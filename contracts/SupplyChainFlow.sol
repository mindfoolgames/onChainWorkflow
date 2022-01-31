//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./WorkflowEngine.sol";

contract SupplyChainFlow {
    address internal workflowEngineAddr;
    WorkflowEngine wfe;

    struct Item {
        uint256 id;
        address userAddr;
        uint256 lineItem1Quantity;
        string lineItem1Description;
    }

    struct Comments {
        address userId;
        uint256 createTimestamp;
        string comment;
    }

    mapping(uint256 => Item) public items;
    mapping(uint256 => Comments[]) public comments;

    constructor(address wfeAddr) {
        workflowEngineAddr = wfeAddr;
        wfe = WorkflowEngine(wfeAddr);
    }

    function createNewItem(
        uint256 lineItem1Quantity,
        string memory lineItem1Description,
        string memory comment
    ) public {
        Item memory item;
        // should also be sending userAddr... so createUser will be logged as the user and not the contract
        item.id = wfe.createNewItem("SupplyChain", "Team A", "Approve");
        item.userAddr = msg.sender;
        item.lineItem1Quantity = lineItem1Quantity;
        item.lineItem1Description = lineItem1Description;
        items[item.id] = item;

        addComment(item.id, comment);
    }

    function checkOut(uint256 itemNum) public {
        // TODO:  should revert if checked out to someone else
        // TODO:  if status is rejected... need to confirm msg.sender is wfe.createUser
        WorkflowEngine.WorkItem memory item = wfe.getItem(itemNum);
        if (!item.checkedOut) {
            wfe.checkOut(itemNum, msg.sender);
        }
    }

    function updateItem(
        uint256 id,
        uint256 lineItem1Quantity,
        string memory lineItem1Description,
        string memory comment
    ) public {
        require(wfe.getItems().length > id, "This workitem does not exist");
        // check that status is Rejected / team == None / editer should be wfe.createUser (maybe this check is)
        // add check to make sure item is checked out to msg.sender
        items[id].lineItem1Quantity = lineItem1Quantity;
        items[id].lineItem1Description = lineItem1Description;

        WorkflowEngine.WorkItem memory item = wfe.getItem(id);
        item.status = "Approve";
        item.team = "Team A";
        wfe.setItem(id, item);
        addComment(id, comment);
        wfe.checkIn(id, msg.sender);
    }

    function addComment(uint256 id, string memory comment) internal {
        if (bytes(comment).length > 0) {
            Comments memory newComment;
            newComment.userId = msg.sender;
            newComment.createTimestamp = block.timestamp;
            newComment.comment = comment;
            comments[id].push(newComment);
        }
    }

    function commentsForItem(uint256 id)
        public
        view
        returns (Comments[] memory)
    {
        return comments[id];
    }

    function getItem(uint256 id) public view returns (Item memory) {
        return items[id];
    }

    function approve(uint256 id, string memory comment) public {
        require(wfe.getItems().length > id, "This workitem does not exist");
        // check to see that item is checked out to msg.sender and the status is "Approve"
        // allow user to add a comment (but no other updates)

        WorkflowEngine.WorkItem memory item = wfe.getItem(id);
        item.status = "Complete";
        wfe.setItem(id, item);

        addComment(id, comment);
        wfe.checkIn(id, msg.sender);
    }

    function reject(uint256 id, string memory comment) public {
        require(wfe.getItems().length > id, "This workitem does not exist");
        // check to see that item is checked out to msg.sender and the status is "Approve"
        // allow user to add a comment (but no other updates)
        WorkflowEngine.WorkItem memory item = wfe.getItem(id);
        item.status = "Rejected";
        item.team = "None";
        wfe.setItem(id, item);
        addComment(id, comment);
        wfe.checkIn(id, msg.sender);
    }

    function cancel(uint256 id, string memory comment) public {
        require(wfe.getItems().length > id, "This workitem does not exist");
        // check to see that item is checked out to msg.sender and the status is "Rejected"
        // allow user to add a comment (but no other updates)
        WorkflowEngine.WorkItem memory item = wfe.getItem(id);
        item.status = "Cancelled";
        item.team = "None";
        wfe.setItem(id, item);
        addComment(id, comment);
        wfe.checkIn(id, msg.sender);
    }
}
