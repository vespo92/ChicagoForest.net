# @chicago-forest/lenr-database

Low Energy Nuclear Reactions (LENR) Scientific Database

## Important Disclaimer

**This package documents REAL scientific research on Low Energy Nuclear Reactions (LENR).** All sources are verified and include DOI links or institutional references where available.

- LENR research is ongoing and not fully understood
- Inclusion in this database does not constitute endorsement of specific claims
- All theoretical extensions are clearly marked as such
- Users should verify claims using original sources

## What is LENR?

Low Energy Nuclear Reactions (LENR), originally called "cold fusion," refers to nuclear reactions that occur at or near room temperature in solid-state materials. Since Fleischmann and Pons' 1989 announcement, over 3,500 peer-reviewed papers have been published on the subject.

Key characteristics of LENR research:
- **Excess heat**: Heat production beyond chemical explanations
- **Nuclear products**: Helium-4, tritium, and transmutation products
- **Low radiation**: Unlike hot fusion, LENR produces minimal harmful radiation
- **Reproducibility challenges**: Results depend heavily on materials science

## Installation

```bash
npm install @chicago-forest/lenr-database
```

## Usage

```typescript
import {
  getAllPapers,
  getAllCompanies,
  getAllPrograms,
  searchPapers,
  getDatabaseStats,
} from '@chicago-forest/lenr-database';

// Get all papers with DOI links
const papersWithDOI = getPapersWithDOI();

// Search for papers
const fleischmannPapers = searchPapers({
  authors: ['Fleischmann'],
  peerReviewedOnly: true,
});

// Get database statistics
const stats = getDatabaseStats();
console.log(`Total papers: ${stats.totalPapers}`);

// Get active companies
const activeCompanies = getActiveCompanies();
```

## Database Contents

### Papers (~40 entries)

Papers are organized by category:

- **Fleischmann-Pons**: Original research and replications
- **NASA Studies**: NASA Glenn and Langley research
- **MIT Colloquium**: Academic and theoretical work
- **Naval Research**: SPAWAR and Navy LENR research
- **Japanese Research**: NEDO-funded work
- **ENEA (Italy)**: Italian government research

All papers include:
- Title, authors, year, journal
- DOI or direct URL
- Abstract and methodology
- Tags for categorization

### Companies (~10 entries)

Active companies include:

| Company | Country | Technology |
|---------|---------|------------|
| Brillouin Energy | USA | Controlled Electron Capture Reaction |
| Clean Planet | Japan | Nano-metal hydrogen energy |
| Industrial Heat | USA | Various LENR approaches |

### Government Programs (~15 entries)

Programs from:
- **USA**: DOE reviews, DARPA, Navy SPAWAR
- **Japan**: NEDO, MITI, university programs
- **Italy**: ENEA Frascati
- **India**: BARC
- **China**: Tsinghua University

## Key Sources

All data is sourced from verified archives:

| Source | URL | Description |
|--------|-----|-------------|
| LENR-CANR.org | https://lenr-canr.org/ | Primary research archive (3500+ papers) |
| DOI.org | https://doi.org/ | DOI link verification |
| NASA NTRS | https://ntrs.nasa.gov/ | NASA technical reports |
| JCMNS | https://www.iscmns.org/CMNS/ | Peer-reviewed LENR journal |

## Verified DOI Links

Key peer-reviewed papers with DOIs:

```
10.1016/0022-0728(89)80006-3  - Original Fleischmann-Pons (1989)
10.1016/0022-0728(90)87006-6  - F-P Calorimetry (1990)
10.1016/0022-0728(91)85080-9  - Miles Helium Correlation
10.1007/s00114-008-0449-x     - SPAWAR Triple Tracks
10.1140/epjc/s2006-02479-8    - Widom-Larsen Theory
10.1143/JJAP.41.4642          - Iwamura Transmutation
```

## API Reference

### Papers

```typescript
getAllPapers(): LENRPaper[]
getPapersWithDOI(): LENRPaper[]
getPapersByMethodology(method: ResearchMethodology): LENRPaper[]
getPeerReviewedPapers(): LENRPaper[]
searchPapers(params: SearchParams): LENRPaper[]
```

### Companies

```typescript
getAllCompanies(): LENRCompany[]
getActiveCompanies(): LENRCompany[]
getCompaniesByCountry(country: string): LENRCompany[]
```

### Government Programs

```typescript
getAllPrograms(): GovernmentProgram[]
getActivePrograms(): GovernmentProgram[]
getProgramsByCountry(country: string): GovernmentProgram[]
```

### Statistics

```typescript
getDatabaseStats(): DatabaseStats
getDOIList(): Array<{ id: string; doi: string; url: string }>
```

## Contributing

Contributions are welcome, especially:

1. **Additional verified sources**: Papers with DOIs or institutional links
2. **Corrections**: Fix any inaccuracies in existing entries
3. **Updates**: Company status changes, new programs

All contributions must include verifiable sources.

## Further Reading

- [LENR-CANR.org](https://lenr-canr.org/) - 3500+ LENR papers
- [Infinite Energy Magazine](https://infinite-energy.com/) - LENR news and research
- [New Energy Times](http://news.newenergytimes.net/) - LENR reporting
- [ISCMNS](https://www.iscmns.org/) - International Society for CMNS

## License

MIT

## Acknowledgments

This database would not be possible without:

- **Jed Rothwell** and LENR-CANR.org for maintaining the largest LENR archive
- **Eugene Mallove** (1947-2004) for founding Infinite Energy magazine
- The researchers who have persevered despite controversy
- The Chicago Plasma Forest Network community

---

*This package is part of the Chicago Plasma Forest Network project, documenting real energy research while envisioning sustainable futures.*
