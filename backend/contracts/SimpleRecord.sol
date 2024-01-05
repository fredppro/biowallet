pragma solidity ^0.8.0;

contract MedicalRecords {
    struct Patient {
        address patientAddress;
        string[] medicalAssetIds;
        mapping(address => bool) accessGranted;
    }

    mapping(address => Patient) private patients;

    // Ensure that only the patient can call the function
    modifier onlyPatient() {
        require(patients[msg.sender].patientAddress == msg.sender, "Only the patient can perform this action");
        _;
    }

    // Ensure that only authorized entities can access the data
    modifier onlyAuthorized(address _patient) {
        require(patients[_patient].accessGranted[msg.sender] || msg.sender == _patient, "Not authorized");
        _;
    }

    // Function for a patient to add a new medical asset ID
    function addMedicalAssetId(string memory _id) public onlyPatient {
        patients[msg.sender].medicalAssetIds.push(_id);
    }

    // Function for a patient to grant access to their medical assets
    function grantAccess(address _entity) public onlyPatient {
        patients[msg.sender].accessGranted[_entity] = true;
    }

    // Function for a patient to revoke access to their medical assets
    function revokeAccess(address _entity) public onlyPatient {
        patients[msg.sender].accessGranted[_entity] = false;
    }

    // Function to view a patient's medical asset IDs
    function viewMedicalAssetIds(address _patient) public view onlyAuthorized(_patient) returns (string[] memory) {
        return patients[_patient].medicalAssetIds;
    }
}
