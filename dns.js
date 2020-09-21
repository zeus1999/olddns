var constanten = require("./constaten");

module.exports = {

    types: {
        A: 1,
        AAAA: 28,
        NS: 2,
        MX: 15,
        TXT: 16,
        SOA: 6,
        SRV: 33,
        CNAME: 5
    },

    classes: {
        "IN": 1,
        "CSNET": 2,
        "CHAOS": 3,
        "HESIOD": 4,
        "NONE": 254,
        "ALL": 255
    },

    convertType: function(a, b){

        let output;
        let changed;

        if(b === 0){

            for(let key in this.types){
                if(key === a){
                    output = this.types[key];
                    changed = true;
                }
            }

        }

        if(b === 1){

            for(let key in this.types){
                if(this.types[key] === a){
                    output = key;
                    changed = true;
                }
            }

        }

        if(!changed){
            output = "ERROR";
        }

        return output;
    },

    convertClass: function(a, b){

        let output;
        let changed;

        if(b === 0){

            for(let key in this.classes){
                if(key === a){
                    output = this.classes[key];
                    changed = true;
                }
            }

        }

        if(b === 1){

            for(let key in this.classes){
                if(this.classes[key] === a){
                    output = key;
                    changed = true;
                }
            }

        }

        if(!changed){
            output = "ERROR";
        }

        return output;
    },
    
    domainToQname: function(domain){
        var tokens = domain.split(".");
        len = domain.length + 2;
        var qname = Buffer.allocUnsafe(len);
        var offset = 0;
        for(var i = 0; i < tokens.length; i++){
            qname[offset] = tokens[i].length;
            offset++;
            for(var j = 0; j < tokens[i].length; j++){
                qname[offset] = tokens[i].charCodeAt(j);
                offset++;
            }
        }
        qname[offset] = 0;
        
        return qname;
    },

    genQueryID: function(){
        const hex = '0123456789ABCDEF';
        let output = '';
        for (let i = 0; i < 4; ++i) {
            output += hex.charAt(Math.floor(Math.random() * hex.length));
        }
        return output;
    },

    number2Hex: function(number){
        return number.toString(16);
    },

    padString: function(string, len){
        return "0".repeat(len - string.length) + string;
    },

    parsePacket: function(message){

        let buf = Buffer.from(message).toString("hex");
        let bufBin = this.hexStringToBinString(buf);

        let parsedObject = {};

        parsedObject.id = {
            bin: bufBin.slice(0, 16),
            hex: this.binStringToHexString(bufBin.slice(0, 16))
        };

        parsedObject.qr = {
            bin: bufBin.slice(16, 17),
            hex: this.binStringToHexString(bufBin.slice(16, 17))
        };
        
        parsedObject.opcode = {
            bin: bufBin.slice(17, 21),
            hex: this.binStringToHexString(bufBin.slice(17, 21))
        };
        
        parsedObject.aa = {
            bin: bufBin.slice(21, 22),
            hex: this.binStringToHexString(bufBin.slice(21, 22))
        };
        
        parsedObject.tc = {
            bin: bufBin.slice(22, 23),
            hex: this.binStringToHexString(bufBin.slice(22, 23))
        };
        
        parsedObject.rd = {
            bin: bufBin.slice(23, 24),
            hex: this.binStringToHexString(bufBin.slice(23, 24))
        };
        
        parsedObject.ra = {
            bin: bufBin.slice(24, 25),
            hex: this.binStringToHexString(bufBin.slice(24, 25))
        };
        
        parsedObject.z = {
            bin: bufBin.slice(25, 28),
            hex: this.binStringToHexString(bufBin.slice(25, 28))
        };
        
        parsedObject.rcode = {
            bin: bufBin.slice(28, 32),
            hex: this.binStringToHexString(bufBin.slice(28, 32))
        };
        
        parsedObject.qdcount = {
            bin: bufBin.slice(32, 48),
            hex: this.binStringToHexString(bufBin.slice(32, 48))
        };
        
        parsedObject.ancount = {
            bin: bufBin.slice(48, 64),
            hex: this.binStringToHexString(bufBin.slice(48, 64))
        };
        
        parsedObject.nscount = {
            bin: bufBin.slice(64, 80),
            hex: this.binStringToHexString(bufBin.slice(64, 80))
        };
        
        parsedObject.arcount = {
            bin: bufBin.slice(80, 96),
            hex: this.binStringToHexString(bufBin.slice(80, 96))
        };

        parsedObject.queries = [];

        let bufBody = buf.slice(24);
        let bufReq = bufBody;

        if(parsedObject.qr.bin === "1"){
            let _startofresp = buf.indexOf("c00c");
            bufReq = buf.slice(0, _startofresp);
        }

        let last8Digits = bufReq.slice(-8);

        let _temp = {
            name: this.qnameToDomain(Buffer.from(bufBody.slice(0, -8), "hex")),
            type: this.convertType(parseInt(last8Digits.slice(0, 4), 16), 1),
            class: this.convertClass(parseInt(last8Digits.slice(4, 8), 16), 1),
        }

        parsedObject.queries.push(_temp);



        //response
        parsedObject.responses = [];

        if(parsedObject.qr.bin === "1"){

            let startofresp = buf.indexOf("c00c");
            let responses = buf.slice(startofresp);

            do {

                let type = this.convertType(parseInt(responses.slice(4, 8), 16), 1);

                let _sub = {
                    type: type,
                    class: this.convertClass(parseInt(responses.slice(8, 12), 16), 1),
                    ttl: parseInt(responses.slice(12, 20), 16),
                }

                let dlength = parseInt(responses.slice(20, 24), 16);
                let data = responses.slice(24, 24 + dlength * 2);

                _sub.dlength = dlength;

                if(dlength === 2){

                    let bitStreamData = this.hexStringToBinString(data);

                    //check if pointer
                    if(bitStreamData.slice(0, 2) === "11"){

                    } else {
                        _sub.data = this.processData(type, data);
                    }

                } else {

                    _sub.data = this.processData(type, data);

                }

                

                parsedObject.responses.push(_sub);

                responses = responses.slice(24 + dlength * 2);
                
            } while(responses != "");

        }
        
        //console.log(parsedObject);



        return parsedObject;

    },

    processData: function(type, data){

        let output;

        if(this.decoder[type]){
            output = this.decoder[type](data, this);
        } else {
            output = data;
        }

        return output;

    },

    buildHeader: function(ID, QR, Opcode, AA, TC, RD, RA, Z, RCode, QDCount, ANCount, NSCount, ARCount){

        let bin = ID + QR + Opcode + AA + TC + RD + RA + Z + RCode;

        return this.binStringToHexString(bin) + QDCount + ANCount + NSCount + ARCount;

    },

    buildRequestBody: function(domain, type, _class){

        let qname = this.domainToQname(domain);

        return (Buffer.concat([Buffer.from(qname), Buffer.from("00010001", "hex")])).toString("hex");

    },

    buildResponseBody: function(f){

        let out = [];

        for(let i = 0; i < f.length; i++){

            let _type = this.padString((parseInt(this.convertType(f[i].type, 0))).toString(16), 4);
            let _class = this.padString((parseInt(this.convertClass(f[i].class, 0))).toString(16), 4);
            let _ttl = this.padString((f[i].ttl).toString(16), 8);

            let _data;

            if(f[i].type == "A"){ _data = this.encodeA(f[i].data); }
            if(f[i].type == "AAAA"){ _data = this.encodeAAAA(f[i].data); }
            if(f[i].type == "TXT"){ _data = this.encodeTXT(f[i].data); }

            let size = this.padString((_data.len).toString(16), 4);

            out.push(Buffer.from("c00c" + _type + _class + _ttl + size + _data.data, "hex"));

        }

        return (Buffer.concat(out)).toString("hex");

    },

    decoder: {

        A: function(data){
            return parseInt(data.slice(0, 2), 16) + "." + parseInt(data.slice(2, 4), 16) + "." + parseInt(data.slice(4, 6), 16) + "." + parseInt(data.slice(6, 8), 16);
        },

        AAAA: function(data, _this){
            return _this.compressIPv6(data.slice(0, 4) + ":" + data.slice(4, 8) + ":" + data.slice(8, 12) + ":" + data.slice(12, 16) + ":" + data.slice(16, 20) + ":" + data.slice(20, 24) + ":" + data.slice(24, 28) + ":" + data.slice(28, 32));
        },

        TXT: function(data, _this){
            let txtLength = parseInt(data.slice(0, 2), 16);
            console.log(txtLength + "a");
            return Buffer.from(data.slice(2), "hex").toString();
        },

    },

    encodeA: function(ip){

        let splitted = ip.split(".");

        let output = {
            data: this.padString((parseInt(splitted[0])).toString(16), 2) + this.padString((parseInt(splitted[1])).toString(16), 2) + this.padString((parseInt(splitted[2])).toString(16), 2) + this.padString((parseInt(splitted[3])).toString(16), 2),
            len: 4
        };

        return output;

    },

    encodeAAAA: function(ip){

        let splitted = (this.expandIPv6(ip)).split(":");

        let output = {
            data: splitted.join(""),
            len: 16
        };

        return output;

    },

    encodeTXT: function(data){

        let _a = Buffer.from(data).toString("hex");

        let txtLenghtDecimal = _a.length/2;
        let txtLenghtHex = this.padString((txtLenghtDecimal).toString(16), 2);

        let dataLengthDecimal = txtLenghtDecimal + 1;
        let dataLenghtHex = this.padString((dataLengthDecimal).toString(16), 2);


        return { len: dataLengthDecimal, data: txtLenghtHex + "" +_a };

    },

    qnameToDomain: function(qname){
    
        var domain= "";
        for(var i = 0; i < qname.length; i++){
            if(qname[i] == 0){
                domain = domain.substring(0, domain.length - 1);
                break;
            }
            
            var tmpBuf = qname.slice(i+1, i+qname[i]+1);
            domain += tmpBuf.toString("binary", 0, tmpBuf.length);
            domain += ".";
            
            i = i + qname[i];
        }
        
        return domain;
    },

    parseType: function(number){
        return this.padString(this.number2Hex(number), 4);
    },
    

    buildRequest: function(id, flags, questions, answer_rrs, authority_rrs, additional_rrs, queries){



        let buf = Buffer.from(id + flags + questions + answer_rrs + authority_rrs + additional_rrs, "hex");
        
        let questionName = this.domainToQname(queries[0].domain);
        let questionBuffer = Buffer.from(this.parseType(queries[0].type) + queries[0].class, "hex");

        return Buffer.concat([buf, questionName, questionBuffer]);

    },

    binStringToHexString: function(a){

        let res = [];

        let _a = {
            "0000": "0",
            "0001": "1",
            "0010": "2",
            "0011": "3",
            "0100": "4",
            "0101": "5",
            "0110": "6",
            "0111": "7",
            "1000": "8",
            "1001": "9",
            "1010": "a",
            "1011": "b",
            "1100": "c",
            "1101": "d",
            "1110": "e",
            "1111": "f",
        }

        while(a.length % 4){
            a = "0" + a;
        }

        let splitted = a.match(/.{1,4}(?=(.{4})+(?!.))|.{1,4}$/g);

        for(let i = 0; i < splitted.length; i++){
            res.push(_a[splitted[i]]);
        }
        return res.join("");
    },

    hexStringToBinString: function(a){

        let res = [];

        let _a = {
            "0": "0000",
            "1": "0001",
            "2": "0010",
            "3": "0011",
            "4": "0100",
            "5": "0101",
            "6": "0110",
            "7": "0111",
            "8": "1000",
            "9": "1001",
            "a": "1010",
            "b": "1011",
            "c": "1100",
            "d": "1101",
            "e": "1110",
            "f": "1111",
        }

        let splitted = a.split("");

        for(let i = 0; i < splitted.length; i++){
            res.push(_a[splitted[i].toLowerCase()]);
        }
        return res.join("");
    },

    compressIPv6: function(input){
        var formatted = input.replace(/\b(?:0+:){2,}/, ':');
        var finalAddress = formatted.split(':')
            .map(function(octet) {
                return  octet.replace(/\b0+/g, '');
            }).join(':');
        return finalAddress;
    },

    expandIPv6: function(address){
        var fullAddress = "";
        var expandedAddress = "";
        var validGroupCount = 8;
        var validGroupSize = 4;
    
        var ipv4 = "";
        var extractIpv4 = /([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/;
        var validateIpv4 = /((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})/;
    
        // look for embedded ipv4
        if(validateIpv4.test(address))
        {
            groups = address.match(extractIpv4);
            for(var i=1; i<groups.length; i++)
            {
                ipv4 += ("00" + (parseInt(groups[i], 10).toString(16)) ).slice(-2) + ( i==2 ? ":" : "" );
            }
            address = address.replace(extractIpv4, ipv4);
        }
    
        if(address.indexOf("::") == -1) // All eight groups are present.
            fullAddress = address;
        else // Consecutive groups of zeroes have been collapsed with "::".
        {
            var sides = address.split("::");
            var groupsPresent = 0;
            for(var i=0; i<sides.length; i++)
            {
                groupsPresent += sides[i].split(":").length;
            }
            fullAddress += sides[0] + ":";
            for(var i=0; i<validGroupCount-groupsPresent; i++)
            {
                fullAddress += "0000:";
            }
            fullAddress += sides[1];
        }
        var groups = fullAddress.split(":");
        for(var i=0; i<validGroupCount; i++)
        {
            while(groups[i].length < validGroupSize)
            {
                groups[i] = "0" + groups[i];
            }
            expandedAddress += (i!=validGroupCount-1) ? groups[i] + ":" : groups[i];
        }
        return expandedAddress;
    }
}