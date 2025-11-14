// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../src/Forwarder.sol";
import "../src/sample.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        TrustedForwarder forwarder = new TrustedForwarder();

        SampleContract sample = new SampleContract(address(forwarder));

        vm.stopBroadcast();

        console.log("TrustedForwarder deployed at:", address(forwarder));
        console.log("SampleContract deployed at:", address(sample));
    }
}
