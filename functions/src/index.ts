import axios, {AxiosResponse} from "axios";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Request} from "firebase-functions/lib/providers/https";
import {Response} from "express";
import {PullRequestInfo} from "./type/PullRequestInfo";
import DataSnapshot = admin.database.DataSnapshot;

const webhooksUrl: string = 'https://chat.googleapis.com/v1/spaces/YYYYYYY/messages?key=xxxxxxxxx';

admin.initializeApp();

function pushToGoogleChat(message: string, dispatch?: (arg: string) => void, thread?: string) {
    axios.post(webhooksUrl, {
        text: message,
        thread: {
            name: thread
        }
    }).then((googleRes: AxiosResponse) => {
        if (dispatch)
            dispatch(googleRes.data.thread.name);
    }).catch((e: any) => {
        console.log(e)
    });
}

function getSaveDispatchByPullRequestId(pullRequestId: string) {
    return (threadId: string) => {
        admin.database().ref('chatThread').child(pullRequestId).set({
            threadId: threadId.toString()
        }).then(() => {
            console.log("Save thread id : " + threadId);
        });
    }
}

function getThreadIdByPullRequestId(pullRequestId: string, dispatch: (snapshot: DataSnapshot) => void) {
    admin.database().ref('chatThread').child(pullRequestId).child('threadId')
        .once('value', dispatch)
        .catch((e: any) => {
            console.log(e)
        });
}

function removeThreadByRequestId(pullRequestId: string) {
    admin.database().ref('chatThread').child(pullRequestId).child('threadId')
        .set(null)
        .catch((e: any) => {
            console.log(e)
        });
}

function extractPullRequestInfo(requestBody: any): PullRequestInfo {
    return {
        actor: requestBody.actor.display_name.trim(),
        pullRequestTitle: requestBody.pullrequest.title.trim(),
        pullRequestId: requestBody.pullrequest.links.html.href.split("/bitbucket.org/")[1],
        pullRequestUrl: requestBody.pullrequest.links.html.href,
        sourceBranch: requestBody.pullrequest.source.branch.name.trim(),
        destinationBranch: requestBody.pullrequest.destination.branch.name.trim()
    };
}

function pullRequestCreated(req: Request) {
    const pullRequestInfo: PullRequestInfo = extractPullRequestInfo(req.body);
    const message: string = '<users/all>\n' +
        'Title :     ' + pullRequestInfo.pullRequestTitle + '\n' +
        'Branch : ' + pullRequestInfo.sourceBranch + '   >   ' + pullRequestInfo.destinationBranch + '\n' +
        'Author : _' + pullRequestInfo.actor + '_\n' +
        'Link :     <' + pullRequestInfo.pullRequestUrl + '|' + pullRequestInfo.pullRequestUrl + '>';
    pushToGoogleChat(message, getSaveDispatchByPullRequestId(pullRequestInfo.pullRequestId));
}

function pullRequestUpdated(req: Request) {
    const pullRequestInfo: PullRequestInfo = extractPullRequestInfo(req.body);
    const message = '_' + pullRequestInfo.actor + '_ has Updated.';

    getThreadIdByPullRequestId(pullRequestInfo.pullRequestId, (data: DataSnapshot) => {
        if (data.val())
            pushToGoogleChat(message, undefined, data.val());
    })
}

function pullRequestCommented(req: Request) {
    const pullRequestInfo: PullRequestInfo = extractPullRequestInfo(req.body);
    const message = '_' + pullRequestInfo.actor + '_ has Commented.';

    getThreadIdByPullRequestId(pullRequestInfo.pullRequestId, (data: DataSnapshot) => {
        if (data.val())
            pushToGoogleChat(message, undefined, data.val());
    })
}

function pullRequestApproved(req: Request) {
    const pullRequestInfo: PullRequestInfo = extractPullRequestInfo(req.body);
    const message = '_' + pullRequestInfo.actor + '_ has Approved.';

    getThreadIdByPullRequestId(pullRequestInfo.pullRequestId, (data: DataSnapshot) => {
        if (data.val())
            pushToGoogleChat(message, undefined, data.val());
    })
}

function pullRequestUnapproved(req: Request) {
    const pullRequestInfo: PullRequestInfo = extractPullRequestInfo(req.body);
    const message = '_' + pullRequestInfo.actor + '_ has Unapproved.';

    getThreadIdByPullRequestId(pullRequestInfo.pullRequestId, (data: DataSnapshot) => {
        if (data.val())
            pushToGoogleChat(message, undefined, data.val());
    })
}

function pullRequestMerged(req: Request) {
    const pullRequestInfo: PullRequestInfo = extractPullRequestInfo(req.body);
    const message = '_' + pullRequestInfo.actor + '_ has Merged.';

    getThreadIdByPullRequestId(pullRequestInfo.pullRequestId, (data: DataSnapshot) => {
        if (data.val())
            pushToGoogleChat(message, () => {
                removeThreadByRequestId(pullRequestInfo.pullRequestId);
            }, data.val());
    })
}

function pullRequestDeclined(req: Request) {
    const pullRequestInfo: PullRequestInfo = extractPullRequestInfo(req.body);
    const message = '_' + pullRequestInfo.actor + '_ has Declined.';

    getThreadIdByPullRequestId(pullRequestInfo.pullRequestId, (data: DataSnapshot) => {
        if (data.val())
            pushToGoogleChat(message, () => {
                removeThreadByRequestId(pullRequestInfo.pullRequestId)
            }, data.val());
    })
}

exports.pullrequest = functions.https.onRequest((req: Request, resp: Response) => {
    switch (req.header('X-Event-Key')) {
        case 'pullrequest:created':
            pullRequestCreated(req);
            break;
        case 'pullrequest:updated':
            pullRequestUpdated(req);
            break;
        case 'pullrequest:comment_created':
            pullRequestCommented(req);
            break;
        case 'pullrequest:approved':
            pullRequestApproved(req);
            break;
        case 'pullrequest:unapproved':
            pullRequestUnapproved(req);
            break;
        case 'pullrequest:fulfilled':
            pullRequestMerged(req);
            break;
        case 'pullrequest:rejected':
            pullRequestDeclined(req);
            break;
    }
    resp.send("OK");
})