/**
 * Geohash Implementation for IPV7 Proximity Routing
 *
 * Geohash encodes geographic coordinates into a string that enables
 * proximity-based routing - nodes with similar geohashes are physically close.
 */
/**
 * Encode latitude/longitude into a geohash string
 */
export declare function encode(latitude: number, longitude: number, precision?: number): string;
/**
 * Decode a geohash string back to latitude/longitude
 */
export declare function decode(geohash: string): {
    latitude: number;
    longitude: number;
    error: {
        latitude: number;
        longitude: number;
    };
};
/**
 * Get all 8 neighboring geohashes
 */
export declare function neighbors(geohash: string): string[];
/**
 * Calculate approximate distance between two geohashes in kilometers
 */
export declare function distance(geohash1: string, geohash2: string): number;
/**
 * Get the common prefix length between two geohashes
 * Longer prefix = closer proximity
 */
export declare function commonPrefixLength(geohash1: string, geohash2: string): number;
/**
 * Check if geohash2 is within the area of geohash1
 */
export declare function contains(geohash1: string, geohash2: string): boolean;
//# sourceMappingURL=geohash.d.ts.map