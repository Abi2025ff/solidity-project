// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract Tree {
    // Merkle tree
    bytes32[] public hashes;
    string[4] transactions = [
        "TX1: Sherlock -> John",
        'TX2: John -> Sherlock',
        "TX3: John -> Mary",
        "TX4: Mary -> Sherlock"
    ];

    constructor() {
        for(uint i = 0; i < transactions.length; i++) {
            hashes.push(makeHash(transactions[i]));
        }

        uint count = transactions.length;
        uint offset = 0;

        while(count > 0) {
            for(uint i = 0; i < count - 1; i+=2) {
              hashes.push(keccak256(
                abi.encodePacked(
                    hashes[offset + i], hashes[offset + i + 1]
                )
              ));
            }
            count = count/2;
            offset += count;
        }
    }
    
    function encode(string memory input) public pure returns(bytes memory) {
        return abi.encodePacked(input);
    }
   

    function makeHash(string memory input) public pure returns(bytes32) {
        return keccak256(
            encode(input)
        );
    }
}