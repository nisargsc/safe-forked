import { SafeTransaction } from "@safe-global/safe-core-sdk-types";
import { Signer, ethers } from "ethers";
import { MyNFT } from "../typechain-types";
import { ABI } from "./contractABI";
import { nftAbi } from "./nftABI";
import { Safe } from "../typechain-types/contracts/Safe";

export async function execCall(
  safeAddress: string,
  txn: SafeTransaction,
  signer: Signer
) {
  const safeContract = new ethers.Contract(
    safeAddress,
    ABI,
    signer
  ) as unknown as Safe;

  const resp = await safeContract.execTransaction(
    txn.data.to,
    txn.data.value,
    txn.data.data,
    txn.data.operation,
    txn.data.safeTxGas,
    txn.data.baseGas,
    txn.data.gasPrice,
    txn.data.gasToken,
    txn.data.refundReceiver,
    txn.encodedSignatures()
  );
  await resp.wait();
  console.log(resp);
}

export async function checkSignsCall(
  safeAddress: string,
  txnHash: string,
  signs: string,
  signer: Signer
) {
  const safeContract = new ethers.Contract(
    safeAddress,
    ABI,
    signer
  ) as unknown as Safe;

  const resp = await safeContract.checkSignatures(txnHash, "0x", signs);
  console.log(resp);
}

export function getMintFuncData(to: string, tokenId: number) {
  const nftInterface = new ethers.utils.Interface(nftAbi);
  const data = nftInterface.encodeFunctionData("safeMint", [to, tokenId]);
  return data;
}

export async function getNftBalance(
  nftAddr: string,
  signer: Signer
) {
  const nftContract = new ethers.Contract(
    nftAddr,
    nftAbi,
    signer
  ) as unknown as MyNFT;

  const balance = await nftContract.balanceOf(await signer.getAddress());
  return balance;
}

module.exports = {
  execCall,
  checkSignsCall,
  getMintFuncData,
  getNftBalance,
};
