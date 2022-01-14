const { ServiceBusClient, delay, ServiceBusMessage } = require("@azure/service-bus");
const { Observable } = require('rxjs');

let connectionString = "Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=test-trade-listen;SharedAccessKey=5OIMVeh/13xv2FKHt9wuon4F5b2VvIX4HhgCDcit/aI="
let topicName = "test-trade"
const subscriptionName = "test-trade-sub";

function consumeMsgFromTopic() {
  return new Observable((sub) => {
    const svcBusClient = new ServiceBusClient(connectionString);
    const receiver = svcBusClient.createReceiver(topicName, subscriptionName);
    let payLoad = null;
    receiver.subscribe({
      processMessage: async (msgReceived) => { console.log("Message received :-", msgReceived.body); payLoad = msgReceived.body; sub.next(payLoad); },
      processError: async (err) => { throw new Error(err) }
    });
  })

  //await delay(2000);
  //await receiver.close();
  //await svcBusClient.close();

}

async function sendMsgToTopic(msg,sendConnString,sendTopicName){
  const svcBusClient=new ServiceBusClient(sendConnString);
  const svcBusSender=svcBusClient.createSender(sendTopicName);
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

module.exports = { consumeMsgFromTopic,sendMsgToTopic }