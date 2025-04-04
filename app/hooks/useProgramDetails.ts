import {
  useEffect,
  useState,
} from 'react';

import { PROGRAM_ID } from '@/lib/constants';
import {
  getConnection,
  getProgramDerivedAddress,
} from '@/lib/utils';
import { AnchorProvider } from '@coral-xyz/anchor';
import { Program } from '@project-serum/anchor';
import {
  AnchorWallet,
  useWallet,
} from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import MemeWar from './idl.json';

interface ProgramDetails {
  memeProgram: Program | null;
  memeWarGlobalAccount: PublicKey | null;
}

function useProgramDetails(): ProgramDetails {
  const [memeProgram, setProgram] = useState<Program | null>(null);
  const [memeWarGlobalAccount, setMemeWarGlobalAccount] = useState<PublicKey | null>(null);
  const wallet = useWallet();

  useEffect(() => {
    const initProgramDetails = async () => {
      try {
        const provider = new AnchorProvider(
          getConnection(),
          wallet as AnchorWallet,
          AnchorProvider.defaultOptions()
        );

        const program = new Program(MemeWar as any, PROGRAM_ID, provider);
        setProgram(program);

        const globalAccount = await getProgramDerivedAddress(PROGRAM_ID, "meme-war-global-account");
        setMemeWarGlobalAccount(globalAccount);
      } catch (error) {
        console.error("Error initializing program details:", error);
      }
    };


    initProgramDetails();

  }, []);

  return { memeProgram, memeWarGlobalAccount };
}

export default useProgramDetails;