"use client";
import { AlchemyTokenAbi, tokenContractAddress } from "@/config/token-contract";
import { useWalletContext } from "@/context/wallet";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Hash, encodeFunctionData } from "viem";
import contractABI from "../../artifacts/contracts/AssetManagement.sol/AssetManagement.json";
import { ethers } from "ethers";
// const ethers = require("ethers");

import { useMagicSigner } from "@/hooks/useMagicSigner";
import { SignerSchema } from "@alchemy/aa-core";
import { Utils } from "alchemy-sdk";

type MintStatus =
  | "Mint"
  | "Requesting"
  | "Minting"
  | "Received"
  | "Error Minting";

export default function Hero() {
  const { isLoggedIn, provider } = useWalletContext();
  const { magic, signer } = useMagicSigner();
  const [mintTxHash, setMintTxHash] = useState<Hash>();
  const [mintStatus, setMintStatus] = useState<MintStatus>("Mint");
  const [assetIds, setAssetIds] = useState([]);

  const handleViewAssetId = async (assetId: any) => {
    if (!provider || !magic) {
      throw new Error("Provider or Magic not initialized");
    }

    try {
      // const magicProvider = new ethers.BrowserProvider(magic.rpcProvider);

      // // Signer
      // const signer = await magicProvider.getSigner();

      // Contract

      // // await magic.wallet.showUI();
      // console.log(signer);
      // console.log(magicProvider);

      // const provider = await magic.wallet.getProvider();

      // console.log(provider);

      const alchemyProvider = new ethers.BrowserProvider(provider);

      console.log(alchemyProvider);
      console.log(provider)

      const contract = new ethers.Contract(
        "0x425dF62F1C8Ca98535E675191A7E2c0a0678019f",
        contractABI.abi,
        alchemyProvider
      );

      const assetIdData = await contract.getAllAssetIds();
      console.log(assetIdData);

      await magic.wallet.showUI(); 
      // Get the patient's address from the signer
      // const patientAddress = await ethersSigner.getAddress();
      // console.log("Patient Address:", patientAddress);

      // Call the viewMedicalAssetId function
      // const assetIdData = await contract.viewMedicalAssetId(patientAddress, assetId);
      // console.log("Asset ID data:", assetIdData);

      // Update state or UI as necessary
    } catch (error) {
      console.error(error);
      // Handle error (e.g., show error message in UI)
    }
  };

  const handleRegisterPatient = async () => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }

    const uoCallData = encodeFunctionData({
      abi: contractABI.abi,
      functionName: "registerPatient",
      args: ["0x70a7AF68B1190e0fc12C4FeEe49207086872a002"],
    });

    const uo = await provider.sendUserOperation(
      {
        target: "0x425dF62F1C8Ca98535E675191A7E2c0a0678019f",
        data: uoCallData,
        value: BigInt(0),
      },
      {
        // maxFeePerGas: 21,
        // maxPriorityFeePerGas: 21
      }
    );

    const txHash = await provider.waitForUserOperationTransaction(uo.hash);

    console.log(txHash);
  };

  const handleAssetRegistration = async () => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }

    const uoCallData = encodeFunctionData({
      abi: contractABI.abi,
      functionName: "addMedicalAssetId",
      args: ["asset123", "0x70a7AF68B1190e0fc12C4FeEe49207086872a002"],
    });

    const uo = await provider.sendUserOperation(
      {
        target: "0x425dF62F1C8Ca98535E675191A7E2c0a0678019f",
        data: uoCallData,
        value: BigInt(1000),
      },
      {
        // maxFeePerGas: 21,
        // maxPriorityFeePerGas: 21
      }
    );

    const txHash = await provider.waitForUserOperationTransaction(uo.hash);

    console.log(txHash);
  };

  const handleMint = useCallback(async () => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }
    setMintTxHash(undefined);
    setMintStatus("Requesting");
    const uoHash = await provider.sendUserOperation({
      target: tokenContractAddress,
      data: encodeFunctionData({
        abi: AlchemyTokenAbi,
        functionName: "mint",
        args: [await provider.getAddress()],
      }),
    });

    setMintStatus("Minting");
    let txHash: Hash;
    try {
      txHash = await provider.waitForUserOperationTransaction(uoHash.hash);
    } catch (e) {
      setMintStatus("Error Minting");
      setTimeout(() => {
        setMintStatus("Mint");
      }, 5000);
      return;
    }

    setMintTxHash(txHash);
    setMintStatus("Received");
    setTimeout(() => {
      setMintStatus("Mint");
    }, 5000);
  }, [provider, setMintTxHash]);

  return (
    <div className="flex flex-row items-center gap-[64px] max-md:flex-col max-md:text-center">
      <button
        disabled={!isLoggedIn}
        onClick={handleRegisterPatient}
        className="btn text-white bg-gradient-1 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
      >
        register patient
      </button>
      <button
        disabled={!isLoggedIn}
        onClick={handleAssetRegistration}
        className="btn text-white bg-gradient-1 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
      >
        add asset
      </button>
      <button
        disabled={!isLoggedIn}
        onClick={() =>
          handleViewAssetId(
            "0x990cd947953db30726533063d033554fba292ebf712f9fec1c0b6d10a60e5c0b"
          )
        }
        className="btn text-white bg-gradient-1 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
      >
        view assets
      </button>
    </div>
    // <div className="flex flex-row items-center gap-[64px] max-md:flex-col max-md:text-center">
    //   <Image
    //     src="/kit-logo.svg"
    //     alt="Account Kit Token"
    //     width={400}
    //     height={400}
    //     priority
    //   />
    //   <div className="flex flex-col items-start gap-[48px] max-md:items-center">
    //     <div className="flex flex-col flex-wrap gap-[12px]">
    //       <div className="flex flex-row max-md:justify-center">
    //         <a
    //           href="https://accountkit.alchemy.com"
    //           target="_blank"
    //           className="btn bg-black dark:bg-white text-white dark:text-black transition ease-in-out duration-500 transform hover:scale-110 hover:bg-black hover:dark:bg-white"
    //         >
    //           <Image
    //             src="/kit-logo.svg"
    //             alt="Account Kit Logo"
    //             width={28}
    //             height={28}
    //             priority
    //           />
    //           <div className="text-md">Powered By Account Kit</div>
    //         </a>
    //       </div>
    //       <div className="text-5xl font-bold">Account Kit Token</div>
    //     </div>
    //     <div className="text-2xl">
    //       Mint a FREE ERC-20 token with no gas fees!
    //     </div>
    //     <div className="flex flex-row flex-wrap gap-[12px]">
    //       <button
    //         disabled={!isLoggedIn || mintStatus !== "Mint"}
    //         onClick={handleMint}
    //         className="btn text-white bg-gradient-1 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
    //       >
    //         {mintStatus} The ALCH Token
    //         {(mintStatus === "Requesting" || mintStatus === "Minting") && (
    //           <span className="loading loading-spinner loading-md"></span>
    //         )}
    //       </button>
    //       {mintTxHash && (
    //         <a
    //           href={`https://sepolia.etherscan.io/tx/${mintTxHash}`}
    //           className="btn text-white bg-gradient-2 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
    //         >
    //           Your Txn Details
    //         </a>
    //       )}
    //     </div>
    //   </div>
    // </div>
  );
}
