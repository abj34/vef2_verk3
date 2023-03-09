import { readFile } from 'fs/promises';
import pg from 'pg';

const { DATABASE_URL: connectionString } = process.env;

const pool = new pg.Pool({ connectionString });

pool.on('error', (err: Error) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

type QueryInput = string | number | null;

export async function query(q: string, values: Array<QueryInput> = []) {
    let client;
    try {
      client = await pool.connect();
    } catch (e) {
      console.error('unable to get client from pool', e);
      return null;
    }
  
    try {
      const result = await client.query(q, values);
      return result;
    } catch (e) {
      console.error('unable to query', e);
      console.info(q, values);
      return null;
    } finally {
      client.release();
    }
}

export async function end() {
  await pool.end();
}
