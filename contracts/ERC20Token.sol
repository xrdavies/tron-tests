// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

import "./ERC20/ERC20Detailed.sol";
import "./ERC20/ERC20.sol";

contract ERC20Token is ERC20Detailed, ERC20 {

    address public minter;

    modifier onlyMinter() {
        require(_msgSender() == minter, "SideToken: Caller is not the minter");
        _;
    }

    constructor(string memory name, string memory symbol, uint8 decimals, address owner)
        ERC20Detailed(name, symbol, decimals) public
    {
        // minter = _msgSender();
        minter = owner;
    }

    function mint(
        address account,
        uint256 amount
    )
    external onlyMinter
    {
        _mint(account, amount);
    }
}