const { Sign } = require('crypto');
let singleton =  require('./singleton')

let peerInfo,
numofPeers,
numOfKBuckets;


module.exports = {
    
       

    init : function(ipeerInfo,inumOfKBuckets){

        peerInfo = ipeerInfo;
        numOfKBuckets = inumOfKBuckets;

    },

    getTable : function(){

        return [];
    },

    pushBucket : function(T,P){
       
        let nthLvl = 0 ;
        let check = Array.from(String(singleton.Hex2Bin(peerInfo.ID)), Number);
        let testPeer = Array.from(String(singleton.Hex2Bin(P.ID)), Number);
      
        for(let i = 0 ;  i < numOfKBuckets ; i ++){
            //Checks to see binary digits are equal
            if(check[i]==testPeer[i]){
                nthLvl++;//incremement match nth lvl
            }
        }

        //if the nth bucket is empty add 
        if( typeof T[nthLvl] == "undefined"){
            T[nthLvl] = P;
            //console.log(nthLvl,P)
            singleton.incrementPeerNo();
        }
        else{

        //closer to this peerinfo
            let curPeer = T[nthLvl];

            let curDistance = parseInt(singleton.XORing(peerInfo.ID,curPeer.ID),2);
            let pDistance = parseInt(singleton.XORing(peerInfo.ID,P.ID),2);

            if (curDistance <  pDistance){T[nthLvl] = curPeer}
            else{ T[nthLvl] = P}

        }
        return T;
    },  

    refreshBuckets : function(T,listOfPeers){

        console.log("\nRefresh k-Bucket operation is performed.");

    
        listOfPeers.forEach(element => singleton.setDHTTable(this.pushBucket(T,element)));
        listOfPeers.forEach(element => singleton.incrementChecker());

        singleton.getDHTTable().forEach(element => 
            console.log("["+element.IPV4+ ":" + element.Port+ ", " + element.ID  +  "]")    
        )
        
    
        return T;
    },

    sendHello : function (T,sock){

        sock.on("data", function(data) {
            
            console.log("Hello packet has been sent.")
            
            for(let i = 0; i < T.length;i++){
                if(singleton.getChecker()== singleton.getPeerNo() && T[i].Port == singleton.getRecieved())
                sock.write(kadPTP.getkadPTP(2,singleton.getPeerNo(),singleton.getSender(),singleton.getDHTTable()))
            }
           
        });

    }

    
    
};