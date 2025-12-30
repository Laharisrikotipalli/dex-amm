This is a clean, professionally formatted `README.md` for your DEX AMM project. It uses structured Markdown, clear hierarchy, and LaTeX for the mathematical formulas to ensure it looks great on GitHub.

```markdown
# DEX AMM Project

## Overview
This project implements a **Decentralized Exchange (DEX)** utilizing an **Automated Market Maker (AMM)** model. The platform enables users to participate in decentralized finance by providing liquidity and performing permissionless token swaps.

The DEX supports:
* **Adding Liquidity:** Users provide token pairs to earn fees.
* **Removing Liquidity:** Users withdraw their proportional share of the pool.
* **Token Swaps:** Instant exchange between two ERC-20 tokens.

All swaps are governed by the **Constant Product Pricing Formula**, ensuring continuous liquidity regardless of trade size.

---

## Features
* **Initial & Subsequent Liquidity:** Optimized logic for pool initialization and fair share distribution for later providers.
* **Constant Product AMM:** Implements the $x \cdot y = k$ invariant.
* **0.3% Trading Fee:** Automated fee collection to incentivize liquidity providers.
* **Internal LP Accounting:** Efficient tracking of provider shares via internal mappings (gas-optimized).
* **Automated Testing:** 100% test coverage for core logic and edge cases.
* **Dockerized Environment:** Fully containerized setup for consistent development and testing.

---

## Architecture
The system is built with modularity and security in mind:

### Core Components
* **`DEX.sol`**: The heart of the protocol. It manages reserves, calculates swap prices, handles fee accumulation, and tracks LP ownership.
* **`MockERC20.sol`**: A standardized ERC-20 implementation used for rigorous testing of swap and transfer functionalities.



---

## Mathematical Implementation

### 1. Constant Product Formula
The DEX maintains the invariant $k$ to determine the price of assets:
$$x \cdot y = k$$
Where:
* $x$: Reserve of Token A
* $y$: Reserve of Token B
* $k$: The invariant product that must remain constant (increasing only via fees).

### 2. Fee Mechanism
A **0.3% fee** is applied to every swap. When a user swaps an input amount ($\Delta x$):
1.  $99.7\%$ of the input is used to calculate the output $(\Delta y)$.
2.  $0.3\%$ remains in the pool, effectively increasing $k$ for all LPs.

### 3. Liquidity (LP) Minting Logic
To ensure fair ownership, the amount of liquidity shares minted is calculated as follows:

**First Liquidity Provider:**
$$L = \sqrt{amount_A \cdot amount_B}$$

**Subsequent Providers:**
$$L = \min\left( \frac{amount_A \cdot T}{R_A}, \frac{amount_B \cdot T}{R_B} \right)$$
Where:
* $T$: Total existing liquidity shares.
* $R_A, R_B$: Current reserves of Token A and B.

---

## Setup Instructions

### Local Environment
**Prerequisites:** Node.js (v16+), npm, Git.

1. **Clone & Install:**
   ```bash
   git clone [https://github.com/Laharisrikotipalli/dex-amm.git](https://github.com/Laharisrikotipalli/dex-amm.git)
   cd dex-amm
   npm install

```

2. **Compile Contracts:**
```bash
npm run compile

```


3. **Run Tests & Coverage:**
```bash
npm test
npm run coverage

```



### Docker Execution

**Prerequisites:** Docker, Docker Compose.

1. **Start Containers:** `docker-compose up -d`
2. **Test via Docker:** ```bash
docker-compose exec app npm test
```


```



---

## Test Coverage

The project maintains a **100% coverage** rate for critical paths:

| Category | Coverage |
| --- | --- |
| **Statements** | 100% |
| **Functions** | 100% |
| **Lines** | 100% |
| **Branches** | ~78% (Excluding intentional revert paths) |

---

## Security & Limitations

### Security Measures

* **Solidity ^0.8.x**: Native protection against overflow/underflow.
* **Input Validation**: Strict checks for zero-value transfers and insufficient balances.
* **State Integrity**: State updates follow the Checks-Effects-Interactions pattern where applicable.

### Known Limitations

* Supports a **single token pair** per deployment.
* No **Slippage Protection** (Users cannot set a minimum output amount).
* No **Deadline Parameter** (Transactions do not expire).
* Lacks an external **Price Oracle** (Price is purely market-driven within the pool).

---

## Deployment

Currently, the project is configured for local development. To deploy to a network:

1. Update `hardhat.config.js` with your provider URL and private key.
2. Run:
```bash
npx hardhat run scripts/deploy.js --network <network_name>

```
