/**
 * Performance Profilers
 *
 * CPU, memory, and I/O profiling utilities.
 */

export interface ProfileSnapshot {
  timestamp: Date;
  cpu: {
    user: number;
    system: number;
    percent: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  eventLoop: {
    latency: number;
    utilization: number;
  };
}

export interface ProfileSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  snapshots: ProfileSnapshot[];
  summary?: ProfileSummary;
}

export interface ProfileSummary {
  duration: number;
  avgCpuPercent: number;
  maxCpuPercent: number;
  avgMemoryMb: number;
  maxMemoryMb: number;
  avgEventLoopLatency: number;
  maxEventLoopLatency: number;
}

export class Profiler {
  private sessions: Map<string, ProfileSession> = new Map();
  private activeSession: ProfileSession | null = null;
  private intervalId: NodeJS.Timeout | null = null;

  startSession(id?: string): string {
    const sessionId = id || `profile-${Date.now()}`;

    this.activeSession = {
      id: sessionId,
      startTime: new Date(),
      snapshots: [],
    };

    this.sessions.set(sessionId, this.activeSession);

    // Start collecting snapshots
    this.intervalId = setInterval(() => {
      if (this.activeSession) {
        this.activeSession.snapshots.push(this.takeSnapshot());
      }
    }, 100);

    return sessionId;
  }

  stopSession(): ProfileSession | null {
    if (!this.activeSession) return null;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.activeSession.endTime = new Date();
    this.activeSession.summary = this.calculateSummary(this.activeSession);

    const session = this.activeSession;
    this.activeSession = null;

    return session;
  }

  private takeSnapshot(): ProfileSnapshot {
    const memUsage = process.memoryUsage?.() || {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0,
    };

    const cpuUsage = process.cpuUsage?.() || { user: 0, system: 0 };

    return {
      timestamp: new Date(),
      cpu: {
        user: cpuUsage.user / 1000000, // Convert to seconds
        system: cpuUsage.system / 1000000,
        percent: (cpuUsage.user + cpuUsage.system) / 10000, // Rough estimate
      },
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      eventLoop: {
        latency: 0, // Would need perf_hooks for accurate measurement
        utilization: 0,
      },
    };
  }

  private calculateSummary(session: ProfileSession): ProfileSummary {
    const snapshots = session.snapshots;
    if (snapshots.length === 0) {
      return {
        duration: 0,
        avgCpuPercent: 0,
        maxCpuPercent: 0,
        avgMemoryMb: 0,
        maxMemoryMb: 0,
        avgEventLoopLatency: 0,
        maxEventLoopLatency: 0,
      };
    }

    const cpuPercents = snapshots.map(s => s.cpu.percent);
    const memoryMbs = snapshots.map(s => s.memory.heapUsed / (1024 * 1024));
    const eventLoopLatencies = snapshots.map(s => s.eventLoop.latency);

    return {
      duration: session.endTime
        ? session.endTime.getTime() - session.startTime.getTime()
        : 0,
      avgCpuPercent: cpuPercents.reduce((a, b) => a + b, 0) / cpuPercents.length,
      maxCpuPercent: Math.max(...cpuPercents),
      avgMemoryMb: memoryMbs.reduce((a, b) => a + b, 0) / memoryMbs.length,
      maxMemoryMb: Math.max(...memoryMbs),
      avgEventLoopLatency: eventLoopLatencies.reduce((a, b) => a + b, 0) / eventLoopLatencies.length,
      maxEventLoopLatency: Math.max(...eventLoopLatencies),
    };
  }

  getSession(id: string): ProfileSession | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): ProfileSession[] {
    return Array.from(this.sessions.values());
  }
}

export function measureExecutionTime<T>(fn: () => T): { result: T; timeMs: number } {
  const start = performance.now();
  const result = fn();
  const timeMs = performance.now() - start;
  return { result, timeMs };
}

export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; timeMs: number }> {
  const start = performance.now();
  const result = await fn();
  const timeMs = performance.now() - start;
  return { result, timeMs };
}
