const { urlencoded } = require('express');
const express = require('express');
const app = express();
const cors = require('cors');
const { Observable, Subscriber, Subscription } = require('rxjs');
let payloadData = null;
const queueManager = require('./Utilities/queueManager');
let transactionId = null;

app.use(express.json(urlencoded({ extended: true })));

function setUpTopicSubscription() {
    setUpHealthEndPoint();
    queueManager.consumeMsgFromTopic().subscribe((data, err) => {
        if (err) {
            console.log("Error Occured");
            console.log(err);
        }
        else {
            if (data) {
                console.log("Received Topic Data");
                console.log(data);
                payloadData = data;
                transactionId = payloadData.id;
                InitiateTrade();
                //res.status(200).json({payLoad:data});
            }
        }
    });
}

function setUpHealthEndPoint(){
    setInterval(()=>{
        queueManager.sendMsgToTopic({body:{name:"InitiateTradePlatform",status:"Healthy",time:new Date()}},"Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=service-health-send;SharedAccessKey=ZYhC+wmgdICYY8ilxeisv00/gN9JB3vChGjaoqWY7uk=;","test-service-health").then((data,err)=>{
        if(err){
            console.log("Encountered error in Sending Create Transaction Message to Topic")
        }
        else{
            if(data){
                console.log("Message insertion is successful");
            }
        }
      });
    },15000);
}

app.use(cors({
    allowedHeaders: '*',
    origin: '*',
    optionsSuccessStatus: 200
}));

function InitiateTrade() {
    //const clientInfo = req.body.clientInfo;
    if (payloadData) {
        queueManager.sendMsgToTopic({ body: { payLoad: payloadData, status: "Initimated Stakeholders" } },"Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=test-trade-send;SharedAccessKey=2GV7Gb3v+9bf0C/9HuTx5Uh7RpluXnotxCXQFhpmZGM=","test-trade").then((data, err) => {
            if (err) {
                console.log("Encountered error in Sending Message to test-trade topic")
            }
            else {
                if (data) {
                    console.log("Trade confirmation insertion is successful in test-trade topic");
                    //res.status(200).json({ body: { payLoad: payloadData, status: "Initimated Stakeholders" } });
                    queueManager.sendMsgToTopic({ body: { id: transactionId, status: "Pending" } }, "Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=transact-status-send;SharedAccessKey=GPuLpa7oBO6srgSAXwV6AFU0FoNQ2DXTEEzo/yPF+U0=;", "transact-status-topic").then((data, err) => {
                        if (err) {
                            console.log("Encountered error in Sending Create Transaction Message to trasact-status topic")
                        }
                        else {
                            if (data) {
                                console.log("Message insertion is successful in transact-status topic");
                            }
                        }
                    });
                }
            }
        });
        //res.status(200).json({body:{payLoad:payloadData,status:"Initimated Stakeholders"}});
    }

}
app.listen(7001, () => { console.log("Token Service up and running at :- 7001"); setUpTopicSubscription() });