// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol"; 
import {SampleContract} from "../src/sample.sol"; 
import {TrustedForwarder} from "../src/Forwarder.sol";
import {console} from "forge-std/console.sol";     // cleaner

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
