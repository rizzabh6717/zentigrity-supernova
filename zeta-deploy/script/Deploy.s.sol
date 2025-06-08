// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/TimeLockEscrow.sol";

// script/Deploy.s.sol
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address zetaGateway = 0xA205682Cb033F03aF4b12D4BFC9e116deBDE7000; // ZetaChain main gateway
        
        vm.startBroadcast(deployerPrivateKey);
        new TimeLockEscrow(zetaGateway);
        vm.stopBroadcast();
    }
}