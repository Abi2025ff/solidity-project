// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Voter {
        address delegate;
        bool voted;
        uint32 vote;
        uint96 weight;
    }

    struct Proposal {
        bytes32 name;
        uint96 voteCount;
    }

    address public chairperson;

    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    event RigthToVoteGiven(address indexed voter);
    event Delegated(address indexed from, address indexed to);
    event Voted(address indexed voter, uint proposalIndex);

    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;

        for(uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function giveRightToVote(address voter) external{
        require(msg.sender == chairperson, "Only chairperson give right to vote");
        require(voters[voter].weight == 0, "The voter already has voting rights");
        voters[voter].weight = 1;
    }

    function delegate(address to) external {
        Voter storage sender = voters[msg.sender];
        require(sender.weight > 0, "you no right to vote");
        require(!sender.voted, "you already voted");
        require(to != msg.sender, "Self-delegation is disallowed.");

        require(voters[to].weight > 0, "Delegate has no voting right");

        

        uint depth = 0;
        Voter storage current = voters[to];
        while(current.delegate != address(0)) {
            depth++;
            require(depth <= 10, "Delegation chain too long");
            require(current.weight > 0, "Delegate has no voting right");
            to = current.delegate;
            require(to != msg.sender, "Found delegation loop");
            current = voters[to];
        }


        sender.voted = true;
        sender.delegate = to;

        if(current.voted) {
            proposals[current.vote].voteCount += sender.weight;
        } else {
            current.weight += sender.weight;
        }
    }

    function vote(uint32 proposal) external {
        require(proposal < proposals.length, "Invalid proposal index");
        Voter storage sender = voters[msg.sender];
        require(sender.weight >= 1, "Has no right to vote");
        require(!sender.voted, "Already voted");
        sender.voted = true;
        sender.vote = proposal;

        proposals[proposal].voteCount += sender.weight;
    }

    function winningProposal() public view returns(uint winningProposal_) {
        uint winingVoteCount = 0;

        for(uint p = 0; p < proposals.length; p++) {
            if(proposals[p].voteCount > winingVoteCount) {
                winingVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns(bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}