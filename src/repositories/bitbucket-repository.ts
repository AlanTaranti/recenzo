type Options = {
  bitbucket_access_token?: string;
};

type PullRequest = {
  id: number;
  destination: {
    commit: {
      hash: string;
    };
  };
  source: {
    commit: {
      hash: string;
    };
  };
};

export type PullRequestComment = {
  id: number;
  content: {
    raw: string;
  };
  inline?: {
    to: number;
    path: string;
  };
};

export type PullRequestCreateComment = {
  content: {
    raw: string;
  };
  inline: {
    to: number;
    path: string;
  };
};

type PullRequestCommentList = {
  values: PullRequestComment[];
};

export class BitbucketRepository {
  private readonly baseUrl = 'https://api.bitbucket.org/2.0/repositories/';
  private readonly pageSize = 50;

  constructor(private readonly options?: Options) {}

  private get defaultHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.bitbucket_access_token}`,
    };
  }

  private get bitbucket_access_token(): string {
    if (this.options?.bitbucket_access_token) {
      return this.options.bitbucket_access_token;
    }

    if (process.env['BITBUCKET_ACCESS_TOKEN']) {
      return process.env['BITBUCKET_ACCESS_TOKEN'];
    }
    throw new Error('BITBUCKET_ACCESS_TOKEN is not set');
  }

  public async getPullRequest(workspace: string, repository: string, pullRequestId: number): Promise<PullRequest> {
    const url = `${this.baseUrl}${workspace}/${repository}/pullrequests/${pullRequestId.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders,
    });

    return <Promise<PullRequest>>await response.json();
  }

  private async _listPullRequestsComments(
    workspace: string,
    repository: string,
    pullRequestId: number,
    page: number,
  ): Promise<PullRequestCommentList> {
    const url = `${this.baseUrl}${workspace}/${repository}/pullrequests/${pullRequestId.toString()}/comments/?page=${page.toString()}&pagelen=${this.pageSize.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders,
    });
    return <PullRequestCommentList>await response.json();
  }

  public async listPullRequestsComments(workspace: string, repository: string, pullRequestId: number): Promise<PullRequestComment[]> {
    let page = 1;
    let comments: PullRequestComment[] = [];
    let hasMore = true;
    while (hasMore) {
      const response = await this._listPullRequestsComments(workspace, repository, pullRequestId, page);
      comments = comments.concat(response.values);
      page++;
      hasMore = response.values.length === this.pageSize;
    }
    return comments;
  }

  public async getSourceCodeDiff(
    workspace: string,
    repository: string,
    sourceCommitHash: string,
    destinationCommitHash: string,
  ): Promise<string> {
    const url = `${this.baseUrl}${workspace}/${repository}/diffs/${sourceCommitHash}...${destinationCommitHash}?binary=false`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders,
    });

    return response.text();
  }

  public async createPullRequestComment(
    workspace: string,
    repository: string,
    pullRequestId: number,
    comments: PullRequestCreateComment,
  ): Promise<void> {
    const url = `${this.baseUrl}${workspace}/${repository}/pullrequests/${pullRequestId.toString()}/comments`;

    await fetch(url, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comments),
    });
  }

  public async createPullRequestComments(
    workspace: string,
    repository: string,
    pullRequestId: number,
    comments: PullRequestCreateComment[],
  ): Promise<void> {
    const promises = comments.map((comment) => this.createPullRequestComment(workspace, repository, pullRequestId, comment));
    await Promise.all(promises);
  }
}
