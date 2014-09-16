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
  var theForm = document.querySelector(options.element);
  var serviceConfig = configureService(options.service);

  //Merge the serviceConfig object into the options
  for (var attrname in serviceConfig) {
    options[attrname] = serviceConfig[attrname];
  }

  if (!options.overrideTemplate) {
    //Render the Default Template
    theForm.innerHTML = template(options);
    //Add BEM Namespace Class to Form
    theForm.classList.add('subscribe-email');
  }

  if (options.service === 'mailchimp') {
    theForm.action = options.key;
    theForm.method = 'post';
  } else {
    //Override Default Submit Action with CORS request
    theForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var requestData = prepareData(this, options);
      makeCorsRequest(serviceConfig.formAction, requestData, theForm);
    });
  }

  var messageHolder = theForm.querySelector(options.responseElement);

  //Override Default Submit Action with CORS request
  theForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var requestData = prepareData(this, options);
    instance.makeCorsRequest(serviceConfig.formAction, requestData, theForm);
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
  }
  return requestData;
}

function configureService(service) {
  var serviceConfig = {};
  switch (service) {
    case 'universe':
      serviceConfig = {
        formAction: 'http://staging.services.sparkart.net/api/v1/contacts',
        emailName: 'contact[email]'
      };
      break;
    case 'sendgrid':
      serviceConfig = {
        formAction: 'https://sendgrid.com/newsletter/addRecipientFromWidget',
        emailName: 'SG_widget[email]'
      };
      break;
    case 'mailchimp':
      serviceConfig = {
        emailName: 'EMAIL'
      };
      break;
    default:
      serviceConfig = {
        formAction: ''
      };
      break;
  }
  return serviceConfig;
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