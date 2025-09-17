import express from 'express';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();
const s3 = new S3({ region: process.env.S3_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID || '', secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '' } });
router.post('/presign', async (req, res) => {
  try {
    const { filename, contentType, keyPrefix } = req.body;
    const fileKey = (keyPrefix?keyPrefix+'/':'') + uuidv4() + '_' + filename;
    const params = { Bucket: process.env.S3_BUCKET || '', Key: fileKey, Expires: 60 * 5, ContentType: contentType, ACL: 'public-read' };
    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
    const publicUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${fileKey}`;
    res.json({ presignedUrl, fileKey, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'presign failed' });
  }
});
export default router;
