var CrowdFundingWithDeadline = artifacts.require("./CrowdFundingWithDeadline.sol");

module.exports = function(deployer) {
  deployer.deploy(
    CrowdFundingWithDeadline, 
    "Test campaign",
    1,
    20,
    "0x227A8bcd4A2b7B21975ca5bcA3430e20A37E270A"
  );
};
