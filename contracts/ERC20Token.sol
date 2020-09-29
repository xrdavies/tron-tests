// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./lib/ERC20.sol";
import "./IERC20Token.sol";

contract ERC20Token is IERC20Token, ERC20 {

    address private minter;

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor(string memory name, string memory symbol, uint8 decimals, address owner) public
    {
        // minter = _msgSender();
        minter = owner;

        _name = name;
        _symbol = symbol;
        _decimals = decimals;
    }

    modifier onlyMinter() {
        require(_msgSender() == minter, "SideToken: Caller is not the minter");
        _;
    }

    function mint(
        address account,
        uint256 amount
    )
    external onlyMinter
    {
        _mint(account, amount);
    }

    function name() public view returns (string memory)  {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }
}