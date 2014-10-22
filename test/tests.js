var assert = require('assert');
var SubscribeEmail = require('../build/subscribe-email.js');

describe('Subscribe Email Module', function() {

  var sendGridForm = SubscribeEmail({
    element: '#sendgrid-form',
    service: 'sendgrid',
    key: ''
  });

  it('is an EventEmitter', function(done){
    assert(sendGridForm.emit);
    assert(sendGridForm._events);
    done();
  });

  describe('element parameter', function() {

    it('accepts a DOM selector string');

    it('accepts a jQuery element');

  });

  describe('template parameter', function() {

    it('accepts a precompiled handlebars template');

    it('overrides the default template');

  });

});
