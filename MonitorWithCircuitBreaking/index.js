const { urlencoded } = require('express');
const express=require('express');
const app=express();
const cors=require('cors');
const {Observable,Subscriber,Subscription}=require('rxjs');
const manageTransaction=require("./Utilities/manageTransactions");
let payloadData=null;
const queueManager=require('./Utilities/queueManager');


app.use(express.json(urlencoded({extended:true})));

function setUpTopicSubscription(){
    queueManager.consumeMsgFromTopic().subscribe((data,err)=>{
        if(err){
                    console.log("Error Occured");
                    console.log(err);
                }
               else{
                   if(data){
                       //console.log("Received Transaction Status Data");
                       //console.log(data);
                       payloadData=data;
                       manageTransaction.updateTrasaction(payloadData.id,{status:payloadData.status});
                       console.log(manageTransaction.getAllTransactions());
                   }
               }
    });
}

app.use(cors({
    allowedHeaders: '*',
    origin: '*',
    optionsSuccessStatus: 200
}));

app.listen(7003,()=>{console.log("Token Service up and running at :- 7003");setUpTopicSubscription()});