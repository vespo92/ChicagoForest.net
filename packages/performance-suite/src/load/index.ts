/**
 * Load Testing Module
 *
 * Agent 19: Benchmarker - Performance Testing
 *
 * Provides load testing capabilities for simulating high-traffic
 * scenarios and measuring system behavior under stress.
 */

import { EventEmitter } from 'eventemitter3';
import type {
  LoadTestConfig,
  LoadTestResult,
  LoadScenario,
  LoadScenarioResult,
  LoadTimelinePoint,
  LoadScenarioStats,
  LatencyMetrics,
  ResourceMetrics,
} from '../types';
import { calculateLatencyMetrics, calculatePercentile, getResourceMetrics } from '../utils';

export interface LoadTesterEvents {
  'start': (config: LoadTestConfig) => void;
  'progress': (point: LoadTimelinePoint) => void;
  'complete': (result: LoadTestResult) => void;
  'error': (error: Error) => void;
}

export class LoadTester extends EventEmitter<LoadTesterEvents> {
  private isRunning = false;
  private shouldStop = false;
  private activeRequests = 0;
  private results: LoadScenarioResult[] = [];
  private timeline: LoadTimelinePoint[] = [];
  private scenarioResults: Map<string, LoadScenarioResult[]> = new Map();

  /**
   * Run a load test with the specified configuration
   */
  async run(config: LoadTestConfig): Promise<LoadTestResult> {
    if (this.isRunning) {
      throw new Error('Load test already running');
    }

    this.isRunning = true;
    this.shouldStop = false;
    this.results = [];
    this.timeline = [];
    this.scenarioResults.clear();

    // Initialize scenario results
    for (const scenario of config.scenarios) {
      this.scenarioResults.set(scenario.name, []);
    }

    this.emit('start', config);

    const startTime = new Date();
    const rampUpDuration = config.rampUpDuration ?? 0;
    const rampDownDuration = config.rampDownDuration ?? 0;
    const mainDuration = config.duration - rampUpDuration - rampDownDuration;
    const maxConcurrent = config.maxConcurrent ?? 1000;

    try {
      // Ramp up phase
      if (rampUpDuration > 0) {
        await this.runPhase(config, rampUpDuration, 0, config.targetRps, maxConcurrent);
      }

      // Main phase
      await this.runPhase(config, mainDuration, config.targetRps, config.targetRps, maxConcurrent);

      // Ramp down phase
      if (rampDownDuration > 0) {
        await this.runPhase(config, rampDownDuration, config.targetRps, 0, maxConcurrent);
      }
    } catch (error) {
      this.emit('error', error as Error);
    }

    // Wait for all active requests to complete
    while (this.activeRequests > 0) {
      await this.sleep(10);
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    const result = this.buildResult(config, startTime, endTime, duration);
    this.isRunning = false;
    this.emit('complete', result);

    return result;
  }

  /**
   * Stop a running load test
   */
  stop(): void {
    this.shouldStop = true;
  }

  private async runPhase(
    config: LoadTestConfig,
    duration: number,
    startRps: number,
    endRps: number,
    maxConcurrent: number
  ): Promise<void> {
    const phaseStart = Date.now();
    const phaseEnd = phaseStart + duration;
    let requestsSent = 0;

    while (Date.now() < phaseEnd && !this.shouldStop) {
      const elapsed = Date.now() - phaseStart;
      const progress = elapsed / duration;
      const currentRps = startRps + (endRps - startRps) * progress;

      // Calculate target requests for this moment
      const targetRequests = Math.floor((currentRps * elapsed) / 1000);
      const requestsToSend = Math.max(0, targetRequests - requestsSent);

      // Send requests respecting concurrency limit
      for (let i = 0; i < requestsToSend && this.activeRequests < maxConcurrent; i++) {
        const scenario = this.selectScenario(config.scenarios);
        this.executeRequest(scenario, config);
        requestsSent++;
      }

      // Record timeline point every 100ms
      if (elapsed % 100 < 10) {
        const latencies = this.results.slice(-100).map(r => r.latencyMs);
        const recentErrors = this.results.slice(-100).filter(r => !r.success).length;

        const point: LoadTimelinePoint = {
          timestamp: new Date(),
          rps: currentRps,
          latency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
          errors: recentErrors,
          activeConnections: this.activeRequests,
        };

        this.timeline.push(point);
        this.emit('progress', point);
      }

      await this.sleep(1);
    }
  }

  private selectScenario(scenarios: LoadScenario[]): LoadScenario {
    const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;

    for (const scenario of scenarios) {
      random -= scenario.weight;
      if (random <= 0) {
        return scenario;
      }
    }

    return scenarios[0];
  }

  private async executeRequest(scenario: LoadScenario, config: LoadTestConfig): Promise<void> {
    this.activeRequests++;

    try {
      const timeoutMs = config.requestTimeout ?? 30000;
      const result = await this.withTimeout(scenario.request(), timeoutMs);

      this.results.push(result);
      this.scenarioResults.get(scenario.name)?.push(result);
    } catch (error) {
      const errorResult: LoadScenarioResult = {
        success: false,
        latencyMs: config.requestTimeout ?? 30000,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.results.push(errorResult);
      this.scenarioResults.get(scenario.name)?.push(errorResult);
    } finally {
      this.activeRequests--;
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      ),
    ]);
  }

  private buildResult(
    config: LoadTestConfig,
    startTime: Date,
    endTime: Date,
    duration: number
  ): LoadTestResult {
    const successfulRequests = this.results.filter(r => r.success).length;
    const failedRequests = this.results.length - successfulRequests;
    const latencies = this.results.filter(r => r.success).map(r => r.latencyMs);

    const scenarioStats = new Map<string, LoadScenarioStats>();
    for (const [name, results] of this.scenarioResults) {
      const successful = results.filter(r => r.success);
      const latencyValues = successful.map(r => r.latencyMs);

      scenarioStats.set(name, {
        name,
        totalRequests: results.length,
        successCount: successful.length,
        failureCount: results.length - successful.length,
        avgLatencyMs: latencyValues.length > 0
          ? latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length
          : 0,
        minLatencyMs: latencyValues.length > 0 ? Math.min(...latencyValues) : 0,
        maxLatencyMs: latencyValues.length > 0 ? Math.max(...latencyValues) : 0,
      });
    }

    return {
      config,
      startTime,
      endTime,
      duration,
      totalRequests: this.results.length,
      successfulRequests,
      failedRequests,
      actualRps: this.results.length / (duration / 1000),
      latency: calculateLatencyMetrics(latencies),
      resources: getResourceMetrics(),
      timeline: this.timeline,
      scenarioResults: scenarioStats,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a simple load scenario from a function
 */
export function createScenario(
  name: string,
  weight: number,
  fn: () => Promise<void>
): LoadScenario {
  return {
    name,
    weight,
    request: async (): Promise<LoadScenarioResult> => {
      const start = performance.now();
      try {
        await fn();
        return {
          success: true,
          latencyMs: performance.now() - start,
        };
      } catch (error) {
        return {
          success: false,
          latencyMs: performance.now() - start,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  };
}

/**
 * Pre-defined load test patterns
 */
export const loadPatterns = {
  /**
   * Constant load at specified RPS
   */
  constant(rps: number, duration: number, scenarios: LoadScenario[]): LoadTestConfig {
    return {
      name: 'Constant Load',
      description: `Constant load at ${rps} RPS for ${duration}ms`,
      targetRps: rps,
      duration,
      scenarios,
    };
  },

  /**
   * Ramp up to target RPS, hold, then ramp down
   */
  rampUpDown(
    targetRps: number,
    rampDuration: number,
    holdDuration: number,
    scenarios: LoadScenario[]
  ): LoadTestConfig {
    return {
      name: 'Ramp Up/Down',
      description: `Ramp to ${targetRps} RPS over ${rampDuration}ms, hold for ${holdDuration}ms`,
      targetRps,
      duration: rampDuration * 2 + holdDuration,
      rampUpDuration: rampDuration,
      rampDownDuration: rampDuration,
      scenarios,
    };
  },

  /**
   * Spike test - sudden increase in load
   */
  spike(
    baseRps: number,
    spikeRps: number,
    spikeDuration: number,
    scenarios: LoadScenario[]
  ): LoadTestConfig {
    return {
      name: 'Spike Test',
      description: `Spike from ${baseRps} to ${spikeRps} RPS for ${spikeDuration}ms`,
      targetRps: spikeRps,
      duration: spikeDuration * 3,
      rampUpDuration: spikeDuration,
      rampDownDuration: spikeDuration,
      scenarios,
    };
  },

  /**
   * Stress test - gradually increase load until breaking point
   */
  stress(
    startRps: number,
    maxRps: number,
    stepDuration: number,
    steps: number,
    scenarios: LoadScenario[]
  ): LoadTestConfig {
    const rpsIncrement = (maxRps - startRps) / steps;
    return {
      name: 'Stress Test',
      description: `Stress test from ${startRps} to ${maxRps} RPS in ${steps} steps`,
      targetRps: maxRps,
      duration: stepDuration * steps,
      rampUpDuration: stepDuration * steps,
      scenarios,
    };
  },
};

export default LoadTester;
