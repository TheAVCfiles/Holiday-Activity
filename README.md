# Holiday Activity - StagePortOS

This repository contains the StagePortOS project, including ERC20 smart contracts with royalty-on-transfer functionality and a web-based interface for choreographic work protection.

## Project Structure

```
.
├── contracts/              # Solidity smart contracts
│   ├── Stagecoin.sol      # ERC20 token with 18 decimals and royalty mechanism
│   └── SentientCents.sol  # ERC20 token with 2 decimals (cents-like)
├── test/                  # Contract test suites
│   ├── Stagecoin.test.js
│   └── SentientCents.test.js
├── src/                   # React application source
│   └── App.js            # StagePortOS main interface
├── project/              # Static HTML prototypes
│   ├── prima-first-dreamm.html
│   └── paygait-local.html
├── hardhat.config.js     # Hardhat configuration
└── package.json          # Node.js dependencies
```

## Smart Contracts

### Stagecoin
- **ERC20 token** with 18 decimals
- **AccessControl roles**: MINTER_ROLE, BURNER_ROLE, ROYALTY_ADMIN_ROLE, DEFAULT_ADMIN_ROLE
- **Royalty-on-transfer**: Configurable basis points (0-10000, where 10000 = 100%)
- **Features**:
  - Mint tokens (MINTER_ROLE only)
  - Burn tokens (BURNER_ROLE only)
  - Configure royalty recipient and rate (ROYALTY_ADMIN_ROLE only)
  - Automatic royalty collection on transfers

### SentientCents
- **ERC20 token** with 2 decimals (cents-like denomination)
- Same role-based access control and royalty features as Stagecoin
- Optimized for cent-based accounting

## Setup

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npm test
```

## Usage

### Running Tests
```bash
npx hardhat test
```

### Contract Deployment
```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## Web Interface

The project includes a React-based interface (StagePortOS) with the following features:
- **PayGait Local**: Kinesthetic hashing and choreographer claim stakes
- **Release Checklist**: Standard operating procedures for deployment
- **Asset Defense**: Protection tools for creative works
- **Legal Wrapper**: Legal framework and compliance
- **Distribution Logs**: Track deployment history

## Key Features

### Royalty-on-Transfer
Both tokens implement a royalty mechanism where:
- A percentage of each transfer is sent to a designated royalty recipient
- Royalty is calculated in basis points (1 bp = 0.01%)
- No royalty is charged when:
  - Royalty recipient is address(0)
  - Royalty basis points is 0
  - Transfer involves the royalty recipient (to avoid recursion)

### Access Control
Four distinct roles provide granular permission management:
- **DEFAULT_ADMIN_ROLE**: Can grant/revoke other roles
- **MINTER_ROLE**: Can mint new tokens
- **BURNER_ROLE**: Can burn tokens
- **ROYALTY_ADMIN_ROLE**: Can configure royalty settings

## Security

The contracts follow OpenZeppelin standards and best practices:
- Uses OpenZeppelin's battle-tested ERC20 and AccessControl implementations
- Input validation on all public functions
- Protection against reentrancy in transfer logic
- Event emission for all state changes

## License

MIT License - See individual file headers for details.
