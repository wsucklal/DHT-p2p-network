let net = require("net"),
  handler = require("./clientHandler"),
  dht =  require("./dhtHandler"),
  singleton = require("./singleton"),
  path = require("path")
 ;
const crypto = require("crypto");
const { argv } = require("process");
const dhtHandler = require("./dhtHandler");

let PORT = 1118,
    HOST = "127.0.0.1";

net.bytesWritten = 300000;
net.bufferSize = 300000;

let peer = net.createServer();
let client = new net.Socket();

let peerInfo = {
    IPV4 : HOST,
    Port : PORT,
    ID : singleton.getPeerID(this.IPV4,this.Port)
};

let test = {
  IPV4 : HOST,
  Port : PORT,
  ID : singleton.getPeerID(this.IPV4,this.Port)
};

let test1 = {
  IPV4 : "127.0.0.1",
  Port : 1993,
  ID : singleton.getPeerID("127.0.0.1",1993)
};

// Get IP & port from client and split to use in client connection
//hanldes first peer vs a 2nd+ peer
process.argv.forEach((val, index) => {
    if (index === 3) {
      test.Port = val.split(":")[1];
      test.IPV4 = val.split(":")[0];
    }
    test.ID = singleton.getPeerID(test.IPV4,test.Port);
});


dht.init(peerInfo,160);

//dht Table
singleton.setDHTTable(dht.getTable());
//peer name
singleton.setSender(require("path").dirname(require.main.filename).split(path.sep).pop());
//peer port
singleton.setPeerPort(PORT);


singleton.setDHTTable(dht.pushBucket(singleton.getDHTTable(), peerInfo));
singleton.incrementChecker();


if( singleton.getSender() == "peer1"){
  try{ peer.listen(peerInfo.Port, peerInfo.IPV4);
    singleton.init();
  }
  catch(err){}
}

peer.on("listening", function() {
    
    //console.log("Peer is listening on " + HOST + ":" + client.address().port);
    singleton.init();
    console.log(
        "This peer address is " +
        peerInfo.IPV4 +
          ":" +
          peer.address().port +
          " located at " +
          require("path")
            .dirname(require.main.filename)
            .split(path.sep)
            .pop() +
            
            " ["+ singleton.getPeerID(HOST,PORT) + "]"
    );

});

peer.on("connection", function(sock) {
    handler.handleClientJoining(sock);
    singleton.setSender(
      require("path")
        .dirname(require.main.filename)
        .split(path.sep)
        .pop()
    ); // Sets sender name to p1 (based on filename)
  });


if( require("path").dirname(require.main.filename).split(path.sep).pop() != "peer1")
client.connect(test.Port, test.IPV4, function() {

    //   Use the port/host from client above
    peer.listen(singleton.getPeerPort(), peerInfo.IPV4);
    singleton.init();

    console.log("Connected to " + client.remoteAddress +  ":"  + client.remotePort + " at timestamp " + singleton.getTimestamp());

    client.write(PORT.toString());

});

client.on("data", function(data) {

  handler.handleClientRecieving(data);

  client.destroy(); // Close connection
});

