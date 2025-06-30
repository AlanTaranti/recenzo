import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BitbucketRepository } from '../../src/repositories/bitbucket-repository';

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

  describe('getSourceDiff', () => {
    it('should fetch diff from Bitbucket API with correct URL and headers', async () => {
      // Setup
      const mockResponse = new Response('mock diff content');
      const mockedFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockedFetch.mockResolvedValue(mockResponse);

      process.env['BITBUCKET_ACCESS_TOKEN'] = 'test-token';
      const repository = new BitbucketRepository();

      // Execute
      const result = await repository.getSourceDiff('workspace', 'repo', 'source-hash', 'dest-hash');

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.bitbucket.org/2.0/repositories/workspace/repo/diffs/source-hash...dest-hash?binary=false',
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
      await repository.getSourceDiff('workspace', 'repo', 'source-hash', 'dest-hash');

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
      await expect(repository.getSourceDiff('workspace', 'repo', 'source-hash', 'dest-hash')).rejects.toThrow('Network error');
    });
  });
});
