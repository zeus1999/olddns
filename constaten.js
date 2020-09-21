module.exports = {
    QR: {
        REQUEST: "0",
        RESPONSE: "1"
    },
    Opcode: {
        QUERY: "0000",
        IQUERY: "0001",
        STATUS: "0010",
        RESERVED_3: "0011",
        NOTIFY: "0100",
        UPDATE: "0101",
    },
    AA: {
        NON_AUTHORITATIVE: "0", 
        AUTHORITATIVE: "1"
    },
    TC: {
        NOT_TRUNCATED: "0",
        TRUNCATED: "1"
    },
    RD: {
        DESIRED: "1",
        NOT_DESIRED: "0",
    },
    RA: {
        AVAILABLE: "1",
        NOT_AVAILABLE: "0",
    },
    Z: "000",
    RCode: {
        NO_ERROR: "0000",
        FORMAT_ERROR: "0001",
        SERVER_FAILURE: "0010",
        NAME_ERROR: "0011",
        NOT_IMPLEMENTED: "0100",
        REFUSED: "0101",
        YX_DOMAIN: "0110",
        YX_RR_SET: "0111",
        NX_RR_SET: "1000",
        NOT_AUTH: "1001",
        NOT_ZONE: "1010"
    }
}