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
    theForm.className += ' subscribe-email';
  }

  var messageHolder = theForm.querySelector(options.responseElement);

  //Override Default Submit Action with CORS request
  theForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var requestData = instance.prepareData(this, options);
    if (options.jsonp) {
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
      options.jsonp = !('withCredentials' in new XMLHttpRequest());
      break;
    case 'sendgrid':
      options.formAction =  options.formAction || 'http://sendgrid.com/newsletter/addRecipientFromWidget';
      options.emailName = options.emailName || 'SG_widget[email]';
      options.jsonp = false;
      break;
    case 'mailchimp':
      options.formAction =  options.formAction || options.url.replace('/post?', '/post-json?');
      options.emailName =  options.emailName || 'EMAIL';
      options.jsonp = true;
      break;
    default:
      break;
  }

  return options;
}

SubscribeEmail.prototype.prepareData = function(data, options) {
  var requestData = '';
  switch (options.service) {
    case 'universe':
      requestData = serialize(data) + '&key=' + options.key;
      if (options.jsonp) {
        requestData = '?' + requestData +
        '&_method=post&callback=' + this.getId() + '.processJSONP';
      }
      break;
    case 'sendgrid':
      requestData = 'p=' + encodeURIComponent(options.key) +
      '&r=' + encodeURIComponent(window.location) + '&' +
      serialize(data);
      break;
    case 'mailchimp':
      requestData = '&_method=post&' + serialize(data) +
      '&c=' + this.getId() + '.processJSONP';
      break;
  }
  return requestData;
};

SubscribeEmail.prototype.makeCorsRequest = function (url, data, form) {
  var instance = this;
  var xhr = createCorsRequest('POST', url, data);
  if (!xhr) { return; }

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

  xhr.onerror = function(){
    instance.emit('subscriptionError', 'Oops, something went wrong!');
  };

  if(xhr instanceof XMLHttpRequest){
    // Request headers cannot be set on XDomainRequest in IE9
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  }
  xhr.send(data);
};

function createCorsRequest(method, url, data) {

    var xhr;
    if ('withCredentials' in new XMLHttpRequest()) {
      xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != 'undefined') {
      xhr = new XDomainRequest();
      //The next 6 lines must be defined here or IE9 will abort the request
      xhr.timeout = 3000;
      xhr.onload = function(){};
      xhr.onerror = function (){};
      xhr.ontimeout = function(){};
      xhr.onprogress = function(){};
      xhr.open('POST', url + '?' + data);
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
  scriptElement.src = url + data;
  form.appendChild(scriptElement);
};

SubscribeEmail.prototype.processJSONP = function(json) {
  var instance = this;
  //Fire Message Event(s)
  if (json.message) {
    this.emit('subscriptionMessage', json.message);
  } else if (json.msg) {
    this.emit('subscriptionMessage', json.msg);
  } else if (json.messages) {
    json.messages.forEach(function(message) {
      instance.emit('subscriptionMessage', message);
    });
  }

  //Fire Success or Error Event
  if (json.result === 'success') {
    this.emit('subscriptionSuccess', json);
  } else {
    this.emit('subscriptionError', json);
  }
};