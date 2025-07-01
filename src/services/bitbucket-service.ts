import { BitbucketRepository, PullRequestComment, PullRequestCreateComment } from '~/repositories/bitbucket-repository';

export class BitbucketService {
  constructor(private readonly bitbucketRepository: BitbucketRepository) {}

  public async getPullRequestDiff(workspace: string, repository: string, pullRequestId: number, ignoredFiles?: string[]): Promise<string> {
    const pullRequest = await this.bitbucketRepository.getPullRequest(workspace, repository, pullRequestId);
    const diff = await this.bitbucketRepository.getSourceCodeDiff(
      workspace,
      repository,
      pullRequest.source.commit.hash,
      pullRequest.destination.commit.hash,
    );
    const parsedDiff = this.removeFilesFromDiff(diff, ignoredFiles);

    return this.annotateDiff(parsedDiff);
  }

  public async listPullRequestsComments(workspace: string, repository: string, pullRequestId: number): Promise<PullRequestComment[]> {
    return this.bitbucketRepository.listPullRequestsComments(workspace, repository, pullRequestId);
  }

  private removeFilesFromDiff(diff: string, ignoredFiles?: string[]): string {
    void ignoredFiles;
    return diff;
  }

  private annotateDiff(diff: string): string {
    return diff;
  }

  public async createPullRequestComments(
    workspace: string,
    repository: string,
    pullRequestId: number,
    comments: PullRequestCreateComment[],
  ): Promise<void> {
    return this.bitbucketRepository.createPullRequestComments(workspace, repository, pullRequestId, comments);
  }
}
