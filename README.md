# DEX AMM Project

## Overview
This project implements a simple decentralized exchange (DEX) using an
Automated Market Maker (AMM) model. The DEX allows users to add and remove
liquidity and swap between two ERC-20 tokens using a constant product formula.

## Features
- Initial and subsequent liquidity provision
- Liquidity removal with proportional share calculation
- Token swaps using constant product formula (x * y = k)
- 0.3% trading fee for liquidity providers
- LP token minting and burning

## Architecture
The system consists of a single DEX contract that manages token reserves,
liquidity accounting, and swaps. ERC-20 tokens are used for testing via a
MockERC20 contract. Liquidity provider balances are tracked internally using
a mapping rather than a separate LP token contract.

## Mathematical Implementation

### Constant Product Formula
The DEX uses the constant product invariant:

x * y = k

Where:
- x = reserve of token A
- y = reserve of token B
- k = constant value that should never decrease

This invariant determines swap pricing.

### Fee Calculation
A 0.3% fee is applied on each swap.  
Only 99.7% of the input amount is used in the pricing formula, and the
remaining 0.3% stays in the pool, increasing the value of LP shares.

### LP Token Minting
- First liquidity provider:
