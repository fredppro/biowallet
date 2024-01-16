// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract AssetManagement {
    struct Patient {
        address patientAddress;
        string[] medicalAssetIds;
        mapping(string => mapping(address => bool)) accessGrantedPerAssetId;
    }

    event PatientRegistered(address indexed patientAddress, address indexed patient);

    mapping(address => Patient) private patients;
    address[] private patientAddresses; // Array to keep track of all patient addresses

    modifier onlyPatient() {
        require(patients[msg.sender].patientAddress == msg.sender, "Only the patient can perform this action");
        _;
    }

    modifier onlyAuthorizedForAssetId(address _patient, string memory _assetId) {
        require(patients[_patient].accessGrantedPerAssetId[_assetId][msg.sender] || msg.sender == _patient, "Not authorized for this asset ID");
        _;
    }

    function registerPatient(address _patient) public {
        require(patients[_patient].patientAddress == address(0), "Patient already registered");
        patients[_patient].patientAddress = _patient;
        patientAddresses.push(_patient); // Add the patient's address to the array
        emit PatientRegistered(msg.sender, _patient); 
    }

    function addMedicalAssetId(string memory _id, address _patient) public {
        patients[_patient].medicalAssetIds.push(_id);
    }

    function getAllAssetIds() public view returns (string[][] memory) {
        string[][] memory allAssetIds = new string[][](patientAddresses.length);
        for (uint i = 0; i < patientAddresses.length; i++) {
            allAssetIds[i] = patients[patientAddresses[i]].medicalAssetIds;
        }
        return allAssetIds;
    }
}
