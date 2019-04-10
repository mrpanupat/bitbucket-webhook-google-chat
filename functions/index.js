const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const chatbotRoom = 'https://chat.googleapis.com/v1/spaces/YYYYYYY/messages?key=xxxxxxxxx';

admin.initializeApp();

async function pushToGoogleChat(message, dispatch, thread = null) {
    let googleRes = await axios.post(chatbotRoom, {
        text: message,
        thread: {
            name: thread
        }
    }).catch((e)=>{console.log(e)});
    dispatch(googleRes.data.thread.name);
}

exports.created = functions.https.onRequest((req, res) => {
    let pullRequest = req.body.pullrequest;
    let actor = req.body.actor;
    let pullRequestId = pullRequest.links.html.href.split("/bitbucket.org/")[1];

    //call google chat api
    let message = '<users/all>\n' +
        'Title :     ' + pullRequest.title.trim() + '\n' +
        'Branch : ' + pullRequest.source.branch.name.trim() + '   >   ' + pullRequest.destination.branch.name.trim() + '\n' +
        'Author : _' + actor.display_name.trim() + '_\n' +
        'Link :     <' + pullRequest.links.html.href + '|' + pullRequest.links.html.href + '>';
    return pushToGoogleChat(message, (threadId) => {
        admin.database().ref('chatThread').child(pullRequestId).set({
            threadId: threadId.toString()
        });
        return res.send('OK');
    });
});

exports.approved = functions.https.onRequest((req, res) => {
    let pullRequest = req.body.pullrequest;
    let actor = req.body.actor.display_name.trim();
    let pullRequestId = pullRequest.links.html.href.split("/bitbucket.org/")[1];

    //call google chat api
    let message = '_' + actor + '_ has Approved.';

    return admin.database().ref('chatThread').child(pullRequestId).child('threadId').once('value', (snapshot) => {
        return pushToGoogleChat(message, (threadId) => {
            return res.send('OK ' + threadId);
        }, snapshot.val());
    }, (errorObject) => {
        return res.send("The read failed: " + errorObject.code);
    })
});

exports.updated = functions.https.onRequest((req, res) => {
    let pullRequest = req.body.pullrequest;
    let actor = req.body.actor.display_name.trim();
    let pullRequestId = pullRequest.links.html.href.split("/bitbucket.org/")[1];

    //call google chat api
    let message = '_' + actor + '_ has Updated.';

    return admin.database().ref('chatThread').child(pullRequestId).child('threadId').once('value', (snapshot) => {
        return pushToGoogleChat(message, (threadId) => {
            return res.send('OK ' + threadId);
        }, snapshot.val());
    }, (errorObject) => {
        return res.send("The read failed: " + errorObject.code);
    })
});

exports.approvalRemoved = functions.https.onRequest((req, res) => {
    let pullRequest = req.body.pullrequest;
    let actor = req.body.actor.display_name.trim();
    let pullRequestId = pullRequest.links.html.href.split("/bitbucket.org/")[1];

    //call google chat api
    let message = '_' + actor + '_ has Unapproved.';

    return admin.database().ref('chatThread').child(pullRequestId).child('threadId').once('value', (snapshot) => {
        return pushToGoogleChat(message, (threadId) => {
            return res.send('OK ' + threadId);
        }, snapshot.val());
    }, (errorObject) => {
        return res.send("The read failed: " + errorObject.code);
    })
});

exports.merged = functions.https.onRequest((req, res) => {
    let pullRequest = req.body.pullrequest;
    let actor = req.body.actor.display_name.trim();
    let pullRequestId = pullRequest.links.html.href.split("/bitbucket.org/")[1];

    //call google chat api
    let message = '_' + actor + '_ has Merged.';
    let dataRef = admin.database().ref('chatThread').child(pullRequestId).child('threadId');
    return dataRef.once('value', (snapshot) => {
        return pushToGoogleChat(message, (threadId) => {
            dataRef.set(null);
            return res.send('OK ' + threadId);
        }, snapshot.val());
    }, (errorObject) => {
        return res.send("The read failed: " + errorObject.code);
    })
});

exports.declined = functions.https.onRequest((req, res) => {
    let pullRequest = req.body.pullrequest;
    let actor = req.body.actor.display_name.trim();
    let pullRequestId = pullRequest.links.html.href.split("/bitbucket.org/")[1];

    //call google chat api
    let message = '_' + actor + '_ has declined.';
    let dataRef = admin.database().ref('chatThread').child(pullRequestId).child('threadId');
    return dataRef.once('value', (snapshot) => {
        return pushToGoogleChat(message, (threadId) => {
            dataRef.set(null);
            return res.send('OK ' + threadId);
        }, snapshot.val());
    }, (errorObject) => {
        return res.send("The read failed: " + errorObject.code);
    })
});

exports.commented = functions.https.onRequest((req, res) => {
    let pullRequest = req.body.pullrequest;
    let actor = req.body.actor.display_name.trim();
    let pullRequestId = pullRequest.links.html.href.split("/bitbucket.org/")[1];

    //call google chat api
    let message = '_' + actor + '_ has Commented.';

    return admin.database().ref('chatThread').child(pullRequestId).child('threadId').once('value', (snapshot) => {
        return pushToGoogleChat(message, (threadId) => {
            return res.send('OK ' + threadId);
        }, snapshot.val());
    }, (errorObject) => {
        return res.send("The read failed: " + errorObject.code);
    })
});