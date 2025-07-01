import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BitbucketService } from '~/services/bitbucket-service';
import { BitbucketRepository, PullRequestComment, PullRequestCreateComment } from '~/repositories/bitbucket-repository';
import { File } from 'gitdiff-parser';
import gitDiffParser from 'gitdiff-parser';

// Mock gitDiffParser
vi.mock('gitdiff-parser', () => ({
  default: {
    parse: vi.fn(),
  },
}));

describe('BitbucketService', () => {
  // Mock dependencies
  const mockBitbucketRepository = {
    getPullRequest: vi.fn(),
    getSourceCodeDiff: vi.fn(),
    listPullRequestsComments: vi.fn(),
    createPullRequestComments: vi.fn(),
  } as unknown as BitbucketRepository & {
    getPullRequest: ReturnType<typeof vi.fn>;
    getSourceCodeDiff: ReturnType<typeof vi.fn>;
    listPullRequestsComments: ReturnType<typeof vi.fn>;
    createPullRequestComments: ReturnType<typeof vi.fn>;
  };

  let bitbucketService: BitbucketService;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Create a new instance with mocked dependencies
    bitbucketService = new BitbucketService(mockBitbucketRepository);
  });

  describe('getPullRequestDiff', () => {
    it('should get pull request, source code diff, and return annotated diff', async () => {
      // Setup
      const workspace = 'test-workspace';
      const repository = 'test-repo';
      const pullRequestId = 123;

      const mockPullRequest = {
        id: pullRequestId,
        source: {
          commit: {
            hash: 'source-hash',
          },
        },
        destination: {
          commit: {
            hash: 'dest-hash',
          },
        },
      };

      const mockDiffText = 'mock diff content';
      const mockAnnotatedDiff = [{ oldPath: 'file1.ts', newPath: 'file1.ts' }] as File[];

      // Mock the repository methods
      mockBitbucketRepository.getPullRequest.mockResolvedValue(mockPullRequest);
      mockBitbucketRepository.getSourceCodeDiff.mockResolvedValue(mockDiffText);

      // Set the return value for gitDiffParser.parse
      (gitDiffParser.parse as ReturnType<typeof vi.fn>).mockReturnValue(mockAnnotatedDiff);

      // Execute
      const result = await bitbucketService.getPullRequestDiff(workspace, repository, pullRequestId);

      // Verify
      expect(mockBitbucketRepository.getPullRequest).toHaveBeenCalledWith(workspace, repository, pullRequestId);
      expect(mockBitbucketRepository.getSourceCodeDiff).toHaveBeenCalledWith(workspace, repository, 'source-hash', 'dest-hash');
      expect(result).toEqual(mockAnnotatedDiff);
    });

    it('should filter out ignored files from the diff', async () => {
      // Setup
      const workspace = 'test-workspace';
      const repository = 'test-repo';
      const pullRequestId = 123;
      const ignoredFiles = ['ignored.ts'];

      const mockPullRequest = {
        id: pullRequestId,
        source: {
          commit: {
            hash: 'source-hash',
          },
        },
        destination: {
          commit: {
            hash: 'dest-hash',
          },
        },
      };

      const mockDiffText = 'mock diff content';
      const mockAnnotatedDiff = [
        { oldPath: 'file1.ts', newPath: 'file1.ts' },
        { oldPath: 'ignored.ts', newPath: 'ignored.ts' },
      ] as File[];

      const expectedFilteredDiff = [{ oldPath: 'file1.ts', newPath: 'file1.ts' }] as File[];

      // Mock the repository methods
      mockBitbucketRepository.getPullRequest.mockResolvedValue(mockPullRequest);
      mockBitbucketRepository.getSourceCodeDiff.mockResolvedValue(mockDiffText);

      // Set the return value for gitDiffParser.parse
      (gitDiffParser.parse as ReturnType<typeof vi.fn>).mockReturnValue(mockAnnotatedDiff);

      // Execute
      const result = await bitbucketService.getPullRequestDiff(workspace, repository, pullRequestId, ignoredFiles);

      // Verify
      expect(mockBitbucketRepository.getPullRequest).toHaveBeenCalledWith(workspace, repository, pullRequestId);
      expect(mockBitbucketRepository.getSourceCodeDiff).toHaveBeenCalledWith(workspace, repository, 'source-hash', 'dest-hash');
      expect(result).toEqual(expectedFilteredDiff);
    });

    it('should handle errors from getPullRequest', async () => {
      // Setup
      const workspace = 'test-workspace';
      const repository = 'test-repo';
      const pullRequestId = 123;

      const error = new Error('Failed to get pull request');
      mockBitbucketRepository.getPullRequest.mockRejectedValue(error);

      // Execute & Verify
      await expect(bitbucketService.getPullRequestDiff(workspace, repository, pullRequestId)).rejects.toThrow('Failed to get pull request');
      expect(mockBitbucketRepository.getPullRequest).toHaveBeenCalledWith(workspace, repository, pullRequestId);
      expect(mockBitbucketRepository.getSourceCodeDiff).not.toHaveBeenCalled();
    });

    it('should handle errors from getSourceCodeDiff', async () => {
      // Setup
      const workspace = 'test-workspace';
      const repository = 'test-repo';
      const pullRequestId = 123;

      const mockPullRequest = {
        id: pullRequestId,
        source: {
          commit: {
            hash: 'source-hash',
          },
        },
        destination: {
          commit: {
            hash: 'dest-hash',
          },
        },
      };

      const error = new Error('Failed to get source code diff');
      mockBitbucketRepository.getPullRequest.mockResolvedValue(mockPullRequest);
      mockBitbucketRepository.getSourceCodeDiff.mockRejectedValue(error);

      // Execute & Verify
      await expect(bitbucketService.getPullRequestDiff(workspace, repository, pullRequestId)).rejects.toThrow(
        'Failed to get source code diff',
      );
      expect(mockBitbucketRepository.getPullRequest).toHaveBeenCalledWith(workspace, repository, pullRequestId);
      expect(mockBitbucketRepository.getSourceCodeDiff).toHaveBeenCalledWith(workspace, repository, 'source-hash', 'dest-hash');
    });
  });

  describe('listPullRequestsComments', () => {
    it('should call repository method with correct parameters', async () => {
      // Setup
      const workspace = 'test-workspace';
      const repository = 'test-repo';
      const pullRequestId = 123;

      const mockComments: PullRequestComment[] = [
        {
          id: 1,
          content: {
            raw: 'Comment 1',
          },
          inline: {
            to: 10,
            path: 'file1.ts',
          },
        },
      ];

      mockBitbucketRepository.listPullRequestsComments.mockResolvedValue(mockComments);

      // Execute
      const result = await bitbucketService.listPullRequestsComments(workspace, repository, pullRequestId);

      // Verify
      expect(mockBitbucketRepository.listPullRequestsComments).toHaveBeenCalledWith(workspace, repository, pullRequestId);
      expect(result).toEqual(mockComments);
    });

    it('should handle errors from listPullRequestsComments', async () => {
      // Setup
      const workspace = 'test-workspace';
      const repository = 'test-repo';
      const pullRequestId = 123;

      const error = new Error('Failed to list pull request comments');
      mockBitbucketRepository.listPullRequestsComments.mockRejectedValue(error);

      // Execute & Verify
      await expect(bitbucketService.listPullRequestsComments(workspace, repository, pullRequestId)).rejects.toThrow(
        'Failed to list pull request comments',
      );
      expect(mockBitbucketRepository.listPullRequestsComments).toHaveBeenCalledWith(workspace, repository, pullRequestId);
    });
  });

  describe('createPullRequestComments', () => {
    it('should call repository method with correct parameters', async () => {
      // Setup
      const workspace = 'test-workspace';
      const repository = 'test-repo';
      const pullRequestId = 123;

      const mockComments: PullRequestCreateComment[] = [
        {
          content: {
            raw: 'Comment 1',
          },
          inline: {
            to: 10,
            path: 'file1.ts',
          },
        },
      ];

      mockBitbucketRepository.createPullRequestComments.mockResolvedValue(undefined);

      // Execute
      await bitbucketService.createPullRequestComments(workspace, repository, pullRequestId, mockComments);

      // Verify
      expect(mockBitbucketRepository.createPullRequestComments).toHaveBeenCalledWith(workspace, repository, pullRequestId, mockComments);
    });

    it('should handle errors from createPullRequestComments', async () => {
      // Setup
      const workspace = 'test-workspace';
      const repository = 'test-repo';
      const pullRequestId = 123;

      const mockComments: PullRequestCreateComment[] = [
        {
          content: {
            raw: 'Comment 1',
          },
          inline: {
            to: 10,
            path: 'file1.ts',
          },
        },
      ];

      const error = new Error('Failed to create pull request comments');
      mockBitbucketRepository.createPullRequestComments.mockRejectedValue(error);

      // Execute & Verify
      await expect(bitbucketService.createPullRequestComments(workspace, repository, pullRequestId, mockComments)).rejects.toThrow(
        'Failed to create pull request comments',
      );
      expect(mockBitbucketRepository.createPullRequestComments).toHaveBeenCalledWith(workspace, repository, pullRequestId, mockComments);
    });
  });
});
