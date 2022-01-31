# On Chain Workflow (Moralis-Avalanche Hackathon)

01/31/2022
Authors: Jon Sloan & Eric Poorbaugh

## Background

In the corporate world there are many use cases that require Workflow or BPM. Large operations teams work together pushing items from state to state and team to team. The status of these items and any SLAs associated with them must be able to be tracked and reported on.

When working within a company there is likely no need for a blockchain workflow solution.

When dealing with business to business interactions a blockchain solution becomes much more attractive. With an on chain implementation you can allow smart contracts to define the rules by which these interactions occur in a transparent and decentralized way.

This project is an On Chain Workflow implementation.

Potential use cases include everything from insurance processing, to supply chain, to real estate and banking transactions.

At the core, this solution is very simple and could easily be dropped into projects that need basic workflow functionality.

## Technologies Used

 - Metamask Wallet.
 - Avalanche Remix for smart contract deployment.   
-   Hardhat for local development.
-   Moralis for web3 integration, metamask login, smart contract interaction, and static site hosting.
    

## Design

### WorkflowEngine.sol
-   Controls the inbox / worklist for the user.
-   Maintains the team structure including which team a user is on.
-   Handles item check-in / check-out.
-   Emits an event when a work item is created or updated.
-   Allows smart contracts which represent individual workflows to be registered with it.
    

### Flow Contracts

-   Individual workflows are represented as a smart contract.
-   Maintain the data elements needed for an individual flow.
-   Define the process steps (state).
-   Define which team can work on an item at a specific state.
-   Define the business logic that will determine how an item flows from start to end.
-   Handles the interaction with the WorkFlowEngine contract.

### Sample Flow Contracts:

#### AddUserFlow.sol
-   Allows a user to associate their TwitterID with their wallet address.
-   Allows a user to request to be added to a team.
-   The idea is that the “Team Admin” group will look for a specific tweet from this id that contains the given wallet address (similar to how some faucets work).
-   Team Admin can accept or reject the request. Accepting will create the necessary twitter id and team associations.
-   If a request is rejected, the user may correct and resubmit.
-   There is a “comments” feature that allows users to communicate with one another.

#### SupplyChainFlow.sol

-   Simple implementation that allows a user to create a SupplyChain work item with minimal data fields.
-   A user from “Team A” will then look at that item and see if it should be accepted or rejected.
-   If a request is rejected, the user may correct and resubmit.
-   There is a “comments” feature that allows users to communicate with one another.
    

  ## Areas for improvement

-   Convert to a web framework like React or Vue.
-   Leverage the Moralis database and Live Queries functionality to process the inbox item events that are emitted from WorkFlowEngine to render the worklist. Currently this is all done from the smart contract functions but moving to the database would enable this to scale.
-   Investigate Avalanche Subnet functionality to give people the option of deploying to a private or semi-private blockchain.
-   Create an Interface and or Abstract Class for the Smart Contracts to use.
-   Refactor Teams code… allow a user to be part of more than one team, convert team to an enumeration for easier comparison.
-   Refactor the States code… again, switch to an enumeration but also make it more structured.
-   Lock down the smart contracts for functionality and security purposes (there are many TODO comments in the smart contracts for this).
-   Upgrade AddUser to use ChainLink to automatically reach out and confirm the wallet address / tweet before routing to the Team Admin to Approve/Reject the Team assignment. This would illustrate the use of automated processes in the workflow in addition to the manual processes that have been shown.
  

## Reference Implementation / Live Demo

-   Deployed on the FUJI C-Chain Test Network.
-   Hosted using Moralis static hosting at [https://w9gxofuzsqai.usemoralis.com](https://w9gxofuzsqai.usemoralis.com)
-   Demo Video Link: [https://vimeo.com/672062200/edd691d54f](https://vimeo.com/672062200/edd691d54f)
-   Github Link: [https://github.com/mindfoolgames/onChainWorkflow](https://github.com/mindfoolgames/onChainWorkflow)
