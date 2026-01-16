// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract HelloWorld is Ownable(msg.sender) {
    string public greeting = "Hello, Solidity!";

    function setGreeting(string memory _newGreeting) public onlyOwner {
        greeting = _newGreeting;
    }
}
