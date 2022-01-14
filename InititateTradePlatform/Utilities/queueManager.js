const { ServiceBusClient, delay, ServiceBusMessage } = require("@azure/service-bus");
const { Observable } = require('rxjs');

let listenConnectionString = "Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=topic-listen;SharedAccessKey=UUVYLnFt7NKTgQqAyKqMcRN+nwBH6Lc8MYyS95Q9ObU="
//let sendConnString="Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=test-trade-send;SharedAccessKey=2GV7Gb3v+9bf0C/9HuTx5Uh7RpluXnotxCXQFhpmZGM="
let topicName = "test-topic";
//let tradeTopicName="test-trade"
const subscriptionName = "test-sub";

function consumeMsgFromTopic() {
  return new Observable((sub) => {
    const svcBusClient = new ServiceBusClient(listenConnectionString);
    const receiver = svcBusClient.createReceiver(topicName, subscriptionName);
    let payLoad = null;
    receiver.subscribe({
      processMessage: async (msgReceived) => { /*console.log("Message received :-", msgReceived.body);*/ payLoad = msgReceived.body; sub.next(payLoad); },
      processError: async (err) => { throw new Error(err) }
    });
  });
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

  //await delay(2000);
  //await receiver.close();
  //await svcBusClient.close();



module.exports = { consumeMsgFromTopic,sendMsgToTopic }