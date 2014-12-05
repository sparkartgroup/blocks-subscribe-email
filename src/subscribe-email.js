var template = require('./subscribe-form.hbs');
var serialize = require('form-serialize');
var inherits = require('inherits');
var Alerter = require('blocks-alerter');
var EventEmitter = require('events').EventEmitter;

inherits(SubscribeEmail, EventEmitter);
module.exports = SubscribeEmail;

function SubscribeEmail (options) {
  if (!(this instanceof SubscribeEmail)) return new SubscribeEmail(options);
  var instance = this;

  if (options.element.jquery) {
    instance.theForm = options.element[0];
  } else {
    instance.theForm = document.querySelector(options.element);
  }

  options = _setDefaults(options, instance);
  //Render the Default Template
  instance.theForm.outerHTML = instance.template(options);
  //Select new DOM element after replacing original with rendered template
  instance.theForm = document.getElementById(options.id);

  var messageHolder;
  if (options.alerter) messageHolder = new Alerter(options.alerter);

  //Override Default Submit Action with CORS request
  instance.theForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (serialize(this)) { //Only submit form if there is data
      var requestData = _prepareData(this, options);
      if (options.jsonp) {
        instance.makeJSONPRequest(options.formAction, requestData, instance);
      } else {
        _makeCorsRequest(options.formAction, requestData, instance);
      }
    } else {
      instance.emit('subscriptionError', 'An email address is required.');
    }
  });

  //Listen for Message Events
  if (messageHolder) {
    this.on('subscriptionMessage', function (message) {
      messageHolder.create({
        message: message,
        dismissable: true
      });
    });
  }
}

SubscribeEmail.prototype.makeJSONPRequest = function(url, data, instance) {
  var callbackName, scriptElement;
  callbackName = "cb_" + Math.floor(Math.random() * 10000);
  window[callbackName] = function(json) {
    try {
      delete window[callbackName];
    } catch (e) {
      window[callbackName] = undefined;
    }
    instance.processJSONP(json, instance);
  };
  scriptElement = document.createElement('script');
  scriptElement.src = url + data + callbackName;
  document.body.appendChild(scriptElement);
}

SubscribeEmail.prototype.processJSONP = function(json, instance) {
  //Fire Message Event(s)
  if (json.message) {
    instance.emit('subscriptionMessage', json.message);
  } else if (json.msg) {
    instance.emit('subscriptionMessage', json.msg);
  } else if (json.messages) {
    json.messages.forEach(function(message) {
      instance.emit('subscriptionMessage', message);
    });
  }

  //Fire Success or Error Event
  if (json.result === 'success' || json.status === 'ok') {
    instance.emit('subscriptionSuccess', json);
  } else {
    instance.emit('subscriptionError', json);
  }
}

//Private Functions
function _setDefaults(options, instance) {
  var instanceId = 'subscribe-email-' + Math.floor(Math.random() * 10000);
  options.namespace = options.namespace || 'subscribe-email';
  options.submitText = options.submitText || 'Subscribe';
  if (options.alerter === undefined || options.alerter === null) {
    options.alerter = {};
  }
  if (options.alerter) {
    //options.prependMessagesTo is to maintain backward compatibility
    options.alerter.prependTo = options.alerter.prependTo || options.prependMessagesTo || '#' + instanceId;
  }
  //set the ID of the HTML element (will be different than the value of element)
  options.id = instanceId;

  if (typeof options.template === 'function') {
    instance.template = options.template;
  } else {
    instance.template = template;
  }

  switch (options.service) {
    case 'universe':
      options.formAction = options.formAction || 'https://services.sparkart.net/api/v1/contacts';
      options.emailName = options.emailName || 'contact[email]';
      options.jsonp = !('withCredentials' in new XMLHttpRequest());
      break;
    case 'sendgrid':
      options.formAction =  options.formAction || 'https://sendgrid.com/newsletter/addRecipientFromWidget';
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

function _prepareData(data, options) {
  var requestData = '';
  switch (options.service) {
    case 'universe':
      requestData = serialize(data) + '&key=' + options.key;
      if (options.jsonp) {
        requestData = '?' + requestData +
        '&_method=post&callback=';
      }
      break;
    case 'sendgrid':
      requestData = 'p=' + encodeURIComponent(options.key) +
      '&r=' + encodeURIComponent(window.location) + '&' +
      serialize(data);
      break;
    case 'mailchimp':
      requestData = '&_method=post&' + serialize(data) + '&c=';
      break;
  }
  return requestData;
}

function _makeCorsRequest(url, data, instance) {
  var xhr = _createCorsRequest('POST', url);
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
}

function _createCorsRequest(method, url) {

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
      xhr.open('POST', url);
    } else {
      xhr = null;
    }
    return xhr;
}