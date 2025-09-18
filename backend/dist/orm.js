"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Art_1 = require("./entities/Art");
const User_1 = require("./entities/User");
exports.AppDataSource = new typeorm_1.DataSource({ type: 'postgres', url: process.env.DATABASE_URL, synchronize: true, entities: [Art_1.Art, User_1.User], logging: false });
