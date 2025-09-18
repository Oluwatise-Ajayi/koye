"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueueConsumers = createQueueConsumers;
const mintWorker_1 = require("./mintWorker");
const aiWorker_1 = require("./aiWorker");
function createQueueConsumers() { (0, mintWorker_1.mintWorker)(); (0, aiWorker_1.aiWorker)(); }
