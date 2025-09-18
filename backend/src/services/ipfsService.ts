import * as Client from '@web3-storage/w3up-client';

// Helper to convert JSON to a File object
function jsonToFile(json: any, filename = 'metadata.json'): File {
  const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
  // @ts-ignore
  return new File([blob], filename, { type: 'application/json' });
}

export async function pinJsonToIPFS(json: any): Promise<{ cid: string; url?: string }> {
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
  if (!space) throw new Error('No current space set in web3.storage client');

  // Convert JSON to File and upload
  const file = jsonToFile(json);
  const root = await client.uploadFile(file);
  return { cid: root.toString(), url: `ipfs://${root.toString()}` };
}
