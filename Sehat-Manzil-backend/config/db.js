import pkg from 'pg';
const { Pool, Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const createDatabase = async (connectionString, dbName) => {
  // Create a client to connect to default postgres database
  const client = new Client(connectionString);

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    // Check if database exists
    const { rows } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (rows.length === 0) {
      // Database doesn't exist, create it
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
      return true; // indicating database was created
    } else {
      console.log(`Database ${dbName} already exists`);
      return false; // indicating database already existed
    }
  } finally {
    await client.end();
  }
};

const initializeTables = async (connectionString, dbName) => {
  // Create connection string for the specific database
  const dbConnectionString = connectionString.replace(/\/[^/]*$/, `/${dbName}`);
  const client = new Client(dbConnectionString);

  try {
    await client.connect();
    console.log(`Connected to database ${dbName}`);
    
    const migrations = fs.readFileSync(path.join(__dirname, 'migrations.txt'), 'utf-8');
    await client.query(migrations);
    console.log('Tables initialized successfully');

  } finally {
    await client.end();
  }
};

const connectDB = async () => {
  try {
    console.log("Getting Environment!");

    let connectionString;

    let type = process.env.NODE_ENV;
    console.log(type)

    switch (type) {
      case 'test':
        console.log("Environment is Test, jo dil kare wo karo!")
        connectionString = process.env.PG_URI_TEST;
        break;
      default:
        console.log("Environment is Production, sambhal ke beta!")
        connectionString = process.env.PG_URI;
    }

    if (!connectionString) {
      throw new Error('Database connection string not found in environment variables');
    }

    const dbName = process.env.DB_NAME;
    if (!dbName) {
      throw new Error('Database name not found in environment variables');
    }

    // Create database if it doesn't exist
    const wasCreated = await createDatabase(connectionString, dbName);
    
    switch (type) {
      case 'test':
        console.log("Environment is Test, jo dil kare wo karo!")
        connectionString = process.env.PG_URI_TEST + "/" + dbName ;
        break;
      default:
        console.log("Environment is Production, sambhal ke beta!")
        connectionString = process.env.PG_URI + "/" + dbName;
    }

    // If database was just created, initialize tables
    if (wasCreated) {
      await initializeTables(connectionString, dbName);
    }

    // Return a connection pool for the specific database
    const dbConnectionString = connectionString.replace(/\/[^/]*$/, `/${dbName}`);
    return new Pool({
      connectionString: dbConnectionString,
    });

  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw error;
  }
};

export default connectDB;