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
app.use('/uploads', uploadRoutes);
app.use('/art', artRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
async function main(){
  await AppDataSource.initialize();
  console.log('DB connected');
  createQueueConsumers();
  const port = process.env.PORT||3000;
  app.listen(port, ()=>console.log('listening',port));
}
main().catch(err=>{console.error(err);process.exit(1);});
