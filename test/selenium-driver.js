var assert = require('assert');
var fs = require('fs');
var webdriver = require('browserstack-webdriver');
var test = require('browserstack-webdriver/testing');
var objectMerge = require('object-merge');

var browserStackConfig = {
  'browserstack.local' : 'true',
  'browserstack.user' : '',
  'browserstack.key' : '',
  'project': 'Subscribe Email Widget'
}

var driver;

//If browser_version is not specified, the latest version is used
var setups = [
  {browser: 'Chrome'},
  {browser: 'Chrome', browser_version: '35.0'},
  {browser: 'Safari'},
  {browser: 'Safari', browser_version: '6.1'},
  {browser: 'IE'},
  {browser: 'IE', browser_version: '10.0'},
  {browser: 'IE', browser_version: '9.0'},
  {browser: 'Firefox'},
  {browser: 'Firefox', browser_version: '30.0'},
  {device: 'iPhone 5S'},
  {device: 'iPhone 6'},
  {device: 'LG Nexus 4'},
  {device: 'Motorola Razr'}
];

function setupDriver(capabilities) {
  driver = new webdriver.Builder().
    usingServer('http://hub.browserstack.com/wd/hub').
    withCapabilities(capabilities).
    build();
  return driver;
}

setups.forEach(function (setup) {

  var setupDescription;
  if (setup.browser) {
    setupDescription = ' in ' + setup.browser +
    ' ' + (setup.browser_version || 'latest');
  } else if (setup.device) {
    setupDescription = ' on ' + setup.device;
  }

  test.describe('Mocha tests should pass' + setupDescription, function() {

    test.before(function() {
      var capabilities = objectMerge(browserStackConfig, setup);
      driver = setupDriver(capabilities);
      driver.get('http://localhost:8080/test/mocha/test.html');
    });

    test.it('all tests pass', function() {
      driver.wait(function() {
        return driver.executeScript('return mocha_finished;').then(function(finished) {
          if (!finished) return false;

          return driver.executeScript('return mocha_stats;').then(function(stats) {
            assert(stats.tests > 0, 'No mocha tests were run');
            assert(stats.failures <= 0, 'Some mocha tests failed');
            if (!stats.failures) return true;

            return driver.executeScript('return mocha_failures;').then(function(failures) {
              for (var i = 0; i < failures.length; ++i) {
                var prefix = '    ' + (i + 1) + '. ';
              }
              return true;
            });
          });
        });
      });
    });
  });

  test.describe('User Interaction' + setupDescription, function() {

    test.before(function() {
      driver.get('http://localhost:8080/test/demo/tests.html');
    });

    var emailServices = [
      {displayName: 'MailChimp', el: '#mailchimp-form', obj: 'mailchimpForm'},
      {displayName: 'SendGrid', el: '#sendgrid-form', obj: 'sendgridForm'},
      {displayName: 'Universe', el: '#universe-form', obj: 'universeForm'},
    ];

    emailServices.forEach(function(service){

      test.describe(service.displayName + ' form with valid email', function() {
        test.before(function(){
        driver.executeScript('try { setupSinonSpies(' + service.obj + '); } catch (ex) { return "Error: " + ex; }');
          fillForm(service.el, true);
        });

        test.it('Displays Success Message', function() {
          testMessages(true, service.el);
        });

        test.it('Emits subscriptionMessage Event', function() {
          testEvents('message');
        });

        test.it('Emits subscriptionSuccess Event', function() {
          testEvents('success');
        });

        test.after(function(){
          driver.executeScript('resetSinonSpies();');
        });

      });

      test.describe(service.displayName + ' form with invalid email', function() {
        test.before(function(){
          driver.executeScript('try { setupSinonSpies(' + service.obj + '); } catch (ex) { return "Error: " + ex; }');
          fillForm(service.el, false);
        });

        test.it('Displays Fail Message', function() {
          testMessages(false, service.el);
        });

        test.it('Emits subscriptionMessage Event', function() {
          testEvents('message');
        });

        test.it('Emits subscriptionError Event', function() {
          testEvents('fail');
        });

        test.after(function(){
          driver.executeScript('resetSinonSpies();');
        });

      });

    });

    test.after(function() { driver.quit(); });

  });
});

function testMessages(success, formId) {
  driver.findElement(webdriver.By.css(formId + ' .alert__message')).getText().then(function(text) {
    driver.findElement(webdriver.By.css(formId + ' .alert .alert__close-button')).click();
    if (success) {
      assert(text === 'Success!', 'Success message not found in page');
    } else {
      assert(text === 'Fail!', 'Fail message not found in page');
    }
  });
}

function testEvents(type) {
  driver.executeScript('return checkEventStatus();').then(function(status){
    switch (type) {
      case 'fail':
        assert(status.fail, 'subscriptionError was not fired');
        break;
      case 'message':
        assert(status.message, 'subscriptionMessage was not fired');
        break;
      case 'success':
        assert(status.success, 'subscriptionSuccess was not fired');
        break;
      default:
        return false;
        break;
      }
  });
}

function fillForm(formId, success) {
  driver.findElement(webdriver.By.css(formId + ' input[type="email"]')).clear();
  if (success) {
    driver.findElement(webdriver.By.css(formId + ' input[type="email"]')).sendKeys('test@test.com');
  } else {
    driver.findElement(webdriver.By.css(formId + ' input[type="email"]')).sendKeys('fail@test.com');
  }
  driver.findElement(webdriver.By.css(formId + ' .subscribe-email__button')).click();
}