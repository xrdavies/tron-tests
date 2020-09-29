// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

interface ITokenFactory {

    function createSideToken(string calldata name, string calldata symbol, uint8 decimals, address owner) external returns(address);

    event ERC20TokenCreated(address indexed sideToken, string symbol, uint8 decimals);
}