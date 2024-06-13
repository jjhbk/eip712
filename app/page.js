"use client"
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import EIP712Verifier from '../artifacts/contracts/EIP712Verifier.sol/EIP712Verifier.json';

const verifierAddress = '0xa34044262cC9Dad5791ED5bC8cD4AAf641829DB7';

const Home = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(tempProvider);
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(async accounts => {
          setSigner(await tempProvider.getSigner());
          setAccount(accounts[0]);
          alert(accounts[0])
        })

        .catch(err => console.log(err));
    } else {
      console.log('MetaMask not installed');
    }
  }, []);

  const signMessage = async () => {
    console.log((await provider.getNetwork()).chainId)
    if (signer) {
      const domain = {
        name: 'Cartesi', //Unique domain
        version: '1', //version of the signatures
        chainId: (await provider.getNetwork()).chainId,
        verifyingContract: verifierAddress,
      };
      // Schema for the messages defined for our application
      const types = {
        Ticket: [
          { name: 'eventName', type: 'string' },
          { name: 'price', type: 'uint256' },
        ],
      };

      const value = {
        eventName: message,
        price: BigInt(1)
      };
      console.log("Domain:", domain);
      console.log("Types:", types);
      console.log("Value:", value);
      const sig = await signer.signTypedData(domain, types, value);
      setSignature(sig);
      console.log(sig);
      // const expectedSignerAddress = await signer.getAddress();
      // const recoveredAddress = ethers.utils.verifyTypedData(domain, types, value, sig);
      // console.log(recoveredAddress, expectedSignerAddress);
    }
  };

  const verifyMessage = async () => {
    const contract = new ethers.Contract(verifierAddress, EIP712Verifier.abi, provider);
    //    console.log(contract);
    const resolvedAddress = await contract.getSigner(message, BigInt(1), signature);
    console.log("Verification result:", resolvedAddress, account);
    alert(`Signature is valid: ${ethers.getAddress(resolvedAddress) === ethers.getAddress(account)}`);
  };

  return (
    <div>
      <h1>EIP-712 Signing with MetaMask</h1>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message"
        />
      </div>
      <button onClick={signMessage}>Sign Message</button>
      <button onClick={verifyMessage}>Verify Signature</button>
      <div>
        <p>Account: {account}</p>
        <p>Signature: {signature}</p>
      </div>
    </div>
  );
};

export default Home;
