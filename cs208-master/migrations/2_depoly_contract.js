const bktoken = artifacts.require("bktoken");

const bktokenSale = artifacts.require("./bktokensale.sol");

module.exports = function(deployer) {
  deployer.deploy(bktoken, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(bktokenSale, bktoken.address, tokenPrice);
  });
};

// module.exports = function(deployer) {
//   deployer.deploy(bktoken,1000000);
// };
