//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract EIP712_Example is EIP712{
        
 
    bytes32 immutable typedDataHash= keccak256("SigningMessage(address app,uint256 nonce,uint256 max_gas_price,bytes data");

    constructor(string memory domainName, string memory signatureVersion) EIP712(domainName,signatureVersion) {
    }    
    
    struct SigningMessage {
        address app; // The address of the app
        uint256 nonce; //nonce for the txn
        uint256 max_gas_price; // The price (in wei) of gas price
        bytes data; //data in bytes
    }


    function getSigner( address app, uint256 nonce,uint256 gasprice, bytes calldata data, bytes memory signature) public view returns (address){
        SigningMessage memory message = SigningMessage(app,nonce,gasprice,data);        
        address signer = _verify(message, signature);                
        return signer;
    }


    function _verify(SigningMessage memory message, bytes memory signature) internal view returns (address){
        bytes32 digest = _hashTypedData(message);
        return ECDSA.recover(digest, signature);
    }


    function _hashTypedData(SigningMessage memory message) internal view returns (bytes32){
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    typedDataHash, // keccak hash of typed data
                    message.app, // encoding string to get its hash 
                    message.nonce,
                    message.max_gas_price,
                    keccak256((message.data)) //uint value                    
                )
            )
        );              
    }
}