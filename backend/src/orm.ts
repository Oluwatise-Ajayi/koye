import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Art } from './entities/Art';
import { User } from './entities/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  entities: [Art, User],
  logging: true
});
