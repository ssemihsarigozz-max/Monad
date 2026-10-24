# CommonGround contract specification

## Scope and constants

The implementation target is Solidity `0.8.24`. The contract accepts native test MON; `1 ether` means `10^18` native-token base units. No ERC-20 token is used.

The constructor is:

```solidity
constructor(
    address payable treasury_,
    uint256[] memory serviceDeadlines_,
    uint256[] memory serviceThresholds_
)
```

Validation: `treasury_` is nonzero; both arrays have exactly three entries; every deadline is strictly greater than deployment `block.timestamp`; every threshold is at least `2`; and no service is configured twice. The demo passes threshold `2`; a realistic deployment passes a threshold of at least `30`. The contract creates three services, each with exactly three sequential slots.

Service IDs are `0=Library`, `1=Laundry Room`, `2=Cafeteria`. Slot indexes are `0`, `1`, `2`. Labels are UI metadata, not contract state:

| Service | Slot 0 | Slot 1 | Slot 2 |
| --- | --- | --- | --- |
| Library | 00:00–00:30 | 00:30–01:00 | 01:00–01:30 |
| Laundry Room | 23:00–23:30 | 23:30–00:00 | 00:00–00:30 |
| Cafeteria | 20:00–20:30 | 20:30–21:00 | 21:00–21:30 |

Labels that cross midnight are display strings only; their chronological meaning is defined by their slot order, not by a date stored on-chain. `serviceDeadlines_[serviceId]` is the shared Unix contribution deadline for all slots in that service.

## Storage model and statuses

```solidity
enum SlotStatus { Locked, Active, Successful, Failed }
```

Numeric values are `Locked=0`, `Active=1`, `Successful=2`, `Failed=3`. At initialization slot `0` is Active and slots `1` and `2` are Locked. An Active slot whose deadline has passed remains numerically `Active` until `finalizeExpired` is called; clients must display it as **Expired—finalization pending** and must not offer contribution.

Each service records `deadline`, `threshold`, `activeSlot`, `closed`, and three slots. Each slot records `status` and `supportCount`. A mapping records whether an address supported a particular service and slot; another mapping records whether it has already claimed that slot's refund.

## External interface

```solidity
function contribute(uint256 serviceId) external payable;
function finalizeExpired(uint256 serviceId) external;
function claimRefund(uint256 serviceId, uint256 slotIndex) external;
function withdrawImpact() external;

function getService(uint256 serviceId)
    external view
    returns (uint256 deadline, uint256 threshold, uint256 activeSlot, bool closed);

function getSlot(uint256 serviceId, uint256 slotIndex)
    external view
    returns (uint8 status, uint256 supportCount);

function hasSupported(uint256 serviceId, uint256 slotIndex, address user)
    external view
    returns (bool);

function impactAccrued() external view returns (uint256);
function impactWithdrawn() external view returns (uint256);
```

`contribute` requires a valid, unclosed service; an Active slot; `block.timestamp < deadline`; exact `msg.value == 1 ether`; and that the sender has not already supported the current slot. Its only target is the current Active slot; callers do not select a slot.

On a contribution that reaches the threshold, that slot becomes Successful and its `supportCount * 1 ether` is added to accrued impact. If it was slot 0 or 1, the next slot becomes Active. If it was slot 2, the service becomes closed with no Active slot (use `activeSlot=3` as a sentinel in `getService`).

`finalizeExpired` is permissionless. It requires a valid, unclosed service, an Active slot, and `block.timestamp >= deadline`; equality therefore counts as expired. It marks only that Active slot Failed and closes the service. Later slots remain Locked. Earlier Successful slots remain Successful.

`claimRefund` requires a valid service and slot, Failed status, recorded support by `msg.sender`, and no previous claim. It marks the claim before transferring exactly `1 ether` to `msg.sender`, reverting if the transfer fails.

`withdrawImpact` can be called only by `treasury`. It transfers `impactAccrued - impactWithdrawn` to the treasury, then increments `impactWithdrawn` by that amount before external transfer. It reverts if the available amount is zero or the transfer fails.

## Events

```solidity
event Supported(uint256 indexed serviceId, uint256 indexed slotIndex, address indexed supporter, uint256 amount);
event SlotSucceeded(uint256 indexed serviceId, uint256 indexed slotIndex, uint256 supportCount, uint256 impactAdded);
event SlotFailed(uint256 indexed serviceId, uint256 indexed slotIndex, uint256 refundableAmount);
event RefundClaimed(uint256 indexed serviceId, uint256 indexed slotIndex, address indexed supporter, uint256 amount);
event ImpactWithdrawn(address indexed treasury, uint256 amount, uint256 totalWithdrawn);
```

All successful contribution amounts are 1 MON per event. `SlotFailed.refundableAmount` is the failed slot's `supportCount * 1 ether`.

## Accounting invariants

- Contract balance equals successful funds not yet withdrawn plus failed-slot refunds not yet claimed plus active-slot pending contributions.
- `impactAccrued` is the cumulative value from threshold-reaching slots; `impactWithdrawn` is the cumulative value transferred to treasury.
- Available treasury withdrawal is exactly `impactAccrued - impactWithdrawn`.
- Pending Active and refundable Failed balances are never part of available treasury withdrawal.
- Every Failed support can be refunded once; every Successful support is irrevocably impact-accrued.
- There is one support per wallet per service and slot. Because each service closes on its final success or any failure, a wallet cannot support a later slot after a failed service.

## Required implementation checks

1. Reject any payment other than exactly 1 MON and repeat support of the active slot.
2. With a threshold of 2, the second support succeeds the slot and activates the next one.
3. Expiry at deadline equality fails the active slot; later slots stay Locked.
4. A failed-slot supporter gets one 1-MON refund; a second claim reverts.
5. Treasury cannot withdraw pending or refundable funds; it can withdraw only accrued successful funds.
6. ABI output must be produced from the actual compilation artifact and match the signatures above.

