import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';

export class AirdropDistributor {
  private connection: Connection;
  private treasuryWallet: Keypair;
  private tokenMint: PublicKey;

  constructor(
    rpcUrl: string,
    treasurySecretKey: Uint8Array,
    tokenMint: string
  ) {
    this.connection = new Connection(rpcUrl);
    this.treasuryWallet = Keypair.fromSecretKey(treasurySecretKey);
    this.tokenMint = new PublicKey(tokenMint);
  }

  async sendAirdrop(recipientAddress: string, amount: number) {
    try {
      const recipient = new PublicKey(recipientAddress);
      
      // Get or create token account for recipient
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.treasuryWallet,
        this.tokenMint,
        recipient
      );

      // Get treasury token account
      const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.treasuryWallet,
        this.tokenMint,
        this.treasuryWallet.publicKey
      );

      // Transfer tokens
      const signature = await transfer(
        this.connection,
        this.treasuryWallet,
        treasuryTokenAccount.address,
        recipientTokenAccount.address,
        this.treasuryWallet.publicKey,
        amount * 1e9 // Convert to token decimals
      );

      return { success: true, signature };
    } catch (error) {
      console.error('Airdrop failed:', error);
      return { success: false, error: error.message };
    }
  }
}
