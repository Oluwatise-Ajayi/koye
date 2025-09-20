"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiQueue = exports.mintQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const redis = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
exports.mintQueue = new bull_1.default('mint-queue', redis);
exports.aiQueue = new bull_1.default('ai-queue', redis);
