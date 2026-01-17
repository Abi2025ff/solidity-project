// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Payments {
    struct Payment {
        uint amount;
        uint timestamp;
        address from;
        string message;
    }

    struct historyAddr {
        uint totalPayments;
        mapping(uint => Payment) payments;
    }

    mapping(address => historyAddr) public balances;

    function get(
        address _addr,
        uint _index
    ) public view returns (Payment memory) {
        return balances[_addr].payments[_index];
    }

    function currentBalance() public view returns (uint) {
        return address(this).balance;
    }

    function pay(string memory message) public payable {
        uint PaymentNum = balances[msg.sender].totalPayments;
        balances[msg.sender].totalPayments++;

        Payment memory newPayment = Payment(
            msg.value,
            block.timestamp,
            msg.sender,
            message
        );

        balances[msg.sender].payments[PaymentNum] = newPayment;
    }
}
