// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title SentientCents — royalty/royalty-pool token (2 decimals) with on-transfer royalty and roles
contract SentientCents is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE      = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE      = keccak256("BURNER_ROLE");
    bytes32 public constant ROYALTY_ADMIN_ROLE = keccak256("ROYALTY_ADMIN_ROLE");

    /// @dev royalty recipient and royalty expressed in basis points (bps, 10000 = 100%)
    address public royaltyRecipient;
    uint256 public royaltyBasisPoints; // 0..10000

    event RoyaltyRecipientUpdated(address indexed previous, address indexed current);
    event RoyaltyBasisPointsUpdated(uint256 previousBps, uint256 currentBps);

    constructor(
        string memory name_,
        string memory symbol_,
        address admin_,
        address royaltyRecipient_,
        uint256 royaltyBps_
    ) ERC20(name_, symbol_) {
        address actualAdmin = admin_ == address(0) ? _msgSender() : admin_;
        _grantRole(DEFAULT_ADMIN_ROLE, actualAdmin);
        _grantRole(MINTER_ROLE, actualAdmin);
        _grantRole(BURNER_ROLE, actualAdmin);
        _grantRole(ROYALTY_ADMIN_ROLE, actualAdmin);

        royaltyRecipient = royaltyRecipient_;
        require(royaltyBps_ <= 10000, "SentientCents: bp>10000");
        royaltyBasisPoints = royaltyBps_;
    }

    /// @notice SentientCents uses 2 decimals (cents-like)
    function decimals() public pure override returns (uint8) {
        return 2;
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }

    function setRoyaltyRecipient(address _recipient) external onlyRole(ROYALTY_ADMIN_ROLE) {
        emit RoyaltyRecipientUpdated(royaltyRecipient, _recipient);
        royaltyRecipient = _recipient;
    }

    function setRoyaltyBasisPoints(uint256 _bps) external onlyRole(ROYALTY_ADMIN_ROLE) {
        require(_bps <= 10000, "SentientCents: bp>10000");
        emit RoyaltyBasisPointsUpdated(royaltyBasisPoints, _bps);
        royaltyBasisPoints = _bps;
    }

    function _update(address from, address to, uint256 amount) internal virtual override {
        // Handle mint and burn cases (from or to is address(0))
        if (from == address(0) || to == address(0)) {
            super._update(from, to, amount);
            return;
        }

        if (
            royaltyRecipient == address(0)
            || royaltyBasisPoints == 0
            || from == royaltyRecipient
            || to == royaltyRecipient
        ) {
            super._update(from, to, amount);
            return;
        }

        uint256 fee = (amount * royaltyBasisPoints) / 10000;
        if (fee == 0) {
            super._update(from, to, amount);
            return;
        }

        uint256 net = amount - fee;
        super._update(from, royaltyRecipient, fee);
        super._update(from, to, net);
    }
}
