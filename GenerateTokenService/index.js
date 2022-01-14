const { urlencoded } = require('express');
const express=require('express');
const app=express();
const cors=require('cors');
const queueManager=require('./Utilities/queueManager');
let connectionString="Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=topic-send;SharedAccessKey=/vdFlQpL+1Yy/0lVyyXEUNUXdlvWQJWk5VcFOIb34Xo="
let topicName="test-topic"
let transactionId = (Math.random() + 1).toString(36).substring(4);

async function createUniqueTransaction(){
    queueManager.sendMsgToTopic({body:{id:transactionId,status:"Created"}},"Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=transact-status-send;SharedAccessKey=GPuLpa7oBO6srgSAXwV6AFU0FoNQ2DXTEEzo/yPF+U0=;","transact-status-topic").then((data,err)=>{
        if(err){
            console.log("Encountered error in Sending Create Transaction Message to Topic")
        }
        else{
            if(data){
                console.log("Message insertion is successful");
            }
        }
      });
}
app.use(express.json(urlencoded({extended:true})));
app.use(cors({
    allowedHeaders: '*',
    origin: '*',
    optionsSuccessStatus: 200
}));

app.post("/generateToken",(req,res)=>{
    const requestorName=req.body.name;
    if(requestorName){
        let tradeToken = (Math.random() + 1).toString(36).substring(7);
        queueManager.sendMsgToTopic({body:{id:transactionId,token:tradeToken}},connectionString,topicName).then((data,err)=>{
            if(err){
                console.log("Encountered error in Sending Message to Topic")
            }
            else{
                if(data){
                    console.log("Message insertion is successful");
                    res.status(200).json({"name": requestorName, "token":tradeToken});
                    // Push Transaction Id to Transaction Status Queue
                    //createUniqueTransaction();
                }
            }
          });
    }
})
app.listen(7000,()=>{console.log("Token Service up and running at :- 7000");createUniqueTransaction();});