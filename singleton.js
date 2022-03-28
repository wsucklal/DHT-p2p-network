let timestamp,
timerInterval = 10,
peerNo = 0,
sender,
checker =0,
port,
received,
dhtTable;

module.exports ={

    init : function() { 
        timestamp = Math.floor(Math.random() * (999 - 1) + 1); // Start random timestamp between 1 and 999
        setInterval(function() {
            return timestamp;
          }, timerInterval);
    },

    getTimestamp: function() {
        return timestamp;
    },

    incrementPeerNo: function() {
        ++peerNo;
    },


    getChecker:  function(){
        return checker;
    },

    incrementChecker: function() {
        ++checker;
    },

    getPeerNo: function() {
        return peerNo;
    },

    setPeerPort: function(data) {
        port = data;
    },

    getPeerPort: function() {
        return port;
    },

    setSender: function(data) {
        sender = data;
    },

    
    getRecieved: function() {
        return received;
    },

    setRecieved: function(data) {
        received = data;
    },

    getSender: function() {
        return sender;
    },

    
    getPeerID : function(IP, port) {
        var crypto = require('crypto')
        var sha1 = crypto.createHash('sha1')
        sha1.update(IP + ':' + port)
        return sha1.digest('hex')
    },

    getDHTTable : function (data){
        return dhtTable;
    },
    setDHTTable : function (data){
        dhtTable = data;
    },

    Hex2Bin: function (hex) {
        var bin = ""
        hex.split("").forEach(str => {
            bin += parseInt(str, 16).toString(2).padStart(8, '0')
        })
        return bin
    },

    Text2Bin: function(string) {
        return string.split('').map(function (char) {
            return char.charCodeAt(0).toString(2);
        }).join(' ');
    },

    Dec2Bin : function(number) {
        return (number >>> 0).toString(2);
    },

    Bin2Dec : function(binary) {
        return parseInt(binary, 2);
    },

        //--------------------------
    //XORing: finds the XOR of the two Binary Strings with the same size
    //--------------------------
    XORing: function (a, b){
        let ans = "";
            for (let i = 0; i < a.length ; i++)
            {
                // If the Character matches
                if (a[i] == b[i])
                    ans += "0";
                else
                    ans += "1";
            }
            return ans;
        }
};
