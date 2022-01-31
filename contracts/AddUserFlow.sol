//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./WorkflowEngine.sol";

contract AddUserFlow {
    address internal workflowEngineAddr;
    WorkflowEngine wfe;

    struct Item {
        uint256 id;
        address userAddr;
        string twitterId;
        string tweetURL;
        string requestedTeam;
        uint256 commentsLength; // probably not needed
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
        string memory twitterId,
        string memory tweetURL,
        string memory requestedTeam,
        string memory comment
    ) public {
        Item memory item;
        // should also be sending userAddr... so createUser will be logged as the user and not the contract
        item.id = wfe.createNewItem("AddUser", "Team Admin", "Approve");
        item.userAddr = msg.sender;
        item.twitterId = twitterId;
        item.tweetURL = tweetURL;
        item.requestedTeam = requestedTeam;
        items[item.id] = item;

        addComment(item.id, comment);
    }

    function checkOut(uint256 itemNum) public {
        // TODO:  should revert if checked out to someone else
        // TODO:  if status is rejected... need to confirm msg.sender is wfe.createUser
        WorkflowEngine.WorkItem memory item = wfe.getItem(itemNum);
        if (item.checkedOut) {
            // if(item.updateUser == msg.sender) {
            //   result = true;
            // }
        } else {
            wfe.checkOut(itemNum, msg.sender);
            // result = true;
        }
        // return result;
    }

    function updateItem(
        uint256 id,
        string memory twitterId,
        string memory tweetURL,
        string memory requestedTeam,
        string memory comment
    ) public {
        require(wfe.getItems().length > id, "This workitem does not exist");
        // check that status is Rejected / team == None / editer should be wfe.createUser (maybe this check is)
        // add checks to make sure item is checked out to msg.sender
        items[id].twitterId = twitterId;
        items[id].tweetURL = tweetURL;
        items[id].requestedTeam = requestedTeam;

        WorkflowEngine.WorkItem memory item = wfe.getItem(id);
        item.status = "Approve";
        item.team = "Team Admin";
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
            items[id].commentsLength = items[id].commentsLength + 1;
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
        // add create user to a team in WFE (TODO)
        // TODO:  this step should allow the Team Admin to adjust the team
        // update status to "completed?" and check item in

        // TODO: what it should really be doing is calling an enhanced version of checkin that updates team and status

        WorkflowEngine.WorkItem memory item = wfe.getItem(id);
        item.status = "Complete";
        wfe.setItem(id, item);

        wfe.setTwitterId(items[id].userAddr, items[id].twitterId);
        wfe.setTeamById(items[id].userAddr, items[id].requestedTeam);

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
        // update status to "canceled?", team to "?" and check item in
        WorkflowEngine.WorkItem memory item = wfe.getItem(id);
        item.status = "Cancelled";
        item.team = "None";
        wfe.setItem(id, item);
        addComment(id, comment);
        wfe.checkIn(id, msg.sender);
    }
}
