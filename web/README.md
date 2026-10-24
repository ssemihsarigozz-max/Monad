# CtC · Consensus then Charity

Interactive Next.js 14 / TypeScript campus coordination demo.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. Production: `npm run build`, then `npm start`.

## Demo walkthrough

1. Click **Try demo** for a simulated wallet with 10 MON. Connect Wallet uses MetaMask when available and otherwise opens the demo wallet.
2. Support the active library slot. Your balance drops by 1 MON; the slot reaches 2/2, the treasury receives your 1 MON commitment, and the next slot unlocks.
3. Switch service tabs for independent pipelines. Each slot starts with a simulated peer commitment.
4. Claim the seeded cafeteria refund from the activity table or Cafeteria Slot 03. It adds 1 MON exactly once.
5. Explore impact breakdown for the live 60/40 allocation and explorer links.
6. Demo controls can expire an active slot or reset the walkthrough. Actual 30-minute timers also expire slots.

All contributions, refunds and treasury allocations are simulated in memory and reset on page refresh. MetaMask integration requests account access, switches to Monad Testnet (10143) when available, and reads actual MON balance, displayed separately from sandbox balance. It never submits a transaction. Rejected network switches preserve demo access. Account/network changes disconnect the app until reconnect.

The initial 24 MON treasury and 1 MON cafeteria refund are seeded demonstration records, not onchain transactions. Each successful slot transfers your new 1 MON commitment to treasury; simulated peer contributions are included in the seeded pool. No deployed contract address is configured.

Photographs: Unsplash remote images. App behavior does not depend on image loading.
