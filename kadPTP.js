const { btoa } = require("buffer");
let fs = require("fs"),
singleton = require("./singleton");

let v,
numOfPeers,
messageType,
sendernamelength,
sendername,
peerIPv4addrss,
dhtTable,
peerPortNum;
  

// Prints the entire packet in bits format
function printPacketBit(packet) {
    var bitString = "";
  
    for (var i = 0; i < packet.length; i++) {
      // To add leading zeros
      var b = "00000000" + packet[i].toString(2);
      // To print 4 bytes per line
      if (i > 0 && i % 4 == 0) bitString += "\n";
      bitString +=  b.substr(b.length - 8);
    }
    return (bitString);
}

// Store integer value into the packet bit stream
function storeBitPacket(packet, value, offset, length) {
    // let us get the actual byte position of the offset
    let lastBitPosition = offset + length - 1;
    let number = value.toString(2);
    let j = number.length - 1;
    for (var i = 0; i < number.length; i++) {
      let bytePosition = Math.floor(lastBitPosition / 8);
      let bitPosition = 7 - (lastBitPosition % 8);
      if (number.charAt(j--) == "0") {
        packet[bytePosition] &= ~(1 << bitPosition);
      } else {
        packet[bytePosition] |= 1 << bitPosition;
      }
      lastBitPosition--;
    }
  }

  function bytes2string(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
      result += String.fromCharCode(array[i]);
    }
    return result;
  }
  
  function stringToBytes(str) {
    var ch,
      st,
      re = [];
    for (var i = 0; i < str.length; i++) {
      ch = str.charCodeAt(i); // get char
      st = []; // set up "stack"
      do {
        st.push(ch & 0xff); // push byte to stack
        ch = ch >> 8; // shift value down by 1 byte
      } while (ch);
      // add stack contents to result
      // done because chars have "wrong" endianness
      re = re.concat(st.reverse());
    }
    // return an array of bytes
    return re;
  }


module.exports = {

    getkadPTP : function(imessageType,inumOfPeers, isendername, T){

        v = 7,
        messageType =  imessageType,
        numOfPeers =  inumOfPeers ,
        sendernamelength = isendername.length, 
        sendername = isendername;
        
        let kadPTP = new Buffer.alloc(4 + sendernamelength);
 
        storeBitPacket(kadPTP,v,0,4);
        storeBitPacket(kadPTP,messageType,4,8);
        storeBitPacket(kadPTP,numOfPeers,12,8);
        storeBitPacket(kadPTP,sendernamelength,20,12);
        //storeBitPacket(kadPTP,sendername,32, sendernamelength*8);
        kadPTP.write(sendername,4,sendernamelength);

        let dhtTable = new Buffer.alloc(6*numOfPeers);

        //Add dht table info
        let bufferIndex =0;
        for(let i  =  0;  i <= 160; i++){            
            if(typeof T[i] !== "undefined"){

                //console.log(i,T[i].Port);
                //console.log(bufferIndex);

                //storeBitPacket(dhtTable,T[i].IPV4,bufferIndex,4 * 8);
                //console.log(dhtTable.write(T[i].IPV4,4+sendernamelength))

                let tempIPV4 = T[160].IPV4.split(".")
                dhtTable.writeIntBE(parseInt(tempIPV4[0]),bufferIndex,1); bufferIndex++;
                dhtTable.writeIntBE(parseInt(tempIPV4[1]),bufferIndex,1); bufferIndex++;
                dhtTable.writeIntBE(parseInt(tempIPV4[2]),bufferIndex,1); bufferIndex++;
                dhtTable.writeIntBE(parseInt(tempIPV4[3]),bufferIndex,1); bufferIndex++;
                
                //storeBitPacket(dhtTable,T[i].Port,bufferIndex,2 * 8);
                dhtTable.writeIntBE(T[i].Port,bufferIndex,2)
                bufferIndex += 2;
                //console.log(T[i].IPV4,tempIPV4[0],tempIPV4[1],T[i].Port,bufferIndex);
                //console.log(bufferIndex);
                
            }
        }

        
        let packet = [kadPTP,dhtTable];
        if(numOfPeers==0){packet = [kadPTP]};

        return Buffer.concat(packet);
    },

    readpacket : function(data){
        
      tempPacket = printPacketBit(data);

      let packetInfo = {
          v : singleton.Bin2Dec(tempPacket.substr(0,4)),
          messageType : singleton.Bin2Dec(tempPacket.substr(4,8)),
          numOfPeers : singleton.Bin2Dec(tempPacket.substr(12,8)),
          sendernamelength : singleton.Bin2Dec(tempPacket.substr(20,12)),
          sendername : data.slice(4,singleton.Bin2Dec(tempPacket.substr(20,12))).toString('utf-8'),
          dhtTable : []
      };
      
      let tempTable = data.slice(4+packetInfo.sendernamelength)
      
      
      //packageInfo.dhtTable.push()
        let bufferIndex =0;


        for (let i = 0 ; i < packetInfo.numOfPeers; i++){
          
          let tempPeerInfo = {
            IPV4 : "",
            Port : 0,
            ID : singleton.getPeerID(this.IPV4,this.Port)
          };

          tempPeerInfo.IPV4 += tempTable.slice(bufferIndex,bufferIndex + 1).readIntBE(0,1)+"."; bufferIndex ++;
          tempPeerInfo.IPV4 += tempTable.slice(bufferIndex,bufferIndex + 1).readIntBE(0,1)+"."; bufferIndex ++;
          tempPeerInfo.IPV4 += tempTable.slice(bufferIndex,bufferIndex + 1).readIntBE(0,1)+"."; bufferIndex ++;
          tempPeerInfo.IPV4 += tempTable.slice(bufferIndex,bufferIndex + 1).readIntBE(0,1); bufferIndex ++;
          
          //bufferIndex += 4;

          //tempPeerInfo.Port = parseInt(tempTable.slice(bufferIndex,bufferIndex + 2),10)
          tempPeerInfo.Port = tempTable.slice(bufferIndex, bufferIndex + 2).readIntBE(0,2)
          bufferIndex += 2;

          tempPeerInfo.ID = singleton.getPeerID(tempPeerInfo.IPV4 ,tempPeerInfo.Port)
          
          singleton.setRecieved(tempPeerInfo.Port)

          packetInfo.dhtTable.push(tempPeerInfo)
        }
          

        return packetInfo;
    },

    redirectPacket : function(){
        packet.writeIntBE(2, 3, 1); // Msg type = redirect
        return packet;
    }

};

  