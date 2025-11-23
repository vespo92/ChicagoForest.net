/**
 * Breaking Change Detector
 *
 * Detect and document breaking changes between package versions.
 */

import type {
  BreakingChange,
  BreakingChangeReport,
  BreakingChangeType,
  ExtractedDoc,
  ParameterDoc,
  PackageDoc,
} from '../types';

export interface BreakingChangeConfig {
  ignorePaths: string[];
  ignoreInternal: boolean;
  semverStrict: boolean;
}

export const DEFAULT_BREAKING_CHANGE_CONFIG: BreakingChangeConfig = {
  ignorePaths: [],
  ignoreInternal: true,
  semverStrict: true,
};

/**
 * Detect breaking changes between two versions of a package
 */
export function detectBreakingChanges(
  previous: PackageDoc,
  current: PackageDoc,
  config: Partial<BreakingChangeConfig> = {}
): BreakingChangeReport {
  const opts = { ...DEFAULT_BREAKING_CHANGE_CONFIG, ...config };
  const changes: BreakingChange[] = [];

  const previousExports = new Map(previous.exports.map(e => [e.name, e]));
  const currentExports = new Map(current.exports.map(e => [e.name, e]));

  // Check for removed exports
  for (const [name, prevExport] of previousExports) {
    if (opts.ignoreInternal && prevExport.internal) continue;

    if (!currentExports.has(name)) {
      changes.push({
        type: 'removed-export',
        severity: 'major',
        location: `${prevExport.filePath}:${prevExport.lineNumber}`,
        previousValue: prevExport.type,
        description: `Export '${name}' (${prevExport.type}) was removed`,
        suggestedMigration: `Remove usage of '${name}' or find alternative API`,
      });
    }
  }

  // Check for changes in existing exports
  for (const [name, currentExport] of currentExports) {
    const prevExport = previousExports.get(name);
    if (!prevExport) continue;
    if (opts.ignoreInternal && (prevExport.internal || currentExport.internal)) continue;

    // Type changed
    if (prevExport.type !== currentExport.type) {
      changes.push({
        type: 'changed-type',
        severity: 'major',
        location: `${currentExport.filePath}:${currentExport.lineNumber}`,
        previousValue: prevExport.type,
        currentValue: currentExport.type,
        description: `'${name}' changed from ${prevExport.type} to ${currentExport.type}`,
      });
    }

    // Check function/method changes
    if (prevExport.type === 'function' && currentExport.type === 'function') {
      const paramChanges = detectParameterChanges(
        name,
        prevExport.parameters || [],
        currentExport.parameters || [],
        currentExport.filePath,
        currentExport.lineNumber
      );
      changes.push(...paramChanges);

      const returnChange = detectReturnTypeChange(
        name,
        prevExport.returns,
        currentExport.returns,
        currentExport.filePath,
        currentExport.lineNumber
      );
      if (returnChange) changes.push(returnChange);
    }

    // Check class/interface property changes
    if (
      (prevExport.type === 'class' || prevExport.type === 'interface') &&
      currentExport.type === prevExport.type
    ) {
      const propChanges = detectPropertyChanges(
        name,
        prevExport.properties || [],
        currentExport.properties || [],
        currentExport.filePath,
        currentExport.lineNumber
      );
      changes.push(...propChanges);

      if (prevExport.type === 'class') {
        const methodChanges = detectMethodChanges(
          name,
          prevExport.methods || [],
          currentExport.methods || [],
          currentExport.filePath,
          currentExport.lineNumber
        );
        changes.push(...methodChanges);
      }
    }
  }

  return {
    packageName: current.name,
    previousVersion: previous.version,
    currentVersion: current.version,
    changes,
    generatedAt: new Date(),
  };
}

/**
 * Detect changes in function parameters
 */
function detectParameterChanges(
  functionName: string,
  prevParams: ParameterDoc[],
  currentParams: ParameterDoc[],
  filePath: string,
  lineNumber: number
): BreakingChange[] {
  const changes: BreakingChange[] = [];

  // Check for removed parameters
  for (const prevParam of prevParams) {
    const currentParam = currentParams.find(p => p.name === prevParam.name);
    if (!currentParam) {
      changes.push({
        type: 'removed-parameter',
        severity: 'major',
        location: `${filePath}:${lineNumber}`,
        previousValue: `${prevParam.name}: ${prevParam.type}`,
        description: `Parameter '${prevParam.name}' was removed from '${functionName}'`,
        suggestedMigration: `Remove argument for '${prevParam.name}' when calling '${functionName}'`,
      });
    }
  }

  // Check for new required parameters
  for (const currentParam of currentParams) {
    const prevParam = prevParams.find(p => p.name === currentParam.name);
    if (!prevParam && !currentParam.optional) {
      changes.push({
        type: 'required-parameter-added',
        severity: 'major',
        location: `${filePath}:${lineNumber}`,
        currentValue: `${currentParam.name}: ${currentParam.type}`,
        description: `Required parameter '${currentParam.name}' was added to '${functionName}'`,
        suggestedMigration: `Add argument for '${currentParam.name}' when calling '${functionName}'`,
      });
    }
  }

  // Check for type changes
  for (const currentParam of currentParams) {
    const prevParam = prevParams.find(p => p.name === currentParam.name);
    if (prevParam && prevParam.type !== currentParam.type) {
      changes.push({
        type: 'changed-type',
        severity: isTypeNarrowing(prevParam.type, currentParam.type) ? 'minor' : 'major',
        location: `${filePath}:${lineNumber}`,
        previousValue: `${prevParam.name}: ${prevParam.type}`,
        currentValue: `${currentParam.name}: ${currentParam.type}`,
        description: `Parameter '${currentParam.name}' type changed in '${functionName}'`,
      });
    }

    // Optional becoming required
    if (prevParam && prevParam.optional && !currentParam.optional) {
      changes.push({
        type: 'required-parameter-added',
        severity: 'major',
        location: `${filePath}:${lineNumber}`,
        previousValue: `${prevParam.name}?: ${prevParam.type}`,
        currentValue: `${currentParam.name}: ${currentParam.type}`,
        description: `Parameter '${currentParam.name}' is now required in '${functionName}'`,
      });
    }
  }

  return changes;
}

/**
 * Detect return type changes
 */
function detectReturnTypeChange(
  functionName: string,
  prevReturn: { type: string; description?: string } | undefined,
  currentReturn: { type: string; description?: string } | undefined,
  filePath: string,
  lineNumber: number
): BreakingChange | null {
  if (!prevReturn && !currentReturn) return null;
  if (!prevReturn && currentReturn) return null; // Adding return type is not breaking

  if (prevReturn && !currentReturn) {
    return {
      type: 'return-type-changed',
      severity: 'major',
      location: `${filePath}:${lineNumber}`,
      previousValue: prevReturn.type,
      currentValue: 'void',
      description: `Return type of '${functionName}' changed to void`,
    };
  }

  if (prevReturn && currentReturn && prevReturn.type !== currentReturn.type) {
    return {
      type: 'return-type-changed',
      severity: isTypeWidening(prevReturn.type, currentReturn.type) ? 'minor' : 'major',
      location: `${filePath}:${lineNumber}`,
      previousValue: prevReturn.type,
      currentValue: currentReturn.type,
      description: `Return type of '${functionName}' changed from '${prevReturn.type}' to '${currentReturn.type}'`,
    };
  }

  return null;
}

/**
 * Detect property changes in classes/interfaces
 */
function detectPropertyChanges(
  parentName: string,
  prevProps: Array<{ name: string; type: string; optional: boolean; visibility: string }>,
  currentProps: Array<{ name: string; type: string; optional: boolean; visibility: string }>,
  filePath: string,
  lineNumber: number
): BreakingChange[] {
  const changes: BreakingChange[] = [];

  // Check for removed properties
  for (const prevProp of prevProps) {
    if (prevProp.visibility === 'private') continue;
    const currentProp = currentProps.find(p => p.name === prevProp.name);
    if (!currentProp) {
      changes.push({
        type: 'removed-export',
        severity: 'major',
        location: `${filePath}:${lineNumber}`,
        previousValue: `${prevProp.name}: ${prevProp.type}`,
        description: `Property '${prevProp.name}' was removed from '${parentName}'`,
      });
    }
  }

  // Check for visibility reductions and type changes
  for (const currentProp of currentProps) {
    const prevProp = prevProps.find(p => p.name === currentProp.name);
    if (!prevProp) continue;

    // Visibility reduced
    const visibilityOrder = ['public', 'protected', 'private'];
    if (visibilityOrder.indexOf(currentProp.visibility) > visibilityOrder.indexOf(prevProp.visibility)) {
      changes.push({
        type: 'visibility-reduced',
        severity: 'major',
        location: `${filePath}:${lineNumber}`,
        previousValue: prevProp.visibility,
        currentValue: currentProp.visibility,
        description: `Property '${currentProp.name}' visibility reduced from ${prevProp.visibility} to ${currentProp.visibility} in '${parentName}'`,
      });
    }

    // Type changed
    if (prevProp.type !== currentProp.type) {
      changes.push({
        type: 'changed-type',
        severity: 'major',
        location: `${filePath}:${lineNumber}`,
        previousValue: prevProp.type,
        currentValue: currentProp.type,
        description: `Property '${currentProp.name}' type changed in '${parentName}'`,
      });
    }
  }

  return changes;
}

/**
 * Detect method changes in classes
 */
function detectMethodChanges(
  className: string,
  prevMethods: Array<{ name: string; visibility: string; parameters: ParameterDoc[] }>,
  currentMethods: Array<{ name: string; visibility: string; parameters: ParameterDoc[] }>,
  filePath: string,
  lineNumber: number
): BreakingChange[] {
  const changes: BreakingChange[] = [];

  // Check for removed methods
  for (const prevMethod of prevMethods) {
    if (prevMethod.visibility === 'private') continue;
    const currentMethod = currentMethods.find(m => m.name === prevMethod.name);
    if (!currentMethod) {
      changes.push({
        type: 'removed-export',
        severity: 'major',
        location: `${filePath}:${lineNumber}`,
        previousValue: prevMethod.name,
        description: `Method '${prevMethod.name}' was removed from '${className}'`,
      });
    }
  }

  // Check for signature changes
  for (const currentMethod of currentMethods) {
    const prevMethod = prevMethods.find(m => m.name === currentMethod.name);
    if (!prevMethod) continue;
    if (prevMethod.visibility === 'private') continue;

    const paramChanges = detectParameterChanges(
      `${className}.${currentMethod.name}`,
      prevMethod.parameters,
      currentMethod.parameters,
      filePath,
      lineNumber
    );
    changes.push(...paramChanges);
  }

  return changes;
}

/**
 * Check if type change is narrowing (more specific)
 */
function isTypeNarrowing(prevType: string, currentType: string): boolean {
  // Simple heuristic - could be expanded with actual type analysis
  if (prevType === 'any' || prevType === 'unknown') return true;
  if (currentType.includes('|') && !prevType.includes('|')) return false;
  return false;
}

/**
 * Check if type change is widening (less specific)
 */
function isTypeWidening(prevType: string, currentType: string): boolean {
  if (currentType === 'any' || currentType === 'unknown') return true;
  if (currentType.includes('|') && !prevType.includes('|')) return true;
  return false;
}

/**
 * Generate breaking change documentation
 */
export function generateBreakingChangeDoc(report: BreakingChangeReport): string {
  const lines: string[] = [
    `# Breaking Changes: ${report.packageName}`,
    '',
    `**Version:** ${report.previousVersion} → ${report.currentVersion}`,
    `**Generated:** ${report.generatedAt.toISOString()}`,
    '',
  ];

  if (report.changes.length === 0) {
    lines.push('No breaking changes detected.');
    return lines.join('\n');
  }

  const majorChanges = report.changes.filter(c => c.severity === 'major');
  const minorChanges = report.changes.filter(c => c.severity === 'minor');

  if (majorChanges.length > 0) {
    lines.push('## Major Changes (Breaking)');
    lines.push('');
    for (const change of majorChanges) {
      lines.push(`### ${change.type.replace(/-/g, ' ')}`);
      lines.push('');
      lines.push(change.description);
      lines.push('');
      if (change.previousValue) {
        lines.push(`- **Before:** \`${change.previousValue}\``);
      }
      if (change.currentValue) {
        lines.push(`- **After:** \`${change.currentValue}\``);
      }
      if (change.suggestedMigration) {
        lines.push(`- **Migration:** ${change.suggestedMigration}`);
      }
      lines.push(`- **Location:** \`${change.location}\``);
      lines.push('');
    }
  }

  if (minorChanges.length > 0) {
    lines.push('## Minor Changes');
    lines.push('');
    for (const change of minorChanges) {
      lines.push(`- ${change.description}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(`Total: ${majorChanges.length} major, ${minorChanges.length} minor changes`);

  return lines.join('\n');
}

/**
 * Determine suggested version bump based on changes
 */
export function suggestVersionBump(
  currentVersion: string,
  changes: BreakingChange[]
): { major: number; minor: number; patch: number; suggestion: string } {
  const [major, minor, patch] = currentVersion.split('.').map(n => parseInt(n, 10));

  const hasMajor = changes.some(c => c.severity === 'major');
  const hasMinor = changes.some(c => c.severity === 'minor');

  if (hasMajor) {
    return {
      major: major + 1,
      minor: 0,
      patch: 0,
      suggestion: `${major + 1}.0.0 (major breaking changes detected)`,
    };
  }

  if (hasMinor) {
    return {
      major,
      minor: minor + 1,
      patch: 0,
      suggestion: `${major}.${minor + 1}.0 (minor changes detected)`,
    };
  }

  return {
    major,
    minor,
    patch: patch + 1,
    suggestion: `${major}.${minor}.${patch + 1} (no breaking changes)`,
  };
}
