// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

contract MyContract {
    event MyEvent1(address sender);
    event MyEvent2(address sender);

    function initialize() public {
    }

    function version() external pure returns (string memory) {
        return "v0";
    }

    function generateEvent1() public {
        emit MyEvent1(msg.sender);
    }

    function generateEvent2() public {
        emit MyEvent2(msg.sender);
    }
}

