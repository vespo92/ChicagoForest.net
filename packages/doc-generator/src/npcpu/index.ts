/**
 * NPCPU Integration
 *
 * AI-enhanced documentation generation through NPCPU cognitive processing.
 */

import EventEmitter from 'eventemitter3';
import type {
  NPCPUDocConfig,
  NPCPUDocRequest,
  NPCPUDocResponse,
  NPCPUFeature,
  ExtractedDoc,
  PackageDoc,
} from '../types';

export const DEFAULT_NPCPU_CONFIG: NPCPUDocConfig = {
  enabled: false,
  features: ['doc-synthesis', 'code-explanation'],
  maxTokens: 4096,
};

export interface NPCPUEvents {
  'request:start': (request: NPCPUDocRequest) => void;
  'request:complete': (response: NPCPUDocResponse) => void;
  'request:error': (error: Error) => void;
}

/**
 * NPCPU Documentation Integration Client
 *
 * Integrates with the NPCPU cognitive processing framework to enhance
 * documentation with AI-generated explanations, examples, and summaries.
 */
export class NPCPUDocClient extends EventEmitter<NPCPUEvents> {
  private readonly config: NPCPUDocConfig;
  private requestCount = 0;
  private totalTokens = 0;

  constructor(config: Partial<NPCPUDocConfig> = {}) {
    super();
    this.config = { ...DEFAULT_NPCPU_CONFIG, ...config };
  }

  /**
   * Check if NPCPU integration is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Check if a specific feature is enabled
   */
  hasFeature(feature: NPCPUFeature): boolean {
    return this.config.features.includes(feature);
  }

  /**
   * Generate enhanced documentation for an export
   */
  async enhanceDocumentation(
    exp: ExtractedDoc,
    packageName: string
  ): Promise<string> {
    if (!this.isEnabled()) {
      return exp.description;
    }

    const request: NPCPUDocRequest = {
      feature: 'doc-synthesis',
      context: {
        sourceCode: this.buildSourceContext(exp),
        existingDocs: exp.description,
        packageName,
      },
    };

    const response = await this.sendRequest(request);
    return response.success ? response.content || exp.description : exp.description;
  }

  /**
   * Generate code explanation for complex code
   */
  async explainCode(
    sourceCode: string,
    packageName: string
  ): Promise<string> {
    if (!this.isEnabled() || !this.hasFeature('code-explanation')) {
      return '';
    }

    const request: NPCPUDocRequest = {
      feature: 'code-explanation',
      context: {
        sourceCode,
        packageName,
      },
    };

    const response = await this.sendRequest(request);
    return response.success ? response.content || '' : '';
  }

  /**
   * Generate example code for an export
   */
  async generateExample(
    exp: ExtractedDoc,
    packageName: string
  ): Promise<string | null> {
    if (!this.isEnabled() || !this.hasFeature('example-generation')) {
      return null;
    }

    const request: NPCPUDocRequest = {
      feature: 'example-generation',
      context: {
        sourceCode: this.buildSourceContext(exp),
        existingDocs: exp.description,
        packageName,
      },
    };

    const response = await this.sendRequest(request);
    return response.success ? response.content || null : null;
  }

  /**
   * Generate migration suggestions for breaking changes
   */
  async suggestMigration(
    previousCode: string,
    currentCode: string,
    packageName: string
  ): Promise<string | null> {
    if (!this.isEnabled() || !this.hasFeature('migration-suggestions')) {
      return null;
    }

    const request: NPCPUDocRequest = {
      feature: 'migration-suggestions',
      context: {
        sourceCode: `// Previous:\n${previousCode}\n\n// Current:\n${currentCode}`,
        packageName,
      },
    };

    const response = await this.sendRequest(request);
    return response.success ? response.content || null : null;
  }

  /**
   * Enhance a full package documentation
   */
  async enhancePackage(pkg: PackageDoc): Promise<PackageDoc> {
    if (!this.isEnabled()) {
      return pkg;
    }

    const enhancedExports: ExtractedDoc[] = [];

    for (const exp of pkg.exports) {
      const enhancedDescription = await this.enhanceDocumentation(exp, pkg.name);
      enhancedExports.push({
        ...exp,
        description: enhancedDescription,
      });
    }

    return {
      ...pkg,
      exports: enhancedExports,
    };
  }

  /**
   * Get usage statistics
   */
  getStats(): { requests: number; tokens: number } {
    return {
      requests: this.requestCount,
      tokens: this.totalTokens,
    };
  }

  /**
   * Build source context string for NPCPU request
   */
  private buildSourceContext(exp: ExtractedDoc): string {
    const lines: string[] = [];

    lines.push(`// ${exp.type}: ${exp.name}`);
    lines.push(`// File: ${exp.filePath}:${exp.lineNumber}`);
    lines.push('');

    // Add signature based on type
    switch (exp.type) {
      case 'function':
        lines.push(this.buildFunctionSignature(exp));
        break;
      case 'class':
        lines.push(this.buildClassSignature(exp));
        break;
      case 'interface':
        lines.push(this.buildInterfaceSignature(exp));
        break;
      case 'type':
        lines.push(`type ${exp.name}${exp.generics ? `<${exp.generics.join(', ')}>` : ''} = ...`);
        break;
      default:
        lines.push(`const ${exp.name} = ...`);
    }

    return lines.join('\n');
  }

  /**
   * Build function signature string
   */
  private buildFunctionSignature(exp: ExtractedDoc): string {
    const params = exp.parameters?.map(p => {
      const opt = p.optional ? '?' : '';
      return `${p.name}${opt}: ${p.type}`;
    }).join(', ') || '';

    const generics = exp.generics ? `<${exp.generics.join(', ')}>` : '';
    const returns = exp.returns ? `: ${exp.returns.type}` : '';

    return `function ${exp.name}${generics}(${params})${returns}`;
  }

  /**
   * Build class signature string
   */
  private buildClassSignature(exp: ExtractedDoc): string {
    const lines: string[] = [];
    const generics = exp.generics ? `<${exp.generics.join(', ')}>` : '';

    lines.push(`class ${exp.name}${generics} {`);

    if (exp.properties) {
      for (const prop of exp.properties.filter(p => p.visibility === 'public')) {
        lines.push(`  ${prop.name}: ${prop.type};`);
      }
    }

    if (exp.methods) {
      for (const method of exp.methods.filter(m => m.visibility === 'public')) {
        const params = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
        const returns = method.returns ? `: ${method.returns.type}` : '';
        lines.push(`  ${method.name}(${params})${returns};`);
      }
    }

    lines.push('}');
    return lines.join('\n');
  }

  /**
   * Build interface signature string
   */
  private buildInterfaceSignature(exp: ExtractedDoc): string {
    const lines: string[] = [];
    const generics = exp.generics ? `<${exp.generics.join(', ')}>` : '';

    lines.push(`interface ${exp.name}${generics} {`);

    if (exp.properties) {
      for (const prop of exp.properties) {
        const opt = prop.optional ? '?' : '';
        lines.push(`  ${prop.name}${opt}: ${prop.type};`);
      }
    }

    lines.push('}');
    return lines.join('\n');
  }

  /**
   * Send request to NPCPU (mock implementation)
   *
   * In production, this would connect to the actual NPCPU service.
   * For now, it returns a mock response indicating the integration point.
   */
  private async sendRequest(request: NPCPUDocRequest): Promise<NPCPUDocResponse> {
    this.emit('request:start', request);
    this.requestCount++;

    // Mock implementation - in production, this would call NPCPU API
    // The integration point is documented for future NPCPU connection
    try {
      if (!this.config.endpoint) {
        // Return indication that NPCPU integration is available but not configured
        return {
          success: false,
          error: 'NPCPU endpoint not configured',
          tokens: 0,
        };
      }

      // Future implementation would make HTTP request to NPCPU
      // const response = await fetch(this.config.endpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(request),
      // });
      // return await response.json();

      // Mock successful response for testing
      const mockResponse: NPCPUDocResponse = {
        success: true,
        content: this.generateMockContent(request),
        tokens: 100,
      };

      this.totalTokens += mockResponse.tokens;
      this.emit('request:complete', mockResponse);

      return mockResponse;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.emit('request:error', err);
      return {
        success: false,
        error: err.message,
        tokens: 0,
      };
    }
  }

  /**
   * Generate mock content for testing
   */
  private generateMockContent(request: NPCPUDocRequest): string {
    switch (request.feature) {
      case 'doc-synthesis':
        return `${request.context.existingDocs || 'No description'}\n\n[Enhanced by NPCPU doc-synthesis]`;
      case 'code-explanation':
        return `This code implements functionality for ${request.context.packageName}.\n\n[Generated by NPCPU code-explanation]`;
      case 'example-generation':
        return `// Example for ${request.context.packageName}\n// [Generated by NPCPU example-generation]`;
      case 'migration-suggestions':
        return `To migrate, update your code to use the new API.\n\n[Generated by NPCPU migration-suggestions]`;
      default:
        return '';
    }
  }
}

/**
 * Create a configured NPCPU client
 */
export function createNPCPUClient(config?: Partial<NPCPUDocConfig>): NPCPUDocClient {
  return new NPCPUDocClient(config);
}

/**
 * Check if NPCPU is available in the environment
 */
export function isNPCPUAvailable(): boolean {
  // Check for NPCPU environment variables or configuration
  return !!(process.env.NPCPU_ENDPOINT || process.env.NPCPU_API_KEY);
}

/**
 * Get NPCPU configuration from environment
 */
export function getNPCPUConfigFromEnv(): Partial<NPCPUDocConfig> {
  return {
    enabled: !!process.env.NPCPU_ENDPOINT,
    endpoint: process.env.NPCPU_ENDPOINT,
    features: (process.env.NPCPU_FEATURES?.split(',') as NPCPUFeature[]) || ['doc-synthesis'],
    maxTokens: parseInt(process.env.NPCPU_MAX_TOKENS || '4096', 10),
  };
}
