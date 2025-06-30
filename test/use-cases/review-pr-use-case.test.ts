import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewPrUseCase } from '~/use-cases/review-pr-use-case';
import { BitbucketService } from '~/services/bitbucket-service';

describe('ReviewPrUseCase', () => {
  // Mock dependencies
  const mockReviewerAgentService = {
    review: vi.fn(),
  } as {
    review: ReturnType<typeof vi.fn>;
  };

  const mockBitbucketService = {
    getPullRequestDiff: vi.fn(),
    createPullRequestComments: vi.fn(),
  } as unknown as BitbucketService & {
    getPullRequestDiff: ReturnType<typeof vi.fn>;
    createPullRequestComments: ReturnType<typeof vi.fn>;
  };

  let reviewPrUseCase: ReviewPrUseCase;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Create a new instance with mocked dependencies
    reviewPrUseCase = new ReviewPrUseCase(mockReviewerAgentService, mockBitbucketService);
  });

  describe('reviewPr', () => {
    it('should get PR diff, review it, and create comments', async () => {
      // Setup
      const prInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
      };

      const mockDiff = 'test diff content';
      const mockComments = [{ comment: 'Test comment', filepath: 'test.ts', line: 10 }];

      mockBitbucketService.getPullRequestDiff.mockResolvedValue(mockDiff);
      mockReviewerAgentService.review.mockResolvedValue(mockComments);
      mockBitbucketService.createPullRequestComments.mockResolvedValue(undefined);

      // Execute
      await reviewPrUseCase.reviewPullRequest(prInfo);

      // Verify
      expect(mockBitbucketService.getPullRequestDiff).toHaveBeenCalledWith('test-workspace', 'test-repo', 123, undefined);

      expect(mockReviewerAgentService.review).toHaveBeenCalledWith(mockDiff);

      expect(mockBitbucketService.createPullRequestComments).toHaveBeenCalledWith('test-workspace', 'test-repo', 123, mockComments);
    });

    it('should pass ignoredFiles to getPullRequestDiff when provided', async () => {
      // Setup
      const prInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
        ignoredFiles: ['package-lock.json', 'yarn.lock'],
      };

      const mockDiff = 'test diff content';
      const mockComments = [{ comment: 'Test comment', filepath: 'test.ts', line: 10 }];

      mockBitbucketService.getPullRequestDiff.mockResolvedValue(mockDiff);
      mockReviewerAgentService.review.mockResolvedValue(mockComments);
      mockBitbucketService.createPullRequestComments.mockResolvedValue(undefined);

      // Execute
      await reviewPrUseCase.reviewPullRequest(prInfo);

      // Verify
      expect(mockBitbucketService.getPullRequestDiff).toHaveBeenCalledWith('test-workspace', 'test-repo', 123, [
        'package-lock.json',
        'yarn.lock',
      ]);
    });

    it('should handle errors from getPullRequestDiff', async () => {
      // Setup
      const prInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
      };

      const error = new Error('Failed to get PR diff');
      mockBitbucketService.getPullRequestDiff.mockRejectedValue(error);

      // Execute & Verify
      await expect(reviewPrUseCase.reviewPullRequest(prInfo)).rejects.toThrow('Failed to get PR diff');
      expect(mockReviewerAgentService.review).not.toHaveBeenCalled();
      expect(mockBitbucketService.createPullRequestComments).not.toHaveBeenCalled();
    });

    it('should handle errors from review', async () => {
      // Setup
      const prInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
      };

      const mockDiff = 'test diff content';
      const error = new Error('Failed to review PR');

      mockBitbucketService.getPullRequestDiff.mockResolvedValue(mockDiff);
      mockReviewerAgentService.review.mockRejectedValue(error);

      // Execute & Verify
      await expect(reviewPrUseCase.reviewPullRequest(prInfo)).rejects.toThrow('Failed to review PR');
      expect(mockBitbucketService.getPullRequestDiff).toHaveBeenCalled();
      expect(mockBitbucketService.createPullRequestComments).not.toHaveBeenCalled();
    });

    it('should handle errors from createPullRequestComments', async () => {
      // Setup
      const prInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
      };

      const mockDiff = 'test diff content';
      const mockComments = [{ comment: 'Test comment', filepath: 'test.ts', line: 10 }];
      const error = new Error('Failed to create PR comment');

      mockBitbucketService.getPullRequestDiff.mockResolvedValue(mockDiff);
      mockReviewerAgentService.review.mockResolvedValue(mockComments);
      mockBitbucketService.createPullRequestComments.mockRejectedValue(error);

      // Execute & Verify
      await expect(reviewPrUseCase.reviewPullRequest(prInfo)).rejects.toThrow('Failed to create PR comment');
      expect(mockBitbucketService.getPullRequestDiff).toHaveBeenCalled();
      expect(mockReviewerAgentService.review).toHaveBeenCalled();
    });
  });
});
