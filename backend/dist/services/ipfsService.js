"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinJsonToIPFS = pinJsonToIPFS;
const Client = __importStar(require("@web3-storage/w3up-client"));
// Helper to convert JSON to a File object
function jsonToFile(json, filename = 'metadata.json') {
    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    // @ts-ignore
    return new File([blob], filename, { type: 'application/json' });
}
async function pinJsonToIPFS(json) {
    // Create the client
    const client = await Client.create();
    // First-time setup: login and create/provision space if needed
    if (!Object.keys(client.accounts()).length) {
        const account = await client.login('acmhackathon@gmail.com');
        const space = await client.createSpace('koye-space');
        await space.save();
        await account.provision(space.did());
    }
    // Use the current space
    const space = client.currentSpace();
    if (!space)
        throw new Error('No current space set in web3.storage client');
    // Convert JSON to File and upload
    const file = jsonToFile(json);
    const root = await client.uploadFile(file);
    return { cid: root.toString(), url: `ipfs://${root.toString()}` };
}
