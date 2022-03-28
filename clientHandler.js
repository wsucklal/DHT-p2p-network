const { Sign } = require("crypto");
let fs = require("fs"),
net = require("net"),
singleton = require("./singleton"),
kadPTP =  require("./kadPTP");
const dhtHandler = require("./dhtHandler");

let mySock;
module.exports = {

    

    handleClientJoining : function(sock){

        //console.log(singleton.getPeerNo(),singleton.getSender().length,singleton.getSender())
        sock.on("data", function(data) {
            console.log("Connected from peer 127.0.0.1:" + data);
            //singleton.incrementPeerNo();
            
            sock.write(kadPTP.getkadPTP(1,singleton.getPeerNo(),singleton.getSender(),singleton.getDHTTable()));


            if (singleton.getPeerNo() <= 2){
                //console.log("Connected from peer 127.0.0.1:" + sock.remotePort);
            }
            else{        
                console.log("Peer table full: 127.0.0.1" + sock.remotePort + " redirected.");
            }

            if (singleton.getChecker() == singleton){
               // sock.write(kadPTP.getPacket(sock.remotePort));
               dhtHandler.sendHello(singleton.getDHTTable(),sock)
            }

        });

        sock.on("close", function(data) {

        });

    },

    handleClientRecieving : function(data){

        let recvPacket = kadPTP.readpacket(data); //Array of received packet info
        
        if(recvPacket.v == 7){

            console.log(
                "Received Welcome message from " + recvPacket.sendername + "\n" +
                "along with DHT:"  
                
            );
    
            for(let i =  0 ; i < recvPacket.dhtTable.length; i++ ){
                console.log("["+recvPacket.dhtTable[i].IPV4+ ":" + recvPacket.dhtTable[i].Port+ ", " + recvPacket.dhtTable[i].ID  +  "]");
            }
            
            dhtHandler.refreshBuckets(singleton.getDHTTable(),recvPacket.dhtTable)

        }

    },
    



};





// ‘Message Type’ field set to 1
