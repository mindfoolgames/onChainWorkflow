const serverUrl = "Fill In Your Moralis Server URL";
const appId = "Fill In Your Moralis appId";

const chainId = 'avalanche testnet';
const WORKFLOWENGINE_ADDRESS = "Fill In Your WorkFlowEngine.sol contract address";
const ADDUSERFLOW_ADDRESS = "Fill In Your AddUserFlow.sol contract address";
const SUPPLYCHAINFLOW_ADDRESS = "Fill In Your SupplyChainFlow.sol contract address";


function convertDate(dt) {
  return new Date(dt * 1000).toLocaleString()
}

function setInnerHTML(el, val) {
  let parent = document.getElementById(el);
  if(val === '') {
    parent.innerHTML = '&nbsp;';
  }
  else {
    parent.innerHTML = val;
  }
}

async function renderUserInfo() {
  const ethAddr = currentUser.get("ethAddress")
  setInnerHTML("userAddress", ethAddr)

  const opt1 = { chain: chainId, contractAddress: WORKFLOWENGINE_ADDRESS, functionName: "getTwitterIdFromAddress", abi: workflowEngineAbi, params: { userAddr: ethAddr } }
  const twitterID = await Moralis.executeFunction(opt1)
  // console.log(twitterID)
  setInnerHTML("userTwitterId", twitterID)

  const opt2 = { chain: chainId, contractAddress: WORKFLOWENGINE_ADDRESS, functionName: "getTeam", abi: workflowEngineAbi }
  let team = await Moralis.executeFunction(opt2)
  console.log(team)
  if (team === '') {
      team = 'None'
  }
  setInnerHTML("userTeam", team)
  return team
}

function workFlowPage(flowType) {
  // could also add logic to route to a specific page for the flowType/Status combo
  switch(flowType) {
      case 'AddUser':
          console.log('AddUser')
          return 'addUser.html'
      case 'SupplyChain':
          console.log('SupplyChain')
          return 'supplyChain.html'
  }
}
