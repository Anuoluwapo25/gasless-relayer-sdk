// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";


/**
 * @title TrustedForwarder
 * @notice EIP-2771 compliant meta-transaction forwarder using OpenZeppelin
 */
contract TrustedForwarder is MinimalForwarder {}