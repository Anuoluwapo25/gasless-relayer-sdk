// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title SampleContract
 * @notice Example contract that accepts meta-transactions via MinimalForwarder
 */
contract SampleContract is ERC2771Context {
    event MessageSet(address indexed sender, string message);
    event ValueIncremented(address indexed sender, uint256 newValue);

    mapping(address => string) private _messages;
    mapping(address => uint256) private _counters;

    // Pass the forwarder address to ERC2771Context
    constructor(address trustedForwarder)
        ERC2771Context(trustedForwarder)
    {}

    function setMessage(string calldata message) external {
        address sender = _msgSender(); // user, not relayer
        _messages[sender] = message;
        emit MessageSet(sender, message);
    }

    function getMessage(address user) external view returns (string memory) {
        return _messages[user];
    }

    function incrementCounter() external {
        address sender = _msgSender(); // user, not relayer
        _counters[sender]++;
        emit ValueIncremented(sender, _counters[sender]);
    }

    function getCounter(address user) external view returns (uint256) {
        return _counters[user];
    }

    function whoIsSender() external view returns (address) {
        return _msgSender(); // returns user even through meta-tx
    }
}
