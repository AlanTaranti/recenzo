import gitDiffParser, { File } from 'gitdiff-parser';

import { BitbucketRepository, PullRequestComment, PullRequestCreateComment } from '~/repositories/bitbucket-repository';

export class BitbucketService {
  constructor(private readonly bitbucketRepository: BitbucketRepository) {}

  public async getPullRequestDiff(workspace: string, repository: string, pullRequestId: number, ignoredFiles?: string[]): Promise<File[]> {
    const pullRequest = await this.bitbucketRepository.getPullRequest(workspace, repository, pullRequestId);
    const diffText = await this.bitbucketRepository.getSourceCodeDiff(
      workspace,
      repository,
      pullRequest.source.commit.hash,
      pullRequest.destination.commit.hash,
    );
    const annotedDiff = this.annotateDiffWithLineNumbers(diffText);

    return this.removeFilesFromDiff(annotedDiff, ignoredFiles);
  }

  public async listPullRequestsComments(workspace: string, repository: string, pullRequestId: number): Promise<PullRequestComment[]> {
    return this.bitbucketRepository.listPullRequestsComments(workspace, repository, pullRequestId);
  }

  private removeFilesFromDiff(files: File[], ignoredFiles?: string[]): File[] {
    return files.filter((file) => !ignoredFiles?.includes(file.newPath) && !ignoredFiles?.includes(file.oldPath));
  }

  private annotateDiffWithLineNumbers(diffText: string): File[] {
    return gitDiffParser.parse(diffText);
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
