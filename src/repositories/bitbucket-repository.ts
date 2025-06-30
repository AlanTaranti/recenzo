type Options = {
  bitbucket_access_token?: string;
};

export class BitbucketRepository {
  private readonly baseUrl = 'https://api.bitbucket.org/2.0/repositories/';

  constructor(private readonly options?: Options) {}

  private get bitbucket_access_token(): string {
    if (this.options?.bitbucket_access_token) {
      return this.options.bitbucket_access_token;
    }

    if (process.env['BITBUCKET_ACCESS_TOKEN']) {
      return process.env['BITBUCKET_ACCESS_TOKEN'];
    }
    throw new Error('BITBUCKET_ACCESS_TOKEN is not set');
  }

  public async getSourceDiff(
    workspace: string,
    repository: string,
    sourceCommitHash: string,
    destinationCommitHash: string,
  ): Promise<string> {
    const url = `${this.baseUrl}${workspace}/${repository}/diffs/${sourceCommitHash}...${destinationCommitHash}?binary=false`;

    const headers = {
      Authorization: `Bearer ${this.bitbucket_access_token}`,
    };

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    return response.text();
  }
}
