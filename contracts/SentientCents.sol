// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title SentientCents - ERC20 reward token with 2-decimal cents-like unit
contract SentientCents is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant ROYALTY_ADMIN_ROLE = keccak256("ROYALTY_ADMIN_ROLE");

    address public royaltyRecipient;
    uint256 public royaltyBasisPoints;

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

    function _transfer(address from, address to, uint256 amount) internal virtual override {
        if (
            royaltyRecipient == address(0)
            || royaltyBasisPoints == 0
            || from == royaltyRecipient
            || to == royaltyRecipient
        ) {
            super._transfer(from, to, amount);
            return;
        }

        uint256 fee = (amount * royaltyBasisPoints) / 10000;
        // Gas optimization: avoid two transfers when fee rounds to zero
        if (fee == 0) {
            super._transfer(from, to, amount);
            return;
        }

        uint256 net = amount - fee;
        super._transfer(from, royaltyRecipient, fee);
        super._transfer(from, to, net);
    }
}
