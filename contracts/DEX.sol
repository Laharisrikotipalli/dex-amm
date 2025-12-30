// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DEX
 * @author Lahari
 * @notice A simple Automated Market Maker (AMM) based decentralized exchange
 * @dev Implements constant product formula (x * y = k)
 */
contract DEX {
    /// @notice Address of token A
    address public tokenA;

    /// @notice Address of token B
    address public tokenB;

    /// @notice Reserve amount of token A
    uint256 public reserveA;

    /// @notice Reserve amount of token B
    uint256 public reserveB;

    /// @notice Total liquidity issued
    uint256 public totalLiquidity;

    /// @notice Liquidity balance per provider
    mapping(address => uint256) public liquidity;

    uint256 private constant FEE_NUMERATOR = 997;
    uint256 private constant FEE_DENOMINATOR = 1000;

    /* ================= EVENTS ================= */

    /**
     * @notice Emitted when liquidity is added
     * @param provider Address adding liquidity
     * @param amountA Amount of token A added
     * @param amountB Amount of token B added
     * @param liquidityMinted Liquidity tokens minted
     */
    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidityMinted
    );

    /**
     * @notice Emitted when liquidity is removed
     * @param provider Address removing liquidity
     * @param amountA Amount of token A returned
     * @param amountB Amount of token B returned
     * @param liquidityBurned Liquidity tokens burned
     */
    event LiquidityRemoved(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidityBurned
    );

    /**
     * @notice Emitted when a swap occurs
     * @param trader Address performing the swap
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input token
     * @param amountOut Amount of output token
     */
    event Swap(
        address indexed trader,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    /* ================= CONSTRUCTOR ================= */

    /**
     * @notice Creates a new DEX instance
     * @param _tokenA Address of token A
     * @param _tokenB Address of token B
     */
    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != _tokenB, "Same token");
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    /* ================= LIQUIDITY ================= */

    /**
     * @notice Adds liquidity to the pool
     * @param amountA Amount of token A to deposit
     * @param amountB Amount of token B to deposit
     * @return liquidityMinted Amount of liquidity minted
     */
    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external returns (uint256 liquidityMinted) {
        require(amountA > 0 && amountB > 0, "Zero liquidity");

        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);

        if (totalLiquidity == 0) {
            liquidityMinted = _sqrt(amountA * amountB);
        } else {
            liquidityMinted = _min(
                (amountA * totalLiquidity) / reserveA,
                (amountB * totalLiquidity) / reserveB
            );
        }

        require(liquidityMinted > 0, "Zero LP");

        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;

        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidityMinted);
    }

    /**
     * @notice Removes liquidity from the pool
     * @param liquidityAmount Amount of liquidity to remove
     * @return amountA Amount of token A returned
     * @return amountB Amount of token B returned
     */
    function removeLiquidity(
        uint256 liquidityAmount
    ) external returns (uint256 amountA, uint256 amountB) {
        require(liquidityAmount > 0, "Zero burn");
        require(liquidity[msg.sender] >= liquidityAmount, "Not enough LP");

        amountA = (liquidityAmount * reserveA) / totalLiquidity;
        amountB = (liquidityAmount * reserveB) / totalLiquidity;

        liquidity[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;

        reserveA -= amountA;
        reserveB -= amountB;

        IERC20(tokenA).transfer(msg.sender, amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidityAmount);
    }

    /* ================= SWAPS ================= */

    /**
     * @notice Swaps one token for the other
     * @param tokenIn Address of input token
     * @param amountIn Amount of input token
     * @return amountOut Amount of output token
     */
    function swap(
        address tokenIn,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        require(amountIn > 0, "Zero swap");

        bool isAToB = tokenIn == tokenA;
        require(isAToB || tokenIn == tokenB, "Invalid token");

        (uint256 reserveIn, uint256 reserveOut) = isAToB
            ? (reserveA, reserveB)
            : (reserveB, reserveA);

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        uint256 amountInWithFee =
            (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;

        amountOut =
            (reserveOut * amountInWithFee) /
            (reserveIn + amountInWithFee);

        require(amountOut > 0, "Zero output");

        address tokenOut = isAToB ? tokenB : tokenA;

        if (isAToB) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        IERC20(tokenOut).transfer(msg.sender, amountOut);

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    /* ================= INTERNAL HELPERS ================= */

    /**
     * @dev Returns the minimum of two numbers
     */
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Babylonian square root method
     */
    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
