type BitBucketPrComment = {
  comment: string;
  filepath: string;
  line: number;
};

interface IReviewerAgentService {
  review: (diff: string, currentComments?: BitBucketPrComment[], codeReviewInstruction?: string) => Promise<BitBucketPrComment[]>;
}

interface IBitbucketService {
  getPrDiff: (workspace: string, repository: string, prNumber: number, ignoredFiles?: string[]) => Promise<string>;
  createPrComment: (workspace: string, repository: string, prNumber: number, comments: BitBucketPrComment[]) => Promise<void>;
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
    private readonly bitbucketService: IBitbucketService,
  ) {}

  public async reviewPr(prInfo: PrInfo): Promise<void> {
    const diff = await this.bitbucketService.getPrDiff(prInfo.workspace, prInfo.repository, prInfo.prNumber, prInfo.ignoredFiles);
    const codeReviewResult = await this.reviewerAgentService.review(diff);
    await this.bitbucketService.createPrComment(prInfo.workspace, prInfo.repository, prInfo.prNumber, codeReviewResult);
  }
}
