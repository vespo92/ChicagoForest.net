/**
 * Discussion Thread Summarizer
 *
 * Analyze and summarize GitHub discussions and community threads.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for the Chicago Plasma Forest Network.
 */

export interface DiscussionComment {
  id: string;
  author: string;
  body: string;
  createdAt: Date;
  reactions: {
    thumbsUp: number;
    thumbsDown: number;
    heart: number;
    rocket: number;
  };
  isAnswer?: boolean;
}

export interface Discussion {
  id: string;
  title: string;
  category: DiscussionCategory;
  author: string;
  body: string;
  createdAt: Date;
  comments: DiscussionComment[];
  labels: string[];
  answered: boolean;
}

export type DiscussionCategory =
  | 'announcements'
  | 'general'
  | 'ideas'
  | 'q-and-a'
  | 'show-and-tell';

export interface DiscussionSummary {
  discussionId: string;
  title: string;
  author: string;
  category: DiscussionCategory;
  participantCount: number;
  commentCount: number;
  topContributors: string[];
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  status: 'active' | 'resolved' | 'stale';
  relatedTopics: string[];
}

/**
 * Extract key points from discussion content
 */
export function extractKeyPoints(
  body: string,
  comments: DiscussionComment[],
  maxPoints: number = 5
): string[] {
  const allContent = [body, ...comments.map(c => c.body)].join('\n');
  const keyPoints: string[] = [];

  // Look for question patterns
  const questions = allContent.match(/\?[^?]*$/gm) || [];
  for (const q of questions.slice(0, 2)) {
    const cleaned = q.trim();
    if (cleaned.length > 10 && cleaned.length < 200) {
      keyPoints.push(`Question: ${cleaned}`);
    }
  }

  // Look for solution patterns
  const solutionPatterns = [
    /the solution is[^.]+\./gi,
    /you can[^.]+\./gi,
    /try[^.]+\./gi,
    /I found that[^.]+\./gi,
  ];

  for (const pattern of solutionPatterns) {
    const matches = allContent.match(pattern) || [];
    for (const match of matches.slice(0, 1)) {
      if (match.length > 15 && match.length < 200) {
        keyPoints.push(match.trim());
      }
    }
  }

  // Look for highly reacted comments
  const topComments = [...comments]
    .sort((a, b) => {
      const scoreA = a.reactions.thumbsUp + a.reactions.heart * 2 + a.reactions.rocket * 3;
      const scoreB = b.reactions.thumbsUp + b.reactions.heart * 2 + b.reactions.rocket * 3;
      return scoreB - scoreA;
    })
    .slice(0, 2);

  for (const comment of topComments) {
    const firstSentence = comment.body.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 10 && firstSentence.length < 200) {
      keyPoints.push(`Popular: ${firstSentence.trim()}`);
    }
  }

  // Add answered comment if present
  const answer = comments.find(c => c.isAnswer);
  if (answer) {
    const firstSentence = answer.body.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length < 200) {
      keyPoints.push(`Answer: ${firstSentence.trim()}`);
    }
  }

  return keyPoints.slice(0, maxPoints);
}

/**
 * Analyze sentiment of a discussion
 */
export function analyzeSentiment(
  comments: DiscussionComment[]
): 'positive' | 'neutral' | 'negative' | 'mixed' {
  if (comments.length === 0) return 'neutral';

  const positiveWords = /thank|great|awesome|perfect|excellent|love|helpful|works|solved/i;
  const negativeWords = /broken|bug|issue|problem|wrong|error|fail|doesn't work|frustrated/i;

  let positiveCount = 0;
  let negativeCount = 0;

  for (const comment of comments) {
    if (positiveWords.test(comment.body)) positiveCount++;
    if (negativeWords.test(comment.body)) negativeCount++;

    // Also consider reactions
    positiveCount += (comment.reactions.thumbsUp + comment.reactions.heart + comment.reactions.rocket) > 5 ? 1 : 0;
    negativeCount += comment.reactions.thumbsDown > 2 ? 1 : 0;
  }

  const total = positiveCount + negativeCount;
  if (total === 0) return 'neutral';

  const positiveRatio = positiveCount / total;

  if (positiveRatio > 0.7) return 'positive';
  if (positiveRatio < 0.3) return 'negative';
  if (total >= 3 && Math.abs(positiveCount - negativeCount) < 2) return 'mixed';
  return 'neutral';
}

/**
 * Determine discussion status
 */
export function determineStatus(discussion: Discussion): 'active' | 'resolved' | 'stale' {
  const now = new Date();
  const lastActivity = discussion.comments.length > 0
    ? discussion.comments[discussion.comments.length - 1].createdAt
    : discussion.createdAt;

  const daysSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

  if (discussion.answered) return 'resolved';
  if (daysSinceActivity > 30) return 'stale';
  return 'active';
}

/**
 * Extract related topics from discussion
 */
export function extractRelatedTopics(
  body: string,
  comments: DiscussionComment[]
): string[] {
  const allContent = [body, ...comments.map(c => c.body)].join(' ').toLowerCase();
  const topics = new Set<string>();

  const topicPatterns = [
    { pattern: /tesla|nikola|wardenclyffe/i, topic: 'Tesla Research' },
    { pattern: /lenr|cold fusion|lattice/i, topic: 'LENR Research' },
    { pattern: /mallove|infinite energy/i, topic: 'Mallove Archive' },
    { pattern: /moray|radiant energy/i, topic: 'Moray Devices' },
    { pattern: /mycelium|network|mesh/i, topic: 'Network Architecture' },
    { pattern: /security|privacy|encryption/i, topic: 'Security' },
    { pattern: /governance|voting|consensus/i, topic: 'Governance' },
    { pattern: /api|sdk|integration/i, topic: 'API/SDK' },
    { pattern: /documentation|docs/i, topic: 'Documentation' },
    { pattern: /test|testing|quality/i, topic: 'Testing' },
    { pattern: /community|contributor/i, topic: 'Community' },
    { pattern: /theoretical|speculative/i, topic: 'Theoretical Framework' },
  ];

  for (const { pattern, topic } of topicPatterns) {
    if (pattern.test(allContent)) {
      topics.add(topic);
    }
  }

  return Array.from(topics).slice(0, 5);
}

/**
 * Generate a summary for a discussion
 */
export function summarizeDiscussion(discussion: Discussion): DiscussionSummary {
  const participants = new Set<string>([discussion.author]);
  discussion.comments.forEach(c => participants.add(c.author));

  // Find top contributors by reaction score
  const contributorScores = new Map<string, number>();
  for (const comment of discussion.comments) {
    const score = comment.reactions.thumbsUp + comment.reactions.heart * 2 + comment.reactions.rocket * 3;
    contributorScores.set(
      comment.author,
      (contributorScores.get(comment.author) || 0) + score
    );
  }

  const topContributors = Array.from(contributorScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([author]) => author);

  return {
    discussionId: discussion.id,
    title: discussion.title,
    author: discussion.author,
    category: discussion.category,
    participantCount: participants.size,
    commentCount: discussion.comments.length,
    topContributors,
    keyPoints: extractKeyPoints(discussion.body, discussion.comments),
    sentiment: analyzeSentiment(discussion.comments),
    status: determineStatus(discussion),
    relatedTopics: extractRelatedTopics(discussion.body, discussion.comments),
  };
}

/**
 * Generate a digest of multiple discussions
 */
export function generateDiscussionDigest(
  discussions: Discussion[],
  period: { start: Date; end: Date }
): string {
  const lines: string[] = [
    '# Discussion Digest',
    '',
    `*Period: ${period.start.toISOString().split('T')[0]} to ${period.end.toISOString().split('T')[0]}*`,
    '',
    '---',
    '',
  ];

  const summaries = discussions.map(summarizeDiscussion);

  // Group by category
  const byCategory = new Map<DiscussionCategory, DiscussionSummary[]>();
  for (const summary of summaries) {
    if (!byCategory.has(summary.category)) {
      byCategory.set(summary.category, []);
    }
    byCategory.get(summary.category)!.push(summary);
  }

  const categoryLabels: Record<DiscussionCategory, string> = {
    'announcements': 'Announcements',
    'general': 'General Discussion',
    'ideas': 'Ideas & Proposals',
    'q-and-a': 'Questions & Answers',
    'show-and-tell': 'Show & Tell',
  };

  for (const [category, categorySummaries] of byCategory) {
    lines.push(`## ${categoryLabels[category]}`);
    lines.push('');

    for (const summary of categorySummaries) {
      const statusEmoji = {
        active: '',
        resolved: '',
        stale: '',
      }[summary.status];

      lines.push(`### ${statusEmoji} ${summary.title}`);
      lines.push(`*by @${summary.author} | ${summary.commentCount} comments | ${summary.participantCount} participants*`);
      lines.push('');

      if (summary.keyPoints.length > 0) {
        lines.push('**Key Points:**');
        for (const point of summary.keyPoints) {
          lines.push(`- ${point}`);
        }
        lines.push('');
      }

      if (summary.relatedTopics.length > 0) {
        lines.push(`**Topics:** ${summary.relatedTopics.join(', ')}`);
        lines.push('');
      }
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('*Generated by Agent 17 (Ambassador) - Chicago Forest Community Manager*');
  lines.push('');
  lines.push('*DISCLAIMER: The Chicago Plasma Forest Network is an AI-generated theoretical framework.*');

  return lines.join('\n');
}

/**
 * Find unanswered questions that need attention
 */
export function findUnansweredQuestions(
  discussions: Discussion[],
  maxAge: number = 7 // days
): Discussion[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - maxAge * 24 * 60 * 60 * 1000);

  return discussions
    .filter(d => d.category === 'q-and-a')
    .filter(d => !d.answered)
    .filter(d => d.createdAt > cutoff)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
