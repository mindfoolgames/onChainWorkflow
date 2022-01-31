// console.log("SERVERURL: " + serverUrl)
// console.log("APPID: " + appId)
// console.log("CHAINID: " + chainId)
// console.log("WORKFLOWENGINE_ADDRESS: " + WORKFLOWENGINE_ADDRESS)
console.log("SUPPLYCHAINFLOW_ADDRESS: " + SUPPLYCHAINFLOW_ADDRESS)
// console.log("WORKFLOWENGINE_ABI: " + workflowEngineAbi)

let web3;
let currentUser;
let wfStatus = "New"
let wfId;
let lineItem1Quantity;
let lineItem1Description;

let comments;

Moralis.start({ serverUrl, appId });


async function intitializeApp() {
    currentUser = Moralis.User.current();
    if (!currentUser) {
        currentUser = await Moralis.Web3.authenticate();
    }

    web3 = await Moralis.enableWeb3();

    let params = new URLSearchParams(document.location.search);
    wfId = params.get("id");
    if(wfId === null || wfId === 'new') {
        // Entry Screen
        document.getElementById('updateButtons').style.display = 'none';
        document.getElementById('approvalButtons').style.display = 'none';
    }
    else if(Number.isFinite(Number.parseInt(wfId))) {
        document.getElementById('entryButtons').style.display = 'none';

        wfStatus = await getItemStatus()

        if(wfStatus === 'Rejected') {
            document.getElementById('approvalButtons').style.display = 'none';
        }
        else {
            document.getElementById('updateButtons').style.display = 'none';
            document.getElementById('lineItem1Quantity').readOnly = true
            document.getElementById('lineItem1Description').readOnly = true
        }

        const opt0 = { chain: chainId, contractAddress: SUPPLYCHAINFLOW_ADDRESS, functionName: "checkOut", 
            abi: supplyChainFlowAbi, params: { itemNum: wfId, userAddr: currentUser.get("ethAddress") }}
        const tx0 = await Moralis.executeFunction(opt0)

        const opt1 = { chain: chainId, contractAddress: SUPPLYCHAINFLOW_ADDRESS, functionName: "getItem", 
            abi: supplyChainFlowAbi, params: { id: wfId }}
        const tx1 = await Moralis.executeFunction(opt1)

        const opt2 = { chain: chainId, contractAddress: SUPPLYCHAINFLOW_ADDRESS, functionName: "commentsForItem", 
            abi: supplyChainFlowAbi, params: { id: wfId }}
        const tx2 = await Moralis.executeFunction(opt2)
        
        // console.log("tx1: " + tx1)

        lineItem1Quantity = tx1[2];
        lineItem1Description = tx1[3];
        // console.log("lineItem1Quantity: " + lineItem1Quantity)
        // console.log("lineItem1Description: " + lineItem1Description)

        document.getElementById('lineItem1Quantity').value = lineItem1Quantity
        document.getElementById('lineItem1Description').value = lineItem1Description

        renderComments(tx2)
    }

    await renderUserInfo()
    setInnerHTML("itemStatus", wfStatus)
}

async function createItem() {
    console.log('in createItem()')
    lineItem1Quantity = document.getElementById('lineItem1Quantity').value;
    // console.log('lineItem1Quantity:  ' + lineItem1Quantity)
    lineItem1Description = document.getElementById('lineItem1Description').value;
    // console.log('lineItem1Description:  ' + lineItem1Description)
    let newComment = document.getElementById('newComment').value;
    
    // Moralis API doesn't seem to like to take an empty string as a parameter... so for now all fields are required.
    if(lineItem1Quantity === '' || lineItem1Description === '' || newComment === '') {
        alert('Quantity, Description, Requested Team & New Comment are all required.')
    }
    else {
        const opt1 = { chain: chainId, contractAddress: SUPPLYCHAINFLOW_ADDRESS, functionName: "createNewItem", 
        abi: supplyChainFlowAbi, params: { lineItem1Quantity: lineItem1Quantity, lineItem1Description: lineItem1Description, comment: newComment }}
        const tx1 = await Moralis.executeFunction(opt1)
        // console.log("createScreateItemimpleFlow: " + tx1)
        alert('New Item Created... go back to the inbox (manually for now)')
    }
}

async function updateItem() {
    console.log('in updateItem()')
    lineItem1Quantity = document.getElementById('lineItem1Quantity').value;
    // console.log('lineItem1Quantity:  ' + lineItem1Quantity)
    lineItem1Description = document.getElementById('lineItem1Description').value;
    // console.log('lineItem1Description:  ' + lineItem1Description)
    
    // Moralis API doesn't seem to like to take an empty string as a parameter... so for now all fields are required.
    if(lineItem1Quantity === '' || lineItem1Description === '' || newComment === '') {
        alert('Quantity, Description, Requested Team & New Comment are all required.')
    }
    else {
        const opt1 = { chain: chainId, contractAddress: SUPPLYCHAINFLOW_ADDRESS, functionName: "updateItem", 
        abi: supplyChainFlowAbi, params: { id: wfId, lineItem1Quantity: lineItem1Quantity, lineItem1Description: lineItem1Description, comment: newComment }}
        const tx1 = await Moralis.executeFunction(opt1)
        alert('Item Updated... go back to the inbox (manually for now)')
    }
}

async function approveItem() {
    console.log('in approveItem()')
    let newComment = document.getElementById('newComment').value;

    const opt1 = { chain: chainId, contractAddress: SUPPLYCHAINFLOW_ADDRESS, functionName: "approve", 
        abi: supplyChainFlowAbi, params: { id: wfId, comment: newComment }}
    const tx1 = await Moralis.executeFunction(opt1)
    alert('Item Approved... go back to the inbox (manually for now)')
}

async function rejectItem() {
    console.log('in rejectItem()')
    let newComment = document.getElementById('newComment').value;

    const opt1 = { chain: chainId, contractAddress: SUPPLYCHAINFLOW_ADDRESS, functionName: "reject", 
        abi: supplyChainFlowAbi, params: { id: wfId, comment: newComment }}
    const tx1 = await Moralis.executeFunction(opt1)
    alert('Item Rejected... go back to the inbox (manually for now)')
}

function renderComments(cmts) {
    console.log("In renderCommentsF")
    parent = document.getElementById("comments");
    // clearChildren('comments')
    for (let i = 0; i < cmts.length; i++) {
        let htmlString = `
            <div class="row">
                <div class="col sm-12">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">${cmts[i].userId} - ${convertDate(cmts[i].createTimestamp)}</h6>
                            <p class="card-text">${cmts[i].comment}</p>
                        </div>
                    </div>
                </div>
            </div>
            `;
        let col = document.createElement("div");
        col.innerHTML = htmlString;
        parent.appendChild(col);
    }
}

async function getItemStatus() {
    const opt00 = { chain: chainId, contractAddress: WORKFLOWENGINE_ADDRESS, functionName: "getItem", 
            abi: workflowEngineAbi, params: { itemNum: wfId }}
    const tx00 = await Moralis.executeFunction(opt00)
    return tx00[4]
}


intitializeApp();
