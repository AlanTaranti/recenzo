import { describe, it, expect, vi, beforeEach } from 'vitest';
import indexModule from '~/index';
import { ReviewPrUseCase } from '~/use-cases/review-pr-use-case';
import { ReviewerAgentService } from '~/services/reviewer-agent-service';
import { BitbucketService } from '~/services/bitbucket-service';
import { BitbucketRepository } from '~/repositories/bitbucket-repository';

// Mock the dependencies
vi.mock('~/use-cases/review-pr-use-case', () => {
  return {
    ReviewPrUseCase: vi.fn().mockImplementation(() => ({
      reviewPullRequest: vi.fn(),
    })),
  };
});

vi.mock('~/services/reviewer-agent-service', () => {
  return {
    ReviewerAgentService: vi.fn(),
  };
});

vi.mock('~/services/bitbucket-service', () => {
  return {
    BitbucketService: vi.fn(),
  };
});

vi.mock('~/repositories/bitbucket-repository', () => {
  return {
    BitbucketRepository: vi.fn(),
  };
});

describe('index', () => {
  describe('reviewPullRequest', () => {
    // Reset mocks before each test
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create instances of dependencies and call reviewPullRequest on ReviewPrUseCase', async () => {
      // Arrange
      const mockReviewPullRequest = vi.fn().mockResolvedValue('mock result');
      (ReviewPrUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        reviewPullRequest: mockReviewPullRequest,
      }));

      const pullRequestInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
      };

      const codeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };

      const options = { dryRun: false };

      // Act
      await indexModule.reviewPullRequest(pullRequestInfo, codeReviewInstruction, options);

      // Assert
      expect(ReviewerAgentService).toHaveBeenCalledTimes(1);
      expect(BitbucketRepository).toHaveBeenCalledTimes(1);
      expect(BitbucketService).toHaveBeenCalledTimes(1);
      expect(BitbucketService).toHaveBeenCalledWith(expect.any(BitbucketRepository));
      expect(ReviewPrUseCase).toHaveBeenCalledTimes(1);
      expect(ReviewPrUseCase).toHaveBeenCalledWith(expect.any(ReviewerAgentService), expect.any(BitbucketService));
      expect(mockReviewPullRequest).toHaveBeenCalledTimes(1);
      expect(mockReviewPullRequest).toHaveBeenCalledWith(pullRequestInfo, codeReviewInstruction, options);
    });

    it('should pass through any errors from ReviewPrUseCase', async () => {
      // Arrange
      const mockError = new Error('Test error');
      const mockReviewPullRequest = vi.fn().mockRejectedValue(mockError);
      (ReviewPrUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        reviewPullRequest: mockReviewPullRequest,
      }));

      const pullRequestInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
      };

      const codeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };

      const options = { dryRun: false };

      // Act & Assert
      await expect(indexModule.reviewPullRequest(pullRequestInfo, codeReviewInstruction, options)).rejects.toThrow(mockError);

      expect(mockReviewPullRequest).toHaveBeenCalledTimes(1);
      expect(mockReviewPullRequest).toHaveBeenCalledWith(pullRequestInfo, codeReviewInstruction, options);
    });

    it('should handle optional parameters correctly', async () => {
      // Arrange
      const mockReviewPullRequest = vi.fn().mockResolvedValue('mock result');
      (ReviewPrUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        reviewPullRequest: mockReviewPullRequest,
      }));

      const pullRequestInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
        ignoredFiles: ['package-lock.json'],
      };

      const codeReviewInstruction = {
        commentLanguage: 'fr',
        instruction: 'Test instruction in French',
      };

      const options = { dryRun: true };

      // Act
      await indexModule.reviewPullRequest(pullRequestInfo, codeReviewInstruction, options);

      // Assert
      expect(mockReviewPullRequest).toHaveBeenCalledTimes(1);
      expect(mockReviewPullRequest).toHaveBeenCalledWith(pullRequestInfo, codeReviewInstruction, options);
    });
  });
});
