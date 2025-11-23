/**
 * Tests for documentation extractors
 */

import { describe, it, expect } from 'vitest';
import {
  parseJSDoc,
  extractFunctionDoc,
  extractInterfaceDoc,
  extractClassDoc,
  extractExports,
  extractAllJSDocComments,
} from '../src/extractors';

describe('parseJSDoc', () => {
  it('should parse simple description', () => {
    const comment = `/**
     * This is a description
     */`;

    const result = parseJSDoc(comment);

    expect(result.description).toBe('This is a description');
    expect(result.tags).toHaveLength(0);
  });

  it('should parse description with tags', () => {
    const comment = `/**
     * This is a description
     * @param name The name parameter
     * @returns The result
     */`;

    const result = parseJSDoc(comment);

    expect(result.description).toBe('This is a description');
    expect(result.tags).toHaveLength(2);
    expect(result.tags[0]).toEqual({ name: 'param', value: 'name The name parameter' });
    expect(result.tags[1]).toEqual({ name: 'returns', value: 'The result' });
  });

  it('should parse multiple tags', () => {
    const comment = `/**
     * Function description
     * @param a First param
     * @param b Second param
     * @example usage()
     * @since 1.0.0
     * @deprecated Use newFunction instead
     */`;

    const result = parseJSDoc(comment);

    expect(result.description).toBe('Function description');
    expect(result.tags).toHaveLength(5);
  });

  it('should handle multiline descriptions', () => {
    const comment = `/**
     * First line of description
     * Second line of description
     * Third line
     * @param x A parameter
     */`;

    const result = parseJSDoc(comment);

    expect(result.description).toBe('First line of description Second line of description Third line');
  });
});

describe('extractFunctionDoc', () => {
  it('should extract function with parameters', () => {
    const content = 'function greet(name: string, age: number): string';
    const jsDoc = {
      description: 'Greet a person',
      tags: [
        { name: 'param', value: 'name The person name' },
        { name: 'param', value: 'age The person age' },
        { name: 'returns', value: 'A greeting message' },
      ],
    };

    const result = extractFunctionDoc('greet', content, jsDoc);

    expect(result.name).toBe('greet');
    expect(result.type).toBe('function');
    expect(result.description).toBe('Greet a person');
    expect(result.parameters).toHaveLength(2);
    expect(result.parameters![0].name).toBe('name');
    expect(result.parameters![0].type).toBe('string');
    expect(result.parameters![1].name).toBe('age');
    expect(result.parameters![1].type).toBe('number');
    expect(result.returns?.type).toBe('string');
  });

  it('should handle optional parameters', () => {
    const content = 'function test(required: string, optional?: number): void';
    const jsDoc = { description: 'Test function', tags: [] };

    const result = extractFunctionDoc('test', content, jsDoc);

    expect(result.parameters).toHaveLength(2);
    expect(result.parameters![0].optional).toBe(false);
    expect(result.parameters![1].optional).toBe(true);
  });

  it('should handle functions with no return type', () => {
    const content = 'function doSomething(x: number)';

    const result = extractFunctionDoc('doSomething', content);

    expect(result.name).toBe('doSomething');
    expect(result.returns).toBeUndefined();
  });
});

describe('extractInterfaceDoc', () => {
  it('should extract interface documentation', () => {
    const content = 'interface Config { name: string; value: number; }';
    const jsDoc = {
      description: 'Configuration options',
      tags: [{ name: 'since', value: '1.0.0' }],
    };

    const result = extractInterfaceDoc('Config', content, jsDoc);

    expect(result.name).toBe('Config');
    expect(result.type).toBe('interface');
    expect(result.description).toBe('Configuration options');
    expect(result.since).toBe('1.0.0');
  });

  it('should provide default description', () => {
    const content = 'interface MyInterface {}';

    const result = extractInterfaceDoc('MyInterface', content);

    expect(result.description).toBe('Interface MyInterface');
  });
});

describe('extractClassDoc', () => {
  it('should extract class documentation', () => {
    const content = 'class MyClass { constructor() {} }';
    const jsDoc = {
      description: 'A sample class',
      tags: [
        { name: 'example', value: 'new MyClass()' },
        { name: 'since', value: '2.0.0' },
      ],
    };

    const result = extractClassDoc('MyClass', content, jsDoc);

    expect(result.name).toBe('MyClass');
    expect(result.type).toBe('class');
    expect(result.description).toBe('A sample class');
    expect(result.examples).toContain('new MyClass()');
    expect(result.since).toBe('2.0.0');
  });

  it('should handle deprecated classes', () => {
    const content = 'class OldClass {}';
    const jsDoc = {
      description: 'Old class',
      tags: [{ name: 'deprecated', value: 'Use NewClass instead' }],
    };

    const result = extractClassDoc('OldClass', content, jsDoc);

    expect(result.deprecated).toBe('Use NewClass instead');
  });
});

describe('extractExports', () => {
  it('should extract function exports', () => {
    const code = `
      export function foo() {}
      export async function bar() {}
    `;

    const result = extractExports(code);

    expect(result).toContain('foo');
    expect(result).toContain('bar');
  });

  it('should extract class exports', () => {
    const code = `
      export class MyClass {}
      export class AnotherClass {}
    `;

    const result = extractExports(code);

    expect(result).toContain('MyClass');
    expect(result).toContain('AnotherClass');
  });

  it('should extract interface exports', () => {
    const code = `
      export interface Config {}
      export interface Options {}
    `;

    const result = extractExports(code);

    expect(result).toContain('Config');
    expect(result).toContain('Options');
  });

  it('should extract type exports', () => {
    const code = `
      export type ID = string;
      export type Status = 'active' | 'inactive';
    `;

    const result = extractExports(code);

    expect(result).toContain('ID');
    expect(result).toContain('Status');
  });

  it('should extract const exports', () => {
    const code = `
      export const VERSION = '1.0.0';
      export const DEFAULT_CONFIG = {};
    `;

    const result = extractExports(code);

    expect(result).toContain('VERSION');
    expect(result).toContain('DEFAULT_CONFIG');
  });

  it('should extract named exports', () => {
    const code = `
      export { foo, bar, baz };
      export { hello as world };
    `;

    const result = extractExports(code);

    expect(result).toContain('foo');
    expect(result).toContain('bar');
    expect(result).toContain('baz');
    expect(result).toContain('hello');
  });

  it('should not have duplicates', () => {
    const code = `
      export function test() {}
      export { test };
    `;

    const result = extractExports(code);

    const testCount = result.filter(e => e === 'test').length;
    expect(testCount).toBe(1);
  });
});

describe('extractAllJSDocComments', () => {
  it('should extract all JSDoc comments with positions', () => {
    const code = `
      /**
       * First function
       */
      export function first() {}

      /**
       * Second function
       * @param x A parameter
       */
      export function second(x: number) {}
    `;

    const result = extractAllJSDocComments(code);

    expect(result.size).toBe(2);
  });

  it('should handle code without JSDoc', () => {
    const code = `
      export function noDoc() {}
      // This is a regular comment
      export const value = 42;
    `;

    const result = extractAllJSDocComments(code);

    expect(result.size).toBe(0);
  });
});
