var assert = require('assert');
var SubscribeEmail = require('../build/subscribe-email.js');

describe('Subscribe Email', function() {
  describe('SubscribeEmail()', function() {
    it('works', function(done) {
      var sendGridForm = SubscribeEmail({
        element: '#sendgrid-form',
        service: 'sendgrid',
        key: 'SDA+fsU1Qw6S6JIXfgrPngHjsFrn2z8v7VWCgt+a0ln11bNnVF1tvSwDWEK/pRiO'
      });

      assert.deepEqual(true, true);
      done();
    });

    it('fails', function(done) {
      assert.deepEqual(true, false);
      done();
    });
  });

});
