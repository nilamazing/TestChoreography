const { ServiceBusClient, delay, ServiceBusMessage } = require("@azure/service-bus");
const { Observable } = require('rxjs');

let listenConnectionString = "Endpoint=sb://micro-service-bus.servicebus.windows.net/;SharedAccessKeyName=transact-status-listen;SharedAccessKey=zdzpIm0FiKSz4ZrbL1Zx15be5NjDVI1MdPs8KP1QDsU=;"
let topicName = "transact-status-topic";
const subscriptionName = "transact-status-sub";

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



module.exports = { consumeMsgFromTopic }