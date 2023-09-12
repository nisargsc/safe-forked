import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import * as sdkUtils from "../utils/sdkUtils";
import * as contractUtils from "../utils/contractUtils";
import {
  SafeTransactionDataPartial,
} from "@safe-global/safe-core-sdk-types";

async function main() {
  const safeAddress = "0x9721B6EFaEc4921a2c43De32C9C1b54Bf6F26103";
  const rpcUrl = process.env.RPC_URL!;
  const nftAddr = process.env.NFT_ADDR!;

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

  console.log("Getting Safe wallet instance...");
  const chainId = await ethAdapter.getChainId();
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

  console.log("Create txn...");
  const tokenId = 10
  const t1: SafeTransactionDataPartial = {
    to: nftAddr,
    value: ethers.utils.parseEther("0").toString(),
    data: contractUtils.getMintFuncData(signerObj.address, tokenId),
  };

  const txn = await safeSdk.createTransaction({ safeTransactionData: t1 });
  const txnHash = await safeSdk.getTransactionHash(txn);
  console.log(txn);

  let nftBalance = (await contractUtils.getNftBalance(nftAddr, signerObj)).toString();
  console.log({ nftBalance });

  console.log("Signing the txn...");
  const sign1 = await safeSdk.signTransactionHash(txnHash);
  txn.addSignature(sign1);
  const sign2 = await safeSdk2.signTransactionHash(txnHash);
  txn.addSignature(sign2);

  console.log(txn);

  console.log("Executing the txn...");
  await safeSdk.executeTransaction(txn);

  nftBalance = (await contractUtils.getNftBalance(nftAddr, signerObj)).toString();
  console.log({ nftBalance });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
