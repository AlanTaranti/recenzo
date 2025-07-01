import { BitbucketService } from '~/services/bitbucket-service';
import { PullRequestComment, PullRequestCreateComment } from '~/repositories/bitbucket-repository';

interface IReviewerAgentService {
  review: (diff: string, currentComments?: PullRequestComment[], codeReviewInstruction?: string) => Promise<PullRequestCreateComment[]>;
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

  public async reviewPullRequest(prInfo: PrInfo, codeReviewInstruction?: string): Promise<void> {
    const [diff, currentComments] = await Promise.all([
      this.bitbucketService.getPullRequestDiff(prInfo.workspace, prInfo.repository, prInfo.prNumber, prInfo.ignoredFiles),
      this.bitbucketService.listPullRequestsComments(prInfo.workspace, prInfo.repository, prInfo.prNumber),
    ]);
    const codeReviewResult = await this.reviewerAgentService.review(diff, currentComments, codeReviewInstruction);
    await this.bitbucketService.createPullRequestComments(prInfo.workspace, prInfo.repository, prInfo.prNumber, codeReviewResult);
  }
}
