var template = require('./template.hbs');
var serialize = require('form-serialize');

module.exports = SubscribeEmail;

function SubscribeEmail (options) {
  if (!(this instanceof SubscribeEmail)) return new SubscribeEmail(options);
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

  var messageHolder = theForm.querySelector(options.responseElement);

  //Override Default Submit Action with CORS request
  theForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var requestData = prepareData(this, options);
    makeCorsRequest(serviceConfig.formAction, requestData, theForm);
  });

  //Listen for Message Events triggered on the form.
  theForm.addEventListener('subscriptionMessage', function (e) {
    if (!messageHolder) {
      console.log(e.detail);
    } else {
      if (typeof e.detail === 'string') {
        messageHolder.innerHTML = e.detail;
      } else if (Array.isArray(e.detail)) {
        messageHolder.innerHTML = '';
        e.detail.forEach(function(message) {
          messageHolder.innerHTML += message + '<br>';
        });
      } else {
        console.log(e.detail);
      }
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
    default:
      serviceConfig = {
        formAction: ''
      };
      break;
  }
  return serviceConfig;
}

function fireEvent(name, detail, el){
  var customEvent;
  if (window.CustomEvent) {
    customEvent = new CustomEvent(name, {'detail': detail });
  } else {
    customEvent = document.createEvent('CustomEvent');
    customEvent.initCustomEvent(name, true, true, detail);
  }
  el.dispatchEvent(customEvent);
}

function makeCorsRequest(url, data, form) {
  var xhr = createCorsRequest('POST', url);
  if (!xhr) {
    console.log('CORS not supported');
    return;
  }
  xhr.onload = function() {

    var response = JSON.parse(xhr.responseText);

    //Fire Message Event(s)
    var payload = response.message || response.messages;
    fireEvent('subscriptionMessage', payload, form);

    //Fire Success or Error Event
    if (response.success || response.status === 'ok') {
      fireEvent('subscriptionSuccess', response, form);
    } else {
      fireEvent('subscriptionError', response, form);
    }

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