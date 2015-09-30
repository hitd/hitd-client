var Client = require('pigato').Client;

var debug = require('hitd-debug')('hitd-client');

module.exports = function(endpoint, conf, cb) {

  var client = new Client(endpoint, conf);
  client.once('start', function() {

    var myclient = {
      request: function(key, data, resCb, opts) {
      if(typeof data == 'function'){

      opts = resCb;
      resCb = data;
      data='';		
      }
      opts = opts || {};
      var full = [];

      debug('new request to %s, data is %s', key, JSON.stringify(
		      data), typeof data);

      var toSend = {
key: key,
body: data.body == undefined ? data : data.body,
};
if (data.clientId) {
	toSend.clientId = data.clientId;
}


debug('will send data %s', key, JSON.stringify(
			toSend));


var prec = undefined;
client.request(key, toSend, function(err, partial) {
		debug("request get partial");

		if (!prec && partial < 100) {
		prec = partial;
		} else if (prec < 100) {
		resCb.apply(null, [null, prec, partial]);
		prec = undefined;
		} else {
		full.push(partial);
		}
		}, function(err, last) {
		full.push(last);
		resCb.apply(null, [null].concat(full));
		}, opts);
}
};

cb(null, myclient);
});

setImmediate(function() {
		client.start();
		});

};
