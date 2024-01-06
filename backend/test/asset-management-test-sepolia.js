const { expect } = require("chai");
const { ethers } = require("hardhat");
const CryptoJS = require("crypto-js");

describe("AssetManagement Contract", function () {
  let assetManagement;
  let patient;
  let healthcareProvider;
  let other;
  const contractAddress = "0x6Dd09eA7fbCc38344ce266b5cFDB690d99863E25";

  beforeEach(async function () {
    const patientPrivateKey =
      "3782b61fd04d8db731cae7cdc85b4441871a60a73a1268786548033479cd0eeb";
    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth-sepolia.g.alchemy.com/v2/eIfwt8ic7hz_o96KKPzVjRrOuSGY70_G"
    );

    // Create a new Wallet instance using the patient's private key and connect it to the Alchemy provider
    patient = new ethers.Wallet(patientPrivateKey, provider);

    const ContractArtifact = require("../../frontend/artifacts/contracts/AssetManagement.sol/AssetManagement.json");

    [_, healthcareProvider, other] = await ethers.getSigners();
    assetManagement = new ethers.Contract(
      contractAddress,
      ContractArtifact.abi,
      patient
    );

    // try {
    //   await medicalRecords.connect(patient).registerPatient();
    // } catch (error) {
    //   // Handle the case where the patient is already registered
    //   // For instance, log the error or ignore it
    //   console.log("Patient already registered, continuing with tests.");
    // }
  });

  function generateHash(realId) {
    return CryptoJS.SHA256(realId).toString();
  }

  it("Should store and verify hashed asset IDs", async function () {
    const realId = "asset-123";
    const hashedId = generateHash(realId);
    await assetManagement.connect(patient).addMedicalAssetId(hashedId);

    // Retrieve and verify the hashed ID for the patient
    const storedHashedId = await assetManagement
      .connect(patient)
      .viewMedicalAssetId(patient.address, hashedId);
    expect(storedHashedId).to.equal(hashedId);
    console.log("Stored hashed ID: ", storedHashedId);
  });

  it("Should allow patient to grant access to a specific asset ID to a healthcare provider", async function () {
    const assetId = "asset1";
    await assetManagement.connect(patient).addMedicalAssetId(assetId);
    await assetManagement
      .connect(patient)
      .grantAccessToAssetId(assetId, healthcareProvider.address);

    // Check if the healthcare provider can access the specific asset ID
    const retrievedAssetId = await assetManagement
      .connect(healthcareProvider)
      .viewMedicalAssetId(patient.address, assetId);
    expect(retrievedAssetId).to.equal(assetId);
  });

  it("Should prevent unauthorized entities from viewing a specific medical asset ID", async function () {
    const assetId = "asset2";
    await assetManagement.connect(patient).addMedicalAssetId(assetId);

    // The "other" entity should not have access
    await expect(
      assetManagement
        .connect(other)
        .viewMedicalAssetId(patient.address, assetId)
    ).to.be.revertedWith("Not authorized for this asset ID");
  });

  it("Should allow patient to revoke access to a specific asset ID from a healthcare provider", async function () {
    const assetId = "asset3";
    await assetManagement.connect(patient).addMedicalAssetId(assetId);
    await assetManagement
      .connect(patient)
      .grantAccessToAssetId(assetId, healthcareProvider.address);
    await assetManagement
      .connect(patient)
      .revokeAccessToAssetId(assetId, healthcareProvider.address);

    // After revoking, the healthcare provider should no longer have access to the specific asset ID
    await expect(
      assetManagement
        .connect(healthcareProvider)
        .viewMedicalAssetId(patient.address, assetId)
    ).to.be.revertedWith("Not authorized for this asset ID");
  });
});
