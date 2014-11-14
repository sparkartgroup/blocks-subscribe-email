var server;
var fakeAPIs = [
  {
    route: 'https://services.sparkart.net/api/v1/contacts',
    email: 'contact[email]',
    required: ['key'],
    callback: 'callback',
    success: '{"status":"ok", "messages":["Success!"]}',
    fail: '{"status":"error", "messages":["Fail!"]}'
  },
  {
    route: 'https://sendgrid.com/newsletter/addRecipientFromWidget',
    email: 'SG_widget[email]',
    required: ['p','r'],
    success: '{"success":true, "message":"Success!"}',
    fail: '{"success":false, "message":"Fail!"}'
  },
  {
    route: 'list-manage.com', //MailChimp
    email: 'EMAIL',
    required: ['_method'],
    callback: 'c',
    success: '{"result": "success", "msg": "Success!"}',
    fail: '{"result": "error", "msg": "Fail!"}'
  }
];
var eventSpy;
function setupSinonSpies(obj) {
  eventSpy = sinon.spy(obj, 'emit');
}

function resetSinonSpies() {
  eventSpy.reset();
}

function checkEventStatus() {
  var eventStatus = {};
  eventStatus.fail = eventSpy.calledWith('subscriptionError');
  eventStatus.success = eventSpy.calledWith('subscriptionSuccess');
  eventStatus.message = eventSpy.calledWith('subscriptionMessage');
  return eventStatus;
}

function setupFakeServer(subscribeEmailInstances) {
  server = sinon.fakeServer.create();
  server.autoRespond = true;

  fakeAPIs.forEach(function(api){
    api.required.push(api.email);
    server.respondWith(api.route, function(r){
      var query = queryStringToObject(r.requestBody);
      var response;
      var isValid = true;
      api.required.forEach(function(param){
        if (!query[param]) {
          isValid = false;
        }
      });
      if (isValid && (query[api.email] !== 'fail@test.com')) {
        response = api.success;
      } else {
        response = api.fail
      }
      r.respond(
        200,
        {"Content-Type":"application/json"},
        response
      );
    });
  });

  //Stub makeJSONPRequest method for each SubscribeEmail instance
  subscribeEmailInstances.forEach(function(instance){
    sinon.stub(instance, 'makeJSONPRequest', mockJSONPResponse);
  });
}

function mockJSONPResponse(url, data, instance) {
  fakeAPIs.forEach(function(api){
    if (url.indexOf(api.route) > -1) { //If this URL is in the fakeAPIs array, fake a response
      var query = queryStringToObject(data);
      var response;
      api.required.push(api.email);
      var isValid = true;
      api.required.forEach(function(param){
        if (!query[param]) {
          isValid = false;
        }
      });
      var hasCallback = false;
      if (query.hasOwnProperty(api.callback)){
        hasCallback = true;
      }
      if (isValid && hasCallback && (query[api.email] !== 'fail@test.com')) {
        instance.processJSONP(JSON.parse(api.success), instance);
      } else {
        instance.processJSONP(JSON.parse(api.fail), instance);
      }
    }
  });
}

function queryStringToObject(query) {
  var queryObject = {};
  query.replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function($0, $1, $2, $3) {
      queryObject[decodeURIComponent($1)] = decodeURIComponent($3);
    });
  return queryObject;
}

function destroyFakeServer() {
  server.restore();
}