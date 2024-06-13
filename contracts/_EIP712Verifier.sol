// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EIP712Verifier {
    string private constant SIGNING_DOMAIN = "EIP712Domain";
    string private constant SIGNATURE_VERSION = "1";

    struct EIP712Message {
        address from;
        string message;
    }

    bytes32 private constant TYPE_HASH = keccak256("EIP712Message(address from,string message)");

    bytes32 private DOMAIN_SEPARATOR;

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(bytes(SIGNING_DOMAIN)),
                keccak256(bytes(SIGNATURE_VERSION)),
                block.chainid,
                address(this)
            )
        );
    }

    function getMessageHash(EIP712Message memory message) public pure returns (bytes32) {
        return keccak256(abi.encode(TYPE_HASH, message.from, keccak256(bytes(message.message))));
    }

    function verify(
        address signer,
        EIP712Message memory message,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                getMessageHash(message)
            )
        );
        return recoverSigner(digest, signature) == signer;
    }

    function recoverSigner(bytes32 digest, bytes memory signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(digest, v, r, s);
    }

    function splitSignature(bytes memory sig)
        public
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return (r, s, v);
    }
}
