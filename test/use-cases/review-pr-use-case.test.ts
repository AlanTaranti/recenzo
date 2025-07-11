import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewPrUseCase } from '~/use-cases/review-pr-use-case';
import { BitbucketService } from '~/services/bitbucket-service';
import { ReviewerAgentService } from '~/services/reviewer-agent-service';
import { PullRequestComment } from '~/repositories/bitbucket-repository';

describe('ReviewPrUseCase', () => {
  // Mock dependencies
  const mockReviewerAgentService = {
    review: vi.fn(),
  } as unknown as ReviewerAgentService & {
    review: ReturnType<typeof vi.fn>;
  };

  const mockBitbucketService = {
    getPullRequestDiff: vi.fn(),
    createPullRequestComments: vi.fn(),
    listPullRequestsComments: vi.fn(),
  } as unknown as BitbucketService & {
    getPullRequestDiff: ReturnType<typeof vi.fn>;
    createPullRequestComments: ReturnType<typeof vi.fn>;
    listPullRequestsComments: ReturnType<typeof vi.fn>;
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
      const mockComments = {
        comments: [{ comment: 'Test comment', filepath: 'test.ts', commentLine: 10 }],
      };

      const mockCurrentComments: PullRequestComment[] = [];
      mockBitbucketService.getPullRequestDiff.mockResolvedValue(mockDiff);
      mockBitbucketService.listPullRequestsComments.mockResolvedValue(mockCurrentComments);
      mockReviewerAgentService.review.mockResolvedValue(mockComments);
      mockBitbucketService.createPullRequestComments.mockResolvedValue(undefined);

      // Setup code review instruction and options
      const codeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };
      const options = { dryRun: false };

      // Execute
      await reviewPrUseCase.reviewPullRequest(prInfo, codeReviewInstruction, options);

      // Verify
      expect(mockBitbucketService.getPullRequestDiff).toHaveBeenCalledWith('test-workspace', 'test-repo', 123, undefined);
      expect(mockBitbucketService.listPullRequestsComments).toHaveBeenCalledWith('test-workspace', 'test-repo', 123);
      expect(mockReviewerAgentService.review).toHaveBeenCalledWith(codeReviewInstruction, mockDiff, mockCurrentComments);
      // The expected transformed comments
      const expectedTransformedComments = [
        {
          content: {
            raw: 'Test comment',
          },
          inline: {
            to: 10,
            path: 'test.ts',
          },
        },
      ];
      expect(mockBitbucketService.createPullRequestComments).toHaveBeenCalledWith(
        'test-workspace',
        'test-repo',
        123,
        expectedTransformedComments,
      );
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
      const mockComments = {
        comments: [{ comment: 'Test comment', filepath: 'test.ts', commentLine: 10 }],
      };
      const mockCurrentComments: PullRequestComment[] = [];

      mockBitbucketService.getPullRequestDiff.mockResolvedValue(mockDiff);
      mockBitbucketService.listPullRequestsComments.mockResolvedValue(mockCurrentComments);
      mockReviewerAgentService.review.mockResolvedValue(mockComments);
      mockBitbucketService.createPullRequestComments.mockResolvedValue(undefined);

      // Setup code review instruction and options
      const codeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };
      const options = { dryRun: false };

      // Execute
      await reviewPrUseCase.reviewPullRequest(prInfo, codeReviewInstruction, options);

      // Verify
      expect(mockBitbucketService.getPullRequestDiff).toHaveBeenCalledWith('test-workspace', 'test-repo', 123, [
        'package-lock.json',
        'yarn.lock',
      ]);
      expect(mockBitbucketService.listPullRequestsComments).toHaveBeenCalledWith('test-workspace', 'test-repo', 123);
      expect(mockReviewerAgentService.review).toHaveBeenCalledWith(codeReviewInstruction, mockDiff, mockCurrentComments);

      // The expected transformed comments
      const expectedTransformedComments = [
        {
          content: {
            raw: 'Test comment',
          },
          inline: {
            to: 10,
            path: 'test.ts',
          },
        },
      ];
      expect(mockBitbucketService.createPullRequestComments).toHaveBeenCalledWith(
        'test-workspace',
        'test-repo',
        123,
        expectedTransformedComments,
      );
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
      mockBitbucketService.listPullRequestsComments.mockResolvedValue([]);

      // Setup code review instruction and options
      const codeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };
      const options = { dryRun: false };

      // Execute & Verify
      await expect(reviewPrUseCase.reviewPullRequest(prInfo, codeReviewInstruction, options)).rejects.toThrow('Failed to get PR diff');
      expect(mockBitbucketService.listPullRequestsComments).toHaveBeenCalledWith('test-workspace', 'test-repo', 123);
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
      const mockCurrentComments: PullRequestComment[] = [];
      const error = new Error('Failed to review PR');

      mockBitbucketService.getPullRequestDiff.mockResolvedValue(mockDiff);
      mockBitbucketService.listPullRequestsComments.mockResolvedValue(mockCurrentComments);
      mockReviewerAgentService.review.mockRejectedValue(error);

      // Setup code review instruction and options
      const codeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };
      const options = { dryRun: false };

      // Execute & Verify
      await expect(reviewPrUseCase.reviewPullRequest(prInfo, codeReviewInstruction, options)).rejects.toThrow('Failed to review PR');
      expect(mockBitbucketService.getPullRequestDiff).toHaveBeenCalled();
      expect(mockBitbucketService.listPullRequestsComments).toHaveBeenCalled();
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
      const mockCurrentComments: PullRequestComment[] = [];
      const mockComments = {
        comments: [{ comment: 'Test comment', filepath: 'test.ts', commentLine: 10 }],
      };
      const error = new Error('Failed to create PR comment');

      mockBitbucketService.getPullRequestDiff.mockResolvedValue(mockDiff);
      mockBitbucketService.listPullRequestsComments.mockResolvedValue(mockCurrentComments);
      mockReviewerAgentService.review.mockResolvedValue(mockComments);
      mockBitbucketService.createPullRequestComments.mockRejectedValue(error);

      // Setup code review instruction and options
      const codeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };
      const options = { dryRun: false };

      // Execute & Verify
      await expect(reviewPrUseCase.reviewPullRequest(prInfo, codeReviewInstruction, options)).rejects.toThrow(
        'Failed to create PR comment',
      );
      expect(mockBitbucketService.getPullRequestDiff).toHaveBeenCalled();
      expect(mockBitbucketService.listPullRequestsComments).toHaveBeenCalled();
      expect(mockReviewerAgentService.review).toHaveBeenCalledWith(codeReviewInstruction, mockDiff, mockCurrentComments);
    });

    it('should not create comments when dryRun is true', async () => {
      // Setup
      const prInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
      };

      const mockDiff = 'test diff content';
      const mockCurrentComments: PullRequestComment[] = [];
      const mockComments = {
        comments: [{ comment: 'Test comment', filepath: 'test.ts', commentLine: 10 }],
      };

      mockBitbucketService.getPullRequestDiff.mockResolvedValue(mockDiff);
      mockBitbucketService.listPullRequestsComments.mockResolvedValue(mockCurrentComments);
      mockReviewerAgentService.review.mockResolvedValue(mockComments);

      // Setup code review instruction and options
      const codeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };
      const options = { dryRun: true };

      // Spy on console.log
      const consoleLogSpy = vi.spyOn(console, 'log');

      // Execute
      await reviewPrUseCase.reviewPullRequest(prInfo, codeReviewInstruction, options);

      // Verify
      expect(mockBitbucketService.getPullRequestDiff).toHaveBeenCalled();
      expect(mockBitbucketService.listPullRequestsComments).toHaveBeenCalled();
      expect(mockReviewerAgentService.review).toHaveBeenCalledWith(codeReviewInstruction, mockDiff, mockCurrentComments);
      expect(mockBitbucketService.createPullRequestComments).not.toHaveBeenCalled();

      // Verify console.log was called with the expected messages
      expect(consoleLogSpy).toHaveBeenCalledWith('Dry run mode. No comments will be created.');
      expect(consoleLogSpy).toHaveBeenCalledWith('Comments to be created:');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Test comment'));

      // Restore console.log
      consoleLogSpy.mockRestore();
    });

    it('should handle falsy agentComments', async () => {
      // Setup
      const prInfo = {
        workspace: 'test-workspace',
        repository: 'test-repo',
        prNumber: 123,
      };

      const mockDiff = 'test diff content';
      const mockCurrentComments: PullRequestComment[] = [];

      mockBitbucketService.getPullRequestDiff.mockResolvedValue(mockDiff);
      mockBitbucketService.listPullRequestsComments.mockResolvedValue(mockCurrentComments);
      // Return null to test the falsy agentComments case
      mockReviewerAgentService.review.mockResolvedValue(null);

      // Setup code review instruction and options
      const codeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };
      const options = { dryRun: false };

      // Execute
      await reviewPrUseCase.reviewPullRequest(prInfo, codeReviewInstruction, options);

      // Verify
      expect(mockBitbucketService.getPullRequestDiff).toHaveBeenCalled();
      expect(mockBitbucketService.listPullRequestsComments).toHaveBeenCalled();
      expect(mockReviewerAgentService.review).toHaveBeenCalledWith(codeReviewInstruction, mockDiff, mockCurrentComments);
      // Should call createPullRequestComments with an empty array
      expect(mockBitbucketService.createPullRequestComments).toHaveBeenCalledWith('test-workspace', 'test-repo', 123, []);
    });
  });
});
