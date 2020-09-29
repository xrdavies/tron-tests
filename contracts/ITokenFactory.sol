// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

interface ITokenFactory {

    function createSideToken(string calldata name, string calldata symbol, address owner, uint8 decimals) external returns(address);

    event ERC20TokenCreated(address indexed sideToken, string symbol, uint8 decimals);
}