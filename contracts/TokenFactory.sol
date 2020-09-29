// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "./ERC20Token.sol";
import "./ITokenFactory.sol";
import "./lib/Secondary.sol";

contract TokenFactory is ITokenFactory, Secondary {
    function createERC20Token(
        string calldata name,
        string calldata symbol,
        uint8 decimals,
        address owner
    ) external onlyPrimary returns (address) {
        address token = address(new ERC20Token(name, symbol, owner, decimals));
        emit ERC20TokenCreated(token, symbol, decimals);
        return token;
    }
}
