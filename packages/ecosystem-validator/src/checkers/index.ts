/**
 * Compatibility Checkers
 *
 * Check compatibility across repositories and versions.
 */

import type { BreakingChange } from '../index';

export interface VersionMatrix {
  package: string;
  versions: {
    version: string;
    compatibleWith: { package: string; versions: string[] }[];
  }[];
}

export interface DependencyCheck {
  package: string;
  required: string;
  installed: string;
  status: 'ok' | 'outdated' | 'incompatible';
}

export function checkVersionCompatibility(
  packageVersion: string,
  matrix: VersionMatrix
): DependencyCheck[] {
  const results: DependencyCheck[] = [];
  const versionEntry = matrix.versions.find(v => v.version === packageVersion);

  if (!versionEntry) {
    return [{
      package: matrix.package,
      required: packageVersion,
      installed: 'unknown',
      status: 'incompatible',
    }];
  }

  for (const compat of versionEntry.compatibleWith) {
    results.push({
      package: compat.package,
      required: compat.versions[0], // First is minimum
      installed: packageVersion,
      status: 'ok',
    });
  }

  return results;
}

export function detectBreakingChanges(
  oldInterface: { methods: string[]; types: string[] },
  newInterface: { methods: string[]; types: string[] }
): BreakingChange[] {
  const changes: BreakingChange[] = [];

  // Removed methods
  for (const method of oldInterface.methods) {
    if (!newInterface.methods.includes(method)) {
      changes.push({
        type: 'removed',
        location: `method:${method}`,
        description: `Method '${method}' has been removed`,
        impact: 'high',
        migration: `Replace calls to '${method}' with the new equivalent`,
      });
    }
  }

  // Removed types
  for (const type of oldInterface.types) {
    if (!newInterface.types.includes(type)) {
      changes.push({
        type: 'removed',
        location: `type:${type}`,
        description: `Type '${type}' has been removed`,
        impact: 'high',
        migration: `Update type imports to use the new type`,
      });
    }
  }

  return changes;
}

export function checkCrossRepoIntegration(
  localPackage: string,
  remoteRepo: string,
  integrationConfig: {
    expectedInterfaces: string[];
    requiredMethods: string[];
  }
): { compatible: boolean; issues: string[] } {
  const issues: string[] = [];

  // In production, this would fetch and validate actual interfaces
  // For now, validate configuration completeness

  if (integrationConfig.expectedInterfaces.length === 0) {
    issues.push(`No interfaces defined for ${localPackage} -> ${remoteRepo}`);
  }

  if (integrationConfig.requiredMethods.length === 0) {
    issues.push(`No required methods defined for integration`);
  }

  return {
    compatible: issues.length === 0,
    issues,
  };
}

export function generateCompatibilityMatrix(
  packages: { name: string; version: string; dependencies: Record<string, string> }[]
): Map<string, Set<string>> {
  const matrix = new Map<string, Set<string>>();

  for (const pkg of packages) {
    for (const [dep, version] of Object.entries(pkg.dependencies)) {
      const key = `${dep}@${version}`;
      if (!matrix.has(key)) {
        matrix.set(key, new Set());
      }
      matrix.get(key)!.add(`${pkg.name}@${pkg.version}`);
    }
  }

  return matrix;
}
