export interface BitbucketPayload {
    actor: Actor;
    pullrequest: PullRequest;
}

interface Actor {
    display_name: string;
}

interface PullRequest {
    title: string;
    links: Links;
    destination: BranchInfo;
    source: BranchInfo;
}

interface Links {
    [key: string]: { href: string };
}

interface BranchInfo {
    branch: { name: string }
}
