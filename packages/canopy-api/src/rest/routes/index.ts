/**
 * @chicago-forest/canopy-api - REST Routes Index
 *
 * Central export for all REST API route definitions.
 */

export { nodeRoutes, type RouteDefinition } from './nodes';
export { routingRoutes } from './routing';
export { researchRoutes } from './research';
export { governanceRoutes } from './governance';
export { storageRoutes } from './storage';

// Re-export individual handlers for direct use
export * from './nodes';
export * from './routing';
export * from './research';
export * from './governance';
export * from './storage';
