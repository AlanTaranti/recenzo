import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewPrUseCase } from '~/use-cases/review-pr-use-case';

describe('ReviewPrUseCase', () => {
  // Mock dependencies
  const mockReviewerAgentService = {
    review: vi.fn(),
  };

  const mockBitbucketService = {
    getPrDiff: vi.fn(),
    createPrComment: vi.fn(),
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

      mockBitbucketService.getPrDiff.mockResolvedValue(mockDiff);
      mockReviewerAgentService.review.mockResolvedValue(mockComments);
      mockBitbucketService.createPrComment.mockResolvedValue(undefined);

      // Execute
      await reviewPrUseCase.reviewPr(prInfo);

      // Verify
      expect(mockBitbucketService.getPrDiff).toHaveBeenCalledWith('test-workspace', 'test-repo', 123, undefined);

      expect(mockReviewerAgentService.review).toHaveBeenCalledWith(mockDiff);

      expect(mockBitbucketService.createPrComment).toHaveBeenCalledWith('test-workspace', 'test-repo', 123, mockComments);
    });

    it('should pass ignoredFiles to getPrDiff when provided', async () => {
      // Setup
      const prInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
        ignoredFiles: ['package-lock.json', 'yarn.lock'],
      };

      const mockDiff = 'test diff content';
      const mockComments = [{ comment: 'Test comment', filepath: 'test.ts', line: 10 }];

      mockBitbucketService.getPrDiff.mockResolvedValue(mockDiff);
      mockReviewerAgentService.review.mockResolvedValue(mockComments);
      mockBitbucketService.createPrComment.mockResolvedValue(undefined);

      // Execute
      await reviewPrUseCase.reviewPr(prInfo);

      // Verify
      expect(mockBitbucketService.getPrDiff).toHaveBeenCalledWith('test-workspace', 'test-repo', 123, ['package-lock.json', 'yarn.lock']);
    });

    it('should handle errors from getPrDiff', async () => {
      // Setup
      const prInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
      };

      const error = new Error('Failed to get PR diff');
      mockBitbucketService.getPrDiff.mockRejectedValue(error);

      // Execute & Verify
      await expect(reviewPrUseCase.reviewPr(prInfo)).rejects.toThrow('Failed to get PR diff');
      expect(mockReviewerAgentService.review).not.toHaveBeenCalled();
      expect(mockBitbucketService.createPrComment).not.toHaveBeenCalled();
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

      mockBitbucketService.getPrDiff.mockResolvedValue(mockDiff);
      mockReviewerAgentService.review.mockRejectedValue(error);

      // Execute & Verify
      await expect(reviewPrUseCase.reviewPr(prInfo)).rejects.toThrow('Failed to review PR');
      expect(mockBitbucketService.getPrDiff).toHaveBeenCalled();
      expect(mockBitbucketService.createPrComment).not.toHaveBeenCalled();
    });

    it('should handle errors from createPrComment', async () => {
      // Setup
      const prInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
      };

      const mockDiff = 'test diff content';
      const mockComments = [{ comment: 'Test comment', filepath: 'test.ts', line: 10 }];
      const error = new Error('Failed to create PR comment');

      mockBitbucketService.getPrDiff.mockResolvedValue(mockDiff);
      mockReviewerAgentService.review.mockResolvedValue(mockComments);
      mockBitbucketService.createPrComment.mockRejectedValue(error);

      // Execute & Verify
      await expect(reviewPrUseCase.reviewPr(prInfo)).rejects.toThrow('Failed to create PR comment');
      expect(mockBitbucketService.getPrDiff).toHaveBeenCalled();
      expect(mockReviewerAgentService.review).toHaveBeenCalled();
    });
  });
});
