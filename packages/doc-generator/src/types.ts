/**
 * @chicago-forest/doc-generator
 *
 * Agent 14: Prophet - Documentation Automation
 *
 * Type definitions for documentation generation.
 */

// ============================================================================
// Core Configuration Types
// ============================================================================

export interface DocGeneratorConfig {
  /** Root path to scan for packages */
  packagesPath: string;
  /** Output directory for generated documentation */
  outputPath: string;
  /** Include private/internal APIs in documentation */
  includePrivate: boolean;
  /** Generate architecture diagrams */
  generateDiagrams: boolean;
  /** Generate integration guides */
  generateGuides: boolean;
  /** Output format for documentation */
  format: DocumentFormat;
  /** Template directory for custom templates */
  templatePath?: string;
  /** Enable NPCPU integration for AI-enhanced docs */
  enableNPCPU: boolean;
  /** Package filter pattern (glob) */
  packageFilter?: string;
  /** Verbose logging */
  verbose: boolean;
}

export type DocumentFormat = 'markdown' | 'html' | 'json';

export const DEFAULT_CONFIG: DocGeneratorConfig = {
  packagesPath: './packages',
  outputPath: './docs/generated',
  includePrivate: false,
  generateDiagrams: true,
  generateGuides: true,
  format: 'markdown',
  enableNPCPU: false,
  verbose: false,
};

// ============================================================================
// Extracted Documentation Types
// ============================================================================

export type ExportType = 'function' | 'class' | 'interface' | 'type' | 'constant' | 'enum';

export interface ParameterDoc {
  name: string;
  type: string;
  description?: string;
  optional: boolean;
  defaultValue?: string;
}

export interface ReturnDoc {
  type: string;
  description?: string;
}

export interface PropertyDoc {
  name: string;
  type: string;
  description?: string;
  readonly: boolean;
  optional: boolean;
  visibility: 'public' | 'protected' | 'private';
}

export interface MethodDoc {
  name: string;
  description: string;
  parameters: ParameterDoc[];
  returns?: ReturnDoc;
  visibility: 'public' | 'protected' | 'private';
  static: boolean;
  async: boolean;
  examples: string[];
  deprecated?: string;
}

export interface ExtractedDoc {
  name: string;
  type: ExportType;
  description: string;
  parameters?: ParameterDoc[];
  returns?: ReturnDoc;
  properties?: PropertyDoc[];
  methods?: MethodDoc[];
  generics?: string[];
  examples: string[];
  since?: string;
  deprecated?: string;
  internal: boolean;
  filePath: string;
  lineNumber: number;
}

export interface PackageDoc {
  name: string;
  version: string;
  description: string;
  exports: ExtractedDoc[];
  dependencies: PackageDependency[];
  peerDependencies: PackageDependency[];
  entryPoints: string[];
  readme?: string;
  changelog?: string;
  license?: string;
}

export interface PackageDependency {
  name: string;
  version: string;
  internal: boolean;
}

// ============================================================================
// Architecture Diagram Types
// ============================================================================

export type DiagramType = 'mermaid' | 'plantuml' | 'd2';

export interface ArchitectureDiagram {
  type: DiagramType;
  content: string;
  title: string;
  description?: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  type: 'package' | 'module' | 'class' | 'interface' | 'external';
  metadata?: Record<string, string>;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  type: 'dependency' | 'implements' | 'extends' | 'uses' | 'contains';
}

export interface DiagramConfig {
  title: string;
  direction: 'TB' | 'BT' | 'LR' | 'RL';
  showExternal: boolean;
  groupByDomain: boolean;
  maxDepth: number;
}

// ============================================================================
// Breaking Change Detection Types
// ============================================================================

export type BreakingChangeType =
  | 'removed-export'
  | 'removed-parameter'
  | 'changed-type'
  | 'required-parameter-added'
  | 'return-type-changed'
  | 'visibility-reduced'
  | 'renamed';

export interface BreakingChange {
  type: BreakingChangeType;
  severity: 'major' | 'minor' | 'patch';
  location: string;
  previousValue?: string;
  currentValue?: string;
  description: string;
  suggestedMigration?: string;
}

export interface BreakingChangeReport {
  packageName: string;
  previousVersion: string;
  currentVersion: string;
  changes: BreakingChange[];
  generatedAt: Date;
}

// ============================================================================
// Changelog Types
// ============================================================================

export type CommitType =
  | 'feat'
  | 'fix'
  | 'docs'
  | 'style'
  | 'refactor'
  | 'perf'
  | 'test'
  | 'build'
  | 'ci'
  | 'chore'
  | 'revert';

export interface ConventionalCommit {
  hash: string;
  type: CommitType;
  scope?: string;
  subject: string;
  body?: string;
  breaking: boolean;
  date: Date;
  author: string;
}

export interface ChangelogEntry {
  version: string;
  date: Date;
  features: ConventionalCommit[];
  fixes: ConventionalCommit[];
  breakingChanges: ConventionalCommit[];
  other: ConventionalCommit[];
}

export interface ChangelogConfig {
  repository: string;
  compareUrl?: string;
  includeAll: boolean;
  groupByScope: boolean;
}

// ============================================================================
// Integration Guide Types
// ============================================================================

export interface IntegrationStep {
  order: number;
  title: string;
  description: string;
  code?: string;
  notes?: string[];
}

export interface IntegrationGuide {
  title: string;
  sourcePackage: string;
  targetPackage: string;
  description: string;
  prerequisites: string[];
  steps: IntegrationStep[];
  examples: CodeExample[];
  troubleshooting: TroubleshootingEntry[];
}

export interface TroubleshootingEntry {
  problem: string;
  solution: string;
  relatedLinks?: string[];
}

// ============================================================================
// Example Code Types
// ============================================================================

export interface CodeExample {
  title: string;
  description?: string;
  language: string;
  code: string;
  imports: string[];
  output?: string;
  tags: string[];
}

export interface ExampleConfig {
  extractFromJSDoc: boolean;
  extractFromTests: boolean;
  validateSyntax: boolean;
  includeOutput: boolean;
}

// ============================================================================
// NPCPU Integration Types (AI-Enhanced Documentation)
// ============================================================================

export interface NPCPUDocConfig {
  enabled: boolean;
  endpoint?: string;
  features: NPCPUFeature[];
  maxTokens: number;
}

export type NPCPUFeature =
  | 'doc-synthesis'
  | 'code-explanation'
  | 'example-generation'
  | 'migration-suggestions';

export interface NPCPUDocRequest {
  feature: NPCPUFeature;
  context: {
    sourceCode: string;
    existingDocs?: string;
    packageName: string;
  };
}

export interface NPCPUDocResponse {
  success: boolean;
  content?: string;
  error?: string;
  tokens: number;
}

// ============================================================================
// Template Types
// ============================================================================

export interface TemplateContext {
  package: PackageDoc;
  config: DocGeneratorConfig;
  diagrams: ArchitectureDiagram[];
  breakingChanges?: BreakingChangeReport;
  generatedAt: Date;
}

export type TemplateType =
  | 'readme'
  | 'api-reference'
  | 'changelog'
  | 'integration-guide'
  | 'architecture';

export interface Template {
  name: string;
  type: TemplateType;
  content: string;
  variables: string[];
}

// ============================================================================
// Event Types
// ============================================================================

export type DocGeneratorEventType =
  | 'extraction:start'
  | 'extraction:complete'
  | 'extraction:error'
  | 'generation:start'
  | 'generation:complete'
  | 'generation:error'
  | 'breaking-change:detected'
  | 'npcpu:request'
  | 'npcpu:response';

export interface DocGeneratorEvent {
  type: DocGeneratorEventType;
  timestamp: Date;
  data: Record<string, unknown>;
}

// ============================================================================
// Result Types
// ============================================================================

export interface GenerationResult {
  success: boolean;
  outputPath: string;
  files: GeneratedFile[];
  errors: GenerationError[];
  stats: GenerationStats;
}

export interface GeneratedFile {
  path: string;
  type: TemplateType;
  size: number;
}

export interface GenerationError {
  file: string;
  message: string;
  line?: number;
}

export interface GenerationStats {
  packagesProcessed: number;
  exportsDocumented: number;
  diagramsGenerated: number;
  filesCreated: number;
  duration: number;
}
