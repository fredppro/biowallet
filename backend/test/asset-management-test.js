const { expect } = require("chai");
const { ethers } = require("hardhat");
const CryptoJS = require("crypto-js");

describe("AssetManagement Contract", function () {
  let AssetManagement;
  let assetManagement;
  let patient;
  let healthcareProvider;
  let other;

  beforeEach(async function () {
    AssetManagement = await ethers.getContractFactory("AssetManagement");
    assetManagement = await AssetManagement.deploy();
    await assetManagement.deployed();

    [patient, healthcareProvider, other] = await ethers.getSigners();
    await assetManagement.connect(patient).registerPatient();
  });

  function generateHash(realId) {
    return CryptoJS.SHA256(realId).toString();
  }

  it("Should store and verify hashed asset IDs", async function () {
    const realId = "asset-123";
    const hashedId = generateHash(realId);

    await assetManagement.connect(patient).addMedicalAssetId(hashedId);

    // Retrieve and verify the hashed ID
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

  it("Should allow patient to view all their medical asset IDs", async function () {
    const assetId1 = "asset1";
    const assetId2 = "asset2";
    await assetManagement.connect(patient).addMedicalAssetId(assetId1);
    await assetManagement.connect(patient).addMedicalAssetId(assetId2);

    // Retrieve and verify all asset IDs
    const assetIds = await assetManagement.connect(patient).viewAllAssetIds();
    expect(assetIds).to.include(assetId1);
    expect(assetIds).to.include(assetId2);
    console.log("All stored asset IDs: ", assetIds);
  });
});
