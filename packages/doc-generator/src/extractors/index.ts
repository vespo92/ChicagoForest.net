/**
 * Documentation Extractors
 *
 * Extract documentation from TypeScript source files.
 */

import type { ExtractedDoc } from '../index';

export interface JSDocComment {
  description: string;
  tags: { name: string; value: string }[];
}

export function parseJSDoc(comment: string): JSDocComment {
  const lines = comment
    .replace(/^\/\*\*/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, '').trim())
    .filter(line => line.length > 0);

  const tags: { name: string; value: string }[] = [];
  const descriptionLines: string[] = [];

  for (const line of lines) {
    const tagMatch = line.match(/^@(\w+)\s*(.*)/);
    if (tagMatch) {
      tags.push({ name: tagMatch[1], value: tagMatch[2] });
    } else if (tags.length === 0) {
      descriptionLines.push(line);
    }
  }

  return {
    description: descriptionLines.join(' '),
    tags,
  };
}

export function extractFunctionDoc(
  name: string,
  content: string,
  jsDoc?: JSDocComment
): ExtractedDoc {
  // Extract parameter types from function signature
  const paramMatch = content.match(/\(([^)]*)\)/);
  const parameters: ExtractedDoc['parameters'] = [];

  if (paramMatch) {
    const paramStr = paramMatch[1];
    const params = paramStr.split(',').filter(p => p.trim());

    for (const param of params) {
      const [paramName, paramType] = param.split(':').map(s => s.trim());
      if (paramName) {
        const paramTag = jsDoc?.tags.find(
          t => t.name === 'param' && t.value.startsWith(paramName)
        );
        parameters.push({
          name: paramName,
          type: paramType || 'unknown',
          description: paramTag?.value.replace(paramName, '').trim(),
        });
      }
    }
  }

  // Extract return type
  const returnMatch = content.match(/\):\s*([^{]+)/);
  const returnTag = jsDoc?.tags.find(t => t.name === 'returns' || t.name === 'return');

  return {
    name,
    type: 'function',
    description: jsDoc?.description || '',
    parameters,
    returns: returnMatch ? {
      type: returnMatch[1].trim(),
      description: returnTag?.value,
    } : undefined,
    examples: jsDoc?.tags.filter(t => t.name === 'example').map(t => t.value),
    deprecated: jsDoc?.tags.some(t => t.name === 'deprecated'),
  };
}

export function extractInterfaceDoc(
  name: string,
  content: string,
  jsDoc?: JSDocComment
): ExtractedDoc {
  return {
    name,
    type: 'interface',
    description: jsDoc?.description || `Interface ${name}`,
    since: jsDoc?.tags.find(t => t.name === 'since')?.value,
    deprecated: jsDoc?.tags.some(t => t.name === 'deprecated'),
  };
}

export function extractClassDoc(
  name: string,
  content: string,
  jsDoc?: JSDocComment
): ExtractedDoc {
  return {
    name,
    type: 'class',
    description: jsDoc?.description || `Class ${name}`,
    examples: jsDoc?.tags.filter(t => t.name === 'example').map(t => t.value),
    since: jsDoc?.tags.find(t => t.name === 'since')?.value,
    deprecated: jsDoc?.tags.some(t => t.name === 'deprecated'),
  };
}

export function extractExports(sourceCode: string): string[] {
  const exports: string[] = [];

  // Match export statements
  const exportPatterns = [
    /export\s+(?:async\s+)?function\s+(\w+)/g,
    /export\s+class\s+(\w+)/g,
    /export\s+interface\s+(\w+)/g,
    /export\s+type\s+(\w+)/g,
    /export\s+const\s+(\w+)/g,
    /export\s+\{\s*([^}]+)\s*\}/g,
  ];

  for (const pattern of exportPatterns) {
    let match;
    while ((match = pattern.exec(sourceCode)) !== null) {
      if (pattern.source.includes('{')) {
        // Handle named exports
        const names = match[1].split(',').map(n => n.trim().split(' ')[0]);
        exports.push(...names);
      } else {
        exports.push(match[1]);
      }
    }
  }

  return [...new Set(exports)];
}
