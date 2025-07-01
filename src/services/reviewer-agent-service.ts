import { File } from 'gitdiff-parser';
import { PullRequestComment, PullRequestCreateComment } from '~/repositories/bitbucket-repository';

export class ReviewerAgentService {
  review(diff: File[], currentComments?: PullRequestComment[], codeReviewInstruction?: string): Promise<PullRequestCreateComment[]> {
    void diff;
    void currentComments;
    void codeReviewInstruction;
    return Promise.resolve([]);
  }
}
