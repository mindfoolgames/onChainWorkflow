//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract WorkflowEngine {
    // ToDo:  Can add indexes on up to three of these fields
    //   event ItemCreated(uint256 id, string itemType, string team, string status, bool checkedOut, address createUser, uint256 createTimestamp);
    event ItemCreated(
        uint256 id,
        address itemType,
        string team,
        string status,
        bool checkedOut,
        address createUser,
        uint256 createTimestamp
    );

    // Still considering an ItemUpdated event vs a ItemCheckIn & ItemChekOut event.
    //   event ItemUpdated(uint256 id, string itemType, string team, string status, bool checkedOut, address createUser, uint256 createTimestamp);
    event ItemUpdated(
        uint256 id,
        address itemType,
        string team,
        string status,
        bool checkedOut,
        address createUser,
        uint256 createTimestamp
    );

    struct WorkItem {
        uint256 id;
        string itemType;
        address itemTypeAddr;
        string team;
        string status;
        bool checkedOut;
        address checkedOutBy; // Good for Granularity, may not be needed
        //uint activeStep;    // FromE
        address createUser;
        address updateUser;
        uint256 createTimestamp;
        uint256 updateTimestamp;
    }

    // Should not be public, need to lock down access
    WorkItem[] public workItems;
    address admin;

    mapping(address => string) public contractAddressToFlowName;
    mapping(string => address) public flowNameToContractAddress;

    // TODO: allow an address to be part of more than one team
    mapping(address => string) public addressToTeam;
    // TODO: teams
    // mapping(string => address[]) public teamToAddresses;

    mapping(address => string) public addressToTwitterId;
    mapping(string => address) public twitterIdToAddress;

    constructor() {
        admin = msg.sender;
    }

    function register(address contractAddr, string memory flowName) public {
        require(msg.sender == admin, "Only Admin Can Register a Contract.");
        contractAddressToFlowName[contractAddr] = flowName;
        flowNameToContractAddress[flowName] = contractAddr;
    }

    function createNewItem(
        string memory flowName,
        string memory team,
        string memory status
    ) external returns (uint256) {
        require(
            flowNameToContractAddress[flowName] == msg.sender,
            "Can only be called by Contract Owner."
        );
        WorkItem memory item;
        item.id = workItems.length;
        item.itemType = flowName;
        item.itemTypeAddr = msg.sender;
        item.team = team;
        item.status = status;
        item.checkedOut = false;
        item.createUser = msg.sender;
        item.createTimestamp = block.timestamp;

        workItems.push(item);

        emit ItemCreated(
            item.id,
            item.itemTypeAddr,
            item.team,
            item.status,
            item.checkedOut,
            item.createUser,
            item.createTimestamp
        );
        return item.id;
    }

    function getItems() public view returns (WorkItem[] memory) {
        return workItems;
    }

    function getItem(uint256 itemNum) public view returns (WorkItem memory) {
        require(workItems.length > itemNum, "This workitem does not exist");
        return workItems[itemNum];
    }

    function setItem(uint256 itemNum, WorkItem memory item) public {
        require(workItems.length > itemNum, "This workitem does not exist");
        workItems[itemNum] = item;
    }

    function checkOut(uint256 itemNum, address userAddr) public {
        require(workItems.length > itemNum, "This workitem does not exist");
        require(
            msg.sender == workItems[itemNum].itemTypeAddr,
            "This workitem is not owned by this flow."
        );
        require(
            !workItems[itemNum].checkedOut,
            "This workitem is already checked out"
        );

        workItems[itemNum].checkedOut = true;
        workItems[itemNum].checkedOutBy = userAddr; // Good for granularity, may not be needed
        workItems[itemNum].updateUser = userAddr;
        workItems[itemNum].updateTimestamp = block.timestamp;

        // emit ItemUpdated(workItems[itemNum].id, workItems[itemNum].itemTypeAddr, workItems[itemNum].team, workItems[itemNum].status, workItems[itemNum].checkedOut, workItems[itemNum].createUser, workItems[itemNum].createTimestamp);
    }

    function checkIn(uint256 itemNum, address userAddr) public {
        require(workItems.length > itemNum, "This workitem does not exist");
        require(
            workItems[itemNum].checkedOut,
            "This workitem is not checked out"
        );
        require(
            msg.sender == workItems[itemNum].itemTypeAddr,
            "This workitem is not owned by this flow."
        );
        require(
            workItems[itemNum].checkedOutBy == userAddr,
            "This workitem is not checked out to you"
        );

        workItems[itemNum].checkedOut = false;
        workItems[itemNum].updateUser = userAddr;
        workItems[itemNum].updateTimestamp = block.timestamp;
        workItems[itemNum].checkedOutBy = address(0); // Good for granularity, may not be needed

        // emit ItemUpdated(workItems[itemNum].id, workItems[itemNum].itemTypeAddr, workItems[itemNum].team, workItems[itemNum].status, workItems[itemNum].checkedOut, workItems[itemNum].createUser, workItems[itemNum].createTimestamp);
    }

    function getOpenItems() public view returns (WorkItem[] memory) {
        WorkItem[] memory openItems = new WorkItem[](workItems.length);
        string memory bb = "Complete";
        uint256 oiIdx = 0;

        for (uint256 i = 0; i < workItems.length; i++) {
            if (!strcmp(workItems[i].status, bb)) {
                openItems[oiIdx] = workItems[i];
                oiIdx++;
            }
        }
        return openItems;
    }

    function getOpenItemsByTeam(string memory _team)
        public
        view
        returns (WorkItem[] memory)
    {
        WorkItem[] memory openItems = new WorkItem[](workItems.length);
        string memory bb = "Complete";
        string memory cc = "Cancelled";
        uint256 oiIdx = 0;

        for (uint256 i = 0; i < workItems.length; i++) {
            if (
                !(strcmp(workItems[i].status, bb) ||
                    strcmp(workItems[i].status, cc))
            ) {
                if (strcmp(workItems[i].team, _team)) {
                    openItems[oiIdx] = workItems[i];
                    oiIdx++;
                }
            }
        }
        return openItems;
    }

    function setTeam(string memory _team) public {
        // TODO: only allow an admin or approved team member to call this function
        addressToTeam[msg.sender] = _team;
    }

    function setTeamById(address userAddr, string memory _team) external {
        // require(
        //     msg.sender == flowNameToContractAddress["AddUser"],
        //     "Only the AddUser contract may update social ids."
        // );

        addressToTeam[userAddr] = _team;
    }

    function getTeam() public view returns (string memory) {
        return addressToTeam[msg.sender];
    }

    function setTwitterId(address userAddr, string memory _twitterId) public {
        // TODO: restrict execution to AddUserFlowContract
        // require(
        //     msg.sender == flowNameToContractAddress["AddUser"],
        //     "Only the AddUser contract may update social ids."
        // );

        addressToTwitterId[userAddr] = _twitterId;
        twitterIdToAddress[_twitterId] = userAddr;
    }

    function getTwitterIdFromAddress(address userAddr)
        public
        view
        returns (string memory)
    {
        return addressToTwitterId[userAddr];
    }

    function getAddressFromTwitterId(string memory _twitterId)
        public
        view
        returns (address)
    {
        return twitterIdToAddress[_twitterId];
    }

    function strcmp(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return memcmp(bytes(a), bytes(b));
    }

    function memcmp(bytes memory a, bytes memory b)
        internal
        pure
        returns (bool)
    {
        return (a.length == b.length) && (keccak256(a) == keccak256(b));
    }
}
