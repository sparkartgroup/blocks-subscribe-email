// This JavaScript module is exported as UMD following the pattern which can be
// found here: https://github.com/umdjs/umd/blob/master/returnExports.js

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['handlebars'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('./templates/BEM-with-messaging.hbs'));
  } else {
    root.SubscribeEmail = factory(root.handlebars);
  }
}(this, function (template) {

  this.SubscribeEmail = function(options){
    var placeholder = document.querySelector(options.element);
    var serviceConfig = {};
    switch (options.service) {
      case 'mailchimp':
        serviceConfig = {
          formAction: 'http://mailchimp-api.com/route',
          formMethod: 'POST',
          emailName: 'EMAIL'
        };
        break;
      case 'sendgrid':
        serviceConfig = {
          formAction: 'http://sendgrid-api.com/route',
          formMethod: 'POST'
        };
        break;
      default:
        serviceConfig = {
          formAction: '',
          formMethod: ''
        };
        break;
    }
    //Merge the serviceConfig object into the template options
    for (var attrname in serviceConfig) { options[attrname] = serviceConfig[attrname]; }

    placeholder.innerHTML = template(options);
  };

  return this.SubscribeEmail;
}));