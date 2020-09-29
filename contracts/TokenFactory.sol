// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./ERC20Token.sol";
import "./IERC20Token.sol";

contract TokenFactory {
    address private _primary;

    mapping (address => IERC20Token) mappedTokens;

    event ERC20TokenCreated(address indexed sideToken, string symbol, uint8 decimals);

    constructor() public {
        _primary = _msgSender();
    }

    function addSideToken(address main, address side) external onlyPrimary returns (bool) {
        if (address(mappedTokens[main]) == address(0)) {
            mappedTokens[main] = IERC20Token(side);
            return true;
        }
        
        return false;
    }

    function hasSideToken(address main) public returns (bool) {
        if(address(mappedTokens[main]) == address(0)) {
            return false;
        }
        return true;
    }

    function acceptTransfer(address token, address receiver, uint256 amount) onlyPrimary public returns (bool) {
        IERC20Token sideToken = mappedTokens[token];
        if( address(sideToken) == address(0)) {
            return false;
        }

        sideToken.mint(receiver, amount * 10**18);
        return true;
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

    function getTokenSymbol(address tokenAddress) public view returns (string memory) {

        return ERC20Token(tokenAddress).symbol();
    }

    function mintToken(address tokenAddress, address receiver, uint256 amount) public {

        ERC20Token(tokenAddress).mint(receiver, amount * 10**18);
    }

    function balanceOf(address tokenAddress, address account) public view returns (uint256) {

        return ERC20Token(tokenAddress).balanceOf(account);
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
}
