const { urlencoded } = require('express');
const express = require('express');
const app = express();
const cors = require('cors');
const { Observable, Subscriber, Subscription } = require('rxjs');
let payloadData = null;
const queueManager = require('./Utilities/queueManager');
const e = require('express');
//let transactionId = "";

app.use(express.json(urlencoded({ extended: true })));

function setUpTopicSubscription() {
    queueManager.consumeMsgFromTopic().subscribe((data, err) => {
        if (err) {
            console.log("Error Occured");
            console.log(err);
        }
        else {
            if (data) {
                console.log("Received Data");
                console.log(data);
                payloadData = data;
                transactionId = payloadData.payLoad.id;
                checkTradeStatus();
                //res.status(200).json({payLoad:data});
            }
        }
    });
}


function checkTradeStatus() {

    //else {
    // if (data) {
    //     console.log("Message insertion is successful in transact-status topic");
    if (payloadData && payloadData.status) {
        console.log(`Trade completed for Trasact id: ${transactionId}`);
        queueManager.sendMsgToTopic({ body: { id: transactionId, status: "Completed" } }, "Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=transact-status-send;SharedAccessKey=GPuLpa7oBO6srgSAXwV6AFU0FoNQ2DXTEEzo/yPF+U0=;", "transact-status-topic").then((data, err) => {
            if (err) {
                console.log("Encountered error in Sending Create Transaction Message to trasact-status topic")
            }
            else{
                if(data){
                    console.log("Message insertion is successful in transact-status topic");
                }
            }
        });
        //res.status(200).json({ status: "Trade Completed" })
    }
    else {
        console.log(`Trade failed for Trasact id: ${transactionId}`);
        //res.status(200).json({ status: "Trade Ongoing" });
    }
}
app.use(cors({
    allowedHeaders: '*',
    origin: '*',
    optionsSuccessStatus: 200
}));
//}
//});
//}
//}

//});
app.listen(7002, () => { console.log("Trade Finalization Service Service up and running at :- 7002"); setUpTopicSubscription() });