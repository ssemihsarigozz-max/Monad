# CommonGround

Conditional collective demand for pre-authorized, fictional service extensions. A supporter sends exactly 1 test MON to the active slot. At the configured threshold, that slot succeeds and the next opens. If an active slot expires, it fails and each supporter can claim one refund.

This is a hackathon demo. Library, Laundry Room, and Cafeteria schedules are fictional; no on-chain transfer proves a real-world donation or institutional agreement.

## Workspace

- `docs/CONTRACT_SPEC.md` is the single source of truth for the smart-contract interface.
- `web/` is owned by the frontend developer.
- `chain/` is owned by the blockchain developer.

## Delivery status

The frontend includes Monad Testnet wallet and contract integration.

## Monad Testnet deployment

- Network: Monad Testnet (`10143`)
- Contract: `0x864890ee1C9A005574808D5D0baF51a06AA0Aa62`
- Deployment transaction: `0x8b9d010a03982d85c63dd1ef64b0212cef71d74dd3fe255c794c42e4b27d54c3`
- Deployment block: `73784625`
- Campaign deadline: 26 October 2026, 10:00:12 UTC (13:00:12 Türkiye time)
- Threshold: `2` supporters per slot
- ABI: `chain/abi/CommonGround.json`
- Deployment status: contract code and all three service configurations confirmed on-chain.

The three services each have three sequential slots. Do not describe the contract, a treasury transfer, or any testnet transaction as proof of a real-world service extension or donation.

