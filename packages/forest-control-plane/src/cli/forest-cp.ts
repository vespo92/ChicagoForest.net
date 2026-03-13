/**
 * @chicago-forest/forest-control-plane - CLI Tool
 *
 * Operator CLI for managing the Forest control plane.
 *
 * Usage:
 *   forest-cp enroll create --name my-router
 *   forest-cp enroll list
 *   forest-cp nodes list
 *   forest-cp nodes get <nodeId>
 *   forest-cp mesh topology
 *   forest-cp mesh health
 *   forest-cp bootstrap list
 *   forest-cp bootstrap add --node-id <id> --host <host> --port <port>
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

const DEFAULT_URL = process.env.FOREST_CP_URL ?? 'http://localhost:8090';

async function request(method: string, path: string, body?: unknown): Promise<unknown> {
  const url = `${DEFAULT_URL}${path}`;
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url, init);
  const data = await response.json();

  if (!response.ok) {
    console.error(`Error ${response.status}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }

  return data;
}

function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

function usage(): void {
  console.log(`
forest-cp - Forest Control Plane CLI

Usage:
  forest-cp enroll create --name <name> [--user <headscale-user>] [--hours <validity>]
  forest-cp enroll list [--status <pending|claimed|expired|revoked>]
  forest-cp enroll get <token>
  forest-cp enroll revoke <token>

  forest-cp nodes list [--status <active|offline|degraded>]
  forest-cp nodes get <nodeId>
  forest-cp nodes delete <nodeId>

  forest-cp mesh topology
  forest-cp mesh health

  forest-cp bootstrap list
  forest-cp bootstrap add --node-id <id> --host <host> --port <port> [--protocol <udp|tcp>]
  forest-cp bootstrap remove <nodeId>

Environment:
  FOREST_CP_URL  Control plane URL (default: http://localhost:8090)
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    usage();
    return;
  }

  const [resource, action, ...rest] = args;

  function getFlag(flag: string): string | undefined {
    const idx = rest.indexOf(flag);
    return idx >= 0 && idx + 1 < rest.length ? rest[idx + 1] : undefined;
  }

  switch (resource) {
    case 'enroll': {
      switch (action) {
        case 'create': {
          const name = getFlag('--name');
          if (!name) { console.error('--name is required'); process.exit(1); }
          const result = await request('POST', '/api/v1/enroll', {
            nodeName: name,
            headscaleUser: getFlag('--user'),
            validityHours: getFlag('--hours') ? parseInt(getFlag('--hours')!, 10) : undefined,
          });
          printJson(result);
          break;
        }
        case 'list': {
          const status = getFlag('--status');
          const qs = status ? `?status=${status}` : '';
          printJson(await request('GET', `/api/v1/enroll${qs}`));
          break;
        }
        case 'get': {
          if (!rest[0]) { console.error('Token required'); process.exit(1); }
          printJson(await request('GET', `/api/v1/enroll/${rest[0]}`));
          break;
        }
        case 'revoke': {
          if (!rest[0]) { console.error('Token required'); process.exit(1); }
          printJson(await request('DELETE', `/api/v1/enroll/${rest[0]}`));
          break;
        }
        default:
          console.error(`Unknown enroll action: ${action}`);
          usage();
      }
      break;
    }

    case 'nodes': {
      switch (action) {
        case 'list': {
          const status = getFlag('--status');
          const qs = status ? `?status=${status}` : '';
          printJson(await request('GET', `/api/v1/nodes${qs}`));
          break;
        }
        case 'get': {
          if (!rest[0]) { console.error('Node ID required'); process.exit(1); }
          printJson(await request('GET', `/api/v1/nodes/${rest[0]}`));
          break;
        }
        case 'delete': {
          if (!rest[0]) { console.error('Node ID required'); process.exit(1); }
          printJson(await request('DELETE', `/api/v1/nodes/${rest[0]}`));
          break;
        }
        default:
          console.error(`Unknown nodes action: ${action}`);
          usage();
      }
      break;
    }

    case 'mesh': {
      switch (action) {
        case 'topology':
          printJson(await request('GET', '/api/v1/mesh/topology'));
          break;
        case 'health':
          printJson(await request('GET', '/api/v1/mesh/health'));
          break;
        default:
          console.error(`Unknown mesh action: ${action}`);
          usage();
      }
      break;
    }

    case 'bootstrap': {
      switch (action) {
        case 'list':
          printJson(await request('GET', '/api/v1/bootstrap'));
          break;
        case 'add': {
          const nodeId = getFlag('--node-id');
          const host = getFlag('--host');
          const port = getFlag('--port');
          if (!nodeId || !host || !port) {
            console.error('--node-id, --host, and --port are required');
            process.exit(1);
          }
          printJson(await request('POST', '/api/v1/bootstrap', {
            nodeId,
            addresses: [{
              protocol: getFlag('--protocol') ?? 'udp',
              host,
              port: parseInt(port, 10),
            }],
          }));
          break;
        }
        case 'remove': {
          if (!rest[0]) { console.error('Node ID required'); process.exit(1); }
          printJson(await request('DELETE', `/api/v1/bootstrap/${rest[0]}`));
          break;
        }
        default:
          console.error(`Unknown bootstrap action: ${action}`);
          usage();
      }
      break;
    }

    default:
      console.error(`Unknown resource: ${resource}`);
      usage();
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
