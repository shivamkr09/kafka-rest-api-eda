// import { create } from 'domain';
// import { Pool } from 'pg';

// const pool = new Pool({
//   max: 300,
//   connectionTimeoutMillis: 5000,
//   host: 'localhost', // Change to your Azure host if needed
//   port: 5432,
//   user: 'citus',
//   password: 'tKCSrD7Qh9Mye6N',
//   database: 'kafka',
//   ssl: false, // Set to `true` if connecting to Azure with SSL
// });


// const createTable = async () => {
//     const client = await pool.connect();
//     try {
//       await client.query(`
//         CREATE TABLE IF NOT EXISTS event_data (
//           id SERIAL PRIMARY KEY,
//           name VARCHAR(255) NOT NULL,
//           timestamp TIMESTAMPTZ NOT NULL
//         );
//       `);
//       console.log('Table "event_data" is ready.');
//     } catch (error) {
//       console.error('Error creating table:', error);
//     } finally {
//       client.release();
//     }
//   };

//   const getAllData = async () => {
//     const client = await pool.connect();
//     try {
//       const result = await client.query('SELECT * FROM event_data');
//       console.log('Fetched data:', result.rows);
//       return result.rows;
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       return [];
//     } finally {
//       client.release();
//     }
//   }
// export const insertEvents = async (events: { name: string; timestamp: string }[]) => {
//   if (events.length === 0) return;

//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');

//     const insertQuery = `
//       INSERT INTO event_data (name, timestamp)
//       VALUES ${events.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(',')}
//     `;

//     const values = events.flatMap(event => [event.name, event.timestamp]);

//     await client.query(insertQuery, values);

//     await client.query('COMMIT');

//     console.log(`Inserted ${events.length} events`);
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Error inserting events:', error);
//   } finally {
//     client.release();
//   }
// };

// // Example usage
// const testEvents = [
//   { name: 'Event1', timestamp: new Date().toISOString() },
//   { name: 'Event2', timestamp: new Date().toISOString() },
// ];

// // insertEvents(testEvents);
// // createTable();
// getAllData();

// import { neon } from '@neondatabase/serverless';

// const sql = neon(process.env.DATABASE_URL!);

// // Create table (if not exists)
// export const createTable = async () => {
//   try {
//     await sql(`
//       CREATE TABLE IF NOT EXISTS event_data (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         timestamp TIMESTAMPTZ NOT NULL
//       );
//     `);
//     console.log('Table "event_data" is ready.');
//   } catch (error) {
//     console.error('Error creating table:', error);
//   }
// };

// // Insert multiple events (bulk insert)
// export const insertEvents = async (events: { name: string; timestamp: string }[]) => {
//   if (events.length === 0) return;

//   const values = events.flatMap(event => [event.name, event.timestamp]);
//   const placeholders = events.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(',');

//   try {
//     await sql(`INSERT INTO event_data (name, timestamp) VALUES ${placeholders}`, values);
//     console.log(`Inserted ${events.length} events`);
//   } catch (error) {
//     console.error('Error inserting events:', error);
//   }
// };

// // Fetch all records
// export const getAllData = async () => {
//   try {
//     const result = await sql('SELECT * FROM event_data');
//     console.log('Fetched data:', result);
//     return result;
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     return [];
//   }
// };

// // Example usage
// const testEvents = [
//   { name: 'Event1', timestamp: new Date().toISOString() },
//   { name: 'Event2', timestamp: new Date().toISOString() },
// ];

// Uncomment to test:
// await createTable();
// await insertEvents(testEvents);
// await getAllData();


import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

let eventBuffer: { name: string; timestamp: string }[] = [];
let lastInsertTime = Date.now();
let inserting = false;

// **Create Table**
export const createTable = async () => {
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS event_data (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL
      );
    `);
    console.log('Table "event_data" is ready.');
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

// **Insert Events (Preserving Your Function)**
export const insertEvents = async (events: { name: string; timestamp: string }[]) => {
  if (events.length === 0) return;

  eventBuffer.push(...events);

  // **Trigger insert if buffer reaches 100 events**
  if (eventBuffer.length >= 100) {
    await flushEvents();
  }
};

// **Flush Events (Handles Bulk Insert)**
const flushEvents = async () => {
  if (eventBuffer.length === 0 || inserting) return;

  inserting = true;
  const batch = [...eventBuffer];
  eventBuffer = []; // Clear buffer before inserting

  try {
    const values = batch.flatMap(event => [event.name, event.timestamp]);
    const placeholders = batch.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(',');

    await sql(`INSERT INTO event_data (name, timestamp) VALUES ${placeholders}`, values);
    console.log(`Inserted ${batch.length} events`);
    lastInsertTime = Date.now();
  } catch (error) {
    console.error('Error inserting events:', error);
    eventBuffer.unshift(...batch); // Re-add failed batch to buffer
  } finally {
    inserting = false;
  }
};

// **Background Insert (Every 1s)**
setInterval(() => {
  if (Date.now() - lastInsertTime >= 1000) {
    flushEvents();
  }
}, 1000);

// **Fetch All Records**
export const getAllData = async () => {
  try {
    const result = await sql('SELECT * FROM event_data');
    console.log('Fetched data:', result);
    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

// Example Usage
const testEvents = [
  { name: 'Event1', timestamp: new Date().toISOString() },
  { name: 'Event2', timestamp: new Date().toISOString() },
];

// Uncomment to test:
// await createTable();
// await insertEvents(testEvents); // Adds events to buffer
// await getAllData();
