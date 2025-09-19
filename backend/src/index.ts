import 'reflect-metadata';
import express from 'express';
import * as dotenv from 'dotenv';

console.log('🚀 Starting application...');
console.log('📝 Loading environment variables...');
dotenv.config();

console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || 3000);
console.log('💾 Database URL exists:', !!process.env.DATABASE_URL);

import { AppDataSource } from './orm';
import uploadRoutes from './routes/uploads';
import artRoutes from './routes/art';
import { createQueueConsumers } from './workers';

console.log('📦 Modules loaded successfully');

const app = express();

console.log('⚙️ Setting up middleware...');
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

console.log('🏥 Setting up health endpoints...');

// Basic health check
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  console.log('🏥 Database health check requested');
  try {
    if (!AppDataSource.isInitialized) {
      console.log('❌ Database not initialized');
      return res.status(503).json({ status: 'error', message: 'Database not initialized' });
    }
    await AppDataSource.query('SELECT 1');
    console.log('✅ Database health check passed');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    console.log('❌ Database health check failed:', errorMessage);
    res.status(503).json({ status: 'error', database: 'disconnected', error: errorMessage });
  }
});

console.log('🛣️ Setting up routes...');
app.use('/uploads', uploadRoutes);
app.use('/art', artRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found', 
    method: req.method, 
    path: req.originalUrl,
    availableRoutes: [
      'GET /health',
      'GET /health/db', 
      'POST /uploads/presign',
      'POST /art/upload',
      'GET /art/status/:artId'
    ]
  });
});

async function main(){
  try {
    console.log('🚀 Starting main function...');
    
    const port = process.env.PORT || 3000;
    
    console.log(`🌐 Starting server on port ${port}...`);
    
    // Start server first
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server successfully started!`);
      console.log(`🌐 Server listening on port ${port}`);
      console.log(`🏥 Health check available at: /health`);
      console.log(`📊 Database health check available at: /health/db`);
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

    console.log('💾 Initializing database connection...');
    
    try {
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully');
      
      console.log('🔄 Starting queue consumers...');
      createQueueConsumers();
      console.log('✅ Queue consumers started');
      
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      console.error('❌ Database connection failed:', errorMessage);
      console.log('⚠️ Application will continue without database functionality');
    }

    console.log('🎉 Application startup completed!');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('💥 Fatal error during startup:', errorMessage);
    process.exit(1);
  }
}

console.log('🏁 About to start main function...');

main().catch(err => {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  const errorStack = err instanceof Error ? err.stack : 'No stack trace';
  console.error('💥 Unhandled error in main:', errorMessage);
  console.error('Stack trace:', errorStack);
  process.exit(1);
});

console.log('📝 Main function called, waiting for async operations...');
