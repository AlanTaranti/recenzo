import { BitBucketPrComment, BitbucketService } from '~/services/bitbucket-service';

interface IReviewerAgentService {
  review: (diff: string, currentComments?: BitBucketPrComment[], codeReviewInstruction?: string) => Promise<BitBucketPrComment[]>;
}

type PrInfo = {
  workspace: string;
  repository: string;
  prNumber: number;
  ignoredFiles?: string[];
};

export class ReviewPrUseCase {
  constructor(
    private readonly reviewerAgentService: IReviewerAgentService,
    private readonly bitbucketService: BitbucketService,
  ) {}

  public async reviewPullRequest(prInfo: PrInfo): Promise<void> {
    const diff = await this.bitbucketService.getPullRequestDiff(prInfo.workspace, prInfo.repository, prInfo.prNumber, prInfo.ignoredFiles);
    const codeReviewResult = await this.reviewerAgentService.review(diff);
    await this.bitbucketService.createPullRequestComments(prInfo.workspace, prInfo.repository, prInfo.prNumber, codeReviewResult);
  }
}
