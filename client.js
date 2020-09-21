var dns = require("./dns");
var PORT = 53;
var HOST = "localhost";

var dgram = require('dgram');

var req = dns.buildRequest(dns.genQueryID(), "0100", "0001", "0000", "0000", "0000", [
    { domain: "api.eu-west-1.aiv-delivery.net", type: dns.types.AAAA, class: "0001" }
]);

var message = Buffer.from(req, "hex");

var client = dgram.createSocket('udp4');
client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
  if (err) throw err;
  console.log('UDP message sent to ' + HOST +':'+ PORT);
  client.close();
});