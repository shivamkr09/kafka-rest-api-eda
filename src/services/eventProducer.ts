import { EventHubProducerClient } from '@azure/event-hubs';
import { config } from '../config';

const producerClient = new EventHubProducerClient(config.connectionString, config.eventHubName);

export const sendToEventHub = async (messages: any[]) => {
  const eventDataBatch = await producerClient.createBatch();

  for (const message of messages) {
    eventDataBatch.tryAdd({ body: message });
  }

  await producerClient.sendBatch(eventDataBatch);
  console.log(`Sent ${messages.length} messages to Event Hub`);
};
