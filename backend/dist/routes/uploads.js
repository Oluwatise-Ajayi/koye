"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const s3 = new aws_sdk_1.S3({ region: process.env.S3_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID || '', secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '' } });
router.post('/presign', async (req, res) => {
    try {
        const { filename, contentType, keyPrefix } = req.body;
        const fileKey = (keyPrefix ? keyPrefix + '/' : '') + (0, uuid_1.v4)() + '_' + filename;
        const params = { Bucket: process.env.S3_BUCKET || '', Key: fileKey, Expires: 60 * 5, ContentType: contentType, ACL: 'public-read' };
        const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
        const publicUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${fileKey}`;
        res.json({ presignedUrl, fileKey, publicUrl });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'presign failed' });
    }
});
exports.default = router;
