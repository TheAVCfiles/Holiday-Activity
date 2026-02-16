# Holiday Activity - Choreographic Rights Management

A decentralized platform for choreographic rights management using blockchain technology and smart contracts.

## Features

### Smart Contracts

#### Stagecoin (ERC20 Token)
- Role-based access control (Minter, Burner, Royalty Admin)
- Automatic royalty collection on transfers
- Configurable royalty basis points (0-10000, where 10000 = 100%)
- Royalty recipient management

#### SentientCents (ERC20 Token with 2 decimals)
- Same features as Stagecoin
- Uses 2 decimals (cents-like) for more precise financial transactions

### Frontend

#### PayGait Local Ingest
- High-fidelity kinesthetic hashing interface
- Choreographer claim stake functionality
- Movement syntax protection protocol
- Modern, responsive UI built with React and Tailwind CSS

## Project Structure

```
.
├── contracts/           # Solidity smart contracts
│   ├── Stagecoin.sol
│   └── SentientCents.sol
├── src/                # React frontend
│   ├── components/
│   │   └── PayGaitLocalIngest.jsx
│   ├── main.jsx
│   └── index.css
├── test/               # Contract tests
│   └── contracts.test.js
├── hardhat.config.js   # Hardhat configuration
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json
```

## Installation

```bash
npm install
```

## Usage

### Compile Smart Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Run Development Server (Frontend)

```bash
npm run dev
```

### Build Frontend

```bash
npm run build
```

## Smart Contract Features

### Royalty Mechanism

Both Stagecoin and SentientCents implement an automatic royalty collection mechanism:

- When tokens are transferred, a configurable percentage (royalty basis points) is automatically deducted
- The deducted amount goes to the royalty recipient
- Royalty is not charged when:
  - Royalty recipient is address(0)
  - Royalty basis points is 0
  - Transfer involves the royalty recipient (to avoid recursion)

### Access Control

The contracts use OpenZeppelin's AccessControl for role management:

- **DEFAULT_ADMIN_ROLE**: Can manage all roles
- **MINTER_ROLE**: Can mint new tokens
- **BURNER_ROLE**: Can burn tokens
- **ROYALTY_ADMIN_ROLE**: Can update royalty settings

## License

MIT
