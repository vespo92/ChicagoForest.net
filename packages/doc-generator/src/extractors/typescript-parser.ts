/**
 * TypeScript Parser
 *
 * Extract documentation from TypeScript source files using the TypeScript compiler API.
 */

import * as ts from 'typescript';
import type {
  ExtractedDoc,
  ParameterDoc,
  PropertyDoc,
  MethodDoc,
  ReturnDoc,
  ExportType,
} from '../types';

export interface ParseOptions {
  includePrivate: boolean;
  extractExamples: boolean;
  resolveTypes: boolean;
}

export const DEFAULT_PARSE_OPTIONS: ParseOptions = {
  includePrivate: false,
  extractExamples: true,
  resolveTypes: true,
};

/**
 * Parse a TypeScript source file and extract documentation
 */
export function parseTypeScriptFile(
  filePath: string,
  sourceCode: string,
  options: Partial<ParseOptions> = {}
): ExtractedDoc[] {
  const opts = { ...DEFAULT_PARSE_OPTIONS, ...options };
  const docs: ExtractedDoc[] = [];

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  const visit = (node: ts.Node) => {
    const doc = extractNodeDoc(node, sourceFile, opts, filePath);
    if (doc) {
      docs.push(doc);
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);

  return docs;
}

/**
 * Extract documentation from a single AST node
 */
function extractNodeDoc(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  options: ParseOptions,
  filePath: string
): ExtractedDoc | null {
  // Only process exported declarations
  if (!isExported(node)) {
    return null;
  }

  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const jsDoc = extractJSDoc(node, sourceFile);
  const isInternal = jsDoc.tags.some(t => t.name === 'internal');

  if (isInternal && !options.includePrivate) {
    return null;
  }

  if (ts.isFunctionDeclaration(node) && node.name) {
    return extractFunctionDeclaration(node, jsDoc, filePath, line + 1);
  }

  if (ts.isClassDeclaration(node) && node.name) {
    return extractClassDeclaration(node, sourceFile, jsDoc, options, filePath, line + 1);
  }

  if (ts.isInterfaceDeclaration(node)) {
    return extractInterfaceDeclaration(node, sourceFile, jsDoc, filePath, line + 1);
  }

  if (ts.isTypeAliasDeclaration(node)) {
    return extractTypeAliasDeclaration(node, sourceFile, jsDoc, filePath, line + 1);
  }

  if (ts.isVariableStatement(node)) {
    return extractVariableStatement(node, sourceFile, jsDoc, filePath, line + 1);
  }

  if (ts.isEnumDeclaration(node)) {
    return extractEnumDeclaration(node, sourceFile, jsDoc, filePath, line + 1);
  }

  return null;
}

/**
 * Check if a node is exported
 */
function isExported(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }
  const modifiers = ts.getModifiers(node);
  return modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

/**
 * Extract JSDoc comments from a node
 */
function extractJSDoc(node: ts.Node, sourceFile: ts.SourceFile): ParsedJSDoc {
  const result: ParsedJSDoc = {
    description: '',
    tags: [],
    examples: [],
  };

  const jsDocs = ts.getJSDocCommentsAndTags(node);

  for (const jsDoc of jsDocs) {
    if (ts.isJSDoc(jsDoc)) {
      if (jsDoc.comment) {
        result.description = typeof jsDoc.comment === 'string'
          ? jsDoc.comment
          : jsDoc.comment.map(c => c.text).join('');
      }

      if (jsDoc.tags) {
        for (const tag of jsDoc.tags) {
          const tagName = tag.tagName.text;
          const tagValue = tag.comment
            ? (typeof tag.comment === 'string' ? tag.comment : tag.comment.map(c => c.text).join(''))
            : '';

          if (tagName === 'example') {
            result.examples.push(tagValue);
          } else {
            result.tags.push({ name: tagName, value: tagValue });
          }
        }
      }
    }
  }

  return result;
}

interface ParsedJSDoc {
  description: string;
  tags: Array<{ name: string; value: string }>;
  examples: string[];
}

/**
 * Extract function declaration documentation
 */
function extractFunctionDeclaration(
  node: ts.FunctionDeclaration,
  jsDoc: ParsedJSDoc,
  filePath: string,
  lineNumber: number
): ExtractedDoc {
  const name = node.name?.text ?? 'anonymous';
  const parameters = extractParameters(node.parameters, jsDoc);
  const returns = extractReturnType(node.type, jsDoc);
  const generics = node.typeParameters?.map(tp => tp.name.text);

  return {
    name,
    type: 'function',
    description: jsDoc.description || `Function ${name}`,
    parameters,
    returns,
    generics,
    examples: jsDoc.examples,
    since: jsDoc.tags.find(t => t.name === 'since')?.value,
    deprecated: jsDoc.tags.find(t => t.name === 'deprecated')?.value,
    internal: jsDoc.tags.some(t => t.name === 'internal'),
    filePath,
    lineNumber,
  };
}

/**
 * Extract class declaration documentation
 */
function extractClassDeclaration(
  node: ts.ClassDeclaration,
  sourceFile: ts.SourceFile,
  jsDoc: ParsedJSDoc,
  options: ParseOptions,
  filePath: string,
  lineNumber: number
): ExtractedDoc {
  const name = node.name?.text ?? 'AnonymousClass';
  const properties: PropertyDoc[] = [];
  const methods: MethodDoc[] = [];
  const generics = node.typeParameters?.map(tp => tp.name.text);

  for (const member of node.members) {
    if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
      const visibility = getVisibility(member);
      if (visibility === 'private' && !options.includePrivate) continue;

      const memberJsDoc = extractJSDoc(member, sourceFile);
      properties.push({
        name: member.name.getText(sourceFile),
        type: member.type?.getText(sourceFile) ?? 'unknown',
        description: memberJsDoc.description,
        readonly: hasModifier(member, ts.SyntaxKind.ReadonlyKeyword),
        optional: !!member.questionToken,
        visibility,
      });
    }

    if (ts.isMethodDeclaration(member)) {
      const visibility = getVisibility(member);
      if (visibility === 'private' && !options.includePrivate) continue;

      const memberJsDoc = extractJSDoc(member, sourceFile);
      methods.push({
        name: member.name.getText(sourceFile),
        description: memberJsDoc.description,
        parameters: extractParameters(member.parameters, memberJsDoc),
        returns: extractReturnType(member.type, memberJsDoc),
        visibility,
        static: hasModifier(member, ts.SyntaxKind.StaticKeyword),
        async: hasModifier(member, ts.SyntaxKind.AsyncKeyword),
        examples: memberJsDoc.examples,
        deprecated: memberJsDoc.tags.find(t => t.name === 'deprecated')?.value,
      });
    }

    if (ts.isConstructorDeclaration(member)) {
      const memberJsDoc = extractJSDoc(member, sourceFile);
      methods.push({
        name: 'constructor',
        description: memberJsDoc.description || 'Create a new instance',
        parameters: extractParameters(member.parameters, memberJsDoc),
        visibility: 'public',
        static: false,
        async: false,
        examples: memberJsDoc.examples,
      });
    }
  }

  return {
    name,
    type: 'class',
    description: jsDoc.description || `Class ${name}`,
    properties,
    methods,
    generics,
    examples: jsDoc.examples,
    since: jsDoc.tags.find(t => t.name === 'since')?.value,
    deprecated: jsDoc.tags.find(t => t.name === 'deprecated')?.value,
    internal: jsDoc.tags.some(t => t.name === 'internal'),
    filePath,
    lineNumber,
  };
}

/**
 * Extract interface declaration documentation
 */
function extractInterfaceDeclaration(
  node: ts.InterfaceDeclaration,
  sourceFile: ts.SourceFile,
  jsDoc: ParsedJSDoc,
  filePath: string,
  lineNumber: number
): ExtractedDoc {
  const name = node.name.text;
  const properties: PropertyDoc[] = [];
  const generics = node.typeParameters?.map(tp => tp.name.text);

  for (const member of node.members) {
    if (ts.isPropertySignature(member)) {
      const memberJsDoc = extractJSDoc(member, sourceFile);
      properties.push({
        name: member.name.getText(sourceFile),
        type: member.type?.getText(sourceFile) ?? 'unknown',
        description: memberJsDoc.description,
        readonly: hasModifier(member, ts.SyntaxKind.ReadonlyKeyword),
        optional: !!member.questionToken,
        visibility: 'public',
      });
    }
  }

  return {
    name,
    type: 'interface',
    description: jsDoc.description || `Interface ${name}`,
    properties,
    generics,
    examples: jsDoc.examples,
    since: jsDoc.tags.find(t => t.name === 'since')?.value,
    deprecated: jsDoc.tags.find(t => t.name === 'deprecated')?.value,
    internal: jsDoc.tags.some(t => t.name === 'internal'),
    filePath,
    lineNumber,
  };
}

/**
 * Extract type alias declaration documentation
 */
function extractTypeAliasDeclaration(
  node: ts.TypeAliasDeclaration,
  sourceFile: ts.SourceFile,
  jsDoc: ParsedJSDoc,
  filePath: string,
  lineNumber: number
): ExtractedDoc {
  const name = node.name.text;
  const generics = node.typeParameters?.map(tp => tp.name.text);

  return {
    name,
    type: 'type',
    description: jsDoc.description || `Type ${name}`,
    generics,
    examples: jsDoc.examples,
    since: jsDoc.tags.find(t => t.name === 'since')?.value,
    deprecated: jsDoc.tags.find(t => t.name === 'deprecated')?.value,
    internal: jsDoc.tags.some(t => t.name === 'internal'),
    filePath,
    lineNumber,
  };
}

/**
 * Extract variable statement documentation
 */
function extractVariableStatement(
  node: ts.VariableStatement,
  sourceFile: ts.SourceFile,
  jsDoc: ParsedJSDoc,
  filePath: string,
  lineNumber: number
): ExtractedDoc | null {
  const declaration = node.declarationList.declarations[0];
  if (!declaration || !ts.isIdentifier(declaration.name)) {
    return null;
  }

  const name = declaration.name.text;

  return {
    name,
    type: 'constant',
    description: jsDoc.description || `Constant ${name}`,
    examples: jsDoc.examples,
    since: jsDoc.tags.find(t => t.name === 'since')?.value,
    deprecated: jsDoc.tags.find(t => t.name === 'deprecated')?.value,
    internal: jsDoc.tags.some(t => t.name === 'internal'),
    filePath,
    lineNumber,
  };
}

/**
 * Extract enum declaration documentation
 */
function extractEnumDeclaration(
  node: ts.EnumDeclaration,
  sourceFile: ts.SourceFile,
  jsDoc: ParsedJSDoc,
  filePath: string,
  lineNumber: number
): ExtractedDoc {
  const name = node.name.text;
  const properties: PropertyDoc[] = [];

  for (const member of node.members) {
    const memberJsDoc = extractJSDoc(member, sourceFile);
    properties.push({
      name: member.name.getText(sourceFile),
      type: 'enum member',
      description: memberJsDoc.description,
      readonly: true,
      optional: false,
      visibility: 'public',
    });
  }

  return {
    name,
    type: 'enum',
    description: jsDoc.description || `Enum ${name}`,
    properties,
    examples: jsDoc.examples,
    since: jsDoc.tags.find(t => t.name === 'since')?.value,
    deprecated: jsDoc.tags.find(t => t.name === 'deprecated')?.value,
    internal: jsDoc.tags.some(t => t.name === 'internal'),
    filePath,
    lineNumber,
  };
}

/**
 * Extract parameters from a function
 */
function extractParameters(
  params: ts.NodeArray<ts.ParameterDeclaration>,
  jsDoc: ParsedJSDoc
): ParameterDoc[] {
  return params.map(param => {
    const name = param.name.getText();
    const paramTag = jsDoc.tags.find(
      t => t.name === 'param' && t.value.startsWith(name)
    );

    return {
      name,
      type: param.type?.getText() ?? 'unknown',
      description: paramTag?.value.replace(name, '').trim(),
      optional: !!param.questionToken || !!param.initializer,
      defaultValue: param.initializer?.getText(),
    };
  });
}

/**
 * Extract return type
 */
function extractReturnType(
  typeNode: ts.TypeNode | undefined,
  jsDoc: ParsedJSDoc
): ReturnDoc | undefined {
  if (!typeNode) return undefined;

  const returnsTag = jsDoc.tags.find(t => t.name === 'returns' || t.name === 'return');

  return {
    type: typeNode.getText(),
    description: returnsTag?.value,
  };
}

/**
 * Get member visibility
 */
function getVisibility(
  node: ts.Node
): 'public' | 'protected' | 'private' {
  if (hasModifier(node, ts.SyntaxKind.PrivateKeyword)) return 'private';
  if (hasModifier(node, ts.SyntaxKind.ProtectedKeyword)) return 'protected';
  return 'public';
}

/**
 * Check if node has a specific modifier
 */
function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  if (!ts.canHaveModifiers(node)) return false;
  const modifiers = ts.getModifiers(node);
  return modifiers?.some(m => m.kind === kind) ?? false;
}

/**
 * Parse multiple TypeScript files from a package
 */
export function parsePackage(
  files: Map<string, string>,
  options: Partial<ParseOptions> = {}
): ExtractedDoc[] {
  const allDocs: ExtractedDoc[] = [];

  for (const [filePath, content] of files) {
    const docs = parseTypeScriptFile(filePath, content, options);
    allDocs.push(...docs);
  }

  return allDocs;
}
