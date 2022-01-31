let currentUser;
Moralis.start({ serverUrl, appId });

async function intitializeApp() {
    currentUser = Moralis.User.current();
    if (currentUser) {
        console.log(`Current User Address:  ${currentUser.get("ethAddress")}`);
        await Moralis.User.logOut();
        console.log("logged out");
        console.log(currentUser.get("ethAddress"));
    }
}

intitializeApp();
