import React, { useState } from 'react';
import { createWalletClient, createPublicClient, custom, http, parseUnits, encodeFunctionData } from 'viem';
import { celoAlfajores } from 'viem/chains';

const erc20TransferAbi = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  }
];

const walletClient = createWalletClient({
  chain: celoAlfajores,
  transport: custom(window.ethereum)
});

const publicClient = createPublicClient({ 
  chain: celoAlfajores,
  transport: http()
});

const CUSDTransfer = () => {
  const [receiverAddress, setReceiverAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [status, setStatus] = useState('');

  const handleTransfer = async () => {
    const cUSDAddress = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';
    const cUSDDecimals = 18;

    try {
      setStatus('Sending transaction...');
      const [account] = await walletClient.getAddresses();
      const hash = await walletClient.sendTransaction({
        account,
        to: cUSDAddress,
        data: encodeFunctionData({
          abi: erc20TransferAbi,
          functionName: "transfer",
          args: [
            receiverAddress,
            parseUnits(transferAmount, cUSDDecimals),
          ],
        }),
        chain: celoAlfajores,
      });

      setStatus(`Transaction sent: ${hash}`);

      const transaction = await publicClient.waitForTransactionReceipt({ hash });

      if (transaction.status === "success") {
        setStatus("Transaction successful!");
      } else {
        setStatus("Transaction failed.");
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Transfer cUSD</h2>
      <input
        type="text"
        placeholder="Receiver Address"
        value={receiverAddress}
        onChange={(e) => setReceiverAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount to Transfer"
        value={transferAmount}
        onChange={(e) => setTransferAmount(e.target.value)}
      />
      <button onClick={handleTransfer}>Transfer cUSD</button>
      <p>{status}</p>
    </div>
  );
};

export default CUSDTransfer;
