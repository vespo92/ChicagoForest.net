# @chicago-forest/source-verifier

**Agent 11: Verifier** - Source Verification for Chicago Forest Network

Continuously validates research sources, verifies URLs, DOIs, and patent links for accuracy and accessibility.

## DISCLAIMER

This is part of an **AI-generated theoretical framework**. All source verification is performed against real, documented archives. The Chicago Forest Network is a conceptual project documenting historical free energy research.

## Features

- **URL Availability Checker** - Validates URLs with retry logic and exponential backoff
- **DOI Resolver & Validator** - Verifies Digital Object Identifiers and resolves to publisher
- **Patent Link Verification** - Validates patents via patents.google.com (US, EP, WO, etc.)
- **Archive Accessibility Checker** - Verifies FBI Vault, LENR-CANR, Internet Archive, Tesla Universe
- **Source Freshness Monitoring** - Tracks when sources were last verified, alerts on stale sources
- **Verification Report Generator** - Multiple formats: JSON, Markdown, HTML, CSV
- **CI/CD Integration** - GitHub Actions workflow for automated source checking
- **Broken Link Detection** - Identifies and reports broken or unreachable sources

## Installation

```bash
pnpm add @chicago-forest/source-verifier
```

## Usage

### CLI

```bash
# Verify a single source (auto-detects type)
npx source-verifier verify https://patents.google.com/patent/US645576

# Verify a DOI
npx source-verifier verify 10.1007/s10948-019-05210-z

# Verify a patent
npx source-verifier verify US645576

# Verify sources from a file
npx source-verifier batch sources.txt --format html -o report.html

# Verify all known Tesla patents
npx source-verifier tesla-patents

# Verify FBI Tesla files
npx source-verifier fbi-files

# Verify LENR-CANR documents
npx source-verifier lenr-docs

# CI/CD usage with failure threshold
npx source-verifier tesla-patents --fail-on-invalid --min-success-rate 95
```

### Programmatic API

```typescript
import { SourceVerifier } from '@chicago-forest/source-verifier';

const verifier = new SourceVerifier({
  retryAttempts: 3,
  retryDelayMs: 1000,
  concurrency: 5,
  maxAgeDays: 30,
});

// Verify a single source
const result = await verifier.verify('US645576');
console.log(result.isValid, result.type); // true, 'patent'

// Verify multiple sources
const results = await verifier.verifyBatch([
  'US645576',
  '10.1007/s10948-019-05210-z',
  'https://vault.fbi.gov/nikola-tesla',
]);

// Generate a report
const { report, formatted } = await verifier.verifyAndReport(sources, 'markdown');
console.log(formatted);

// Verify Tesla patents
const teslaResults = await verifier.verifyTeslaPatents();

// Subscribe to alerts
verifier.onAlert((alert) => {
  console.log('Alert:', alert.message);
});
```

### Individual Checkers

```typescript
import {
  UrlChecker,
  DoiChecker,
  PatentChecker,
  ArchiveChecker,
} from '@chicago-forest/source-verifier/checkers';

// URL Checker
const urlChecker = new UrlChecker();
const urlResult = await urlChecker.check('https://example.com');

// DOI Checker
const doiChecker = new DoiChecker();
const doiResult = await doiChecker.check('10.1007/s10948-019-05210-z');

// Patent Checker
const patentChecker = new PatentChecker();
const patentResult = await patentChecker.check('US645576');
console.log(patentResult.title); // 'System of Transmission of Electrical Energy'

// Archive Checker
const archiveChecker = new ArchiveChecker();
const archiveResult = await archiveChecker.check('https://vault.fbi.gov/nikola-tesla');
```

### Validators (Format Only)

```typescript
import {
  validateUrl,
  validateDOI,
  validatePatentNumber,
  validateArchiveUrl,
  validateSource,
} from '@chicago-forest/source-verifier/validators';

// Validate URL format
const urlValidation = validateUrl('https://example.com');
console.log(urlValidation.isValid, urlValidation.warnings);

// Validate DOI format
const doiValidation = validateDOI('10.1007/s10948-019-05210-z');
console.log(doiValidation.isValid);

// Validate patent number
const patentValidation = validatePatentNumber('US645576');
console.log(patentValidation.isValid, patentValidation.jurisdiction);
```

### Report Generation

```typescript
import { ReportGenerator } from '@chicago-forest/source-verifier/reporters';

const generator = new ReportGenerator();
const report = generator.generate(results);

// Multiple formats
console.log(generator.toMarkdown(report));
console.log(generator.toHtml(report));
console.log(generator.toJson(report));
console.log(generator.toCsv(report));
```

### Freshness Monitoring

```typescript
import { FreshnessMonitor } from '@chicago-forest/source-verifier/monitoring';

const monitor = new FreshnessMonitor({
  maxAgeDays: 30,
  checkIntervalHours: 24,
  alertOnStale: true,
});

// Register sources
monitor.registerSource({ url: 'https://example.com', type: 'url' });

// Update with verification results
monitor.updateSource(result);

// Get stale sources
const staleSources = monitor.getStaleSources();

// Generate freshness report
const freshnessReport = monitor.generateReport();
```

## Supported Source Types

### URLs
Any HTTP/HTTPS URL. Trusted domains include:
- patents.google.com
- doi.org
- archive.org
- lenr-canr.org
- vault.fbi.gov
- teslauniverse.com
- nasa.gov
- arxiv.org

### DOIs
Digital Object Identifiers in format `10.xxxx/suffix`:
- Supports doi.org and dx.doi.org URLs
- Identifies publishers: Nature, Springer, Elsevier, IEEE, etc.

### Patents
Patent numbers from multiple jurisdictions:
- **US**: US645576, US10234567A
- **EP**: EP1234567
- **WO**: WO2020123456
- **GB**: GB1234567
- **DE**: DE102020123456

### Archives
Known archive sites:
- FBI Vault (vault.fbi.gov)
- LENR-CANR Library (lenr-canr.org)
- Internet Archive (archive.org)
- Wayback Machine (web.archive.org)
- Tesla Universe (teslauniverse.com)
- OSTI (osti.gov)

## CI/CD Integration

The package includes a GitHub Actions workflow (`.github/workflows/verify-sources.yml`) that:

1. Runs on push/PR to main branch
2. Runs weekly (Sundays at midnight UTC)
3. Verifies all research sources
4. Generates verification reports
5. Creates GitHub issues on failures

## Known Tesla Patents

The verifier includes metadata for known Tesla patents:
- US645576 - System of Transmission of Electrical Energy
- US787412 - Art of Transmitting Electrical Energy
- US685957 - Apparatus for the Utilization of Radiant Energy
- US685958 - Method of Utilizing Radiant Energy
- US512340 - Coil for Electro-Magnets
- US593138 - Electrical Transformer
- And more...

## API Reference

### SourceVerifier

Main class for source verification.

| Method | Description |
|--------|-------------|
| `verify(source)` | Verify any source (auto-detects type) |
| `verifyUrl(url)` | Verify a URL |
| `verifyDOI(doi)` | Verify a DOI |
| `verifyPatent(patent)` | Verify a patent |
| `verifyArchive(url)` | Verify an archive URL |
| `verifyBatch(sources)` | Verify multiple sources |
| `verifyAndReport(sources, format)` | Verify and generate report |
| `verifyTeslaPatents()` | Verify all known Tesla patents |
| `verifyFbiTeslaFiles()` | Verify FBI vault Tesla files |
| `verifyLenrCanrDocuments()` | Verify LENR-CANR documents |
| `getStaleSources()` | Get sources needing re-verification |
| `getFailingSources()` | Get currently failing sources |
| `getStatistics()` | Get verification statistics |
| `onAlert(callback)` | Subscribe to alerts |

### Options

```typescript
interface VerificationOptions {
  retryAttempts?: number;    // Default: 3
  retryDelayMs?: number;     // Default: 1000
  timeoutMs?: number;        // Default: 30000
  concurrency?: number;      // Default: 5
  checkFreshness?: boolean;  // Default: true
  maxAgeDays?: number;       // Default: 30
  validateContent?: boolean; // Default: false
  followRedirects?: boolean; // Default: true
}
```

## License

MIT

---

*Chicago Forest Network - Agent 11: Verifier*
*Preserving and verifying historical free energy research*
