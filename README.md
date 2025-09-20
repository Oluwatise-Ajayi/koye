Kóyè updated repo (blockchain + backend scaffold).

## How to Use

### 1. Deploy the Smart Contract (Polygon Amoy Testnet)

1. Go to the `blockchain` directory:
   ```bash
   cd blockchain
   ```
2. Create a `.env` file in the `blockchain` folder with your Amoy RPC URL and private key:
   ```env
   POLYGON_AMOY_RPC_URL=YOUR_AMOY_RPC_URL
   PRIVATE_KEY=YOUR_PRIVATE_KEY
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Deploy the contract:
   ```bash
   npx hardhat run scripts/deploy.ts --network polygonAmoy
   ```
5. Copy the deployed contract address from the output.

### 2. Configure the Backend

1. In the `backend` directory, update your `.env` (or `.env.example`) file:
   ```env
   KOYE_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
   POLYGON_AMOY_RPC_URL=YOUR_AMOY_RPC_URL
   PRIVATE_KEY=YOUR_PRIVATE_KEY
   # ...other variables
   ```

### 3. Start the Backend

- Using Docker Compose (recommended):
  ```bash
  docker-compose up --build
  ```
- Or run manually (if you have Node.js and dependencies installed):
  ```bash
  cd backend
  npm install
  npm start
  ```

### 4. API Endpoints

#### 1. `/uploads/presign` (POST)
Get a presigned AWS S3 URL for uploading files.

**Request Body:**
```json
{
  "filename": "myart.png",
  "contentType": "image/png",
  "keyPrefix": "optional-folder-name"
}
```
**Response:**
```json
{
  "presignedUrl": "https://...",
  "fileKey": "...",
  "publicUrl": "https://..."
}
```

#### 2. `/art/upload` (POST)
Upload art metadata and queue for NFT minting.

**Request Body:**
```json
{
  "title": "My Art",
  "description": "A beautiful digital painting.",
  "fileUrl": "https://your-bucket.s3.amazonaws.com/my-art.png",
  "metadata": { "genre": "abstract", "year": 2025 },
  "username": "artist123",
  "artistWallet": "0x1234abcd5678ef..."
}
```
**Response:**
```json
{
  "artId": 1,
  "status": "pending"
}
```

#### 3. `/art/status/:artId` (GET)
Check the status of AI processing and NFT minting for an artwork.

**Response:**
```json
{
  "artId": 1,
  "aiStatus": "pending|done|failed",
  "nftStatus": "queued|minted_pending|minted|failed",
  "nftTokenId": 123,
  "nftTxHash": "0x..."
}
```

---
- Make sure you have enough testnet MATIC on Polygon Amoy for contract deployment and minting.
- For local testing, you can use Hardhat's local network instead of Amoy.
