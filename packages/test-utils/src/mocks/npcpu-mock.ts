/**
 * NPCPU Mock
 *
 * Mock implementation for NPCPU (Neural Processing Cognitive Processing Unit) integration testing.
 * Simulates cognitive query routing and AI workload distribution for Chicago Forest Network.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

// ============================================================================
// NPCPU Types (mirroring expected NPCPU interface)
// ============================================================================

export interface CognitiveQuery {
  id: string;
  type: 'analyze' | 'predict' | 'optimize' | 'learn' | 'reason';
  payload: unknown;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timeout?: number;
  originNode?: NodeId;
}

export interface CognitiveResponse {
  queryId: string;
  success: boolean;
  result: unknown;
  processingTime: number;
  confidenceScore: number;
  nodesTouched: number;
  error?: string;
}

export interface AITask {
  id: string;
  type: string;
  payload: unknown;
  requirements: {
    minMemory?: number;
    minCpu?: number;
    gpuRequired?: boolean;
  };
  deadline?: number;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  output: unknown;
  executionTime: number;
  resourcesUsed: {
    memory: number;
    cpu: number;
    gpu: boolean;
  };
  distributedNodes: NodeId[];
}

export interface ConsciousnessSnapshot {
  timestamp: number;
  globalState: Record<string, unknown>;
  activeNodes: NodeId[];
  syncVersion: number;
}

export interface NPCPUEvents {
  'query:received': (query: CognitiveQuery) => void;
  'query:processed': (response: CognitiveResponse) => void;
  'task:started': (task: AITask) => void;
  'task:completed': (result: TaskResult) => void;
  'consciousness:synced': (snapshot: ConsciousnessSnapshot) => void;
  'error': (error: Error) => void;
}

// ============================================================================
// Mock NPCPU Connector
// ============================================================================

export class MockNPCPUConnector extends EventEmitter<NPCPUEvents> {
  private connected = false;
  private queries: Map<string, CognitiveQuery> = new Map();
  private tasks: Map<string, AITask> = new Map();
  private consciousnessState: ConsciousnessSnapshot | null = null;
  private processingDelay: number;
  private failureRate: number;

  constructor(options: { processingDelay?: number; failureRate?: number } = {}) {
    super();
    this.processingDelay = options.processingDelay ?? 50;
    this.failureRate = options.failureRate ?? 0;
  }

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.queries.clear();
    this.tasks.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Route a cognitive query through the NPCPU network
   */
  async routeCognitiveQuery(query: CognitiveQuery): Promise<CognitiveResponse> {
    if (!this.connected) {
      throw new Error('NPCPU connector not connected');
    }

    this.queries.set(query.id, query);
    this.emit('query:received', query);

    // Simulate processing delay
    await this.delay(this.processingDelay);

    // Simulate random failures
    if (Math.random() < this.failureRate) {
      const response: CognitiveResponse = {
        queryId: query.id,
        success: false,
        result: null,
        processingTime: this.processingDelay,
        confidenceScore: 0,
        nodesTouched: 0,
        error: 'Simulated NPCPU processing failure',
      };
      this.emit('query:processed', response);
      return response;
    }

    const response: CognitiveResponse = {
      queryId: query.id,
      success: true,
      result: this.generateMockResult(query),
      processingTime: this.processingDelay + Math.random() * 50,
      confidenceScore: 0.85 + Math.random() * 0.15,
      nodesTouched: 1 + Math.floor(Math.random() * 5),
    };

    this.emit('query:processed', response);
    return response;
  }

  /**
   * Distribute an AI processing task across the network
   */
  async distributeProcessing(task: AITask): Promise<TaskResult> {
    if (!this.connected) {
      throw new Error('NPCPU connector not connected');
    }

    this.tasks.set(task.id, task);
    this.emit('task:started', task);

    // Simulate processing
    await this.delay(this.processingDelay * 2);

    const result: TaskResult = {
      taskId: task.id,
      success: Math.random() >= this.failureRate,
      output: { computed: true, taskType: task.type },
      executionTime: this.processingDelay * 2 + Math.random() * 100,
      resourcesUsed: {
        memory: 256 + Math.floor(Math.random() * 512),
        cpu: 10 + Math.floor(Math.random() * 50),
        gpu: task.requirements.gpuRequired ?? false,
      },
      distributedNodes: this.generateMockNodeIds(1 + Math.floor(Math.random() * 3)),
    };

    this.emit('task:completed', result);
    return result;
  }

  /**
   * Sync consciousness state across the network
   */
  async syncConsciousnessState(state: ConsciousnessSnapshot): Promise<void> {
    if (!this.connected) {
      throw new Error('NPCPU connector not connected');
    }

    await this.delay(this.processingDelay);
    this.consciousnessState = state;
    this.emit('consciousness:synced', state);
  }

  /**
   * Get current consciousness state
   */
  getConsciousnessState(): ConsciousnessSnapshot | null {
    return this.consciousnessState;
  }

  /**
   * Get all received queries (for test assertions)
   */
  getReceivedQueries(): CognitiveQuery[] {
    return Array.from(this.queries.values());
  }

  /**
   * Get all distributed tasks (for test assertions)
   */
  getDistributedTasks(): AITask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Set processing delay for testing
   */
  setProcessingDelay(delay: number): void {
    this.processingDelay = delay;
  }

  /**
   * Set failure rate for testing error scenarios
   */
  setFailureRate(rate: number): void {
    this.failureRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.queries.clear();
    this.tasks.clear();
    this.consciousnessState = null;
    this.removeAllListeners();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateMockResult(query: CognitiveQuery): unknown {
    switch (query.type) {
      case 'analyze':
        return { analysis: 'complete', metrics: { score: 0.9 } };
      case 'predict':
        return { prediction: 'positive', probability: 0.75 };
      case 'optimize':
        return { optimized: true, improvements: ['latency', 'throughput'] };
      case 'learn':
        return { learned: true, newPatterns: 3 };
      case 'reason':
        return { conclusion: 'valid', steps: 5 };
      default:
        return { processed: true };
    }
  }

  private generateMockNodeIds(count: number): NodeId[] {
    return Array.from({ length: count }, (_, i) => `CFN-npcpu-node-${i}`);
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createMockNPCPU(
  options?: { processingDelay?: number; failureRate?: number }
): MockNPCPUConnector {
  return new MockNPCPUConnector(options);
}

export function createTestCognitiveQuery(
  overrides: Partial<CognitiveQuery> = {}
): CognitiveQuery {
  return {
    id: `query-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'analyze',
    payload: { data: 'test' },
    priority: 'normal',
    ...overrides,
  };
}

export function createTestAITask(overrides: Partial<AITask> = {}): AITask {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'inference',
    payload: { input: 'test' },
    requirements: {},
    ...overrides,
  };
}
