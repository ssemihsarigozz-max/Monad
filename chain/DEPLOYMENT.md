# Monad Testnet deployment

Network values checked on 24 October 2026: Monad Testnet, chain ID `10143`, native token `MON`, public RPC `https://testnet-rpc.monad.xyz`. Use only testnet, never mainnet. Obtain test MON and gas from the official faucet before deployment.

1. Copy `.env.example` to `.env`; fill `TREASURY_ADDRESS` and `DEPLOYER_PRIVATE_KEY` locally. Do not commit or print `.env`. Leave the three deadline overrides blank for a 48-hour campaign, calculated from the latest chain block. Overrides shorter than 24 hours are rejected. The Solidity contract and its three-service, three-sequential-slot logic are unchanged.
2. Run `npm run compile && npm test && npm run export:abi`.
3. Run `npm run deploy:testnet` for a read-only preflight. It validates chain ID 10143 and treasury, estimates gas, checks balance, and prints only public deployment parameters. It sends no transaction by default. Review the deadlines and estimated MON fee with the owner.
4. Immediately before broadcast, obtain explicit user approval to spend test MON. In PowerShell, set `$env:BROADCAST_DEPLOYMENT = "1"`, run `npm run deploy:testnet`, and remove the flag afterward with `Remove-Item Env:BROADCAST_DEPLOYMENT`. Never enable this flag during preparation. Re-run preflight if parameters change before approval.
5. The script records the new public address, transaction hash, deadlines and thresholds in `deployment.monad-testnet.json` after checking contract code and all three service configurations. If a transaction hash was printed but verification failed, inspect that transaction before retrying to avoid a duplicate deployment.
6. Update the frontend contract address and root README only after deployment succeeds and the new address is verified. The ABI output is `abi/CommonGround.json`. The old deployment remains historical and must not be used for the new live demo.

The UI must use the compiled ABI, chain ID 10143, and the deployed address. No address or transaction in this repository is proof of a real-world service extension or donation.
