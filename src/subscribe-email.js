var template = require('./templates/BEM-with-messaging.hbs');
var serialize = require('form-serialize');

module.exports = {

  init: function(options) {
    options = this.setDefaults(options);
    var theForm = document.querySelector(options.element);
    var serviceConfig = this.configureService(options.service);
    var instance = this;

    //Merge the serviceConfig object into the options
    for (var attrname in serviceConfig) {
      options[attrname] = serviceConfig[attrname];
    }

    if (options.template) {
      //Render the Default Template
      theForm.innerHTML = template(options);
      //Add BEM Namespace Class to Form
      theForm.classList.add('subscribe-email');
    }

    var messageHolder = theForm.querySelector(options.responseElement);

    //Override Default Submit Action with CORS request
    theForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var requestData = instance.prepareData(this, options);
      instance.makeCorsRequest(serviceConfig.formAction, requestData, theForm);
    });

    //Listen for Message Events triggered on the form.
    theForm.addEventListener('message', function (e) {
      if (messageHolder) {
        messageHolder.innerHTML = e.detail;
      } else {
        console.log(e.detail);
      }
    });
  },

  setDefaults: function(options) {
    options.template = options.template || false;
    options.submitText = options.submitText || 'Subscribe';
    options.responseElement = options.responseElement || '.subscribe-email__response';
    return options;
  },

  prepareData: function(data, options) {
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
  },

  configureService: function(service) {
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
      default:
        serviceConfig = {
          formAction: ''
        };
        break;
    }
    return serviceConfig;
  },

  makeCorsRequest: function(url, data, form) {
    var xhr = this.createCorsRequest('POST', url);
    if (!xhr) {
      console.log('CORS not supported');
      return;
    }
    xhr.onload = function() {
      var response = JSON.parse(xhr.responseText);

      if (response.message) {
        var msgEvent = new CustomEvent('message', { 'detail': response.message });
        form.dispatchEvent(msgEvent);
      } else if (response.messages) {
        response.messages.forEach(function(message){
          var msgEvent = new CustomEvent('message', { 'detail': message });
          form.dispatchEvent(msgEvent);
        });
      }

    };
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
  },

  createCorsRequest: function(method, url) {
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

};