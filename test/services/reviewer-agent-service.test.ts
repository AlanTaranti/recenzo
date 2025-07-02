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
      expect(mockParseFn).toHaveBeenCalledWith({
        model: 'o4-mini',
        input: [
          {
            role: 'system',
            content:
              'You are a code reviewer.\n' +
              'Your role is to help developers improve their code.\n' +
              'You will receive an annotated diff with the code changes to be reviewed, and you should respond with feedback on the code.\n' +
              'Comment only on what needs improvement.\n' +
              'Comment only at included lines, not deleted ones.\n' +
              'Make sure to do not include any comment similar to what has already been made.\n' +
              'The comment text must be formated in markdown\n' +
              'Always use an empathetic and educational writing style.\n' +
              `Respond to the user in en language.\n\n\n` +
              'Bellow is the code project guidelines:\n' +
              'Test instruction',
          },
          {
            role: 'user',
            content:
              'Here is the current comments on the pull request:\n\n' +
              JSON.stringify(currentComments, null, 2) +
              '\n\n' +
              'Now, here is the diff:\n\n' +
              JSON.stringify(diffs, null, 2),
          },
        ],
        text: expect.objectContaining({
          format: expect.objectContaining({
            name: 'comments',
            schema: expect.any(Object) as unknown,
            strict: true,
            type: 'json_schema',
          }) as unknown as Record<string, unknown>,
        }) as Record<string, unknown>,
      });

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
