/**
 * @chicago-forest/forest-control-plane - SQLite Store
 *
 * Persistence layer using better-sqlite3 for nodes, enrollments,
 * mesh links, and bootstrap peers.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import Database from 'better-sqlite3';
import type {
  ForestNode,
  ForestNodeStatus,
  EnrollmentRecord,
  EnrollmentStatus,
  MeshLink,
  BootstrapPeer,
  HardwareProfile,
  RegisterNodeRequest,
} from '../types';
import type { NodeCapability, PeerAddress } from '@chicago-forest/shared-types';

export class ForestStore {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.init();
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS nodes (
        node_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        capabilities TEXT NOT NULL DEFAULT '[]',
        hardware TEXT NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'pending',
        wg_public_key TEXT NOT NULL,
        headscale_node_id TEXT,
        ip_addresses TEXT NOT NULL DEFAULT '[]',
        location_lat REAL,
        location_lng REAL,
        last_heartbeat TEXT NOT NULL,
        registered_at TEXT NOT NULL,
        mesh_neighbors TEXT NOT NULL DEFAULT '[]',
        metadata TEXT NOT NULL DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        token TEXT PRIMARY KEY,
        node_name TEXT NOT NULL,
        capabilities TEXT NOT NULL DEFAULT '[]',
        headscale_auth_key TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        claimed_by TEXT,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        claimed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS mesh_links (
        source_node_id TEXT NOT NULL,
        target_node_id TEXT NOT NULL,
        quality REAL NOT NULL DEFAULT 1.0,
        last_seen TEXT NOT NULL,
        PRIMARY KEY (source_node_id, target_node_id)
      );

      CREATE TABLE IF NOT EXISTS bootstrap_peers (
        node_id TEXT PRIMARY KEY,
        addresses TEXT NOT NULL DEFAULT '[]',
        last_health_check TEXT NOT NULL,
        healthy INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);
      CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
      CREATE INDEX IF NOT EXISTS idx_mesh_links_source ON mesh_links(source_node_id);
      CREATE INDEX IF NOT EXISTS idx_mesh_links_target ON mesh_links(target_node_id);
    `);
  }

  // ===========================================================================
  // NODES
  // ===========================================================================

  insertNode(req: RegisterNodeRequest): ForestNode {
    const now = new Date().toISOString();
    const node: ForestNode = {
      nodeId: req.nodeId,
      name: req.name,
      capabilities: req.capabilities,
      hardware: req.hardware,
      status: 'active',
      wgPublicKey: req.wgPublicKey,
      headscaleNodeId: req.headscaleNodeId,
      ipAddresses: req.ipAddresses ?? [],
      location: req.location,
      lastHeartbeat: now,
      registeredAt: now,
      meshNeighbors: [],
      metadata: req.metadata ?? {},
    };

    this.db.prepare(`
      INSERT INTO nodes (node_id, name, capabilities, hardware, status, wg_public_key,
        headscale_node_id, ip_addresses, location_lat, location_lng, last_heartbeat,
        registered_at, mesh_neighbors, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      node.nodeId, node.name, JSON.stringify(node.capabilities),
      JSON.stringify(node.hardware), node.status, node.wgPublicKey,
      node.headscaleNodeId ?? null, JSON.stringify(node.ipAddresses),
      node.location?.lat ?? null, node.location?.lng ?? null,
      node.lastHeartbeat, node.registeredAt,
      JSON.stringify(node.meshNeighbors), JSON.stringify(node.metadata),
    );

    return node;
  }

  getNode(nodeId: string): ForestNode | undefined {
    const row = this.db.prepare('SELECT * FROM nodes WHERE node_id = ?').get(nodeId) as NodeRow | undefined;
    return row ? this.rowToNode(row) : undefined;
  }

  listNodes(status?: ForestNodeStatus): ForestNode[] {
    const rows = status
      ? this.db.prepare('SELECT * FROM nodes WHERE status = ? ORDER BY registered_at DESC').all(status) as NodeRow[]
      : this.db.prepare('SELECT * FROM nodes ORDER BY registered_at DESC').all() as NodeRow[];
    return rows.map((r) => this.rowToNode(r));
  }

  updateHeartbeat(nodeId: string, status: ForestNodeStatus, meshNeighbors: string[], metadata?: Record<string, string>): boolean {
    const now = new Date().toISOString();
    const result = this.db.prepare(`
      UPDATE nodes SET status = ?, last_heartbeat = ?, mesh_neighbors = ?,
        metadata = COALESCE(?, metadata)
      WHERE node_id = ?
    `).run(status, now, JSON.stringify(meshNeighbors), metadata ? JSON.stringify(metadata) : null, nodeId);
    return result.changes > 0;
  }

  deleteNode(nodeId: string): boolean {
    const result = this.db.prepare('UPDATE nodes SET status = ? WHERE node_id = ?')
      .run('deregistered', nodeId);
    return result.changes > 0;
  }

  markOfflineNodes(timeoutSec: number): number {
    const cutoff = new Date(Date.now() - timeoutSec * 1000).toISOString();
    const result = this.db.prepare(`
      UPDATE nodes SET status = 'offline'
      WHERE status IN ('active', 'degraded') AND last_heartbeat < ?
    `).run(cutoff);
    return result.changes;
  }

  // ===========================================================================
  // ENROLLMENTS
  // ===========================================================================

  insertEnrollment(record: EnrollmentRecord): void {
    this.db.prepare(`
      INSERT INTO enrollments (token, node_name, capabilities, headscale_auth_key,
        status, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.token, record.nodeName, JSON.stringify(record.capabilities),
      record.headscaleAuthKey, record.status, record.createdAt, record.expiresAt,
    );
  }

  getEnrollment(token: string): EnrollmentRecord | undefined {
    const row = this.db.prepare('SELECT * FROM enrollments WHERE token = ?').get(token) as EnrollmentRow | undefined;
    return row ? this.rowToEnrollment(row) : undefined;
  }

  claimEnrollment(token: string, nodeId: string): boolean {
    const now = new Date().toISOString();
    const result = this.db.prepare(`
      UPDATE enrollments SET status = 'claimed', claimed_by = ?, claimed_at = ?
      WHERE token = ? AND status = 'pending' AND expires_at > ?
    `).run(nodeId, now, token, now);
    return result.changes > 0;
  }

  revokeEnrollment(token: string): boolean {
    const result = this.db.prepare(`
      UPDATE enrollments SET status = 'revoked' WHERE token = ? AND status = 'pending'
    `).run(token);
    return result.changes > 0;
  }

  expireEnrollments(): number {
    const now = new Date().toISOString();
    const result = this.db.prepare(`
      UPDATE enrollments SET status = 'expired'
      WHERE status = 'pending' AND expires_at <= ?
    `).run(now);
    return result.changes;
  }

  listEnrollments(status?: EnrollmentStatus): EnrollmentRecord[] {
    const rows = status
      ? this.db.prepare('SELECT * FROM enrollments WHERE status = ? ORDER BY created_at DESC').all(status) as EnrollmentRow[]
      : this.db.prepare('SELECT * FROM enrollments ORDER BY created_at DESC').all() as EnrollmentRow[];
    return rows.map((r) => this.rowToEnrollment(r));
  }

  // ===========================================================================
  // MESH LINKS
  // ===========================================================================

  upsertMeshLink(link: MeshLink): void {
    this.db.prepare(`
      INSERT INTO mesh_links (source_node_id, target_node_id, quality, last_seen)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(source_node_id, target_node_id)
      DO UPDATE SET quality = excluded.quality, last_seen = excluded.last_seen
    `).run(link.sourceNodeId, link.targetNodeId, link.quality, link.lastSeen);
  }

  getMeshLinks(): MeshLink[] {
    const rows = this.db.prepare('SELECT * FROM mesh_links ORDER BY last_seen DESC').all() as MeshLinkRow[];
    return rows.map((r) => ({
      sourceNodeId: r.source_node_id,
      targetNodeId: r.target_node_id,
      quality: r.quality,
      lastSeen: r.last_seen,
    }));
  }

  pruneStaleLinks(maxAgeSec: number): number {
    const cutoff = new Date(Date.now() - maxAgeSec * 1000).toISOString();
    const result = this.db.prepare('DELETE FROM mesh_links WHERE last_seen < ?').run(cutoff);
    return result.changes;
  }

  // ===========================================================================
  // BOOTSTRAP PEERS
  // ===========================================================================

  upsertBootstrapPeer(peer: BootstrapPeer): void {
    this.db.prepare(`
      INSERT INTO bootstrap_peers (node_id, addresses, last_health_check, healthy)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(node_id)
      DO UPDATE SET addresses = excluded.addresses, last_health_check = excluded.last_health_check,
        healthy = excluded.healthy
    `).run(peer.nodeId, JSON.stringify(peer.addresses), peer.lastHealthCheck, peer.healthy ? 1 : 0);
  }

  getBootstrapPeers(healthyOnly = true): BootstrapPeer[] {
    const query = healthyOnly
      ? 'SELECT * FROM bootstrap_peers WHERE healthy = 1'
      : 'SELECT * FROM bootstrap_peers';
    const rows = this.db.prepare(query).all() as BootstrapPeerRow[];
    return rows.map((r) => ({
      nodeId: r.node_id,
      addresses: JSON.parse(r.addresses) as PeerAddress[],
      lastHealthCheck: r.last_health_check,
      healthy: r.healthy === 1,
    }));
  }

  removeBootstrapPeer(nodeId: string): boolean {
    const result = this.db.prepare('DELETE FROM bootstrap_peers WHERE node_id = ?').run(nodeId);
    return result.changes > 0;
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private rowToNode(row: NodeRow): ForestNode {
    return {
      nodeId: row.node_id,
      name: row.name,
      capabilities: JSON.parse(row.capabilities) as NodeCapability[],
      hardware: JSON.parse(row.hardware) as HardwareProfile,
      status: row.status as ForestNodeStatus,
      wgPublicKey: row.wg_public_key,
      headscaleNodeId: row.headscale_node_id ?? undefined,
      ipAddresses: JSON.parse(row.ip_addresses) as string[],
      location: row.location_lat != null && row.location_lng != null
        ? { lat: row.location_lat, lng: row.location_lng }
        : undefined,
      lastHeartbeat: row.last_heartbeat,
      registeredAt: row.registered_at,
      meshNeighbors: JSON.parse(row.mesh_neighbors) as string[],
      metadata: JSON.parse(row.metadata) as Record<string, string>,
    };
  }

  private rowToEnrollment(row: EnrollmentRow): EnrollmentRecord {
    return {
      token: row.token,
      nodeName: row.node_name,
      capabilities: JSON.parse(row.capabilities) as NodeCapability[],
      headscaleAuthKey: row.headscale_auth_key,
      status: row.status as EnrollmentStatus,
      claimedBy: row.claimed_by ?? undefined,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      claimedAt: row.claimed_at ?? undefined,
    };
  }

  close(): void {
    this.db.close();
  }
}

// ===========================================================================
// ROW TYPES (raw SQLite rows)
// ===========================================================================

interface NodeRow {
  node_id: string;
  name: string;
  capabilities: string;
  hardware: string;
  status: string;
  wg_public_key: string;
  headscale_node_id: string | null;
  ip_addresses: string;
  location_lat: number | null;
  location_lng: number | null;
  last_heartbeat: string;
  registered_at: string;
  mesh_neighbors: string;
  metadata: string;
}

interface EnrollmentRow {
  token: string;
  node_name: string;
  capabilities: string;
  headscale_auth_key: string;
  status: string;
  claimed_by: string | null;
  created_at: string;
  expires_at: string;
  claimed_at: string | null;
}

interface MeshLinkRow {
  source_node_id: string;
  target_node_id: string;
  quality: number;
  last_seen: string;
}

interface BootstrapPeerRow {
  node_id: string;
  addresses: string;
  last_health_check: string;
  healthy: number;
}
