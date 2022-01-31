// console.log("SERVERURL: " + serverUrl)
// console.log("APPID: " + appId)
// console.log("CHAINID: " + chainId)
// console.log("WORKFLOWENGINE_ADDRESS: " + WORKFLOWENGINE_ADDRESS)
// console.log("ADDUSERFLOW_ADDRESS: " + ADDUSERFLOW_ADDRESS)
// console.log("WORKFLOWENGINE_ABI: " + workflowEngineAbi)

let web3;
let currentUser;
let team;
let inboxItems = [];
Moralis.start({ serverUrl, appId });


async function intitializeApp() {
    currentUser = Moralis.User.current();
    if (!currentUser) {
        currentUser = await Moralis.Web3.authenticate();
    }

    web3 = await Moralis.enableWeb3();
    
    team = await renderUserInfo()  // from config.js
    await loadInbox('btnMyItems')
}

async function loadInbox(listType) {
    console.log(`In loadInbox(${listType})`)

    const opt3 = { chain: chainId, contractAddress: WORKFLOWENGINE_ADDRESS, functionName: "getItems", abi: workflowEngineAbi}
    // const opt3 = { chain: chainId, contractAddress: WORKFLOWENGINE_ADDRESS, functionName: "getOpenItems", abi: workflowEngineAbi}
    // const opt3 = { chain: chainId, contractAddress: WORKFLOWENGINE_ADDRESS, functionName: "getOpenItemsByTeam", abi: workflowEngineAbi, params: { _team: "Team Admin" } }
    inboxItems = await Moralis.executeFunction(opt3)
    console.log("inboxItems: " + inboxItems)

    renderInboxTable(listType)
}

function clearChildren(el) {
    const parent = document.getElementById(el);
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function renderInboxTable(listType) {
    console.log(`In renderInboxTable(${listType})`)
    parent = document.getElementById("wfItems");
    clearChildren('wfItems')

    for (let i = 0; i < inboxItems.length; i++) {
        if(showItem(inboxItems[i], listType)) {
            const itemId = (inboxItems[i].checkedOut) ? `${inboxItems[i].id}`:
                `<a href="${workFlowPage(inboxItems[i].itemType)}?id=${inboxItems[i].id}">${inboxItems[i].id}</a>`
            let htmlString = `
                <th scope="row">${itemId}</th>
                <td>${inboxItems[i].itemType}</td>
                <td>${inboxItems[i].status}</td>
                <td>${inboxItems[i].team}</td>
                <td>${convertDate(inboxItems[i].createTimestamp)}</td>
                `;
            let col = document.createElement("tr");
            col.innerHTML = htmlString;
            parent.appendChild(col);
        }
    }
}

function showItem(item, listType) {
    console.log(item.createUser)
    if(listType === 'btnAllItems') {
        if(item.itemType !== '') {
            return true
        }
    }
    else if(listType === 'btnMyItems' && item.status !== 'Complete') {
        if(item.itemType !== '' && (item.team === team || item.createUser === currentUser.get("ethAddress"))) {
            return true
        }
    }
    else if(listType === 'btnAllOpenItems') {
        if(item.itemType !== '' && item.status !== 'Complete') {
            return true
        }
    }
    else
        return false
}

intitializeApp();
