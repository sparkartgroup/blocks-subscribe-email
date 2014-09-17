var SubscribeEmail = require('../build/subscribe-email.js');
var test = require('tape');

//Setup
var theElement = document.createElement('form');
document.body.appendChild(theElement);
theElement.id = 'subscribe';

new SubscribeEmail({
  element: '#subscribe',
  service: 'universe',
  template: true,
  key: '2366edcf-805b-43bf-b043-9c2f527967d9'
});

//Tests
test('SubscribeEmail exists and is a function', function (t) {
  var objType = typeof SubscribeEmail;
  t.equal(objType, 'function');
  t.end();
});