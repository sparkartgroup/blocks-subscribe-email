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

function testForm(driver, formId, success) {
  driver.findElement(webdriver.By.css(formId + ' input[type="email"]')).clear();
  if (success) {
    driver.findElement(webdriver.By.css(formId + ' input[type="email"]')).sendKeys('test@test.com');
  } else {
    driver.findElement(webdriver.By.css(formId + ' input[type="email"]')).sendKeys('fail@test.com');
  }
  driver.findElement(webdriver.By.css(formId + ' .subscribe-email__button')).click();
  driver.wait(function() {
    return driver.findElement(webdriver.By.css(formId + ' .alert__message')).getText().then(function(text) {
      driver.findElement(webdriver.By.css(formId + ' .alert .alert__close-button')).click();
      if (success) {
        return text = 'Success!';
      } else {
        return text = 'Fail!';
      }
    });
  }, 1000);
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
      var driver = setupDriver(capabilities);
      driver.get('http://localhost:8080/test/mocha/test.html');
    });

    test.it('all tests pass', function() {
      driver.wait(function() {
        return driver.executeScript('return mocha_finished;').then(function(finished) {
          if (!finished) return false;

          return driver.executeScript('return mocha_stats;').then(function(stats) {
            //console.log('    Passes: ' + stats.passes + ', Failures: ' + stats.failures + ', Duration: ' + (stats.duration / 1000).toFixed(2) + 's');
            assert(stats.tests > 0, 'No mocha tests were run');
            assert(stats.failures <= 0, 'Some mocha tests failed');
            if (!stats.failures) return true;

            return driver.executeScript('return mocha_failures;').then(function(failures) {
              for (var i = 0; i < failures.length; ++i) {
                var prefix = '    ' + (i + 1) + '. ';
                //console.log(prefix + failures[i][0]);
                //console.log(Array(prefix.length + 1).join(' ') + failures[i][1]);
              }
              return true;
            });
          });
        });
      });
    });
  });

  test.describe('Forms should work' + setupDescription, function() {

    test.before(function() {
      driver.get('http://localhost:8080/test/demo/tests.html');
    });

    test.it('universe form success', function() {
      var result = testForm(driver, '#universe-form', true);
    });

    test.it('universe form fail', function() {
      var result = testForm(driver, '#universe-form', false);
    });

    test.it('sendgrid form success', function() {
      var result = testForm(driver, '#sendgrid-form', true);
    });

    test.it('sendgrid form fail', function() {
      var result = testForm(driver, '#sendgrid-form', false);
    });

    test.it('mailchimp form success', function() {
      var result = testForm(driver, '#mailchimp-form', true);
    });

    test.it('mailchimp form fail', function() {
      var result = testForm(driver, '#mailchimp-form', false);
    });

    test.after(function() { driver.quit(); });

  });
});