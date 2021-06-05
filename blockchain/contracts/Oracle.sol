pragma solidity >=0.5.0 <0.7.0;

import "@aztec/protocol/contracts/ERC1724/ZkAssetMintable.sol";
import "@aztec/protocol/contracts/ERC1724/ZkAsset.sol";
import "@aztec/protocol/contracts/ACE/ACE.sol";
import "@aztec/protocol/contracts/ERC20/ERC20Mintable.sol";
import "@aztec/protocol/contracts/libs/ProofUtils.sol";
import "@aztec/protocol/contracts/ACE/validators/privateRange/PrivateRange.sol";

contract Oracle is ZkAssetMintable {
    
    uint currentId = 0;
    
    string res;
    
    event NewRequest (
        uint id,
        string urlToQuery,
        string attributeToFetch
    );
    
    constructor(address _aceAddress) public ZkAssetMintable(_aceAddress, address(0), 1){}
   
    function createRequest(
        string memory _urlToQuery,
        string memory _attributeToFetch    
    ) public {
        emit NewRequest (
            currentId,
            _urlToQuery,
            _attributeToFetch
        );
    }
    
    function register(uint24 _proof, bytes calldata _proofData) external returns (bytes32) {
        require(_proofData.length != 0, "proof invalid");

        (bytes memory _proofOutputs) = ace.mint(_proof, _proofData, address(this));

        (, bytes memory newTotal, ,) = _proofOutputs.get(0).extractProofOutput();

        (, bytes memory mintedNotes, ,) = _proofOutputs.get(1).extractProofOutput();

        (,bytes32 noteHash,) = newTotal.get(0).extractNote();

        logOutputNotes(mintedNotes);
        return noteHash;
    }
    
    function validateOwnership(bytes32 _message, uint8 v, bytes32 r, bytes32 s, bytes32 _noteHash) external view returns (bool) {
        (, , , address noteOwner ) = ace.getNote(address(this), _noteHash);
        address signer = ecrecover(_message, v, r, s);
        if (signer == noteOwner) {
            return true;
        }
        else return false;
    }

    function validate(uint24 _proof, bytes calldata _proofData, string calldata _res) external {
        ace.validateProof(_proof, msg.sender, _proofData);
        res = _res;
    }
}