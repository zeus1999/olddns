var dns = require("./dns");
var constants = require("./constaten");

var dgram = require("dgram");
const { Opcode } = require("./constaten");
var server = dgram.createSocket("udp4");

server.on("listening", function(){
  var address = server.address();
  console.log('UDP Server listening on ' + address.address + ':' + address.port);
});

server.on("message", function(message, remote){
 //console.log(remote.address + ':' + remote.port +' - ' + message);

  let parsed = dns.parsePacket(message);
  console.log(parsed);

  let responseData = [
    { type: "A", class: "IN", data: "1.2.3.4", ttl: 60 },
    //{ type: "AAAA", class: "IN", data: "1:47:d:a:b:11:55:88", ttl: 60 },
    //{ type: "TXT", class: "IN", data: "facebook-domain-verification=22rm551cu4k0ab0bxsw536tlds4h95", ttl: 60 },
    //{ type: "TXT", class: "IN", data: "aaaa", ttl: 60 },
  ];

  let head = dns.buildHeader(parsed.id.bin, constants.QR.RESPONSE, constants.Opcode.QUERY, constants.AA.NON_AUTHORITATIVE, constants.TC.NOT_TRUNCATED, constants.RD.DESIRED, constants.RA.NOT_AVAILABLE, constants.Z, constants.RCode.NO_ERROR, dns.padString((1).toString(16), 4), dns.padString((responseData.length).toString(16), 4), dns.padString((0).toString(16), 4), dns.padString((0).toString(16), 4));
  let body = dns.buildRequestBody(parsed.queries[0].name);
  let resp = dns.buildResponseBody(responseData);

  console.log(head+body+resp);

  let re = Buffer.concat([Buffer.from(head, "hex"), Buffer.from(body, "hex"), Buffer.from(resp, "hex")])

  server.send(re, 0, re.length, remote.port, remote.address);


});

server.bind(53);
