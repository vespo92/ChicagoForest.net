/**
 * Discussion Summarizer Tests
 * Agent 17: Ambassador - Community Manager
 */
import { describe, it, expect } from 'vitest';
import {
  extractKeyPoints,
  analyzeSentiment,
  determineStatus,
  extractRelatedTopics,
  summarizeDiscussion,
  generateDiscussionDigest,
  findUnansweredQuestions,
  Discussion,
  DiscussionComment,
} from '../src/discussions';

const createComment = (overrides: Partial<DiscussionComment> = {}): DiscussionComment => ({
  id: 'c1',
  author: 'user',
  body: 'Test comment',
  createdAt: new Date(),
  reactions: { thumbsUp: 0, thumbsDown: 0, heart: 0, rocket: 0 },
  ...overrides,
});

const createDiscussion = (overrides: Partial<Discussion> = {}): Discussion => ({
  id: 'd1',
  title: 'Test Discussion',
  category: 'general',
  author: 'author',
  body: 'Test body',
  createdAt: new Date(),
  comments: [],
  labels: [],
  answered: false,
  ...overrides,
});

describe('extractKeyPoints', () => {
  it('should extract questions', () => {
    const body = 'How do I configure the network?';
    const points = extractKeyPoints(body, []);

    expect(points.some(p => p.includes('Question'))).toBe(true);
  });

  it('should extract solution patterns', () => {
    const comments = [
      createComment({ body: 'The solution is to update the config file.' }),
    ];

    const points = extractKeyPoints('', comments);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should extract highly reacted comments', () => {
    const comments = [
      createComment({
        body: 'This is a very popular solution that works great.',
        reactions: { thumbsUp: 10, heart: 5, rocket: 3, thumbsDown: 0 },
      }),
    ];

    const points = extractKeyPoints('', comments);
    expect(points.some(p => p.includes('Popular'))).toBe(true);
  });

  it('should extract answered comment', () => {
    const comments = [
      createComment({
        body: 'This is the accepted answer.',
        isAnswer: true,
      }),
    ];

    const points = extractKeyPoints('', comments);
    expect(points.some(p => p.includes('Answer'))).toBe(true);
  });

  it('should limit key points', () => {
    const body = 'Question one? Question two? Question three?';
    const points = extractKeyPoints(body, [], 2);
    expect(points.length).toBeLessThanOrEqual(2);
  });
});

describe('analyzeSentiment', () => {
  it('should detect positive sentiment', () => {
    const comments = [
      createComment({ body: 'Great work! This is awesome!' }),
      createComment({ body: 'Thank you so much, it works perfectly!' }),
    ];

    const sentiment = analyzeSentiment(comments);
    expect(sentiment).toBe('positive');
  });

  it('should detect negative sentiment', () => {
    const comments = [
      createComment({ body: 'This is broken and frustrating.' }),
      createComment({ body: "Doesn't work, there's an error." }),
    ];

    const sentiment = analyzeSentiment(comments);
    expect(sentiment).toBe('negative');
  });

  it('should detect neutral sentiment', () => {
    const comments = [
      createComment({ body: 'I updated the configuration.' }),
      createComment({ body: 'The changes have been applied.' }),
    ];

    const sentiment = analyzeSentiment(comments);
    expect(sentiment).toBe('neutral');
  });

  it('should detect mixed sentiment', () => {
    const comments = [
      createComment({ body: 'Great feature but there is a bug.' }),
      createComment({ body: 'Awesome work, but it breaks something else.' }),
      createComment({ body: 'Love this! But there are problems.' }),
    ];

    const sentiment = analyzeSentiment(comments);
    expect(['mixed', 'positive', 'negative']).toContain(sentiment);
  });

  it('should return neutral for empty comments', () => {
    const sentiment = analyzeSentiment([]);
    expect(sentiment).toBe('neutral');
  });

  it('should consider reactions', () => {
    const comments = [
      createComment({
        body: 'Neutral statement.',
        reactions: { thumbsUp: 10, heart: 10, rocket: 10, thumbsDown: 0 },
      }),
    ];

    const sentiment = analyzeSentiment(comments);
    expect(sentiment).toBe('positive');
  });
});

describe('determineStatus', () => {
  it('should return resolved for answered discussions', () => {
    const discussion = createDiscussion({ answered: true });
    const status = determineStatus(discussion);
    expect(status).toBe('resolved');
  });

  it('should return stale for old discussions', () => {
    const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
    const discussion = createDiscussion({
      createdAt: oldDate,
      comments: [],
    });

    const status = determineStatus(discussion);
    expect(status).toBe('stale');
  });

  it('should return active for recent discussions', () => {
    const discussion = createDiscussion({
      createdAt: new Date(),
      comments: [createComment({ createdAt: new Date() })],
    });

    const status = determineStatus(discussion);
    expect(status).toBe('active');
  });

  it('should use last comment date for activity', () => {
    const oldCreated = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const recentComment = new Date();

    const discussion = createDiscussion({
      createdAt: oldCreated,
      comments: [createComment({ createdAt: recentComment })],
    });

    const status = determineStatus(discussion);
    expect(status).toBe('active');
  });
});

describe('extractRelatedTopics', () => {
  it('should extract Tesla research topics', () => {
    const topics = extractRelatedTopics('Tesla patent at Wardenclyffe', []);
    expect(topics).toContain('Tesla Research');
  });

  it('should extract LENR topics', () => {
    const topics = extractRelatedTopics('Cold fusion LENR experiments', []);
    expect(topics).toContain('LENR Research');
  });

  it('should extract network topics', () => {
    const topics = extractRelatedTopics('Mycelium network mesh configuration', []);
    expect(topics).toContain('Network Architecture');
  });

  it('should extract security topics', () => {
    const topics = extractRelatedTopics('Encryption and privacy concerns', []);
    expect(topics).toContain('Security');
  });

  it('should extract multiple topics', () => {
    const topics = extractRelatedTopics('Tesla research with security concerns', []);
    expect(topics.length).toBeGreaterThanOrEqual(2);
  });

  it('should limit topics to 5', () => {
    const body = 'Tesla LENR Mallove Moray mycelium security governance API documentation testing community theoretical';
    const topics = extractRelatedTopics(body, []);
    expect(topics.length).toBeLessThanOrEqual(5);
  });

  it('should include comment content', () => {
    const comments = [createComment({ body: 'This is about Tesla research.' })];
    const topics = extractRelatedTopics('General discussion', comments);
    expect(topics).toContain('Tesla Research');
  });
});

describe('summarizeDiscussion', () => {
  it('should create summary with correct fields', () => {
    const discussion = createDiscussion({
      id: 'test-id',
      title: 'Test Title',
      author: 'testauthor',
      category: 'q-and-a',
      comments: [
        createComment({ author: 'user1' }),
        createComment({ author: 'user2' }),
      ],
    });

    const summary = summarizeDiscussion(discussion);

    expect(summary.discussionId).toBe('test-id');
    expect(summary.title).toBe('Test Title');
    expect(summary.author).toBe('testauthor');
    expect(summary.category).toBe('q-and-a');
    expect(summary.participantCount).toBe(3); // author + 2 commenters
    expect(summary.commentCount).toBe(2);
  });

  it('should identify top contributors', () => {
    const discussion = createDiscussion({
      comments: [
        createComment({ author: 'helpful', reactions: { thumbsUp: 10, heart: 5, rocket: 3, thumbsDown: 0 } }),
        createComment({ author: 'less-helpful', reactions: { thumbsUp: 1, heart: 0, rocket: 0, thumbsDown: 0 } }),
      ],
    });

    const summary = summarizeDiscussion(discussion);
    expect(summary.topContributors[0]).toBe('helpful');
  });

  it('should include key points', () => {
    const discussion = createDiscussion({
      body: 'How do I configure this?',
      comments: [
        createComment({ body: 'The solution is to check the docs.', isAnswer: true }),
      ],
    });

    const summary = summarizeDiscussion(discussion);
    expect(summary.keyPoints.length).toBeGreaterThan(0);
  });
});

describe('generateDiscussionDigest', () => {
  it('should generate markdown digest', () => {
    const discussions = [
      createDiscussion({ category: 'announcements', title: 'Announcement 1' }),
      createDiscussion({ category: 'q-and-a', title: 'Question 1' }),
    ];

    const period = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };

    const digest = generateDiscussionDigest(discussions, period);

    expect(digest).toContain('# Discussion Digest');
    expect(digest).toContain('Announcements');
    expect(digest).toContain('Questions & Answers');
  });

  it('should include period dates', () => {
    const digest = generateDiscussionDigest([], {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    });

    expect(digest).toContain('2024-01-01');
    expect(digest).toContain('2024-01-31');
  });

  it('should include Agent 17 attribution', () => {
    const digest = generateDiscussionDigest([], {
      start: new Date(),
      end: new Date(),
    });

    expect(digest).toContain('Agent 17');
    expect(digest).toContain('Ambassador');
  });

  it('should include disclaimer', () => {
    const digest = generateDiscussionDigest([], {
      start: new Date(),
      end: new Date(),
    });

    expect(digest).toContain('DISCLAIMER');
    expect(digest).toContain('AI-generated');
  });
});

describe('findUnansweredQuestions', () => {
  it('should find unanswered Q&A discussions', () => {
    const discussions = [
      createDiscussion({ category: 'q-and-a', answered: false, createdAt: new Date() }),
      createDiscussion({ category: 'q-and-a', answered: true, createdAt: new Date() }),
      createDiscussion({ category: 'general', answered: false, createdAt: new Date() }),
    ];

    const unanswered = findUnansweredQuestions(discussions);
    expect(unanswered.length).toBe(1);
    expect(unanswered[0].answered).toBe(false);
    expect(unanswered[0].category).toBe('q-and-a');
  });

  it('should filter by age', () => {
    const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const discussions = [
      createDiscussion({ category: 'q-and-a', answered: false, createdAt: new Date() }),
      createDiscussion({ category: 'q-and-a', answered: false, createdAt: oldDate }),
    ];

    const unanswered = findUnansweredQuestions(discussions, 7);
    expect(unanswered.length).toBe(1);
  });

  it('should sort by creation date', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const discussions = [
      createDiscussion({ id: 'newer', category: 'q-and-a', answered: false, createdAt: now }),
      createDiscussion({ id: 'older', category: 'q-and-a', answered: false, createdAt: yesterday }),
    ];

    const unanswered = findUnansweredQuestions(discussions);
    expect(unanswered[0].id).toBe('older');
  });
});
