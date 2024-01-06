// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract AssetManagement {
    struct Patient {
        address patientAddress;
        string[] medicalAssetIds;
        mapping(string => mapping(address => bool)) accessGrantedPerAssetId;
    }

    mapping(address => Patient) private patients;

    // Ensure that only the patient can call the function
    modifier onlyPatient() {
        require(
            patients[msg.sender].patientAddress == msg.sender,
            "Only the patient can perform this action"
        );
        _;
    }

    // Ensure that only authorized entities can access the specific data
    modifier onlyAuthorizedForAssetId(
        address _patient,
        string memory _assetId
    ) {
        require(
            patients[_patient].accessGrantedPerAssetId[_assetId][msg.sender] ||
                msg.sender == _patient,
            "Not authorized for this asset ID"
        );
        _;
    }

    function registerPatient() public {
        require(
            patients[msg.sender].patientAddress == address(0),
            "Patient already registered"
        );
        patients[msg.sender].patientAddress = msg.sender;
    }

    // Function for a patient to add a new medical asset ID
    function addMedicalAssetId(string memory _id) public onlyPatient {
        patients[msg.sender].medicalAssetIds.push(_id);
    }

    // Function for a patient to grant access to a specific medical asset
    function grantAccessToAssetId(
        string memory _assetId,
        address _entity
    ) public onlyPatient {
        patients[msg.sender].accessGrantedPerAssetId[_assetId][_entity] = true;
    }

    function viewAllAssetIds()
        public
        view
        onlyPatient
        returns (string[] memory)
    {
        return patients[msg.sender].medicalAssetIds;
    }

    // Function for a patient to revoke access to a specific medical asset
    function revokeAccessToAssetId(
        string memory _assetId,
        address _entity
    ) public onlyPatient {
        patients[msg.sender].accessGrantedPerAssetId[_assetId][_entity] = false;
    }

    // Function to view a specific patient's medical asset ID
    function viewMedicalAssetId(
        address _patient,
        string memory _assetId
    )
        public
        view
        onlyAuthorizedForAssetId(_patient, _assetId)
        returns (string memory)
    {
        // Verify that the asset ID exists for the patient
        bool assetExists = false;
        for (uint i = 0; i < patients[_patient].medicalAssetIds.length; i++) {
            if (
                keccak256(bytes(patients[_patient].medicalAssetIds[i])) ==
                keccak256(bytes(_assetId))
            ) {
                assetExists = true;
                break;
            }
        }
        require(assetExists, "Asset ID does not exist");
        return _assetId;
    }
}
