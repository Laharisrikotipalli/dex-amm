# DEX AMM Project

## Overview
This project implements a **Decentralized Exchange (DEX)** using an  
**Automated Market Maker (AMM)** model.

The DEX allows users to:
- Add liquidity
- Remove liquidity
- Swap between two ERC-20 tokens

All swaps follow the **constant product pricing formula**.

The implementation is written in **Solidity** and tested using **Hardhat**, with
a complete automated test suite and **Dockerized execution support**.

---

## Features
- Initial and subsequent liquidity provision
- Liquidity removal with proportional share calculation
- Token swaps using constant product formula (`x * y = k`)
- **0.3% trading fee** for liquidity providers
- Internal liquidity (LP) accounting (no separate LP token)
- Event emission for liquidity and swap actions
- **100% test coverage** (statements, functions, and lines)

---

## Architecture
The system consists of the following components:

### DEX.sol
- Core smart contract
- Manages liquidity pools
- Executes swaps
- Tracks reserves and fees
- Implements AMM logic

### MockERC20.sol
- Mock ERC-20 token
- Used only for testing
- Simulates real token behavior

Liquidity provider balances are tracked internally using a `mapping`
instead of minting a separate LP token contract.

---

## Mathematical Implementation

### Constant Product Formula
The AMM follows the invariant:

```text
x * y = k
````
Where:

x = reserve of token A

y = reserve of token B

k = constant value that should not decrease

This invariant determines swap pricing and ensures pool balance.

----

### Fee Calculation

A 0.3% fee is applied to every swap.

99.7% of the input amount is used for price calculation

0.3% remains in the pool

This mechanism increases the value of liquidity provider shares over time.

------
### Liquidity (LP) Minting Logic
#### First Liquidity Provider
```
liquidityMinted = sqrt(amountA * amountB)
```
#### Subsequent Liquidity Providers
```
liquidityMinted = min(
  (amountA * totalLiquidity) / reserveA,
  (amountB * totalLiquidity) / reserveB
)
```
This ensures fair and proportional ownership of the pool.

----
### Setup Instructions (Local)
#### Prerequisites

Node.js (v16 or above)

npm

Git

----
### Installation
```
git clone https://github.com/Laharisrikotipalli/dex-amm.git
cd dex-amm
npm install
```
#### Compile Contracts
```
npm run compile
```

#### Run Tests
```
npm test
```

#### Run Coverage
```
npm run coverage
```
----
### Setup Instructions (Docker)
#### Prerequisites

Docker

Docker Compose

#### Build and Start Containers
```
docker-compose up -d
```

#### Compile Contracts (Docker)
```
docker-compose exec app npm run compile
```
#### Run Tests (Docker)
```
docker-compose exec app npm test
```

#### Run Coverage (Docker)
```
docker-compose exec app npm run coverage
```
#### Stop Containers
```
docker-compose down
```
----

### Test Coverage

The project includes a comprehensive test suite covering:

Liquidity management

Token swaps

Fee accumulation

Edge cases

Event emission

----

### Coverage Summary

Statements: 100%

Functions: 100%

Lines: 100%

Branches: ~78% (revert paths intentionally excluded)

----
### Contract Addresses

This project was tested locally using the Hardhat network.

No contracts have been deployed to a public testnet or mainnet.

#### Deployment can be performed using:
```
npx hardhat run scripts/deploy.js
```
---
### Security Considerations

Solidity ^0.8.x built-in overflow and underflow protection

Input validation for zero values

Protection against removing more liquidity than owned

Swap amount validation

Reentrancy-safe state update pattern

---

### Known Limitations

Supports only a single token pair

No slippage protection

No deadline parameter for swaps

No external price oracle

No governance or upgrade mechanism
