var SubscribeEmail = require('../src/subscribe-email.js');

document.addEventListener('DOMContentLoaded', function(){

  SubscribeEmail.init({
    element: '#subscribe-form',
    template: false,
    service: 'universe',
    key: 'd54e8487-e44e-4c6f-bdd7-6ab9c2eae1e9'
  });

  SubscribeEmail.init({
    element: '#subscribe-form2',
    template: true,
    service: 'sendgrid',
    key: 'SDA+fsU1Qw6S6JIXfgrPngHjsFrn2z8v7VWCgt+a0ln11bNnVF1tvSwDWEK/pRiO'
  });

});