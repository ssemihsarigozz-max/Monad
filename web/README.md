# CtC · Consensus then Charity (frontend)

Next.js 14 + TypeScript frontend for **CommonGround**, connected to the live contract on Monad Testnet.

- **Live:** https://ctc-mu.vercel.app
- **Contract:** `0x864890ee1C9A005574808D5D0baF51a06AA0Aa62` (chain ID `10143`)
- Project overview, test evidence and limitations: see the [root README](../README.md).

## Run

```sh
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build      # production build, then: npm start
```

Optional environment variable:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_MONAD_RPC_URL` | `https://testnet-rpc.monad.xyz` | RPC used for read-only chain data |

## How it talks to the chain

Nothing in the app is simulated. Every number on screen comes from the deployed contract.

- **Reads (no wallet needed):** slot status, supporter counts, countdowns and the impact pool are read through the public Monad RPC, so any visitor sees live state.
- **Writes (MetaMask):** `contribute`, `finalizeExpired` and `claimRefund` are signed in MetaMask. On **Connect** the app adds or switches the wallet to Monad Testnet (`10143`).
- **Per-wallet state:** once connected, the app reads whether this wallet supported each slot (`hasSupported`). For failed slots it simulates `claimRefund` to tell whether the refund was already claimed, so the refund button can't be used twice.
- Account or network changes in MetaMask trigger a fresh read from the chain.

## Files

| Path | Role |
|---|---|
| `lib/contract.ts` | Contract address, chain ID and the ABI fragment used by the UI (source: `chain/abi/CommonGround.json`) |
| `context/AppContext.tsx` | Wallet connection, network switching, chain reads and transactions |
| `components/SlotPipeline.tsx` | Service tabs and the three sequential slots with countdowns and actions |
| `components/CharityTreasury.tsx` | Impact pool read from `impactAccrued()` and explorer links |
| `components/ContributionHistory.tsx` | This session's transactions and refundable slots |

## Notes

- The 60 / 40 charity split and the slot time labels (e.g. 22:00–22:30) are display only; the contract has a single treasury and stores only slot order and one deadline per service.
- Photographs are remote Unsplash images; app behaviour does not depend on them loading.
