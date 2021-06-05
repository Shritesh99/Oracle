const express = require("express");
const aztec = require("aztec.js");
const ethers = require("ethers");
const utils = require("@aztec/dev-utils");
const axios = require("axios").default;
const router = express.Router();
const { OracleContract, ContractAddress, web3 } = require("./web3");

OracleContract.events.NewRequest({}, async (error, msg) => {
	if (!error) {
		// Initialization Phase

		const { _urlToQuery, _attributeToFetch, sender } = msg.returnValues;

		// Trusted Setup and Proof Generation phase
		const note = await aztec.note.create(sender, 1);
		const newMintCounterNote = await aztec.note.create(sender, 1);
		const zeroMintCounterNote = await aztec.note.createZeroValueNote();
		const mintedNotes = [note];

		const mintProof = new aztec.MintProof(
			zeroMintCounterNote,
			newMintCounterNote,
			mintedNotes,
			ContractAddress
		);
		const mintData = mintProof.encodeABI();
		await OracleContract.register(utils.proofs.MINT_PROOF, mintData, {
			from: web3.eth.defaultAccount,
		});

		// Network Calling phase
		const response = await axios.get(msg.returnValues._urlToQuery);
		let res = response.data;
		const attr = msg.returnValues._attributeToFetch.split(".");
		for (let i = 0; i < attr.length; i++) res = res[attr[i]];
		const messageHash = web3.sha3(res);

		const signature = await web3.eth.personal.sign(
			messageHash,
			web3.eth.defaultAccount
		);

		// Signature Generation and Verification Phase
		let sig = ethers.utils.splitSignature(signature);

		// Proof Verification Phase
		await OracleContract.validateOwnership(
			message,
			sig.v,
			sig.r,
			sig.s,
			bobNote1.noteHash
		);

		await degreeContract.validate(utils.proofs.MINT_PROOF, mintData, res);
	} else console.log(error);
});

router.get("/", (req, res, next) => {
	res.json("Working");
});

module.exports = router;
