/**
 * Tests for ForestPubSub - GossipSub integration
 */

import { describe, it, expect } from 'vitest';
import {
  TOPIC_PREFIX,
  FOREST_TOPICS,
  DEFAULT_PUBSUB_CONFIG,
  createTopic,
} from '../src/pubsub';

describe('PubSub Constants', () => {
  describe('TOPIC_PREFIX', () => {
    it('should have correct prefix', () => {
      expect(TOPIC_PREFIX).toBe('/chicago-forest/pubsub');
    });
  });

  describe('FOREST_TOPICS', () => {
    it('should define ANNOUNCEMENTS topic', () => {
      expect(FOREST_TOPICS.ANNOUNCEMENTS).toBe('/chicago-forest/pubsub/announcements');
    });

    it('should define PEER_DISCOVERY topic', () => {
      expect(FOREST_TOPICS.PEER_DISCOVERY).toBe('/chicago-forest/pubsub/peer-discovery');
    });

    it('should define STATUS topic', () => {
      expect(FOREST_TOPICS.STATUS).toBe('/chicago-forest/pubsub/status');
    });

    it('should define ENERGY_DATA topic', () => {
      expect(FOREST_TOPICS.ENERGY_DATA).toBe('/chicago-forest/pubsub/energy-data');
    });

    it('should define GOVERNANCE topic', () => {
      expect(FOREST_TOPICS.GOVERNANCE).toBe('/chicago-forest/pubsub/governance');
    });

    it('should define ALERTS topic', () => {
      expect(FOREST_TOPICS.ALERTS).toBe('/chicago-forest/pubsub/alerts');
    });
  });
});

describe('DEFAULT_PUBSUB_CONFIG', () => {
  it('should have sensible defaults', () => {
    expect(DEFAULT_PUBSUB_CONFIG.signMessages).toBe(true);
    expect(DEFAULT_PUBSUB_CONFIG.strictSignatureValidation).toBe(false);
    expect(DEFAULT_PUBSUB_CONFIG.heartbeatInterval).toBe(1000);
    expect(DEFAULT_PUBSUB_CONFIG.messageCacheTTL).toBe(120000);
    expect(DEFAULT_PUBSUB_CONFIG.gossipFactor).toBe(0.25);
  });

  it('should have correct mesh parameters', () => {
    expect(DEFAULT_PUBSUB_CONFIG.meshDegree).toBe(6);
    expect(DEFAULT_PUBSUB_CONFIG.meshDegreeLow).toBe(4);
    expect(DEFAULT_PUBSUB_CONFIG.meshDegreeHigh).toBe(12);
  });

  it('should start with empty subscriptions', () => {
    expect(DEFAULT_PUBSUB_CONFIG.subscribeTopics).toEqual([]);
  });
});

describe('createTopic', () => {
  it('should create topic with name only', () => {
    const topic = createTopic('my-topic');
    expect(topic).toBe('/chicago-forest/pubsub/my-topic');
  });

  it('should create topic with namespace', () => {
    const topic = createTopic('my-topic', 'custom-namespace');
    expect(topic).toBe('/chicago-forest/pubsub/custom-namespace/my-topic');
  });

  it('should handle special characters', () => {
    const topic = createTopic('node-123');
    expect(topic).toBe('/chicago-forest/pubsub/node-123');
  });
});
