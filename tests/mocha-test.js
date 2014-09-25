var assert = require('assert');
var fs = require('fs');
var webdriver = require('browserstack-webdriver');
var test = require('browserstack-webdriver/testing');
var objectMerge = require('object-merge');

var browserStackConfig = {
  'browserstack.local' : 'true',
  'browserstack.user' : 'sparkart',
  'browserstack.key' : '***REMOVED***'
}

var setups = [
      { browser: 'Chrome',  browser_version: '36.0', os: 'Windows', os_version: '8.1'},
      { browser: 'Chrome',  browser_version: '35.0', os: 'Windows', os_version: '8.1'},
      { browser: 'Safari',  browser_version: '7.0', os: 'OS X', os_version: 'Mavericks'},
      { browser: 'Safari',  browser_version: '6.1', os: 'OS X', os_version: 'Mountain Lion'},
      { browser: 'IE',  browser_version: '9.0', os: 'Windows', os_version: '7'},
      { browser: 'IE',  browser_version: '10.0', os: 'Windows', os_version: '7'},
      { browser: 'IE',  browser_version: '11.0', os: 'Windows', os_version: '8.1'},
      { browser: 'Firefox',  browser_version: '31.0', os: 'Windows', os_version: '8.1' },
      { browser: 'Firefox',  browser_version: '30.0', os: 'Windows', os_version: '8.1' },
      { browserName: 'iPhone',  platform: 'MAC', device: 'iPhone 5S'},
      { browserName: 'iPhone',  platform: 'MAC', device: 'iPhone 5'},
      { browserName: 'android',  platform: 'ANDROID', device: 'LG Nexus 4'},
      { browserName: 'android',  platform: 'ANDROID', device: 'Motorola Razr'}
   ];

function setupDriver(capabilities) {
  driver = new webdriver.Builder().
    usingServer('http://hub.browserstack.com/wd/hub').
    withCapabilities(capabilities).
    build();

    driver.get('http://lvh.me:8080/tests/tests.html');
  return driver;
}

function testForm(driver, formId, submission, responseElement) {
  responseElement = responseElement || '.subscribe-email__response'
  driver.findElement(webdriver.By.css(formId + ' input[type="email"]')).sendKeys(submission);
  driver.findElement(webdriver.By.css(formId + ' input[type="submit"]')).click();
  driver.wait(function() {
    return driver.findElement(webdriver.By.css(formId + ' ' + responseElement)).getText().then(function(text) {
      return text;
    });
  }, 2000);
}


setups.forEach(function (setup) {

  var setupDescription;
  if (setup.os) {
    setupDescription = ' in ' + setup.browser +
    ' ' + setup.browser_version +
    ' on ' + setup.os + ' ' + setup.os_version;
  } else if (setup.device) {
    setupDescription = ' on ' + setup.device;
  }

  test.describe('Forms should work' + setupDescription, function() {
    var driver;

    test.before(function() {
      var capabilities = objectMerge(browserStackConfig, setup);
      driver = setupDriver(capabilities);
    });

    test.it('universe form with test@test.com', function() {
      var result = testForm(driver, '#universe-form', 'test@test.com', '.message');
      var expectedResult = new RegExp('Please check your email for confirmation','gi');
      return expectedResult.test(result);
    });

    test.it('sendgrid form with test@test.com', function() {
      var result = testForm(driver, '#sendgrid-form', 'test@test.com');
      var expectedResult = new RegExp('You have subscribed','gi');
      return expectedResult.test(result);
    });

    test.it('mailchimp form with test@test.com', function() {
      var result = testForm(driver, '#mailchimp-form', 'test@test.com');
      var expectedResult = new RegExp('0 - This email address looks fake','gi');
      return expectedResult.test(result);
    });

    test.after(function() { driver.quit(); });
  });

});