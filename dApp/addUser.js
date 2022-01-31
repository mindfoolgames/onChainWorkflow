// console.log("SERVERURL: " + serverUrl)
// console.log("APPID: " + appId)
// console.log("CHAINID: " + chainId)
// console.log("WORKFLOWENGINE_ADDRESS: " + WORKFLOWENGINE_ADDRESS)
// console.log("ADDUSERFLOW_ADDRESS: " + ADDUSERFLOW_ADDRESS)
// console.log("WORKFLOWENGINE_ABI: " + workflowEngineAbi)

let web3;
let currentUser;
let wfStatus = "New"
let wfId;
let twitterID;
let tweetURL;
let requestedTeam;
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
            document.getElementById('twitterID').readOnly = true
            document.getElementById('tweetURL').readOnly = true
            document.getElementById('requestedTeam').readOnly = true
        }

        const opt0 = { chain: chainId, contractAddress: ADDUSERFLOW_ADDRESS, functionName: "checkOut", 
            abi: addUserFlowAbi, params: { itemNum: wfId, userAddr: currentUser.get("ethAddress") }}
        const tx0 = await Moralis.executeFunction(opt0)

        const opt1 = { chain: chainId, contractAddress: ADDUSERFLOW_ADDRESS, functionName: "getItem", 
            abi: addUserFlowAbi, params: { id: wfId }}
        const tx1 = await Moralis.executeFunction(opt1)

        const opt2 = { chain: chainId, contractAddress: ADDUSERFLOW_ADDRESS, functionName: "commentsForItem", 
            abi: addUserFlowAbi, params: { id: wfId }}
        const tx2 = await Moralis.executeFunction(opt2)
        
        // console.log("tx1: " + tx1)
        twitterID = tx1[2];
        tweetURL = tx1[3];
        requestedTeam = tx1[4];
        // console.log("twitterID: " + twitterID)
        // console.log("tweetURL: " + tweetURL)
        // console.log("requestedTeam: " + tx1[4])

        document.getElementById('twitterID').value = twitterID
        document.getElementById('tweetURL').value = tweetURL
        document.getElementById('requestedTeam').value = requestedTeam

        renderComments(tx2)
    }

    await renderUserInfo()
    setInnerHTML("itemStatus", wfStatus)
}

// function clearChildren(el) {
//     const parent = document.getElementById(el);
//     while (parent.firstChild) {
//         parent.removeChild(parent.firstChild);
//     }
// }

async function createAddUserItem() {
    console.log('in createAddUserItem()')
    twitterID = document.getElementById('twitterID').value;
    // console.log('twitterID:  ' + twitterID)
    tweetURL = document.getElementById('tweetURL').value;
    // console.log('tweetURL:  ' + tweetURL)
    requestedTeam = document.getElementById('requestedTeam').value;
    // console.log('requestedTeam:  ' + requestedTeam)
    let newComment = document.getElementById('newComment').value;
    
    // Moralis API doesn't seem to like to take an empty string as a parameter... so for now all fields are required.
    if(twitterID === '' || tweetURL === '' || newComment === '') {
        alert('Twitter ID, Tweet URL, Requested Team & New Comment are all required.')
    }
    else {
        const opt1 = { chain: chainId, contractAddress: ADDUSERFLOW_ADDRESS, functionName: "createNewItem", 
        abi: addUserFlowAbi, params: { twitterId: twitterID, tweetURL: tweetURL, requestedTeam: requestedTeam, comment: newComment }}
        const tx1 = await Moralis.executeFunction(opt1)
        // console.log("createScreateAddUserItemimpleFlow: " + tx1)
        alert('New AddUser Item Created... go back to the inbox (manually for now)')
    }
}

async function updateAddUserItem() {
    console.log('in updateAddUserItem()')
    twitterID = document.getElementById('twitterID').value;
    // console.log('twitterID:  ' + twitterID)
    tweetURL = document.getElementById('tweetURL').value;
    // console.log('tweetURL:  ' + tweetURL)
    requestedTeam = document.getElementById('requestedTeam').value;
    // console.log('requestedTeam:  ' + requestedTeam)
    let newComment = document.getElementById('newComment').value;
    
    // Moralis API doesn't seem to like to take an empty string as a parameter... so for now all fields are required.
    if(twitterID === '' || tweetURL === '' || newComment === '') {
        alert('Twitter ID, Tweet URL, Requested Team & New Comment are all required.')
    }
    else {
        const opt1 = { chain: chainId, contractAddress: ADDUSERFLOW_ADDRESS, functionName: "updateItem", 
        abi: addUserFlowAbi, params: { id: wfId, twitterId: twitterID, tweetURL: tweetURL, requestedTeam: requestedTeam, comment: newComment }}
        const tx1 = await Moralis.executeFunction(opt1)
        // console.log("createScreateAddUserItemimpleFlow: " + tx1)
        alert('AddUser Item Updated... go back to the inbox (manually for now)')
    }
}

async function approveAddUserItem() {
    console.log('in approveAddUserItem()')
    let newComment = document.getElementById('newComment').value;

    const opt1 = { chain: chainId, contractAddress: ADDUSERFLOW_ADDRESS, functionName: "approve", 
        abi: addUserFlowAbi, params: { id: wfId, comment: newComment }}
    const tx1 = await Moralis.executeFunction(opt1)
    // console.log("approveAddUserItem: " + tx1)
    alert('New AddUser Approved... go back to the inbox (manually for now)')
}

async function rejectAddUserItem() {
    console.log('in rejectAddUserItem()')
    let newComment = document.getElementById('newComment').value;

    const opt1 = { chain: chainId, contractAddress: ADDUSERFLOW_ADDRESS, functionName: "reject", 
        abi: addUserFlowAbi, params: { id: wfId, comment: newComment }}
    const tx1 = await Moralis.executeFunction(opt1)
    // console.log("rejectAddUserItem: " + tx1)
    alert('New AddUser Rejected... go back to the inbox (manually for now)')
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
