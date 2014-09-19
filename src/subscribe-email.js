var template = require('./template.hbs');
var serialize = require('form-serialize');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

inherits(SubscribeEmail, EventEmitter);
module.exports = SubscribeEmail;

function SubscribeEmail (options) {
  if (!(this instanceof SubscribeEmail)) return new SubscribeEmail(options);
  var instance = this;
  options = setDefaults(options);
  var theForm;
  if (options.element.jquery) {
    theForm = options.element[0];
  } else {
    theForm = document.querySelector(options.element);
  }

  if (!options.overrideTemplate) {
    //Render the Default Template
    theForm.innerHTML = template(options);
    //Add BEM Namespace Class to Form
    theForm.classList.add('subscribe-email');
  }

  var messageHolder = theForm.querySelector(options.responseElement);

  //Override Default Submit Action with CORS request
  theForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var requestData = prepareData(this, options);
    if (options.service === 'mailchimp') {
      instance.makeJSONPRequest(options.formAction, requestData, theForm);
    } else {
      instance.makeCorsRequest(options.formAction, requestData, theForm);
    }
  });

  //Listen for Message Events
  this.on('subscriptionMessage', function (message) {
    if (!messageHolder) {
      console.log(message);
    } else {
      messageHolder.innerHTML = message;
    }
  });
}

function setDefaults(options) {
  options.overrideTemplate = options.overrideTemplate || false;
  options.submitText = options.submitText || 'Subscribe';
  options.responseElement = options.responseElement || '.subscribe-email__response';

  switch (options.service) {
    case 'universe':
      options.formAction = options.formAction || 'http://staging.services.sparkart.net/api/v1/contacts';
      options.emailName = options.emailName || 'contact[email]';
      break;
    case 'sendgrid':
      options.formAction =  options.formAction || 'https://sendgrid.com/newsletter/addRecipientFromWidget';
      options.emailName = options.emailName || 'SG_widget[email]';
      break;
    case 'mailchimp':
      options.formAction =  options.formAction || options.url.replace('/post?', '/post-json?');
      options.emailName =  options.emailName || 'EMAIL';
      break;
    default:
      break;
  }

  return options;
}

function prepareData(data, options) {
  var requestData = '';
  switch (options.service) {
    case 'universe':
      requestData = serialize(data) + '&key=' + options.key;
      break;
    case 'sendgrid':
      requestData = serialize(data) +
      '&p=' + encodeURIComponent(options.key) +
      '&r=' + window.location;
      break;
    case 'mailchimp':
      requestData = '&' + serialize(data);
      break;
  }
  return requestData;
}

SubscribeEmail.prototype.makeCorsRequest = function (url, data, form) {
  var instance = this;
  var xhr = createCorsRequest('POST', url);
  if (!xhr) {
    console.log('CORS not supported');
    return;
  }

  xhr.onload = function() {

    var response = JSON.parse(xhr.responseText);

    //Fire Message Event(s)
    if (response.message) {
      instance.emit('subscriptionMessage', response.message);
    } else if (response.messages) {
      response.messages.forEach(function(message) {
        instance.emit('subscriptionMessage', message);
      });
    }

    //Fire Success or Error Event
    if (response.success || response.status === 'ok') {
      instance.emit('subscriptionSuccess', response);
    } else {
      instance.emit('subscriptionError', response);
    }

  };

  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(data);
};

function createCorsRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != 'undefined') {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }
  return xhr;
}

SubscribeEmail.prototype.getId = function() {
  for (var id in window) {
    if (window[id] === this) { return id; }
  }
};

SubscribeEmail.prototype.makeJSONPRequest = function (url, data, form) {
  var scriptElement = document.createElement('script');
  scriptElement.src = url + data + '&c=' + this.getId() + '.processJSONP';
  form.appendChild(scriptElement);
};

SubscribeEmail.prototype.processJSONP = function(json) {
  //Fire Message Event(s)
  if (json.msg) {
    this.emit('subscriptionMessage', json.msg);
  }

  //Fire Success or Error Event
  if (json.result === 'success') {
    this.emit('subscriptionSuccess', json);
  } else {
    this.emit('subscriptionError', json);
  }
};