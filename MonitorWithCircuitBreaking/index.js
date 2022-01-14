const { urlencoded } = require('express');
const express=require('express');
const app=express();
const cors=require('cors');
const {Observable,Subscriber,Subscription}=require('rxjs');
const manageTransaction=require("./Utilities/manageTransactions");
let payloadData=null;
const queueManager=require('./Utilities/queueManager');
let serviceHealthObj={};
let healthyServiceThresholdMilliseconds=60000;

app.use(express.json(urlencoded({extended:true})));

function setUpTopicSubscription(){
    queueManager.consumeMsgFromHealthTopic().subscribe((data,err)=>{
        if(err){
                    console.log("Error Occured from Health Topic");
                    console.log(err);
                }
               else{
                   if(data){
                       console.log("Health Status Received");
                       if(data){
                           serviceHealthObj[data.name]=data;
                       }
                       flagOffUnhealthyServices();
                       console.log(serviceHealthObj);
                       //console.log("Logging Service Health objects");

                       //console.log(serviceHealthObj);

                       //console.log("Received Transaction Status Data");
                       //console.log(data);
                    //    payloadData=data;
                    //    manageTransaction.updateTrasaction(payloadData.id,{status:payloadData.status});
                    //    console.log(manageTransaction.getAllTransactions());
                   }
               }
    });
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

function flagOffUnhealthyServices(){
    if(serviceHealthObj && Object.keys(serviceHealthObj).length>0){
        Object.keys(serviceHealthObj).forEach(objKey=>{
            if(new Date()-new Date(serviceHealthObj[objKey]["time"])>healthyServiceThresholdMilliseconds){
                console.log(`Service ${objKey} is Unhealthy`);
                serviceHealthObj[objKey]["status"]="Unhealthy";
            }
         })
    }
}
app.use(cors({
    allowedHeaders: '*',
    origin: '*',
    optionsSuccessStatus: 200
}));

app.listen(7003,()=>{console.log("Token Service up and running at :- 7003");setUpTopicSubscription()});