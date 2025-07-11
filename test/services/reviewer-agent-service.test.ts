import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewerAgentService, CodeReviewInstruction } from '~/services/reviewer-agent-service';
import { File } from 'gitdiff-parser';
import { PullRequestComment } from '~/repositories/bitbucket-repository';

// Mock OpenAI
const mockParseFn = vi.fn();
vi.mock('openai', () => {
  const mockOpenAI = vi.fn(() => ({
    responses: {
      parse: mockParseFn,
    },
  }));

  return {
    default: mockOpenAI,
  };
});

describe('ReviewerAgentService', () => {
  let reviewerAgentService: ReviewerAgentService;
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Create a new instance
    reviewerAgentService = new ReviewerAgentService();
  });

  describe('review', () => {
    it('should call OpenAI with correct parameters and return the parsed response', async () => {
      // Setup
      const codeReviewInstruction: CodeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };

      const diffs = [
        {
          oldPath: 'file1.ts',
          newPath: 'file1.ts',
          hunks: [
            {
              content: 'Test content',
              oldStart: 1,
              oldLines: 5,
              newStart: 1,
              newLines: 5,
              changes: [],
            },
          ],
        },
      ] as unknown as File[];

      const currentComments: PullRequestComment[] = [
        {
          id: 1,
          content: {
            raw: 'Existing comment',
          },
          inline: {
            to: 5,
            path: 'file1.ts',
          },
        },
      ];

      const mockResponse = {
        output_parsed: {
          comments: [
            {
              commentLine: 10,
              filepath: 'file1.ts',
              comment: 'Test comment',
            },
          ],
        },
      };

      mockParseFn.mockResolvedValue(mockResponse);

      // Execute
      const result = await reviewerAgentService.review(codeReviewInstruction, diffs, currentComments);

      // Verify
      expect(mockParseFn).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'o4-mini',
          input: [
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Respond to the user in en language') as string,
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining(JSON.stringify(diffs, null, 2)) as string,
            }),
          ],
          text: expect.objectContaining({
            format: expect.any(Object) as unknown,
          }) as Record<string, unknown>,
        }) as Record<string, unknown>,
      );

      expect(result).toEqual(mockResponse.output_parsed);
    });

    it('should include the correct language in the system prompt', async () => {
      // Setup
      const codeReviewInstruction: CodeReviewInstruction = {
        commentLanguage: 'pt-BR',
        instruction: 'Test instruction',
      };

      const diffs: File[] = [];
      const currentComments: PullRequestComment[] = [];

      const mockResponse = {
        output_parsed: {
          comments: [],
        },
      };

      mockParseFn.mockResolvedValue(mockResponse);

      // Execute
      await reviewerAgentService.review(codeReviewInstruction, diffs, currentComments);

      // Verify
      expect(mockParseFn).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining(`Respond to the user in pt-BR language`) as string,
            }) as Record<string, unknown>,
          ]) as unknown[],
        }) as Record<string, unknown>,
      );
    });

    it('should include the instruction in the system prompt', async () => {
      // Setup
      const codeReviewInstruction: CodeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Custom project guidelines',
      };

      const diffs: File[] = [];
      const currentComments: PullRequestComment[] = [];

      const mockResponse = {
        output_parsed: {
          comments: [],
        },
      };

      mockParseFn.mockResolvedValue(mockResponse);

      // Execute
      await reviewerAgentService.review(codeReviewInstruction, diffs, currentComments);

      // Verify
      expect(mockParseFn).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Custom project guidelines') as string,
            }) as Record<string, unknown>,
          ]) as unknown[],
        }) as Record<string, unknown>,
      );
    });

    it('should handle errors from OpenAI', async () => {
      // Setup
      const codeReviewInstruction: CodeReviewInstruction = {
        commentLanguage: 'en',
        instruction: 'Test instruction',
      };

      const diffs: File[] = [];
      const currentComments: PullRequestComment[] = [];

      const error = new Error('OpenAI API error');
      mockParseFn.mockRejectedValue(error);

      // Execute & Verify
      await expect(reviewerAgentService.review(codeReviewInstruction, diffs, currentComments)).rejects.toThrow('OpenAI API error');
    });
  });
});
