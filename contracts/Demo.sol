//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Demo {
    // require
    // revert
    // assert
    address owner;

    // event
    event Paid(address indexed _from, uint _amount, uint _timestamp);

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        pay();
    }

    function pay() public payable {
        emit Paid(msg.sender, msg.value, block.timestamp);
    }

    modifier onlyOwner(address _to) {
        require(msg.sender == owner, "you are not an owner");
        require(_to != address(0));
        //   address(0) =>  address demo;
        _;
        //   require(...)
    }

    function withDraw(address payable _to) external onlyOwner(_to) {
        //Panic
        // assert(msg.sender == owner);
        // require(msg.sender == owner, "you are not an owner");
        //или же можно использовать след
        // if(msg.sender != owner) {
        //     revert("you are not an owner");
        // }
        _to.transfer(address(this).balance);
    }
}
