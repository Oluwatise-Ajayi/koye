import 'reflect-metadata';
import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from './orm';
import uploadRoutes from './routes/uploads';
import artRoutes from './routes/art';
import { createQueueConsumers } from './workers';

const app = express();
app.use(express.json());

// Add basic health check BEFORE database initialization
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add database health check
app.get('/health/db', async (req, res) => {
  try {
    if (!AppDataSource.isInitialized) {
      return res.status(503).json({ status: 'error', message: 'Database not initialized' });
    }
    await AppDataSource.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

app.use('/uploads', uploadRoutes);
app.use('/art', artRoutes);

async function main(){
  const port = process.env.PORT || 3000;
  
  // Start server first
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Health check available at: http://localhost:${port}/health`);
  });

  try {
    // Then initialize database
    await AppDataSource.initialize();
    console.log('DB connected');
    
    // Start queue consumers only after DB is ready
    createQueueConsumers();
    console.log('Queue consumers started');
  } catch (error) {
    console.error('Database connection failed:', error);
    // Don't exit - let the basic server still run for health checks
  }
}

main().catch(err => {
  console.error('Application startup error:', err);
  // Don't exit immediately - let health endpoint still work
});
