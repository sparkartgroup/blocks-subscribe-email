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

//Test in IE 9
test.describe('Forms work in IE 9', function() {
  var driver;

  test.before(function() {
    var capabilities = objectMerge(browserStackConfig, {
      'browser' : 'IE',
      'browser_version' : '9.0',
      'os' : 'Windows',
      'os_version' : '7'
    });
    driver = setupDriver(capabilities);
  });

  test.it('universe form works', function() {
    var result = testForm(driver, '#universe-form', 'test@test.com', '.message');
    return 'Please check your email for confirmation instructions' === result;
  });

  test.it('sendgrid form works', function() {
    var result = testForm(driver, '#sendgrid-form', 'test@test.com');
    return 'You have subscribed to this Marketing Email.' === result;
  });

  test.it('mailchimp form works', function() {
    var result = testForm(driver, '#mailchimp-form', 'test@test.com');
    return '0 - This email address looks fake or invalid. Please enter a real email address' === result;
  });

  test.after(function() { driver.quit(); });
});

//Test in Safari 7
test.describe('Forms work in Safari 7', function() {
  var driver;

  test.before(function() {
    var capabilities = objectMerge(browserStackConfig, {
      'browser' : 'Safari',
      'browser_version' : '7.0',
      'os' : 'OS X',
      'os_version' : 'Mavericks'
    });
    driver = setupDriver(capabilities);
  });

  test.it('universe form works', function() {
    var result = testForm(driver, '#universe-form', 'test@test.com', '.message');
    return 'Please check your email for confirmation instructions' === result;
  });

  test.it('sendgrid form works', function() {
    var result = testForm(driver, '#sendgrid-form', 'test@test.com');
    return 'You have subscribed to this Marketing Email.' === result;
  });

  test.it('mailchimp form works', function() {
    var result = testForm(driver, '#mailchimp-form', 'test@test.com');
    return '0 - This email address looks fake or invalid. Please enter a real email address' === result;
  });

  test.after(function() { driver.quit(); });
});