import SafeApiKit from "@safe-global/api-kit";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import * as sdkUtils from "../utils/sdkUtils";
import * as contractUtils from "../utils/contractUtils";

async function main() {
  const safeAddress = "0x9721B6EFaEc4921a2c43De32C9C1b54Bf6F26103";
  const txServiceUrl = "https://safe-transaction-goerli.safe.global";
  const rpcUrl = process.env.RPC_URL!;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signerObj = new ethers.Wallet(process.env.PRIV_KEY1!, provider);
  const signerObj2 = new ethers.Wallet(process.env.PRIV_KEY2!, provider);

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signerObj,
  });

  const ethAdapter2 = new EthersAdapter({
    ethers,
    signerOrProvider: signerObj2,
  });

  console.log(
    `Signer Balance: ${ethers.utils.formatEther(
      (await signerObj.getBalance()).toString()
    )} eth`
  );

  // Get Pending transactions using service API
  console.log("Get pending txn using safeService...");
  const safeApiKit = new SafeApiKit({
    txServiceUrl,
    ethAdapter,
  });

  const pendingTransactions = (
    await safeApiKit.getPendingTransactions(safeAddress)
  ).results;
  const txnResp = pendingTransactions[1];
  const txnResp1 = pendingTransactions[0];
  console.log("txnResp: ", txnResp);
  console.log("txnResp1: ", txnResp1);

  // Add signs and execute
  console.log("Getting Safe wallet instance...");
  const chainId = await ethAdapter.getChainId();
  const chainIdGor = 5;
  const contractNetworks = sdkUtils.getContractNetworks(chainId);
  const safeSdk = await Safe.create({
    ethAdapter: ethAdapter,
    safeAddress,
    contractNetworks,
  });
  const safeSdk2 = await Safe.create({
    ethAdapter: ethAdapter2,
    safeAddress,
    contractNetworks,
  });

  console.log("Signing the txn nonce0...");
  const txn = await safeSdk.toSafeTransactionType(txnResp);
  const sign = await safeSdk.signTransactionHash(txnResp.safeTxHash);
  txn.addSignature(sign);
  console.log(txn);

  console.log("Executing the txn nonce0...");
  await safeSdk.executeTransaction(txn);

  console.log("Signing the txn nonce1...");
  const txn1 = await safeSdk.toSafeTransactionType(txnResp1);
  const sign1 = await safeSdk2.signTransactionHash(txnResp1.safeTxHash);
  txn1.addSignature(sign1);
  console.log(txn1);

  console.log("Executing the txn nonce1...");
  await safeSdk.executeTransaction(txn1);

  const nftAddr = process.env.NFT_ADDR!;
  const nftBalance1 = (
    await contractUtils.getNftBalance(nftAddr, signerObj)
  ).toString();
  const nftBalance2 = (
    await contractUtils.getNftBalance(nftAddr, signerObj2)
  ).toString();
  console.log({ nftBalance1, nftBalance2 });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
