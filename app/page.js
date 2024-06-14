"use client"
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import EIP712Verifier from '../artifacts/contracts/EIP712Verifier.sol/EIP712Verifier.json';

const verifierAddress = "0x6F45DDbDd6285B09a8421d5F859991B0511862C2";
//"0xcaF1f4e04486faFEee55A633E818b5Bf1bC7Ab1D";
//"0x848eb1a4977948109fa366a43107dc5d30a6668a"
//'0xa34044262cC9Dad5791ED5bC8cD4AAf641829DB7';
//"0x237B1b69daA6978EE0C4B341286526335e63546d"

const Home = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [app, setApp] = useState('0x00Ea57108199F042EDe48CF3D4D555F8d7Af274A');
  const [nonce, setnonce] = useState(126);
  const [gasprice, setgasprice] = useState(1);
  let utfencode = new TextEncoder();
  const [data, setdata] = useState('hello');

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
        name: 'CartesiPaio', //Unique domain
        version: '0.0.1', //version of the signatures
        chainId: (await provider.getNetwork()).chainId,
        verifyingContract: verifierAddress,
      };
      // Schema for the messages defined for our application
      const types = {
        SigningMessage: [
          { name: 'app', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'max_gas_price', type: 'uint256' },
          { name: 'data', type: 'bytes' }
        ]
      };

      const value = {
        app: app,
        nonce: BigInt(nonce),
        max_gas_price: BigInt(gasprice),
        data: utfencode.encode(data)

      };
      console.log("Domain:", domain);
      console.log("Types:", types);
      console.log("Value:", value);
      const sig = await signer.signTypedData(domain, types, value);
      setSignature(sig);
      console.log(sig);
    }
  };

  const verifyMessage = async () => {
    const contract = new ethers.Contract(verifierAddress, EIP712Verifier.abi, provider);
    //    console.log(contract);
    const resolvedAddress = await contract.getSigner(app, BigInt(nonce), BigInt(gasprice), utfencode.encode(data), signature);
    console.log("Verification result:", resolvedAddress, account);
    alert(`Signature is valid: ${ethers.getAddress(resolvedAddress) === ethers.getAddress(account)}`);
  };

  return (
    <div>
      <h1>EIP-712 Signing with MetaMask</h1>
      <div>
        <textarea
          value={app}
          onChange={(e) => setApp(e.target.value)}
          placeholder="Enter a dapp address"
        />
      </div>
      <div>
        <textarea
          value={nonce}
          onChange={(e) => setnonce(e.target.value)}
          placeholder="Enter a nonce"
        />
      </div>
      <div>
        <textarea
          value={gasprice}
          onChange={(e) => setgasprice(e.target.value)}
          placeholder="Enter a gasprice"
        />
      </div>
      <div>
        <textarea
          value={data}
          onChange={(e) => setdata(e.target.value)}
          placeholder="Enter a data"
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
