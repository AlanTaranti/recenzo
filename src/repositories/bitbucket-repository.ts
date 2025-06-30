type Options = {
  bitbucket_access_token?: string;
};

type PrResponse = {
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

export class BitbucketRepository {
  private readonly baseUrl = 'https://api.bitbucket.org/2.0/repositories/';

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

  public async getPullRequest(workspace: string, repository: string, pullRequestId: number): Promise<PrResponse> {
    const url = `${this.baseUrl}${workspace}/${repository}/pullrequests/${pullRequestId.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders,
    });

    return <Promise<PrResponse>>await response.json();
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
}
