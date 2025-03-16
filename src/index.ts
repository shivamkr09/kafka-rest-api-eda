import express from 'express';
import { sendToEventHub } from './services/eventProducer';
import { startEventProcessor } from './services/eventConsumer';

const app = express();
app.use(express.json());

// API Endpoint to send messages
app.post('/send', async (req:any, res:any) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).send({ error: 'Messages should be a non-empty array' });
  }

  try {
    await sendToEventHub(messages);
    res.send({ message: 'Events sent successfully' });
  } catch (error) {
    console.error('Error sending messages:', error);
    res.status(500).send({ error: 'Failed to send messages' });
  }
});

// Start Event Processing
startEventProcessor();

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
