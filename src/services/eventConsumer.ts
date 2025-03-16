import { EventHubConsumerClient } from '@azure/event-hubs';
import { insertEvents } from './database';
import { config } from '../config';
import { randomBytes } from 'crypto';

const consumerGroup = '$Default';

const consumerClient = new EventHubConsumerClient(
  consumerGroup,
  config.connectionString,
  config.eventHubName
);
const messages:any[]=[];

export const startEventProcessor = () => {
  consumerClient.subscribe({
    processEvents: async (events) => {
      if (events.length > 0) {
        const eventList = events.map(event => ({
          name: event.body.name+randomBytes(10).toString('hex'),
          timestamp: event.body.timestamp
        }));
        messages.push(...eventList);
        // await insertEvents(eventList);
        if(messages.length>100){
          await insertEvents(messages.splice(0,100));
        }

      }
    },
    processError: async (error) => {
      console.error('Error processing events:', error);
    }
  });

};
