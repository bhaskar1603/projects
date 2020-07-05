const bktoken = artifacts.require("bktoken");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {

    await deployer.deploy(bktoken);
    const token = await bktoken.deployed()

    await deployer.deploy(EthSwap, token.address);
    const ethSwap = await EthSwap.deployed()

    // Transfer all tokens to EthSwap (1 million)
  await token.transfer(ethSwap.address, '1000000000000000000000000')
};
