var assert = require("chai").assert;
var describe = require("mocha").describe;
var expect = require("chai").expect;

var dns = require("./dns");

describe("dns", function() {

    
    it("get type of AAAA record", function(){
      expect(dns.types.AAAA).to.equal(28);
    });

    it("number2Hex", function(){
      expect(dns.number2Hex(dns.types.AAAA)).to.equal("1c");
    });

    it("hex padding", function(){
      expect(dns.padString("1c", 4)).to.equal("001c");
    });

    it("parse type", function(){
      expect(dns.parseType(16)).to.equal("0010");
    });

    it("conv bin to hex", function(){
      expect(dns.binStringToHexString("1110101010101101")).to.equal("eaad");
    });


    it("conv hex to bin", function(){
      expect(dns.hexStringToBinString("eaad")).to.equal("1110101010101101");
    });


    
    
  })
  