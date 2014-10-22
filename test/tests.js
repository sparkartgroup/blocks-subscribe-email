var assert = require('assert');
var $ = require('jquery');
var SubscribeEmail = require('../build/subscribe-email.js');
var Handlebars = require('handlebars');
var testTemplate = require('./test-template.hbs');
var sinon = require('sinon');

describe('Subscribe Email Module', function() {

  beforeEach(function(){
    var testElement = $('#test-element');
    if (testElement) {
      testElement.remove();
    }
    testElement = document.createElement('div');
    testElement.id = 'test-element';
    document.body.appendChild(testElement);
  });

  describe('Events', function() {

    it('Emits events', function(done){
      var subscribeInstance = SubscribeEmail({
        element: '#test-element',
        service: 'universe'
      });
      var spy = sinon.spy(subscribeInstance, 'emit');
      subscribeInstance.emit('subscriptionMessage', 'Test Message');
      assert(spy.called);
      done();
    });

    it('fires a subscriptionSuccess event on success');
    it('fires a subscriptionError event on fail');
    it('fires a subscriptionMessage event on both subscribe and fail');

  });

  describe('element parameter', function() {

    it('accepts a DOM selector string as the element to render the template into', function(done){
      var subscribeInstance = SubscribeEmail({
        element: '#test-element',
        service: 'universe'
      });
      var emailInputs = $('#test-element input[type=email]');
      assert(emailInputs.length > 0);
      done();
    });

    it('accepts a jQuery object as the element to render the template into', function(done){
      var jQueryForm = $('#test-element');
      var subscribeInstance = SubscribeEmail({
        element: jQueryForm,
        service: 'universe'
      });
      var emailInputs = $('#test-element input[type=email]');
      assert(emailInputs.length > 0);
      done();
    });

  });

  describe('template parameter', function() {

    it('accepts a precompiled handlebars template that overrides the default template', function(done){
      var subscribeInstance = SubscribeEmail({
        element: '#test-element',
        service: 'universe',
        template: testTemplate
      });
      var testElement = $('#test-element .custom-template');
      assert(testElement.length > 0);
      done();
    });

  });

});