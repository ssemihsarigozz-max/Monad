// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract CommonGround {
    enum SlotStatus { Locked, Active, Successful, Failed }
    struct Slot { SlotStatus status; uint256 supportCount; }
    struct Service { uint256 deadline; uint256 threshold; uint256 activeSlot; bool closed; Slot[3] slots; }

    address payable public immutable treasury;
    Service[3] private services;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) private supported;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) private refunded;
    uint256 private accrued;
    uint256 private withdrawn;
    bool private entered;

    event Supported(uint256 indexed serviceId, uint256 indexed slotIndex, address indexed supporter, uint256 amount);
    event SlotSucceeded(uint256 indexed serviceId, uint256 indexed slotIndex, uint256 supportCount, uint256 impactAdded);
    event SlotFailed(uint256 indexed serviceId, uint256 indexed slotIndex, uint256 refundableAmount);
    event RefundClaimed(uint256 indexed serviceId, uint256 indexed slotIndex, address indexed supporter, uint256 amount);
    event ImpactWithdrawn(address indexed treasury, uint256 amount, uint256 totalWithdrawn);

    modifier validService(uint256 serviceId) { require(serviceId < 3, "invalid service"); _; }
    modifier nonReentrant() { require(!entered, "reentrant call"); entered = true; _; entered = false; }

    constructor(address payable treasury_, uint256[] memory serviceDeadlines_, uint256[] memory serviceThresholds_) {
        require(treasury_ != address(0), "zero treasury");
        require(serviceDeadlines_.length == 3 && serviceThresholds_.length == 3, "three services required");
        treasury = treasury_;
        for (uint256 i; i < 3; i++) {
            require(serviceDeadlines_[i] > block.timestamp, "deadline must be future");
            require(serviceThresholds_[i] >= 2, "threshold below two");
            services[i].deadline = serviceDeadlines_[i];
            services[i].threshold = serviceThresholds_[i];
            services[i].slots[0].status = SlotStatus.Active;
        }
    }

    function contribute(uint256 serviceId) external payable validService(serviceId) {
        Service storage service = services[serviceId];
        require(!service.closed, "service closed");
        require(block.timestamp < service.deadline, "campaign expired");
        require(msg.value == 1 ether, "send exactly one MON");
        uint256 slotIndex = service.activeSlot;
        require(slotIndex < 3 && service.slots[slotIndex].status == SlotStatus.Active, "no active slot");
        require(!supported[serviceId][slotIndex][msg.sender], "already supported");
        supported[serviceId][slotIndex][msg.sender] = true;
        Slot storage slot = service.slots[slotIndex];
        slot.supportCount++;
        emit Supported(serviceId, slotIndex, msg.sender, msg.value);
        if (slot.supportCount == service.threshold) {
            slot.status = SlotStatus.Successful;
            uint256 impact = slot.supportCount * 1 ether;
            accrued += impact;
            emit SlotSucceeded(serviceId, slotIndex, slot.supportCount, impact);
            if (slotIndex == 2) { service.closed = true; service.activeSlot = 3; }
            else { service.activeSlot = slotIndex + 1; service.slots[slotIndex + 1].status = SlotStatus.Active; }
        }
    }

    function finalizeExpired(uint256 serviceId) external validService(serviceId) {
        Service storage service = services[serviceId];
        require(!service.closed, "service closed");
        require(block.timestamp >= service.deadline, "campaign not expired");
        uint256 slotIndex = service.activeSlot;
        require(slotIndex < 3 && service.slots[slotIndex].status == SlotStatus.Active, "no active slot");
        Slot storage slot = service.slots[slotIndex];
        slot.status = SlotStatus.Failed;
        service.closed = true;
        emit SlotFailed(serviceId, slotIndex, slot.supportCount * 1 ether);
    }

    function claimRefund(uint256 serviceId, uint256 slotIndex) external validService(serviceId) nonReentrant {
        require(slotIndex < 3, "invalid slot");
        require(services[serviceId].slots[slotIndex].status == SlotStatus.Failed, "slot not failed");
        require(supported[serviceId][slotIndex][msg.sender], "not a supporter");
        require(!refunded[serviceId][slotIndex][msg.sender], "refund already claimed");
        refunded[serviceId][slotIndex][msg.sender] = true;
        (bool sent,) = payable(msg.sender).call{value: 1 ether}("");
        require(sent, "refund transfer failed");
        emit RefundClaimed(serviceId, slotIndex, msg.sender, 1 ether);
    }

    function withdrawImpact() external nonReentrant {
        require(msg.sender == treasury, "only treasury");
        uint256 amount = accrued - withdrawn;
        require(amount > 0, "nothing to withdraw");
        withdrawn += amount;
        (bool sent,) = treasury.call{value: amount}("");
        require(sent, "treasury transfer failed");
        emit ImpactWithdrawn(treasury, amount, withdrawn);
    }

    function getService(uint256 serviceId) external view validService(serviceId) returns (uint256 deadline, uint256 threshold, uint256 activeSlot, bool closed) { Service storage s = services[serviceId]; return (s.deadline, s.threshold, s.activeSlot, s.closed); }
    function getSlot(uint256 serviceId, uint256 slotIndex) external view validService(serviceId) returns (uint8 status, uint256 supportCount) { require(slotIndex < 3, "invalid slot"); Slot storage slot = services[serviceId].slots[slotIndex]; return (uint8(slot.status), slot.supportCount); }
    function hasSupported(uint256 serviceId, uint256 slotIndex, address user) external view validService(serviceId) returns (bool) { require(slotIndex < 3, "invalid slot"); return supported[serviceId][slotIndex][user]; }
    function impactAccrued() external view returns (uint256) { return accrued; }
    function impactWithdrawn() external view returns (uint256) { return withdrawn; }
}
