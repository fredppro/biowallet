const { expect } = require("chai");
const { ethers } = require("hardhat");
const CryptoJS = require("crypto-js");

describe("AssetManagement Contract", function () {
  let MedicalRecords;
  let medicalRecords;
  let patient;
  let healthcareProvider;
  let other;

  beforeEach(async function () {
    MedicalRecords = await ethers.getContractFactory("AssetManagement");
    medicalRecords = await MedicalRecords.deploy();
    await medicalRecords.deployed();

    [patient, healthcareProvider, other] = await ethers.getSigners();
    await medicalRecords.connect(patient).registerPatient();
  });

  function generateHash(realId) {
    return CryptoJS.SHA256(realId).toString();
  }

  it("Should store and verify hashed asset IDs", async function () {
    const realId = "asset-123";
    const hashedId = generateHash(realId);

    await medicalRecords.connect(patient).addMedicalAssetId(hashedId);

    // Retrieve and verify the hashed ID
    const storedHashedId = await medicalRecords
      .connect(patient)
      .viewMedicalAssetIds(patient.address);
    expect(storedHashedId[0]).to.equal(hashedId);

    console.log("Stored hashed ID: ", storedHashedId);
  });

  it("Should allow patient to grant access to a healthcare provider", async function () {
    await medicalRecords
      .connect(patient)
      .grantAccess(healthcareProvider.address);

    // Granting access doesn't change asset IDs, but it does change access rights
    // To verify, attempt to view patient's asset IDs as the healthcare provider
    await medicalRecords.connect(patient).addMedicalAssetId("asset1");
    const assetIds = await medicalRecords
      .connect(healthcareProvider)
      .viewMedicalAssetIds(patient.address);
    expect(assetIds).to.include("asset1");
  });

  it("Should prevent unauthorized entities from viewing medical asset IDs", async function () {
    await medicalRecords.connect(patient).addMedicalAssetId("asset2");

    // The "other" entity should not have access
    await expect(
      medicalRecords.connect(other).viewMedicalAssetIds(patient.address)
    ).to.be.revertedWith("Not authorized");
  });

  it("Should allow patient to grant access to a healthcare provider and check accessibility", async function () {
    await medicalRecords
      .connect(patient)
      .grantAccess(healthcareProvider.address);

    // Patient adds an asset ID
    await medicalRecords.connect(patient).addMedicalAssetId("asset1");

    // Check if the healthcare provider can access the patient's asset IDs
    const assetIds = await medicalRecords
      .connect(healthcareProvider)
      .viewMedicalAssetIds(patient.address);
    expect(assetIds).to.include("asset1");
  });

  it("Should allow patient to revoke access from a healthcare provider and check inaccessibility", async function () {
    // First, grant then revoke the access
    await medicalRecords
      .connect(patient)
      .grantAccess(healthcareProvider.address);
    await medicalRecords
      .connect(patient)
      .revokeAccess(healthcareProvider.address);

    await expect(
      medicalRecords
        .connect(healthcareProvider)
        .viewMedicalAssetIds(patient.address)
    ).to.be.revertedWith("Not authorized");
  });
});
