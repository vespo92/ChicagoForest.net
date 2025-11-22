/**
 * Growth Analytics System
 *
 * DISCLAIMER: This is a THEORETICAL framework inspired by biological systems.
 * This code represents a conceptual design for network growth analytics and is NOT
 * a working energy distribution system.
 *
 * AI-GENERATED CONTENT: Created as part of the Chicago Plasma Forest Network
 * theoretical framework - an educational project exploring decentralized energy.
 *
 * BIOLOGICAL INSPIRATION:
 * Based on growth patterns studied in biological systems:
 *
 * - Allometric scaling laws in biology
 *   West et al., "A General Model for the Origin of Allometric Scaling Laws in Biology"
 *   Science 276(5309):122-126, 1997
 *   DOI: 10.1126/science.276.5309.122
 *
 * - Network growth in slime molds
 *   Tero et al., Science 2010
 *   DOI: 10.1126/science.1177894
 *
 * - Plant growth dynamics
 *   Niklas, "Plant Allometry: The Scaling of Form and Process"
 *   University of Chicago Press, 1994
 *   ISBN: 978-0226586427
 */

import { EventEmitter } from 'events';

// ============================================================================
// THEORETICAL FRAMEWORK - NOT OPERATIONAL
// ============================================================================

/**
 * Growth Metric Types
 *
 * THEORETICAL: Categories of growth measurements
 */
export enum GrowthMetricType {
  /** Network size metrics */
  SIZE = 'SIZE',

  /** Connectivity metrics */
  CONNECTIVITY = 'CONNECTIVITY',

  /** Coverage metrics */
  COVERAGE = 'COVERAGE',

  /** Efficiency metrics */
  EFFICIENCY = 'EFFICIENCY',

  /** Health metrics */
  HEALTH = 'HEALTH'
}

/**
 * Time Series Data Point
 *
 * THEORETICAL: Single measurement in time
 */
export interface TimeSeriesPoint {
  /** Timestamp */
  timestamp: Date;

  /** Metric value */
  value: number;

  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Growth Rate Analysis
 *
 * THEORETICAL: Analysis of growth velocity and acceleration
 */
export interface GrowthRateAnalysis {
  /** Current growth rate (units per day) */
  currentRate: number;

  /** Average growth rate */
  averageRate: number;

  /** Growth acceleration (change in rate) */
  acceleration: number;

  /** Growth phase */
  phase: 'lag' | 'exponential' | 'linear' | 'plateau' | 'decline';

  /** Projected value at target date */
  projection?: {
    targetDate: Date;
    projectedValue: number;
    confidence: number;
  };
}

/**
 * Network Topology Metrics
 *
 * THEORETICAL: Graph-theoretic measurements of network structure
 */
export interface TopologyMetrics {
  /** Total nodes */
  nodeCount: number;

  /** Total edges/connections */
  edgeCount: number;

  /** Average degree (connections per node) */
  averageDegree: number;

  /** Clustering coefficient (0-1) */
  clusteringCoefficient: number;

  /** Average path length */
  averagePathLength: number;

  /** Network diameter (longest shortest path) */
  diameter: number;

  /** Degree distribution entropy */
  degreeEntropy: number;

  /** Small-world coefficient */
  smallWorldCoefficient: number;
}

/**
 * Scaling Analysis
 *
 * THEORETICAL: Based on allometric scaling laws in biology
 *
 * Reference: West et al., Science 1997
 * Biological networks often follow power law scaling:
 * Y = Y0 * M^b where b is the scaling exponent
 */
export interface ScalingAnalysis {
  /** Scaling exponent */
  exponent: number;

  /** Scaling coefficient */
  coefficient: number;

  /** R-squared fit quality */
  rSquared: number;

  /** Scaling type */
  scalingType: 'sublinear' | 'linear' | 'superlinear';

  /** Comparison to biological scaling */
  biologicalComparison: {
    metabolicScaling: number; // ~0.75 in biology
    surfaceAreaScaling: number; // ~0.67 in biology
    difference: number;
  };
}

/**
 * Growth Efficiency Metrics
 *
 * THEORETICAL: Measuring growth quality, not just quantity
 */
export interface GrowthEfficiencyMetrics {
  /** Coverage gained per node added */
  coverageEfficiency: number;

  /** Capacity gained per unit cost */
  capacityEfficiency: number;

  /** Redundancy improvement rate */
  redundancyEfficiency: number;

  /** Connection quality vs quantity */
  connectionQuality: number;

  /** Resource utilization during growth */
  resourceUtilization: number;
}

/**
 * Cohort Analysis
 *
 * THEORETICAL: Analyzing nodes by when they joined
 */
export interface CohortAnalysis {
  /** Cohort identifier (e.g., "2024-Q1") */
  cohortId: string;

  /** Nodes in this cohort */
  nodeCount: number;

  /** Survival rate (nodes still active) */
  survivalRate: number;

  /** Average performance of cohort */
  averagePerformance: number;

  /** Cohort contribution to network */
  networkContribution: number;
}

/**
 * Growth Analytics Manager
 *
 * THEORETICAL FRAMEWORK: Tracks and analyzes network growth patterns,
 * inspired by biological growth studies and allometric scaling.
 */
export class GrowthAnalyticsManager extends EventEmitter {
  private timeSeries: Map<string, TimeSeriesPoint[]> = new Map();
  private topologyHistory: TopologyMetrics[] = [];
  private cohorts: Map<string, CohortAnalysis> = new Map();
  private scalingCache: Map<string, ScalingAnalysis> = new Map();

  // Analytics parameters
  private readonly params = {
    /** Time series retention (ms) */
    retentionPeriod: 90 * 24 * 60 * 60 * 1000, // 90 days

    /** Minimum points for trend analysis */
    minTrendPoints: 7,

    /** Smoothing window for rate calculation */
    smoothingWindow: 7,

    /** Projection horizon (days) */
    projectionHorizon: 30
  };

  constructor() {
    super();
    this.initializeTimeSeries();
  }

  /**
   * Initialize standard time series
   */
  private initializeTimeSeries(): void {
    const metrics = [
      'node_count',
      'edge_count',
      'total_capacity',
      'coverage_percentage',
      'average_health',
      'active_connections'
    ];

    for (const metric of metrics) {
      this.timeSeries.set(metric, []);
    }
  }

  /**
   * Record a metric value
   */
  recordMetric(metricName: string, value: number, metadata?: Record<string, unknown>): void {
    if (!this.timeSeries.has(metricName)) {
      this.timeSeries.set(metricName, []);
    }

    const series = this.timeSeries.get(metricName)!;
    series.push({
      timestamp: new Date(),
      value,
      metadata
    });

    // Trim old data
    this.trimTimeSeries(metricName);

    this.emit('metricRecorded', { metricName, value, timestamp: new Date() });
  }

  /**
   * Trim time series to retention period
   */
  private trimTimeSeries(metricName: string): void {
    const series = this.timeSeries.get(metricName);
    if (!series) return;

    const cutoff = Date.now() - this.params.retentionPeriod;
    const trimmedSeries = series.filter(point => point.timestamp.getTime() > cutoff);
    this.timeSeries.set(metricName, trimmedSeries);
  }

  /**
   * Analyze growth rate for a metric
   *
   * THEORETICAL: Calculate growth velocity and phase
   */
  analyzeGrowthRate(metricName: string): GrowthRateAnalysis | null {
    const series = this.timeSeries.get(metricName);
    if (!series || series.length < this.params.minTrendPoints) {
      return null;
    }

    console.log(`[THEORETICAL] Analyzing growth rate for ${metricName}...`);

    // Calculate daily rates
    const dailyRates: number[] = [];
    for (let i = 1; i < series.length; i++) {
      const timeDiff = series[i].timestamp.getTime() - series[i - 1].timestamp.getTime();
      const valueDiff = series[i].value - series[i - 1].value;
      const dailyRate = (valueDiff / timeDiff) * (24 * 60 * 60 * 1000); // Per day
      dailyRates.push(dailyRate);
    }

    // Current rate (smoothed)
    const recentRates = dailyRates.slice(-this.params.smoothingWindow);
    const currentRate = recentRates.reduce((a, b) => a + b, 0) / recentRates.length;

    // Average rate
    const averageRate = dailyRates.reduce((a, b) => a + b, 0) / dailyRates.length;

    // Acceleration (change in rate)
    const firstHalf = dailyRates.slice(0, Math.floor(dailyRates.length / 2));
    const secondHalf = dailyRates.slice(Math.floor(dailyRates.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const acceleration = secondAvg - firstAvg;

    // Determine growth phase
    const phase = this.determineGrowthPhase(series, currentRate, acceleration);

    // Project future value
    const projection = this.projectGrowth(series, currentRate, phase);

    return {
      currentRate,
      averageRate,
      acceleration,
      phase,
      projection
    };
  }

  /**
   * Determine growth phase
   *
   * THEORETICAL: Based on classic S-curve growth patterns
   */
  private determineGrowthPhase(
    series: TimeSeriesPoint[],
    currentRate: number,
    acceleration: number
  ): GrowthRateAnalysis['phase'] {
    const latestValue = series[series.length - 1].value;
    const startValue = series[0].value;

    // Very early growth with low rate
    if (series.length < 10 && currentRate < 0.5) {
      return 'lag';
    }

    // Positive acceleration indicates exponential
    if (acceleration > 0.1 && currentRate > 0) {
      return 'exponential';
    }

    // Declining rate but still positive
    if (currentRate > 0 && acceleration < -0.1) {
      return 'plateau';
    }

    // Negative growth
    if (currentRate < 0) {
      return 'decline';
    }

    // Stable linear growth
    return 'linear';
  }

  /**
   * Project future growth
   */
  private projectGrowth(
    series: TimeSeriesPoint[],
    currentRate: number,
    phase: GrowthRateAnalysis['phase']
  ): GrowthRateAnalysis['projection'] {
    const targetDate = new Date(Date.now() + this.params.projectionHorizon * 24 * 60 * 60 * 1000);
    const currentValue = series[series.length - 1].value;
    const daysToTarget = this.params.projectionHorizon;

    let projectedValue: number;
    let confidence: number;

    switch (phase) {
      case 'exponential':
        // Assume slowing down
        projectedValue = currentValue + currentRate * daysToTarget * 0.7;
        confidence = 0.6;
        break;
      case 'linear':
        projectedValue = currentValue + currentRate * daysToTarget;
        confidence = 0.8;
        break;
      case 'plateau':
        projectedValue = currentValue * 1.1; // 10% max increase
        confidence = 0.7;
        break;
      default:
        projectedValue = currentValue + currentRate * daysToTarget;
        confidence = 0.5;
    }

    return {
      targetDate,
      projectedValue: Math.max(0, projectedValue),
      confidence
    };
  }

  /**
   * Calculate topology metrics
   *
   * THEORETICAL: Graph-theoretic analysis of network structure
   */
  calculateTopologyMetrics(
    nodes: Array<{ id: string; connections: string[] }>
  ): TopologyMetrics {
    console.log('[THEORETICAL] Calculating topology metrics...');

    const nodeCount = nodes.length;
    let totalDegree = 0;
    let edgeCount = 0;
    const degrees: number[] = [];

    // Calculate degrees
    for (const node of nodes) {
      const degree = node.connections.length;
      degrees.push(degree);
      totalDegree += degree;
      edgeCount += degree; // Will count each edge twice
    }
    edgeCount = edgeCount / 2;

    const averageDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;

    // Clustering coefficient (simplified)
    const clusteringCoefficient = this.calculateClusteringCoefficient(nodes);

    // Average path length (simplified - would need full graph traversal)
    const averagePathLength = Math.log(nodeCount) / Math.log(averageDegree + 1);

    // Network diameter (simplified estimate)
    const diameter = Math.ceil(averagePathLength * 2);

    // Degree entropy
    const degreeEntropy = this.calculateEntropy(degrees);

    // Small-world coefficient
    const smallWorldCoefficient = clusteringCoefficient / averagePathLength;

    const metrics: TopologyMetrics = {
      nodeCount,
      edgeCount,
      averageDegree,
      clusteringCoefficient,
      averagePathLength,
      diameter,
      degreeEntropy,
      smallWorldCoefficient
    };

    // Store in history
    this.topologyHistory.push(metrics);

    // Record individual metrics
    this.recordMetric('node_count', nodeCount);
    this.recordMetric('edge_count', edgeCount);

    return metrics;
  }

  /**
   * Calculate clustering coefficient
   */
  private calculateClusteringCoefficient(nodes: Array<{ id: string; connections: string[] }>): number {
    if (nodes.length === 0) return 0;

    let totalCoeff = 0;

    for (const node of nodes) {
      const neighbors = node.connections;
      const k = neighbors.length;

      if (k < 2) continue;

      // Count connections between neighbors (simplified)
      let triangles = 0;
      const maxTriangles = (k * (k - 1)) / 2;

      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          const neighbor1 = nodes.find(n => n.id === neighbors[i]);
          if (neighbor1 && neighbor1.connections.includes(neighbors[j])) {
            triangles++;
          }
        }
      }

      totalCoeff += triangles / maxTriangles;
    }

    return totalCoeff / nodes.length;
  }

  /**
   * Calculate entropy of a distribution
   */
  private calculateEntropy(values: number[]): number {
    if (values.length === 0) return 0;

    const total = values.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;

    let entropy = 0;
    for (const value of values) {
      if (value > 0) {
        const p = value / total;
        entropy -= p * Math.log2(p);
      }
    }

    return entropy;
  }

  /**
   * Perform scaling analysis
   *
   * THEORETICAL: Based on allometric scaling laws (West et al., Science 1997)
   *
   * Biological systems often exhibit power-law scaling:
   * - Metabolic rate scales as M^0.75
   * - Surface area scales as M^0.67
   * - Liffespan scales as M^0.25
   */
  performScalingAnalysis(
    xMetric: string,
    yMetric: string
  ): ScalingAnalysis | null {
    const xSeries = this.timeSeries.get(xMetric);
    const ySeries = this.timeSeries.get(yMetric);

    if (!xSeries || !ySeries || xSeries.length < this.params.minTrendPoints) {
      return null;
    }

    console.log(`[THEORETICAL] Performing scaling analysis: ${yMetric} vs ${xMetric}...`);

    // Align time series
    const paired: Array<{ x: number; y: number }> = [];
    for (const xPoint of xSeries) {
      const yPoint = ySeries.find(y =>
        Math.abs(y.timestamp.getTime() - xPoint.timestamp.getTime()) < 3600000 // Within 1 hour
      );
      if (yPoint && xPoint.value > 0 && yPoint.value > 0) {
        paired.push({ x: xPoint.value, y: yPoint.value });
      }
    }

    if (paired.length < 5) return null;

    // Log-log regression for power law fit
    const logX = paired.map(p => Math.log(p.x));
    const logY = paired.map(p => Math.log(p.y));

    const { slope, intercept, rSquared } = this.linearRegression(logX, logY);

    const exponent = slope;
    const coefficient = Math.exp(intercept);

    // Determine scaling type
    let scalingType: ScalingAnalysis['scalingType'];
    if (exponent < 0.9) {
      scalingType = 'sublinear';
    } else if (exponent > 1.1) {
      scalingType = 'superlinear';
    } else {
      scalingType = 'linear';
    }

    // Compare to biological scaling
    const metabolicScaling = 0.75;
    const surfaceAreaScaling = 0.67;

    const analysis: ScalingAnalysis = {
      exponent,
      coefficient,
      rSquared,
      scalingType,
      biologicalComparison: {
        metabolicScaling,
        surfaceAreaScaling,
        difference: Math.abs(exponent - metabolicScaling)
      }
    };

    this.scalingCache.set(`${xMetric}-${yMetric}`, analysis);

    return analysis;
  }

  /**
   * Simple linear regression
   */
  private linearRegression(x: number[], y: number[]): {
    slope: number;
    intercept: number;
    rSquared: number;
  } {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const rSquared = 1 - ssRes / ssTotal;

    return { slope, intercept, rSquared };
  }

  /**
   * Calculate growth efficiency metrics
   */
  calculateEfficiencyMetrics(): GrowthEfficiencyMetrics {
    console.log('[THEORETICAL] Calculating growth efficiency metrics...');

    const nodeSeries = this.timeSeries.get('node_count') || [];
    const coverageSeries = this.timeSeries.get('coverage_percentage') || [];
    const capacitySeries = this.timeSeries.get('total_capacity') || [];

    // Coverage efficiency
    let coverageEfficiency = 0;
    if (nodeSeries.length >= 2 && coverageSeries.length >= 2) {
      const nodeGrowth = nodeSeries[nodeSeries.length - 1].value - nodeSeries[0].value;
      const coverageGrowth = coverageSeries[coverageSeries.length - 1].value - coverageSeries[0].value;
      coverageEfficiency = nodeGrowth > 0 ? coverageGrowth / nodeGrowth : 0;
    }

    // Capacity efficiency
    let capacityEfficiency = 0;
    if (nodeSeries.length >= 2 && capacitySeries.length >= 2) {
      const nodeGrowth = nodeSeries[nodeSeries.length - 1].value - nodeSeries[0].value;
      const capacityGrowth = capacitySeries[capacitySeries.length - 1].value - capacitySeries[0].value;
      capacityEfficiency = nodeGrowth > 0 ? capacityGrowth / nodeGrowth : 0;
    }

    return {
      coverageEfficiency,
      capacityEfficiency,
      redundancyEfficiency: 0.7, // Placeholder
      connectionQuality: 0.8, // Placeholder
      resourceUtilization: 0.75 // Placeholder
    };
  }

  /**
   * Analyze cohorts
   */
  analyzeCohort(cohortId: string, nodeIds: string[], metrics: Map<string, number>): CohortAnalysis {
    console.log(`[THEORETICAL] Analyzing cohort ${cohortId}...`);

    const analysis: CohortAnalysis = {
      cohortId,
      nodeCount: nodeIds.length,
      survivalRate: metrics.get('survival') || 1.0,
      averagePerformance: metrics.get('performance') || 0.5,
      networkContribution: metrics.get('contribution') || nodeIds.length * 10
    };

    this.cohorts.set(cohortId, analysis);

    return analysis;
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    latestTopology: TopologyMetrics | null;
    growthRates: Map<string, GrowthRateAnalysis | null>;
    efficiency: GrowthEfficiencyMetrics;
    cohortCount: number;
  } {
    const growthRates = new Map<string, GrowthRateAnalysis | null>();
    for (const metricName of this.timeSeries.keys()) {
      growthRates.set(metricName, this.analyzeGrowthRate(metricName));
    }

    return {
      latestTopology: this.topologyHistory[this.topologyHistory.length - 1] || null,
      growthRates,
      efficiency: this.calculateEfficiencyMetrics(),
      cohortCount: this.cohorts.size
    };
  }

  /**
   * Get time series data
   */
  getTimeSeries(metricName: string): TimeSeriesPoint[] {
    return this.timeSeries.get(metricName) || [];
  }
}

// ============================================================================
// DISCLAIMER
// ============================================================================
/*
 * IMPORTANT NOTICE:
 *
 * This code is part of a THEORETICAL FRAMEWORK exploring concepts for
 * network growth analytics inspired by biological scaling laws.
 *
 * It is NOT:
 * - A working analytics system
 * - A proven technology
 * - Ready for production deployment
 * - An actual network monitoring tool
 *
 * It IS:
 * - An educational exploration of growth analysis concepts
 * - Inspired by biological scaling (West et al., Kleiber's law)
 * - A conceptual framework for community discussion
 *
 * For actual analytics, please consult established time series
 * analysis tools and network monitoring software.
 */
