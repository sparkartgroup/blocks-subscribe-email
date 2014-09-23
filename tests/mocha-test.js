var assert = require('assert'),
  fs = require('fs');

var webdriver = require('browserstack-webdriver')
  test = require('browserstack-webdriver/testing');

test.describe('Subscribe Email', function() {
  //Give the BrowserStack VM enough time to boot up before running tests
  this.timeout(25000);
  var driver, server;

  test.before(function() {
  var capabilities = {
    'browser' : 'IE',
    'browser_version' : '9.0',
    'os' : 'Windows',
    'os_version' : '7',
    'resolution' : '1024x768',
    'browserstack.local' : 'true',
    'browserstack.user' : 'sparkart',
    'browserstack.key' : '***REMOVED***'
   }
  driver = new webdriver.Builder().
    usingServer('http://hub.browserstack.com/wd/hub').
    withCapabilities(capabilities).
    build();

    driver.get('http://lvh.me:8080/tests/tests.html');
  });

  test.it('universe form works', function() {

    driver.findElement(webdriver.By.css('#subscribe-form input[type="email"]')).sendKeys('test@test.com');
    driver.findElement(webdriver.By.css('#subscribe-form input[type="submit"]')).click();
    driver.wait(function() {
      return driver.findElement(webdriver.By.css('#subscribe-form .message')).getText().then(function(text) {
        return 'Please check your email for confirmation instructions' === text;
      });
    }, 2000);

  });

  test.it('sendgrid form works', function() {

    driver.findElement(webdriver.By.css('#subscribe-form2 input[type="email"]')).sendKeys('test@test.com');
    driver.findElement(webdriver.By.css('#subscribe-form2 input[type="submit"]')).click();
    driver.wait(function() {
      return driver.findElement(webdriver.By.css('#subscribe-form2 .subscribe-email__response')).getText().then(function(text) {
        return 'You have subscribed to this Marketing Email.' === text;
      });
    }, 2000);

  });

  test.it('mailchimp form works', function() {

    driver.findElement(webdriver.By.css('#subscribe-form3 input[type="email"]')).sendKeys('test@test.com');
    driver.findElement(webdriver.By.css('#subscribe-form3 input[type="submit"]')).click();
    driver.wait(function() {
      return driver.findElement(webdriver.By.css('#subscribe-form3 .subscribe-email__response')).getText().then(function(text) {
        return '0 - This email address looks fake or invalid. Please enter a real email address' === text;
      });
    }, 2000);

  });

  test.after(function() { driver.quit(); });
});