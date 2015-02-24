var assert = require('assert');
var $ = require('jquery');
var SubscribeEmail = require('../build/subscribe-email.js');
var Handlebars = require('handlebars');
var testTemplate = require('./test-template.hbs');
var testTemplateAlert = require('./test-template-alert.hbs');

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

  describe('Initialization', function() {

    it('Has an emit method', function(done){
      var subscribeInstance = SubscribeEmail({
        element: '#test-element',
        service: 'universe'
      });
      assert(typeof subscribeInstance.emit === 'function');
      done();
    });

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

    it('accepts a DOM Node as the element to render the template into', function(done){
      var testElement = document.querySelector('#test-element');
      var subscribeInstance = SubscribeEmail({
        element: testElement,
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
      var testElement = $('#test-element.custom-template');
      assert(testElement.length > 0);
      done();
    });

  });

  describe('alerter parameter', function() {

    it('defaults to true', function(done){
      var subscribeInstance = SubscribeEmail({
        element: '#test-element',
        service: 'universe'
      });
      setupFakeServer([subscribeInstance]);
      $('#test-element .subscribe-email__input--email').val('test@test.com');
      $('#test-element .subscribe-email__button').click();
      window.setTimeout(function(){
        var thisAlert = $('#test-element .alert');
        assert(thisAlert.length > 0);
        done();
      }, 100);
    });

    it('turns off alerts when set to false', function(done){
      var subscribeInstance = SubscribeEmail({
        element: '#test-element',
        service: 'universe',
        alerter: false
      });
      setupFakeServer([subscribeInstance]);
      $('#test-element .subscribe-email__input--email').val('test@test.com');
      $('#test-element .subscribe-email__button').click();
      window.setTimeout(function(){
        var thisAlert = $('#test-element .alert');
        assert(thisAlert.length == 0);
        done();
      }, 100);
    });

    it('allows setting alerter prependTo', function(done){
      var subscribeInstance = SubscribeEmail({
        element: '#test-element',
        service: 'universe',
        alerter: {
          prependTo: 'body'
        }
      });
      setupFakeServer([subscribeInstance]);
      $('#test-element .subscribe-email__input--email').val('test@test.com');
      $('#test-element .subscribe-email__button').click();
      window.setTimeout(function(){
        var thisAlert = $('body .alert');
        assert(thisAlert.length > 0);
        $('body .alert').remove();
        done();
      }, 100);
    });

    it('allows setting alerter template', function(done){
      var subscribeInstance = SubscribeEmail({
        element: '#test-element',
        service: 'universe',
        alerter: {
          template: testTemplateAlert
        }
      });
      setupFakeServer([subscribeInstance]);
      $('#test-element .subscribe-email__input--email').val('test@test.com');
      $('#test-element .subscribe-email__button').click();
      window.setTimeout(function(){
        var thisAlert = $('#test-element .alert-custom');
        assert(thisAlert.length > 0);
        done();
      }, 100);
    });

  });

  describe('hiddenFields', function() {
    it('name and value added to hidden input element', function(done){
      var subscribeInstance = SubscribeEmail({
        element: '#test-element',
        service: 'universe',
        hiddenFields: [
          {
            name: 'testField1',
            value: 'testValue1'
          }, 
          {
            name: 'testField2',
            value: 'testValue2'
          }
        ]
      });
      var testField1 = $('#test-element input[name="testField1"][type="hidden"]');
      assert(testField1.val() === 'testValue1');
      var testField2 = $('#test-element input[name="testField2"][type="hidden"]');
      assert(testField2.val() === 'testValue2');
      done();
    });
  });

});
