/**
 * Example Code Generator
 *
 * Generate and extract example code for documentation.
 */

import type {
  CodeExample,
  ExampleConfig,
  ExtractedDoc,
  PackageDoc,
} from '../types';

export const DEFAULT_EXAMPLE_CONFIG: ExampleConfig = {
  extractFromJSDoc: true,
  extractFromTests: true,
  validateSyntax: true,
  includeOutput: false,
};

/**
 * Generate examples for a package based on its exports
 */
export function generatePackageExamples(
  pkg: PackageDoc,
  config: Partial<ExampleConfig> = {}
): CodeExample[] {
  const opts = { ...DEFAULT_EXAMPLE_CONFIG, ...config };
  const examples: CodeExample[] = [];

  // Extract examples from JSDoc comments
  if (opts.extractFromJSDoc) {
    for (const exp of pkg.exports) {
      const jsDocExamples = extractJSDocExamples(exp, pkg.name);
      examples.push(...jsDocExamples);
    }
  }

  // Generate basic usage examples for each export type
  for (const exp of pkg.exports) {
    const generated = generateExampleForExport(exp, pkg.name);
    if (generated && !examples.some(e => e.title === generated.title)) {
      examples.push(generated);
    }
  }

  return examples;
}

/**
 * Extract examples from JSDoc @example tags
 */
function extractJSDocExamples(
  exp: ExtractedDoc,
  packageName: string
): CodeExample[] {
  if (!exp.examples || exp.examples.length === 0) {
    return [];
  }

  return exp.examples.map((example, index) => ({
    title: `${exp.name} Example ${index + 1}`,
    description: `Example usage of ${exp.name}`,
    language: 'typescript',
    code: cleanExampleCode(example),
    imports: [`import { ${exp.name} } from '${packageName}';`],
    tags: [exp.type, exp.name],
  }));
}

/**
 * Generate an example for a specific export
 */
function generateExampleForExport(
  exp: ExtractedDoc,
  packageName: string
): CodeExample | null {
  switch (exp.type) {
    case 'function':
      return generateFunctionExample(exp, packageName);
    case 'class':
      return generateClassExample(exp, packageName);
    case 'interface':
      return generateInterfaceExample(exp, packageName);
    case 'type':
      return generateTypeExample(exp, packageName);
    case 'constant':
      return generateConstantExample(exp, packageName);
    default:
      return null;
  }
}

/**
 * Generate example for a function
 */
function generateFunctionExample(
  exp: ExtractedDoc,
  packageName: string
): CodeExample {
  const params = exp.parameters || [];
  const paramValues = params.map(p => generateParamValue(p.type, p.name));
  const paramStr = paramValues.join(', ');

  const lines: string[] = [
    `import { ${exp.name} } from '${packageName}';`,
    '',
  ];

  // Add parameter declarations if needed
  for (let i = 0; i < params.length; i++) {
    if (isComplexType(params[i].type)) {
      lines.push(`const ${params[i].name}: ${params[i].type} = ${paramValues[i]};`);
    }
  }

  if (params.some(p => isComplexType(p.type))) {
    lines.push('');
  }

  // Generate function call
  const callParams = params.map(p => isComplexType(p.type) ? p.name : generateParamValue(p.type, p.name));
  const isAsync = exp.returns?.type.includes('Promise');

  if (isAsync) {
    lines.push(`const result = await ${exp.name}(${callParams.join(', ')});`);
  } else {
    lines.push(`const result = ${exp.name}(${callParams.join(', ')});`);
  }

  lines.push('console.log(result);');

  return {
    title: `Using ${exp.name}`,
    description: exp.description,
    language: 'typescript',
    code: lines.join('\n'),
    imports: [`import { ${exp.name} } from '${packageName}';`],
    tags: ['function', exp.name],
  };
}

/**
 * Generate example for a class
 */
function generateClassExample(
  exp: ExtractedDoc,
  packageName: string
): CodeExample {
  const lines: string[] = [
    `import { ${exp.name} } from '${packageName}';`,
    '',
  ];

  // Find constructor parameters
  const constructor = exp.methods?.find(m => m.name === 'constructor');
  const constructorParams = constructor?.parameters || [];

  // Generate constructor arguments
  const argValues: string[] = [];
  for (const param of constructorParams) {
    if (isComplexType(param.type)) {
      lines.push(`const ${param.name}: ${param.type} = ${generateParamValue(param.type, param.name)};`);
      argValues.push(param.name);
    } else {
      argValues.push(generateParamValue(param.type, param.name));
    }
  }

  if (constructorParams.some(p => isComplexType(p.type))) {
    lines.push('');
  }

  // Instantiate the class
  lines.push(`const instance = new ${exp.name}(${argValues.join(', ')});`);
  lines.push('');

  // Show public method calls
  const publicMethods = exp.methods?.filter(
    m => m.visibility === 'public' && m.name !== 'constructor'
  ) || [];

  if (publicMethods.length > 0) {
    lines.push('// Call methods');
    for (const method of publicMethods.slice(0, 3)) {
      const methodParams = method.parameters.map(p => generateParamValue(p.type, p.name));
      if (method.async) {
        lines.push(`await instance.${method.name}(${methodParams.join(', ')});`);
      } else {
        lines.push(`instance.${method.name}(${methodParams.join(', ')});`);
      }
    }
  }

  // Show property access
  const publicProps = exp.properties?.filter(p => p.visibility === 'public') || [];
  if (publicProps.length > 0) {
    lines.push('');
    lines.push('// Access properties');
    for (const prop of publicProps.slice(0, 3)) {
      lines.push(`console.log(instance.${prop.name});`);
    }
  }

  return {
    title: `Using ${exp.name}`,
    description: exp.description,
    language: 'typescript',
    code: lines.join('\n'),
    imports: [`import { ${exp.name} } from '${packageName}';`],
    tags: ['class', exp.name],
  };
}

/**
 * Generate example for an interface
 */
function generateInterfaceExample(
  exp: ExtractedDoc,
  packageName: string
): CodeExample {
  const lines: string[] = [
    `import type { ${exp.name} } from '${packageName}';`,
    '',
  ];

  lines.push(`const config: ${exp.name} = {`);

  for (const prop of exp.properties || []) {
    const value = generateParamValue(prop.type, prop.name);
    if (prop.optional) {
      lines.push(`  // ${prop.name}?: ${value}, // Optional`);
    } else {
      lines.push(`  ${prop.name}: ${value},`);
    }
  }

  lines.push('};');

  return {
    title: `Creating a ${exp.name}`,
    description: exp.description,
    language: 'typescript',
    code: lines.join('\n'),
    imports: [`import type { ${exp.name} } from '${packageName}';`],
    tags: ['interface', exp.name],
  };
}

/**
 * Generate example for a type alias
 */
function generateTypeExample(
  exp: ExtractedDoc,
  packageName: string
): CodeExample {
  const lines: string[] = [
    `import type { ${exp.name} } from '${packageName}';`,
    '',
    `// ${exp.description}`,
    `const value: ${exp.name} = /* your value */;`,
  ];

  return {
    title: `Using ${exp.name} type`,
    description: exp.description,
    language: 'typescript',
    code: lines.join('\n'),
    imports: [`import type { ${exp.name} } from '${packageName}';`],
    tags: ['type', exp.name],
  };
}

/**
 * Generate example for a constant
 */
function generateConstantExample(
  exp: ExtractedDoc,
  packageName: string
): CodeExample {
  return {
    title: `Using ${exp.name}`,
    description: exp.description,
    language: 'typescript',
    code: `import { ${exp.name} } from '${packageName}';\n\nconsole.log(${exp.name});`,
    imports: [`import { ${exp.name} } from '${packageName}';`],
    tags: ['constant', exp.name],
  };
}

/**
 * Generate a parameter value based on type
 */
function generateParamValue(type: string, name: string): string {
  const lowerType = type.toLowerCase();

  if (lowerType === 'string') return `'example-${name}'`;
  if (lowerType === 'number') return '42';
  if (lowerType === 'boolean') return 'true';
  if (lowerType === 'null') return 'null';
  if (lowerType === 'undefined') return 'undefined';
  if (lowerType.includes('[]') || lowerType.startsWith('array')) return '[]';
  if (lowerType === 'date') return 'new Date()';
  if (lowerType === 'regexp') return '/pattern/';
  if (lowerType.startsWith('map<')) return 'new Map()';
  if (lowerType.startsWith('set<')) return 'new Set()';
  if (lowerType.startsWith('promise<')) return 'Promise.resolve()';
  if (lowerType === 'void') return '';
  if (lowerType === 'any' || lowerType === 'unknown') return '{}';
  if (lowerType.includes('=>') || lowerType.includes('function')) return '() => {}';

  // Union types - pick first option
  if (type.includes('|')) {
    const firstOption = type.split('|')[0].trim();
    return generateParamValue(firstOption, name);
  }

  // Object/interface type
  return '{}';
}

/**
 * Check if a type is complex (requires declaration)
 */
function isComplexType(type: string): boolean {
  const simpleTypes = ['string', 'number', 'boolean', 'null', 'undefined', 'any', 'unknown'];
  const lowerType = type.toLowerCase();
  return !simpleTypes.includes(lowerType) && !type.includes('=>');
}

/**
 * Clean up example code from JSDoc
 */
function cleanExampleCode(code: string): string {
  return code
    .replace(/^```\w*\n?/gm, '')
    .replace(/```$/gm, '')
    .trim();
}

/**
 * Generate a quick start guide with examples
 */
export function generateQuickStart(pkg: PackageDoc): string {
  const lines: string[] = [
    `# Quick Start: ${pkg.name}`,
    '',
    pkg.description,
    '',
    '## Installation',
    '',
    '```bash',
    `pnpm add ${pkg.name}`,
    '```',
    '',
    '## Basic Usage',
    '',
  ];

  // Add examples for main exports
  const mainExports = pkg.exports.filter(e => !e.internal).slice(0, 5);

  for (const exp of mainExports) {
    const example = generateExampleForExport(exp, pkg.name);
    if (example) {
      lines.push(`### ${example.title}`);
      lines.push('');
      if (example.description) {
        lines.push(example.description);
        lines.push('');
      }
      lines.push('```typescript');
      lines.push(example.code);
      lines.push('```');
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Validate example code syntax
 */
export function validateExampleSyntax(example: CodeExample): { valid: boolean; error?: string } {
  try {
    // Basic syntax validation using Function constructor
    // This is a simple check - production would use actual TypeScript compiler
    new Function(example.code.replace(/import\s+.*?from\s+['"][^'"]+['"];?/g, ''));
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown syntax error',
    };
  }
}
