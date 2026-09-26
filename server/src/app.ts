import express from 'express';
import cors from 'cors';
import pool from './db/pool.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'BookIt API is running',
  });
});

app.get('/health/db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS now');

    res.json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database connection failed:', error);

    res.status(500).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});

export default app;