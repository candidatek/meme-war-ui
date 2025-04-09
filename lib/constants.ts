import { PublicKey } from '@solana/web3.js';


export const PROGRAM_ID = new PublicKey("MwarqKym18cUZg6KLYcjhxkw7Vcot8JdiT258QUxcBx");

// export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
// export const SERVER_URL = 'http://localhost:80';
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://meme-server-devnet-b9ba9128f2d5.herokuapp.com';