import { BitbucketService } from '~/services/bitbucket-service';
import { CodeReviewInstruction, ReviewerAgentService } from '~/services/reviewer-agent-service';
import { PullRequestCreateComment } from '~/repositories/bitbucket-repository';

export type PullRequestInfo = {
  workspace: string;
  repository: string;
  prNumber: number;
  ignoredFiles?: string[];
};

export type ReviewPrOptions = {
  dryRun?: boolean;
};

export class ReviewPrUseCase {
  constructor(
    private readonly reviewerAgentService: ReviewerAgentService,
    private readonly bitbucketService: BitbucketService,
  ) {}

  public async reviewPullRequest(
    pullRequestInfo: PullRequestInfo,
    codeReviewInstruction: CodeReviewInstruction,
    options: ReviewPrOptions,
  ): Promise<void> {
    const [diff, currentComments] = await Promise.all([
      this.bitbucketService.getPullRequestDiff(
        pullRequestInfo.workspace,
        pullRequestInfo.repository,
        pullRequestInfo.prNumber,
        pullRequestInfo.ignoredFiles,
      ),
      this.bitbucketService.listPullRequestsComments(pullRequestInfo.workspace, pullRequestInfo.repository, pullRequestInfo.prNumber),
    ]);

    const codeReviewResult = await this.reviewerAgentService.review(codeReviewInstruction, diff, currentComments);
    const comments = this.mapAgentCommentsToPullRequestComments(codeReviewResult);

    if (options.dryRun) {
      console.log('Dry run mode. No comments will be created.');
      console.log('Comments to be created:');
      comments.forEach((comment) => {
        console.log(JSON.stringify(comment, null, 2) + '\n');
      });
      return;
    }

    await this.bitbucketService.createPullRequestComments(
      pullRequestInfo.workspace,
      pullRequestInfo.repository,
      pullRequestInfo.prNumber,
      comments,
    );
  }

  private mapAgentCommentsToPullRequestComments(
    agentComments: Awaited<ReturnType<ReviewerAgentService['review']>>,
  ): PullRequestCreateComment[] {
    if (!agentComments) {
      return [];
    }

    return agentComments.comments.map((comment) => {
      return {
        content: {
          raw: comment.comment,
        },
        inline: {
          to: comment.commentLine,
          path: comment.filepath,
        },
      };
    });
  }
}
