export interface BitbucketPayload {
    actor: Actor;
    pullrequest: PullRequest;
    repository: Repository;
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

interface Repository {
    name: string;
}

interface Links {
    [key: string]: { href: string };
}

interface BranchInfo {
    branch: { name: string }
}
