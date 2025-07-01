import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BitbucketRepository } from '~/repositories/bitbucket-repository';

describe('BitbucketRepository', () => {
  // Store original environment variables to restore after tests
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    vi.resetModules();
    process.env = { ...originalEnv };

    // Mock global fetch
    global.fetch = vi.fn() as unknown as typeof global.fetch;
  });

  afterEach(() => {
    // Restore environment variables after each test
    process.env = originalEnv;

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values when no options provided', () => {
      const repository = new BitbucketRepository();
      expect(repository).toBeInstanceOf(BitbucketRepository);
    });

    it('should initialize with provided options', () => {
      const options = { bitbucket_access_token: 'test-token' };
      const repository = new BitbucketRepository(options);
      expect(repository).toBeInstanceOf(BitbucketRepository);
    });
  });

  describe('bitbucket_access_token', () => {
    it('should use token from options when provided', () => {
      const options = { bitbucket_access_token: 'test-token' };
      const repository = new BitbucketRepository(options);

      // We need to access the private property for testing
      // @ts-expect-error - Accessing private property for testing
      expect(repository.bitbucket_access_token).toBe('test-token');
    });

    it('should use token from environment when not provided in options', () => {
      process.env['BITBUCKET_ACCESS_TOKEN'] = 'env-token';
      const repository = new BitbucketRepository();

      // @ts-expect-error - Accessing private property for testing
      expect(repository.bitbucket_access_token).toBe('env-token');
    });

    it('should throw error when token is not available', () => {
      // Remove token from environment
      delete process.env['BITBUCKET_ACCESS_TOKEN'];

      const repository = new BitbucketRepository();

      // @ts-expect-error - Accessing private property for testing
      expect(() => repository.bitbucket_access_token).toThrow('BITBUCKET_ACCESS_TOKEN is not set');
    });
  });

  describe('getSourceCodeDiff', () => {
    it('should fetch diff from Bitbucket API with correct URL and headers', async () => {
      // Setup
      const mockResponse = new Response('mock diff content');
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Execute
      const result = await repository.getSourceCodeDiff('workspace', 'repo', 'source-hash', 'dest-hash');

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.bitbucket.org/2.0/repositories/workspace/repo/diff/source-hash..dest-hash?binary=false',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer test-token',
          },
        },
      );
      expect(result).toBe('mock diff content');
    });

    it('should use token from options for authorization header', async () => {
      // Setup
      const mockResponse = new Response('mock diff content');
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      const options = { bitbucket_access_token: 'options-token' };
      const repository = new BitbucketRepository(options);

      // Execute
      await repository.getSourceCodeDiff('workspace', 'repo', 'source-hash', 'dest-hash');

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer options-token',
          },
        }),
      );
    });

    it('should handle fetch errors properly', async () => {
      // Setup
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockRejectedValue(new Error('Network error'));

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Execute & Verify
      await expect(repository.getSourceCodeDiff('workspace', 'repo', 'source-hash', 'dest-hash')).rejects.toThrow('Network error');
    });
  });
  describe('getPullRequest', () => {
    const mockPrResponse = {
      type: '<string>',
      links: {
        self: { href: '<string>', name: '<string>' },
        html: { href: '<string>', name: '<string>' },
        commits: { href: '<string>', name: '<string>' },
        approve: { href: '<string>', name: '<string>' },
        diff: { href: '<string>', name: '<string>' },
        diffstat: { href: '<string>', name: '<string>' },
        comments: { href: '<string>', name: '<string>' },
        activity: { href: '<string>', name: '<string>' },
        merge: { href: '<string>', name: '<string>' },
        decline: { href: '<string>', name: '<string>' },
      },
      id: 108,
      title: '<string>',
      rendered: {
        title: { raw: '<string>', markup: 'markdown', html: '<string>' },
        description: { raw: '<string>', markup: 'markdown', html: '<string>' },
        reason: { raw: '<string>', markup: 'markdown', html: '<string>' },
      },
      summary: { raw: '<string>', markup: 'markdown', html: '<string>' },
      state: 'OPEN',
      author: { type: '<string>' },
      source: {
        repository: { type: '<string>' },
        branch: { name: '<string>', merge_strategies: ['merge_commit'], default_merge_strategy: '<string>' },
        commit: { hash: '<string>' },
      },
      destination: {
        repository: { type: '<string>' },
        branch: { name: '<string>', merge_strategies: ['merge_commit'], default_merge_strategy: '<string>' },
        commit: { hash: '<string>' },
      },
      merge_commit: { hash: '<string>' },
      comment_count: 51,
      task_count: 53,
      close_source_branch: true,
      closed_by: { type: '<string>' },
      reason: '<string>',
      created_on: '<string>',
      updated_on: '<string>',
      reviewers: [{ type: '<string>' }],
      participants: [{ type: '<string>' }],
      draft: true,
      queued: true,
    };

    it('should fetch pull request from Bitbucket API with correct URL and headers', async () => {
      // Setup
      const mockResponse = new Response(JSON.stringify(mockPrResponse));
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Execute
      const result = await repository.getPullRequest('workspace', 'repo', 123);

      // Verify
      expect(global.fetch).toHaveBeenCalledWith('https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/123', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });
      expect(result).toEqual(mockPrResponse);
    });

    it('should use token from options for authorization header', async () => {
      // Setup
      const mockResponse = new Response(JSON.stringify(mockPrResponse));
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      const options = { bitbucket_access_token: 'options-token' };
      const repository = new BitbucketRepository(options);

      // Execute
      await repository.getPullRequest('workspace', 'repo', 123);

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer options-token',
          },
        }),
      );
    });

    it('should handle fetch errors properly', async () => {
      // Setup
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockRejectedValue(new Error('Network error'));

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Execute & Verify
      await expect(repository.getPullRequest('workspace', 'repo', 123)).rejects.toThrow('Network error');
    });

    it('should handle API error responses properly', async () => {
      // Setup
      const mockErrorResponse = new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockErrorResponse);

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Execute
      const result = await repository.getPullRequest('workspace', 'repo', 999);

      // Verify
      expect(result).toEqual({ error: 'Not found' });
    });
  });
  describe('listPullRequestsComments', () => {
    it('should fetch comments from Bitbucket API with correct URL and headers (single page)', async () => {
      // Setup
      const mockCommentsResponse = {
        values: [
          {
            id: 1,
            content: {
              raw: 'Comment 1',
            },
          },
          {
            id: 2,
            content: {
              raw: 'Comment 2',
            },
            inline: {
              to: 10,
              path: 'src/file.ts',
            },
          },
        ],
      };
      const mockResponse = new Response(JSON.stringify(mockCommentsResponse));
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Execute
      const result = await repository.listPullRequestsComments('workspace', 'repo', 123);

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/123/comments/?page=1&pagelen=50',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer test-token',
          },
        },
      );
      expect(result).toEqual(mockCommentsResponse.values);
    });

    it('should handle pagination and fetch all comments across multiple pages', async () => {
      // Setup
      const mockFirstPageResponse = {
        values: Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          content: {
            raw: `Comment ${(i + 1).toString()}`,
          },
        })),
      };
      const mockSecondPageResponse = {
        values: Array.from({ length: 25 }, (_, i) => ({
          id: i + 51,
          content: {
            raw: `Comment ${(i + 51).toString()}`,
          },
        })),
      };

      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch
        .mockResolvedValueOnce(new Response(JSON.stringify(mockFirstPageResponse)))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockSecondPageResponse)));

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Execute
      const result = await repository.listPullRequestsComments('workspace', 'repo', 123);

      // Verify
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/123/comments/?page=1&pagelen=50',
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/123/comments/?page=2&pagelen=50',
        expect.any(Object),
      );

      // Should combine results from both pages
      expect(result.length).toBe(75);
      expect(result[0]?.id).toBe(1);
      expect(result[74]?.id).toBe(75);
    });

    it('should handle empty response (no comments)', async () => {
      // Setup
      const mockEmptyResponse = {
        values: [],
      };
      const mockResponse = new Response(JSON.stringify(mockEmptyResponse));
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Execute
      const result = await repository.listPullRequestsComments('workspace', 'repo', 123);

      // Verify
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should use token from options for authorization header', async () => {
      // Setup
      const mockCommentsResponse = {
        values: [
          {
            id: 1,
            content: {
              raw: 'Comment 1',
            },
          },
        ],
      };
      const mockResponse = new Response(JSON.stringify(mockCommentsResponse));
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      const options = { bitbucket_access_token: 'options-token' };
      const repository = new BitbucketRepository(options);

      // Execute
      await repository.listPullRequestsComments('workspace', 'repo', 123);

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer options-token',
          },
        }),
      );
    });

    it('should handle fetch errors properly', async () => {
      // Setup
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockRejectedValue(new Error('Network error'));

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Execute & Verify
      await expect(repository.listPullRequestsComments('workspace', 'repo', 123)).rejects.toThrow('Network error');
    });
  });
  describe('createPullRequestComment', () => {
    it('should call Bitbucket API with correct URL, headers, and body', async () => {
      // Setup
      const mockResponse = new Response('', { status: 201 });
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      const comment = {
        content: {
          raw: 'Test comment',
        },
        inline: {
          to: 10,
          path: 'src/file.ts',
        },
      };

      // Execute
      await repository.createPullRequestComment('workspace', 'repo', 123, comment);

      // Verify
      expect(global.fetch).toHaveBeenCalledWith('https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/123/comments', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment),
      });
    });

    it('should use token from options for authorization header', async () => {
      // Setup
      const mockResponse = new Response('', { status: 201 });
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      const options = { bitbucket_access_token: 'options-token' };
      const repository = new BitbucketRepository(options);

      const comment = {
        content: {
          raw: 'Test comment',
        },
        inline: {
          to: 10,
          path: 'src/file.ts',
        },
      };

      // Execute
      await repository.createPullRequestComment('workspace', 'repo', 123, comment);

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer options-token',
          }) as Record<string, string>,
        }),
      );
    });

    it('should handle fetch errors properly', async () => {
      // Setup
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockRejectedValue(new Error('Network error'));

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      const comment = {
        content: {
          raw: 'Test comment',
        },
        inline: {
          to: 10,
          path: 'src/file.ts',
        },
      };

      // Execute & Verify
      await expect(repository.createPullRequestComment('workspace', 'repo', 123, comment)).rejects.toThrow('Network error');
    });

    it('should handle API error responses properly', async () => {
      // Setup
      const mockErrorResponse = new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockErrorResponse);

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      const comment = {
        content: {
          raw: 'Test comment',
        },
        inline: {
          to: 10,
          path: 'src/file.ts',
        },
      };

      // Execute & Verify
      // Since the method doesn't check response status, we just verify it doesn't throw
      await expect(repository.createPullRequestComment('workspace', 'repo', 123, comment)).resolves.not.toThrow();
    });
  });

  describe('createPullRequestComments', () => {
    it('should call createPullRequestComment for each comment in the array', async () => {
      // Setup
      const mockResponse = new Response('', { status: 201 });
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Spy on createPullRequestComment
      const createCommentSpy = vi.spyOn(repository, 'createPullRequestComment');

      const comments = [
        {
          content: {
            raw: 'Test comment 1',
          },
          inline: {
            to: 10,
            path: 'src/file1.ts',
          },
        },
        {
          content: {
            raw: 'Test comment 2',
          },
          inline: {
            to: 20,
            path: 'src/file2.ts',
          },
        },
      ];

      // Execute
      await repository.createPullRequestComments('workspace', 'repo', 123, comments);

      // Verify
      expect(createCommentSpy).toHaveBeenCalledTimes(2);
      expect(createCommentSpy).toHaveBeenNthCalledWith(1, 'workspace', 'repo', 123, comments[0]);
      expect(createCommentSpy).toHaveBeenNthCalledWith(2, 'workspace', 'repo', 123, comments[1]);
    });

    it('should handle empty array of comments', async () => {
      // Setup
      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Spy on createPullRequestComment
      const createCommentSpy = vi.spyOn(repository, 'createPullRequestComment');

      // Execute
      await repository.createPullRequestComments('workspace', 'repo', 123, []);

      // Verify
      expect(createCommentSpy).not.toHaveBeenCalled();
    });

    it('should handle errors from createPullRequestComment', async () => {
      // Setup
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockRejectedValue(new Error('Network error'));

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      const comments = [
        {
          content: {
            raw: 'Test comment 1',
          },
          inline: {
            to: 10,
            path: 'src/file1.ts',
          },
        },
        {
          content: {
            raw: 'Test comment 2',
          },
          inline: {
            to: 20,
            path: 'src/file2.ts',
          },
        },
      ];

      // Execute & Verify
      await expect(repository.createPullRequestComments('workspace', 'repo', 123, comments)).rejects.toThrow('Network error');
    });

    it('should use Promise.all to create comments in parallel', async () => {
      // Setup
      const mockResponse = new Response('', { status: 201 });
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Spy on Promise.all
      const promiseAllSpy = vi.spyOn(Promise, 'all');

      const comments = [
        {
          content: {
            raw: 'Test comment 1',
          },
          inline: {
            to: 10,
            path: 'src/file1.ts',
          },
        },
        {
          content: {
            raw: 'Test comment 2',
          },
          inline: {
            to: 20,
            path: 'src/file2.ts',
          },
        },
      ];

      // Execute
      await repository.createPullRequestComments('workspace', 'repo', 123, comments);

      // Verify
      expect(promiseAllSpy).toHaveBeenCalledTimes(1);
      expect(promiseAllSpy).toHaveBeenCalledWith(expect.any(Array));
    });
  });
});
