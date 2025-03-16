import { create } from 'domain';
import { Pool } from 'pg';

const pool = new Pool({
  max: 300,
  connectionTimeoutMillis: 5000,
  host: 'localhost', // Change to your Azure host if needed
  port: 5432,
  user: 'citus',
  password: 'tKCSrD7Qh9Mye6N',
  database: 'kafka',
  ssl: false, // Set to `true` if connecting to Azure with SSL
});


const createTable = async () => {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS event_data (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL
        );
      `);
      console.log('Table "event_data" is ready.');
    } catch (error) {
      console.error('Error creating table:', error);
    } finally {
      client.release();
    }
  };

  const getAllData = async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM event_data');
      console.log('Fetched data:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    } finally {
      client.release();
    }
  }
export const insertEvents = async (events: { name: string; timestamp: string }[]) => {
  if (events.length === 0) return;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO event_data (name, timestamp)
      VALUES ${events.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(',')}
    `;

    const values = events.flatMap(event => [event.name, event.timestamp]);

    await client.query(insertQuery, values);

    await client.query('COMMIT');

    console.log(`Inserted ${events.length} events`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting events:', error);
  } finally {
    client.release();
  }
};

// Example usage
const testEvents = [
  { name: 'Event1', timestamp: new Date().toISOString() },
  { name: 'Event2', timestamp: new Date().toISOString() },
];

// insertEvents(testEvents);
// createTable();
getAllData();