# Monad Testnet deployment

Network values checked on 24 October 2026: Monad Testnet, chain ID `10143`, native token `MON`, public RPC `https://testnet-rpc.monad.xyz`. Use only testnet, never mainnet. Obtain test MON and gas from the official faucet before deployment.

1. Copy `.env.example` to `.env`; fill `TREASURY_ADDRESS`, three future Unix deadlines, and `DEPLOYER_PRIVATE_KEY` locally. Do not commit `.env`.
2. Run `npm run compile && npm test && npm run export:abi`.
3. Run `npm run deploy:testnet` only after the owner approves the broadcast.
4. Record the returned address and transaction hash in the root README after independently checking them in the current official explorer. The ABI output is `abi/CommonGround.json`.

The UI must use the compiled ABI, chain ID 10143, and the deployed address. No address or transaction in this repository is proof of a real-world service extension or donation.
