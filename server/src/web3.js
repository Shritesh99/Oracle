const Web3 = require("web3");

const ABI = require("./ABI.json");

const ContractAddress = "0xdab50A5cF0FEdE2755C146db38D1b2CDeEf5baaf";

const web3 = new Web3(
	new Web3.providers.WebsocketProvider(
		process.env.WEB3_PROVIDER || "http://127.0.0.1:7545"
	)
);

web3.eth.defaultAccount = web3.eth.accounts[0];

const OracleContract = new web3.eth.Contract(ContractAddress, "", {
	from: web3.eth.defaultAccount,
});

module.exports = { web3, OracleContract, ContractAddress };
