// This JavaScript module is exported as UMD following the pattern which can be
// found here: https://github.com/umdjs/umd/blob/master/returnExports.js

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['handlebars'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('./templates/BEM-with-messaging.hbs'), require('form-serialize'));
  } else {
    root.SubscribeEmail = factory(root.handlebars);
  }
}(this, function (template, serialize) {

  this.SubscribeEmail = function(options){
    var theForm = document.querySelector(options.element);

    var serviceConfig = configureService(options.service);
    //Merge the serviceConfig object into the options
    for (var attrname in serviceConfig) {
      options[attrname] = serviceConfig[attrname];
    }

    if (options.template) {
      //Render the Default Template
      theForm.innerHTML = template(options);
    }
    var messageHolder = theForm.querySelector('.message');

    //Override Default Submit Action with CORS request
    theForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var requestData = serialize(this) + '&amp;key=' + options.key;
      makeCorsRequest(serviceConfig.formAction, requestData, theForm);
    });

    //Listen for Message Events triggered on the form.
    theForm.addEventListener('message', function (e) {
      messageHolder.innerHTML = e.detail;
    });

  };

  function configureService(service) {
    var serviceConfig = {};
    switch (service) {
      case 'universe':
        serviceConfig = {
          formAction: 'http://staging.services.sparkart.net/api/v1/contacts',
          emailName: 'contact[email]'
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

  function makeCorsRequest(url, data, form) {
    var xhr = createCorsRequest('POST', url);
    if (!xhr) {
      console.log('CORS not supported');
      return;
    }
    xhr.onload = function() {
      var response = JSON.parse(xhr.responseText);

      response.messages.forEach(function(message){
        var msgEvent = new CustomEvent('message', { 'detail': message });
        form.dispatchEvent(msgEvent);
      });

    };
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
  }

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

  return this.SubscribeEmail;
}));