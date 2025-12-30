# DEX AMM Project

## Overview
This project implements a decentralized exchange (DEX) using an Automated
Market Maker (AMM) model based on the constant product formula.

## Features
- Liquidity provision and removal
- Token swaps
- 0.3% trading fee
- Fully tested with Docker support

## Architecture
Single AMM contract with internal liquidity tracking.

## Mathematical Implementation
Uses x * y = k invariant.

## Setup Instructions
### Local
npm install  
npm test  

### Docker
docker-compose up -d  
docker-compose exec app npm test  

## Contract Addresses
Local Hardhat network only.

## Known Limitations
Single trading pair, no slippage protection.

## Security Considerations
Uses Solidity 0.8 overflow protection and input validation.
