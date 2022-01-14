const {ServiceBusClient}=require("@azure/service-bus");



async function sendMsgToTopic(msg,connectionString,topicName){
 const svcBusClient=new ServiceBusClient(connectionString);
 const svcBusSender=svcBusClient.createSender(topicName);
 try{
    let svcMsgBatch = await svcBusSender.createMessageBatch();
    if(!svcMsgBatch.tryAddMessage(msg)){
        // Send message as it already full
        await svcBusSender.sendMessages(svcMsgBatch);
        // Create a new batch
        svcMsgBatch=await svcBusSender.createMessageBatch();
        if(!svcMsgBatch.tryAddMessage(msg)){
            // This means the message is too big to fit
            throw new Error("Message too big to fit");
        }
    }
   await svcBusSender.sendMessages(svcMsgBatch);
   await svcBusSender.close()
   return true;
 }
 finally{
     await svcBusClient.close();
 }
}

module.exports={sendMsgToTopic}