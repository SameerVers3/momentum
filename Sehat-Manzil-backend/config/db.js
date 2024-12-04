import pkg from 'pg';
const { Pool, Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const createDatabase = async (connectionString, dbName) => {
  const client = new Client({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    // Safely check and create database
    try {
      const { rows } = await client.query(
        'SELECT 1 FROM pg_catalog.pg_database WHERE datname = $1',
        [dbName]
      );

      if (rows.length === 0) {
        // Database doesn't exist, so try to create it
        try {
          await client.query(`CREATE DATABASE "${dbName}"`);
          console.log(`Database ${dbName} created successfully`);
          
          // Call the initializeTables function to set up the tables
          await initializeTables(connectionString, dbName);
          return true;
        } catch (createError) {
          if (createError.code === '42P04' || createError.code === '23505') {
            console.log(`Database ${dbName} already exists`);
            return false;
          }
          // Rethrow other errors
          throw createError;
        }
      } else {
        console.log(`Database ${dbName} already exists`);
        return false;
      }
    } catch (checkError) {
      console.error('Error checking database:', checkError);
      throw checkError;
    }
  } catch (connectError) {
    console.error('Connection error:', connectError);
    throw connectError;
  } finally {
    await client.end();
  }
};

const connectDB = async () => {
  try {
    console.log("Getting Environment!");

    // Simplified environment type selection
    const type = process.env.NODE_ENV || 'production';
    console.log('Environment:', type);

    const connectionString = type === 'test' 
      ? process.env.PG_URI_TEST 
      : process.env.PG_URI;

    if (!connectionString) {
      throw new Error('Database connection string not found in environment variables');
    }

    const dbName = process.env.DB_NAME;
    if (!dbName) {
      throw new Error('Database name not found in environment variables');
    }

    // Attempt to create database (will not throw if already exists)
    await createDatabase(connectionString, dbName);

    const fullConnectionString = `${connectionString}/${dbName}`;

    // Create connection pool
    const pool = new Pool({
      connectionString: fullConnectionString,
      ssl: type === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 5000
    });

    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      console.log('Database connection successful');
    } finally {
      client.release();
    }

    return pool;

  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    if (error.code === '3D000') {
      console.error('Specific database connection error. Ensure database exists.');
    }
    throw error;
  }
};

const initializeTables = async (connectionString, dbName) => {
  const client = new Client({
    connectionString: `${connectionString}/${dbName}`,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log(`Connected to database ${dbName}`);
    
    const migrations = fs.readFileSync(path.join(__dirname, 'migrations.txt'), 'utf-8');
    await client.query(migrations);
    console.log('Tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  } finally {
    await client.end();
  }
};

export default connectDB;
