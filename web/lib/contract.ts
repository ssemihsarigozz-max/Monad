// ABI source: chain/abi/CommonGround.json. This focused interface keeps the browser bundle small.
export const COMMON_GROUND_ADDRESS = "0x864890ee1C9A005574808D5D0baF51a06AA0Aa62";
export const MONAD_CHAIN_ID = 10143;
export const MONAD_CHAIN_HEX = "0x279f";
export const COMMON_GROUND_ABI = [
 "function contribute(uint256 serviceId) payable", "function finalizeExpired(uint256 serviceId)", "function claimRefund(uint256 serviceId,uint256 slotIndex)", "function getService(uint256 serviceId) view returns (uint256 deadline,uint256 threshold,uint256 activeSlot,bool closed)", "function getSlot(uint256 serviceId,uint256 slotIndex) view returns (uint8 status,uint256 supportCount)", "function hasSupported(uint256 serviceId,uint256 slotIndex,address user) view returns (bool)", "function impactAccrued() view returns (uint256)",
] as const;
