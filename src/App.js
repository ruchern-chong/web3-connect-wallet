import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";

import logo from "./logo.svg";
import "./App.css";

import { contracts } from "./config";

const App = () => {
  const { ethereum } = window;

  const provider = new ethers.providers.Web3Provider(ethereum);
  provider.on("network", (newNetwork, oldNetwork) => {
    // When a Provider makes its initial connection, it emits a "network"
    // event with a null oldNetwork along with the newNetwork. So, if the
    // oldNetwork exists, it represents a changing network
    if (oldNetwork) {
      window.location.reload();
    }
  });
  const signer = provider.getSigner();

  const [account, setAccount] = useState();
  const [balance, setBalance] = useState();
  const [chainId, setChainId] = useState();
  const [message, setMessage] = useState();

  ethereum.on("connect", (connectInfo) => console.log(connectInfo));
  ethereum.on("disconnect", (error) => console.error(error));

  const connectWallet = useCallback(() => {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        setAccount(accounts[0]);
      })
      .catch((error) => {
        if (error.code === 4001) {
          setMessage("Please connect to Metamask!");
        }
      });
  }, [ethereum]);

  const getBalance = async () => {
    const rawBalance = await provider.getBalance(signer.getAddress());
    const balance = ethers.utils.formatEther(rawBalance);
    setBalance(balance);

    // TODO: Understand how to get the balance for the default token and ERC20 contract
    // const erc20 = new ethers.Contract(address, abi, provider);
    //
    // const decimals = await erc20.decimals();
    // const rawBalance = await erc20.balanceOf(signer.getAddress());
    // const symbol = await erc20.symbol();
    //
    // const balance = rawBalance / Math.pow(10, decimals);
    //
    // setBalance({ amount: balance, symbol });
  };

  useEffect(() => {
    connectWallet();

    if (account || chainId) {
      const contractAddress = contracts["CRO"];

      getBalance(contractAddress);
    }
  }, [account, chainId, connectWallet, ethereum, getBalance]);

  const handleAccountsChanged = (accounts) => {
    setAccount(accounts[0]);
  };
  ethereum.on("accountsChanged", handleAccountsChanged);

  const handleChainChanged = (chainId) => {
    setChainId(chainId);
  };
  ethereum.on("chainChanged", handleChainChanged);

  return (
    <div className="App">
      <header className="App-header">
        {!account && <button onClick={connectWallet}>Connect Wallet</button>}
        {account && <button>Disconnect Wallet</button>}
        <img src={logo} className="App-logo" alt="logo" />
        <p>{account}</p>
        {Boolean(balance) && <p>{balance}</p>}
        {Boolean(message) && <p>{message}</p>}
      </header>
    </div>
  );
};

export default App;
