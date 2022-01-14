const { ServiceBusClient, delay, ServiceBusMessage } = require("@azure/service-bus");
const { Observable } = require('rxjs');

let listenConnectionString = "Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=transact-status-listen;SharedAccessKey=zdzpIm0FiKSz4ZrbL1Zx15be5NjDVI1MdPs8KP1QDsU=;"
let topicName = "transact-status-topic";
const subscriptionName = "transact-status-sub";

function consumeMsgFromHealthTopic(){
  return new Observable((sub) => {
    const svcBusClient = new ServiceBusClient("Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=service-health-listen;SharedAccessKey=opGUtxwJL3nFk0htHoHK7FHk5eIN6Jqpjl5HxC/nPas=;EntityPath=test-service-health");
    const receiver = svcBusClient.createReceiver("test-service-health", "test-service-sub");
    let payLoad = null;
    receiver.subscribe({
      processMessage: async (msgReceived) => { console.log("Health Message received :-", msgReceived.body); payLoad = msgReceived.body; sub.next(payLoad); },
      processError: async (err) => { throw new Error(err) }
    });
  });
}

function consumeMsgFromTopic() {
  return new Observable((sub) => {
    const svcBusClient = new ServiceBusClient(listenConnectionString);
    const receiver = svcBusClient.createReceiver(topicName, subscriptionName);
    let payLoad = null;
    receiver.subscribe({
      processMessage: async (msgReceived) => { console.log("Message received :-", msgReceived.body); payLoad = msgReceived.body; sub.next(payLoad); },
      processError: async (err) => { throw new Error(err) }
    });
  });
}
 

  //await delay(2000);
  //await receiver.close();
  //await svcBusClient.close();



module.exports = { consumeMsgFromTopic,consumeMsgFromHealthTopic }