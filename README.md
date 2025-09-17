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
- `/uploads/presign` - Get a presigned URL for uploads
- `/art/upload` - Upload art metadata

The backend uses Bull for queues and batch minting.

---
- Make sure you have enough testnet MATIC on Polygon Amoy for contract deployment and minting.
- For local testing, you can use Hardhat's local network instead of Amoy.
