// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./ERC20Token.sol";

contract TokenFactory {
    address private _primary;

    event ERC20TokenCreated(address indexed sideToken, string symbol, uint8 decimals);

    constructor() public {
        _primary = _msgSender();
    }

    function _msgSender() internal view returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal view returns (bytes memory) {
        this;
        return msg.data;
    }

    function primary() public view returns (address) {
        return _primary;
    }

    modifier onlyPrimary() {
        require(
            _msgSender() == _primary,
            "TokenFactory: caller is not the primary account"
        );
        _;
    }

    function createERC20Token(
        string calldata name,
        string calldata symbol,
        uint8 decimals,
        address owner
    ) external onlyPrimary returns (address) {
        address token = address(new ERC20Token(name, symbol, decimals, owner));
        emit ERC20TokenCreated(token, symbol, decimals);
        return token;
    }
}
