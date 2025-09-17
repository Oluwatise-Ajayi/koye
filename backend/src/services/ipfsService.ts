import axios from 'axios';
export async function pinJsonToIPFS(json:any): Promise<{cid:string,url?:string}> {
  const API_KEY = process.env.NFT_STORAGE_API_KEY || '';
  if (!API_KEY) return { cid: 'bafybeimockcid' };
  const resp = await axios.post('https://api.nft.storage/upload', JSON.stringify(json), { headers: { 'Authorization': 'Bearer '+API_KEY, 'Content-Type':'application/json' }});
  const cid = resp.data.value.cid;
  return { cid, url: `ipfs://${cid}` };
}
