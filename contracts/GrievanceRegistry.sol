// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GrievanceRegistry {
    struct Grievance {
        string title;
        string description;
        string category;
        string location;
        uint256 mediaCount;
        string priorityLevel;
        string trackingId;
        uint256 timestamp;
        address submitter;
        bool resolved;
        // Grouped fields
        uint256 estimatedDays;
        uint256 fundAmount;
        string currency;
        string aiJustification;
    }

    Grievance[] private grievances;
    mapping(string => uint256) private grievanceIndex;
    event GrievanceSubmitted(string trackingId, address indexed submitter);
    event GrievanceMetaAdded(string trackingId);
    event GrievanceDetailsAdded(string trackingId);
    event GrievanceResolved(string trackingId);

    // Single-step grievance submission
    function submitGrievance(
        string memory title,
        string memory description,
        string memory category,
        string memory location,
        uint256 mediaCount,
        string memory priorityLevel,
        string memory trackingId,
        uint256 estimatedDays,
        uint256 fundAmount,
        string memory currency,
        string memory aiJustification
    ) public {
        grievances.push(Grievance({
            title: title,
            description: description,
            category: category,
            location: location,
            mediaCount: mediaCount,
            priorityLevel: priorityLevel,
            trackingId: trackingId,
            timestamp: block.timestamp,
            submitter: msg.sender,
            resolved: false,
            estimatedDays: estimatedDays,
            fundAmount: fundAmount,
            currency: currency,
            aiJustification: aiJustification
        }));
        grievanceIndex[trackingId] = grievances.length - 1;
        emit GrievanceSubmitted(trackingId, msg.sender);
    }

    // Split getter: basic fields
    function getGrievanceBasic(string memory trackingId) public view returns (
        string memory title,
        string memory description,
        string memory category,
        string memory location,
        uint256 mediaCount,
        string memory priorityLevel,
        uint256 timestamp,
        address submitter,
        bool resolved
    ) {
        uint256 idx = grievanceIndex[trackingId];
        require(idx < grievances.length, "Grievance does not exist");
        Grievance storage g = grievances[idx];
        return (
            g.title,
            g.description,
            g.category,
            g.location,
            g.mediaCount,
            g.priorityLevel,
            g.timestamp,
            g.submitter,
            g.resolved
        );
    }

    // Split getter: grouped details
    function getGrievanceDetails(string memory trackingId) public view returns (
        uint256 estimatedDays,
        uint256 fundAmount,
        string memory currency,
        string memory aiJustification
    ) {
        uint256 idx = grievanceIndex[trackingId];
        require(idx < grievances.length, "Grievance does not exist");
        Grievance storage g = grievances[idx];
        return (
            g.estimatedDays,
            g.fundAmount,
            g.currency,
            g.aiJustification
        );
    }

    // Get all tracking IDs for listing
    function getAllTrackingIds() public view returns (string[] memory) {
        string[] memory ids = new string[](grievances.length);
        for (uint256 i = 0; i < grievances.length; i++) {
            ids[i] = grievances[i].trackingId;
        }
        return ids;
    }

    function markResolved(string memory trackingId) public {
        uint256 idx = grievanceIndex[trackingId];
        require(idx < grievances.length, "Grievance does not exist");
        grievances[idx].resolved = true;
        emit GrievanceResolved(trackingId);
    }
}
