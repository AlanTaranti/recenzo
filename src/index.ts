import { PullRequestInfo, ReviewPrOptions, ReviewPrUseCase } from '~/use-cases/review-pr-use-case';
import { CodeReviewInstruction, ReviewerAgentService } from '~/services/reviewer-agent-service';
import { BitbucketService } from '~/services/bitbucket-service';
import { BitbucketRepository } from '~/repositories/bitbucket-repository';

export default {
  reviewPullRequest: (pullRequestInfo: PullRequestInfo, codeReviewInstruction: CodeReviewInstruction, options?: ReviewPrOptions) => {
    const useCase = new ReviewPrUseCase(new ReviewerAgentService(), new BitbucketService(new BitbucketRepository()));
    return useCase.reviewPullRequest(pullRequestInfo, codeReviewInstruction, options);
  },
};
