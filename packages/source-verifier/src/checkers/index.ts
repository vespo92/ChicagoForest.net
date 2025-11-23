/**
 * Source Checkers
 *
 * Specialized checkers for different archive and database types.
 */

export interface CheckResult {
  source: string;
  type: 'url' | 'doi' | 'patent' | 'archive';
  isAccessible: boolean;
  isFresh: boolean;
  lastChecked: Date;
  metadata?: Record<string, unknown>;
}

export class DOIChecker {
  private readonly doiResolver = 'https://doi.org/';

  async check(doi: string): Promise<CheckResult> {
    const resolvedUrl = `${this.doiResolver}${doi}`;

    return {
      source: doi,
      type: 'doi',
      isAccessible: true, // Would verify in production
      isFresh: true,
      lastChecked: new Date(),
      metadata: {
        resolvedUrl,
        registrar: this.getRegistrar(doi),
      },
    };
  }

  private getRegistrar(doi: string): string {
    // Extract registrant code from DOI
    const match = doi.match(/^10\.(\d+)\//);
    if (!match) return 'unknown';

    const registrantCodes: Record<string, string> = {
      '1038': 'Nature Publishing',
      '1126': 'Science/AAAS',
      '1103': 'APS Physics',
      '1016': 'Elsevier',
      '1007': 'Springer',
    };

    return registrantCodes[match[1]] || 'Other';
  }
}

export class PatentChecker {
  private readonly patentDatabase = 'https://patents.google.com/patent/';

  async check(patentNumber: string): Promise<CheckResult> {
    const patentUrl = `${this.patentDatabase}${patentNumber}`;

    return {
      source: patentNumber,
      type: 'patent',
      isAccessible: true, // Would verify in production
      isFresh: true,
      lastChecked: new Date(),
      metadata: {
        patentUrl,
        jurisdiction: this.getJurisdiction(patentNumber),
      },
    };
  }

  private getJurisdiction(patent: string): string {
    if (patent.startsWith('US')) return 'United States';
    if (patent.startsWith('EP')) return 'European Patent Office';
    if (patent.startsWith('WO')) return 'WIPO';
    if (patent.startsWith('GB')) return 'United Kingdom';
    return 'Unknown';
  }
}

export class ArchiveChecker {
  private readonly knownArchives = new Map<string, string>([
    ['lenr-canr.org', 'LENR-CANR Library'],
    ['vault.fbi.gov', 'FBI Vault'],
    ['archive.org', 'Internet Archive'],
    ['teslauniverse.com', 'Tesla Universe'],
  ]);

  async check(url: string): Promise<CheckResult> {
    let archiveName = 'Unknown Archive';

    try {
      const parsed = new URL(url);
      for (const [domain, name] of this.knownArchives) {
        if (parsed.hostname.includes(domain)) {
          archiveName = name;
          break;
        }
      }
    } catch {
      // Invalid URL
    }

    return {
      source: url,
      type: 'archive',
      isAccessible: true, // Would verify in production
      isFresh: true,
      lastChecked: new Date(),
      metadata: {
        archiveName,
        isKnownArchive: archiveName !== 'Unknown Archive',
      },
    };
  }
}

export class FreshnessChecker {
  private readonly maxAgeMs: number;

  constructor(maxAgeDays: number = 30) {
    this.maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  }

  isFresh(lastChecked: Date): boolean {
    return Date.now() - lastChecked.getTime() < this.maxAgeMs;
  }

  getNextCheckDate(lastChecked: Date): Date {
    return new Date(lastChecked.getTime() + this.maxAgeMs);
  }
}
