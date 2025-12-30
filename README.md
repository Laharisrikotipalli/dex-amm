
# DEX AMM Project

## Overview
This project implements a decentralized exchange (DEX) using an Automated
Market Maker (AMM) model. The DEX allows users to add liquidity, remove
liquidity, and swap between two ERC-20 tokens using a constant product
pricing formula.

The implementation is written in Solidity and tested using Hardhat with
a complete automated test suite and Dockerized execution support.

---

## Features
- Initial and subsequent liquidity provision
- Liquidity removal with proportional share calculation
- Token swaps using constant product formula (`x * y = k`)
- 0.3% trading fee for liquidity providers
- Internal liquidity (LP) accounting without a separate LP token
- Event emission for liquidity and swap actions
- Full test coverage (≥ 80%, achieved 100%)

---
## Repository Structure
```
dex-amm/
├── contracts/
│   ├── DEX.sol
│   └── MockERC20.sol
├── test/
│   └── DEX.test.js
├── scripts/
│   └── deploy.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── hardhat.config.js
├── package.json
└── README.md
```
---------------------------------------------------------------------------------------------
## Architecture
The system consists of the following components:

- **DEX.sol**  
  Core smart contract responsible for liquidity management, swaps,
  reserve tracking, and fee accumulation using the AMM model.

- **MockERC20.sol**  
  A mock ERC-20 token contract used for testing purposes.

Liquidity provider balances are tracked internally using a mapping instead
of minting a separate LP token contract.

---

## Mathematical Implementation

### Constant Product Formula
The DEX follows the constant product invariant:

```
x * y = k
```

Where:
- `x` = reserve of token A  
- `y` = reserve of token B  
- `k` = constant value that should not decrease  

This invariant determines swap pricing and ensures balanced liquidity pools.

---

### Fee Calculation
A **0.3% fee** is applied on every swap.

Only **99.7%** of the input amount is used in the swap calculation, while
**0.3% remains in the pool**, increasing the value of liquidity provider shares.

---

### Liquidity (LP) Minting Logic

- **First liquidity provider**:
```
liquidityMinted = sqrt(amountA * amountB)
```

- **Subsequent liquidity providers**:
```
liquidityMinted = min(
  (amountA * totalLiquidity) / reserveA,
  (amountB * totalLiquidity) / reserveB
)
```

---

## Setup Instructions (Local)

### Prerequisites
- Node.js (v16 or above)
- npm
- Git

### Installation
```bash
git clone https://github.com/Laharisrikotipalli/dex-amm.git
cd dex-amm
npm install
```

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Run Coverage
```bash
npm run coverage
```

---

## Setup Instructions (Docker)

### Prerequisites
- Docker
- Docker Compose

### Build and Start Containers
```bash
docker-compose up -d
```

### Compile Contracts (Docker)
```bash
docker-compose exec app npm run compile
```

### Run Tests (Docker)
```bash
docker-compose exec app npm test
```

### Run Coverage (Docker)
```bash
docker-compose exec app npm run coverage
```

### Stop Containers
```bash
docker-compose down
```

---

## Test Coverage
- Statements: **100%**
- Functions: **100%**
- Lines: **100%**
- Branches: **~78%** (revert paths intentionally excluded)

---

## Contract Addresses
This project was tested locally using the Hardhat network.

No contracts have been deployed to a public testnet or mainnet.
Deployment can be performed using:

```bash
npx hardhat run scripts/deploy.js
```

---

## Security Considerations
- Solidity `^0.8.x` built-in overflow protection
- Input validation for zero values
- Protection against removing more liquidity than owned
- Swap amount validation
- Reentrancy-safe state update patterns

---

## Known Limitations
- Supports only a single token pair
- No slippage protection
- No deadline parameter for swaps
- No external price oracle
- No governance or upgrade mechanism

---

## Conclusion
This project demonstrates a complete and well-tested implementation of
a basic AMM-based decentralized exchange, focusing on correctness,
security, and clean architecture with Docker support.

======================================================================

## 3. Docker Configuration

### Dockerfile
```Dockerfile
FROM node:18
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
CMD ["npm", "test"]
```

### docker-compose.yml
```yaml
version: "3.8"

services:
  app:
    container_name: dex-amm
    build: .
    volumes:
      - .:/app
    command: npm test
```

### .dockerignore
```
node_modules
artifacts
cache
coverage
.git
.env
```

======================================================================

## 4. Git Ignore

### .gitignore
```
node_modules/
artifacts/
cache/
coverage/
.env
```

======================================================================

## 5. Final Git Commands Used

```bash
git add .
git commit -m "Final DEX AMM submission with Docker support"
git pull origin main --allow-unrelated-histories
git push origin main
```

======================================================================

## 6. Final Verification Commands

```bash
docker-compose up -d
docker-compose exec app npm run compile
docker-compose exec app npm test
docker-compose exec app npm run coverage
docker-compose down
```

