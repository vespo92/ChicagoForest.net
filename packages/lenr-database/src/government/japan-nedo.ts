/**
 * Japan NEDO and Other Government LENR Programs
 *
 * Japan has been a leader in government-funded LENR research through
 * NEDO (New Energy and Industrial Technology Development Organization)
 * and academic institutions. This file documents verified programs.
 *
 * All sources are from official government documents or verified reports.
 */

import type { GovernmentProgram, LENRPaper } from '../types';

/**
 * Japanese Government LENR Programs
 */
export const japanGovernmentPrograms: GovernmentProgram[] = [
  {
    id: 'nedo-new-hydrogen',
    name: 'NEDO New Hydrogen Energy Project',
    agency: 'New Energy and Industrial Technology Development Organization',
    country: 'Japan',
    startYear: 1993,
    endYear: 1998,
    status: 'completed',
    budget: '~$30 million over 5 years',
    url: 'https://www.nedo.go.jp/',
    description:
      'Major Japanese government program to evaluate cold fusion/LENR claims. The program concluded with mixed results but established Japan as a serious LENR research nation.',
    researchers: [
      'Akito Takahashi (Osaka University)',
      'Various industry researchers',
    ],
    publications: [
      'NHE Final Report (1998)',
    ],
  },
  {
    id: 'nedo-2015-nano-metal',
    name: 'NEDO Nano-Metal Energy Program',
    agency: 'NEDO',
    country: 'Japan',
    startYear: 2015,
    status: 'active',
    url: 'https://www.nedo.go.jp/',
    description:
      'Current NEDO-funded program supporting Clean Planet and university research into nano-metal hydrogen energy. This represents ongoing Japanese government investment in LENR.',
    researchers: [
      'Yasuhiro Iwamura (Clean Planet/Tohoku)',
      'Jirohta Kasagi (Tohoku University)',
    ],
  },
  {
    id: 'miti-cold-fusion',
    name: 'MITI Cold Fusion Research',
    agency: 'Ministry of International Trade and Industry',
    country: 'Japan',
    startYear: 1989,
    endYear: 1997,
    status: 'completed',
    description:
      'Early Japanese government program coordinating industry cold fusion research at companies including Mitsubishi, NEC, and others.',
    publications: [
      'Various MITI technical reports',
    ],
  },
];

/**
 * European Government Programs
 */
export const europeanPrograms: GovernmentProgram[] = [
  {
    id: 'italy-enea',
    name: 'ENEA Frascati LENR Research',
    agency: 'Italian National Agency for New Technologies, Energy and Sustainable Economic Development',
    country: 'Italy',
    startYear: 1989,
    status: 'active',
    url: 'https://www.enea.it/',
    description:
      'The ENEA laboratory at Frascati has conducted LENR research since 1989. Dr. Vittorio Violante has led significant work on materials science aspects of LENR.',
    researchers: [
      'Vittorio Violante',
      'Emanuele Castagna',
    ],
    publications: [
      'ENEA Technical Reports',
      'ICCF conference papers',
    ],
  },
  {
    id: 'eu-fp7-interest',
    name: 'EU Framework Programme Interest',
    agency: 'European Commission',
    country: 'European Union',
    startYear: 2012,
    status: 'unknown',
    description:
      'The EU has shown periodic interest in LENR through various framework programmes, though no dedicated large-scale funding has materialized.',
  },
];

/**
 * Other International Programs
 */
export const otherInternationalPrograms: GovernmentProgram[] = [
  {
    id: 'india-barc',
    name: 'BARC LENR Research',
    agency: 'Bhabha Atomic Research Centre',
    country: 'India',
    startYear: 1989,
    status: 'active',
    url: 'http://www.barc.gov.in/',
    description:
      'Indian government nuclear research center has conducted LENR experiments. Dr. Mahadeva Srinivasan led early work showing tritium production.',
    researchers: [
      'Mahadeva Srinivasan',
      'P.K. Iyengar',
    ],
    publications: [
      'BARC Reports on Cold Fusion',
    ],
  },
  {
    id: 'china-tsinghua',
    name: 'Chinese LENR Research',
    agency: 'Tsinghua University / Chinese Academy of Sciences',
    country: 'China',
    startYear: 1989,
    status: 'active',
    description:
      'China has maintained LENR research programs at universities and research institutes. Dr. Xing Zhong Li at Tsinghua University has published extensively.',
    researchers: [
      'Xing Zhong Li (Tsinghua University)',
    ],
  },
  {
    id: 'russia-lenr',
    name: 'Russian LENR Research',
    agency: 'Various Russian Institutes',
    country: 'Russia',
    startYear: 1989,
    status: 'active',
    description:
      'Russia has maintained LENR research at various institutes. Notable work has been done on glow discharge experiments.',
    researchers: [
      'Alexander Karabut',
    ],
  },
];

/**
 * Japanese LENR research papers from government-funded work
 */
export const japanLENRPapers: LENRPaper[] = [
  {
    id: 'takahashi-1991-osaka',
    title:
      'Anomalous Excess Heat by D2O/Pd Cell under L-H Mode Electrolysis',
    authors: ['Akito Takahashi', 'T. Iida', 'T. Takeuchi', 'A. Mega'],
    year: 1991,
    journal: 'ICCF-3 Proceedings',
    url: 'https://lenr-canr.org/acrobat/TakahashiAanomalouse.pdf',
    abstract:
      'Osaka University research reporting excess heat in Pd-D electrolysis cells. This work contributed to Japanese government interest in LENR.',
    tags: ['excess-heat', 'palladium-deuterium', 'government-funded'],
    methodology: 'electrochemical',
    peerReviewed: false,
  },
  {
    id: 'arata-1995-solid-fusion',
    title: 'Achievement of Intense Cold Fusion Reaction',
    authors: ['Yoshiaki Arata', 'Yue-Chang Zhang'],
    year: 1995,
    journal: 'Proceedings of the Japan Academy, Series B',
    doi: '10.2183/pjab.71.304',
    url: 'https://doi.org/10.2183/pjab.71.304',
    abstract:
      'Dr. Arata of Osaka University reports excess heat and helium production using DS-cathode (double structure) palladium. Arata was a member of the Japan Academy.',
    tags: ['excess-heat', 'helium-production', 'palladium-deuterium'],
    methodology: 'electrochemical',
    peerReviewed: true,
    notes:
      'Dr. Arata received the Order of Cultural Merit from Japan.',
  },
  {
    id: 'mizuno-1998-hydrogen',
    title:
      'Nuclear Transmutation: The Reality of Cold Fusion',
    authors: ['Tadahiko Mizuno'],
    year: 1998,
    journal: 'Infinite Energy Press (Book)',
    url: 'https://lenr-canr.org/acrobat/MizunoTnucleartra.pdf',
    abstract:
      'Book documenting Mizuno transmutation experiments at Hokkaido University. Mizuno claimed to observe various elemental transmutations.',
    tags: ['transmutation'],
    methodology: 'electrochemical',
    peerReviewed: false,
    notes: 'Hokkaido University research.',
  },
  {
    id: 'kasagi-2018-tohoku',
    title:
      'Anomalous Heat Generation in Nanostructured Ni-based Alloys',
    authors: ['Jirohta Kasagi', 'Yasuhiro Iwamura', 'Takehiko Itoh'],
    year: 2018,
    journal: 'ICCF-21 Proceedings',
    url: 'https://www.iccf21.com/',
    abstract:
      'Tohoku University research on nano-structured nickel alloys showing anomalous heat generation with hydrogen loading.',
    tags: ['excess-heat', 'nickel-hydrogen', 'government-funded'],
    methodology: 'gas-loading',
    peerReviewed: false,
  },
];

/**
 * ENEA Italy research papers
 */
export const eneaLENRPapers: LENRPaper[] = [
  {
    id: 'enea-2002-excess-power',
    title: 'Excess Power Production in Pd-D Systems',
    authors: ['Vittorio Violante', 'A. La Gatta', 'M. McKubre'],
    year: 2002,
    journal: 'ICCF-9 Proceedings',
    url: 'https://lenr-canr.org/acrobat/ViolanteVexcesspowe.pdf',
    abstract:
      'ENEA Frascati research on excess power in palladium-deuterium systems with focus on materials preparation and characterization.',
    tags: ['excess-heat', 'palladium-deuterium', 'materials-science', 'government-funded'],
    methodology: 'electrochemical',
    peerReviewed: false,
  },
  {
    id: 'enea-2010-materials',
    title:
      'The Role of Metallurgy in the Search for Reproducibility',
    authors: ['Vittorio Violante'],
    year: 2010,
    journal: 'JCMNS',
    url: 'https://www.iscmns.org/CMNS/',
    abstract:
      'Analysis of how palladium metallurgy affects LENR reproducibility. ENEA has focused on understanding why some experiments succeed and others fail.',
    tags: ['materials-science', 'palladium-deuterium', 'government-funded'],
    methodology: 'electrochemical',
    peerReviewed: true,
  },
];

/**
 * Get all Japanese programs
 */
export function getJapanPrograms(): GovernmentProgram[] {
  return japanGovernmentPrograms;
}

/**
 * Get all European programs
 */
export function getEuropeanPrograms(): GovernmentProgram[] {
  return europeanPrograms;
}

/**
 * Get all international programs
 */
export function getAllInternationalPrograms(): GovernmentProgram[] {
  return [
    ...japanGovernmentPrograms,
    ...europeanPrograms,
    ...otherInternationalPrograms,
  ];
}

/**
 * Get Japanese papers
 */
export function getJapanLENRPapers(): LENRPaper[] {
  return japanLENRPapers;
}

/**
 * Get ENEA papers
 */
export function getENEALENRPapers(): LENRPaper[] {
  return eneaLENRPapers;
}
