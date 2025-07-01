import { BitbucketService } from '~/services/bitbucket-service';
import { ReviewerAgentService } from '~/services/reviewer-agent-service';

type PrInfo = {
  workspace: string;
  repository: string;
  prNumber: number;
  ignoredFiles?: string[];
};

export class ReviewPrUseCase {
  constructor(
    private readonly reviewerAgentService: ReviewerAgentService,
    private readonly bitbucketService: BitbucketService,
  ) {}

  public async reviewPullRequest(prInfo: PrInfo, codeReviewInstruction?: string): Promise<void> {
    const [diff, currentComments] = await Promise.all([
      this.bitbucketService.getPullRequestDiff(prInfo.workspace, prInfo.repository, prInfo.prNumber, prInfo.ignoredFiles),
      this.bitbucketService.listPullRequestsComments(prInfo.workspace, prInfo.repository, prInfo.prNumber),
    ]);
    const codeReviewResult = await this.reviewerAgentService.review(diff, currentComments, codeReviewInstruction);
    await this.bitbucketService.createPullRequestComments(prInfo.workspace, prInfo.repository, prInfo.prNumber, codeReviewResult);
  }
}
