# Official course map - Entity Resolution & Master Data

Six sessions, 45 minutes each. Running artifact: **Meridian**, two CRMs and a support system
merged into one customer master. **63 records, 32 real people, 35 true pairs, 1,953 possible
pairs.** Those four figures are computed by the widget at load, never hardcoded downstream.

Research pass completed 2026-09-04. **Every source below carries its verification tier**, because
this subject has an unusually wide gap between what is peer-reviewed and what is vendor
vocabulary. Master data management in particular has no academic canon, and the course says so
on the page rather than implying rigour it does not have.

## Verification tiers used throughout

| Tier | Meaning |
|------|---------|
| **PRIMARY** | Fetched and read from the authoritative source. Quote counts, dates and wording precisely. |
| **SECONDARY** | Real work whose primary was not fetched this pass. Cite it and say the wording travels through a secondary. |
| **NO CANON** | Widely used vocabulary or framework with no traceable primary. Teach the substance, name the provenance honestly, never dress it as peer-reviewed. |

## Coverage by session

Legend: ✓ taught in full · ◐ named and partially taught, full depth elsewhere

### Session 1 - No shared key
| Source | Tier | Cover |
|---|---|---|
| Newcombe, Kennedy, Axford, James, "Automatic Linkage of Vital Records", Science 130(3381), 16 Oct 1959, 954-959. DOI 10.1126/science.130.3381.954 | PRIMARY | ✓ the origin of the probabilistic approach, and why the first application was vital statistics |
| The five-stage pipeline and the quadratic pair count | standard | ✓ structure common to every current tool; the arithmetic is computed, not cited |
| Fellegi and Sunter 1969 | PRIMARY | ◐ named as the formalisation of Newcombe; taught in full in session 3 |
| Active learning for label selection, as `dedupe` does it | SECONDARY | ◐ the label-the-uncertain-pairs instinct; the library itself is session 6 |

### Session 2 - Comparing strings honestly
| Source | Tier | Cover |
|---|---|---|
| Levenshtein 1965/66, Soviet Physics Doklady | PRIMARY | ✓ insert, delete, substitute; a transposition costs 2 |
| Damerau 1964, CACM | PRIMARY | ✓ transposition at cost 1 |
| Jaro 1989 | PRIMARY | ✓ window matching and transposition counting |
| Winkler 1990 | PRIMARY | ✓ JW = Jaro + L·P·(1-Jaro), **L capped at 4, P default 0.1**, and why P above 0.25 breaks the bound. Failure case: the difference at the start of the string, so Katherine against Catherine gets no boost |
| Jaccard 1901 | PRIMARY | ✓ token sets, order-free; failure case is partial similarity inside a token |
| Cosine on TF-IDF (Salton) | standard | ✓ down-weights Ltd and Inc; needs a corpus |
| Soundex: Odell and Russell, US patents 1,261,167 (1918) and 1,435,663 (1922) | PRIMARY (patent numbers) | ✓ the algorithm and its 4-character collapse |
| Metaphone, Philips 1990, Computer Language | PRIMARY | ✓ one code per string |
| Double Metaphone, Philips 2000, C/C++ Users Journal 18, 38-43, ACM 10.5555/349124.349132 | PRIMARY | ✓ primary plus secondary code |
| NYSIIS, Taft 1970, NY State Identification and Intelligence System, Albany | SECONDARY | ✓ taught with the caveat that the report was not fetched, so the ~2.7% claim is second-hand |

### Session 3 - Fellegi-Sunter, and the band nobody implements
| Source | Tier | Cover |
|---|---|---|
| Fellegi and Sunter, "A Theory for Record Linkage", JASA 64(328), 1969, 1183-1210. DOI 10.1080/01621459.1969.10501049 | PRIMARY | ✓ m and u probabilities; agreement weight log2(m/u) and disagreement log2((1-m)/(1-u)); **the three-way decision with its clerical review region**, and the theorem that it minimises review volume for chosen error bounds |
| The log2 formulation with a prior-odds term, as Splink documents it | PRIMARY | ✓ the -5.7 prior for Meridian is computed from 35 true pairs in 1,953 |
| Expectation maximisation for estimating m and u unlabelled | SECONDARY | ◐ named as Splink's default; the algorithm is not derived |
| Term-frequency adjustment on name fields | SECONDARY | ◐ introduced as the better treatment of u for common surnames |

### Session 4 - Blocking
| Source | Tier | Cover |
|---|---|---|
| Christen, "Quality and Complexity Measures for Data Linkage and Deduplication" | PRIMARY | ✓ **pair completeness, reduction ratio, pairs quality**, and the PC/RR trade-off |
| Standard blocking | practice | ✓ taught without a citation, because there is not one |
| Sorted neighbourhood, Hernandez and Stolfo, SIGMOD 1995 | SECONDARY | ✓ taught with the not-fetched caveat stated |
| Canopy clustering, McCallum, Nigam, Ungar, KDD 2000, 169-178 | PRIMARY | ✓ cheap approximate distance forms overlapping canopies; >10x speedup, ~25% error reduction reported |
| LSH and MinHash, Broder, SEQUENCES 1997 | SECONDARY | ✓ taught with the not-fetched caveat stated |

### Session 5 - Judging it
| Source | Tier | Cover |
|---|---|---|
| Pairwise precision, recall, F1 | standard | ✓ IR practice applied to pair classification |
| The class-imbalance argument | computed | ✓ 35 of 1,953 pairs match, so "no match" everywhere scores about 98.2% accuracy and finds nothing |
| B-cubed precision and recall, Bagga and Baldwin 1998 | SECONDARY | ✓ named as the cluster-level measure, with the caveat |
| "(Almost) All of Entity Resolution", arXiv:2008.04443 | SECONDARY | ◐ cited as a survey |
| Correlation clustering, Bansal, Blum, Chawla, Machine Learning 56 (2004) 89-113. DOI 10.1023/B:MACH.0000033116.57574.95 | PRIMARY (bib) | ✓ the formal objective ER clustering should target; NP-hard |
| Markov clustering, van Dongen, Utrecht thesis 2000 | PRIMARY for the algorithm, SECONDARY as an ER application | ◐ mentioned |
| Connected components and the chaining problem | consensus | ✓ pairwise match is not transitive, so closure over-merges |

### Session 6 - Master data, and the linkage you should not make
| Source | Tier | Cover |
|---|---|---|
| "Golden record" | **NO CANON** | ✓ taught with the provenance stated: industry-common, no traceable originating citation |
| Survivorship rules (source-priority, most-recent, most-complete, most-trusted) | **NO CANON** | ✓ taught properly as useful practice, labelled vendor-consensus vocabulary |
| The four implementation styles - Registry, Consolidation, Coexistence, Centralized | **NO CANON** | ✓ attributed to Gartner across five independent vendor sources, with **no primary Gartner note obtainable (paywalled)**. Presented as an analyst framework |
| DAMA-DMBOK 2nd ed., Reference and Master Data as one knowledge area | SECONDARY | ✓ structure cited; **the DMBOK text is paid and was not fetched** |
| Splink (UK Ministry of Justice) - MIT, Splink 4 current, UK Civil Service Award 2025 | PRIMARY (repo + docs) | ✓ recommended; it implements what session 3 teaches |
| `dedupe` (Gregg, Eder) - MIT, active learning | SECONDARY | ✓ taught with the caveat that **current maintenance could not be confirmed**, copyright seen only to 2022 |
| Python Record Linkage Toolkit (`recordlinkage`, de Bruin) - BSD-3 | SECONDARY | ✓ indexing, comparison, classifiers including ECM |
| Zingg - **AGPL-3.0, copyleft with real commercial implications**, v0.6.0 Apr 2026 | SECONDARY | ✓ the licence point made explicitly |
| Febrl (Christen, Churches, ANU) - **not maintained** | SECONDARY | ✓ taught as the source of the canonical benchmarks: Febrl1 1,000 records/500 pairs, Febrl3 5,000, Febrl4 10,000 split 4a/4b |
| DBLP-ACM, Amazon-Google (Magellan / deepmatcher) | SECONDARY | ◐ named as standard benchmarks |
| Schnell, Bachteler, Reiher, "Privacy-preserving record linkage using Bloom filters", BMC Med Inform Decis Mak 9:41 (2009). DOI 10.1186/1472-6947-9-41 | PRIMARY | ✓ q-grams hashed into bit arrays, Dice similarity on bit vectors, quality comparable to unencrypted identifiers |
| Kuzu, Kantarcioglu, Durham, Malin, PETS 2011 - frequency-based cryptanalysis of Bloom-filter PPRL | SECONDARY | ✓ taught as a real, actively studied attack surface. PPRL is risk-managed, not solved |
| GDPR identifiability and purpose limitation applied to linkage | reasoned, SECONDARY | ✓ **no GDPR clause names record linkage**; this is a reasoned application, corroborated via a cohort-linkage scoping review. Recital 71 covers profiling, which is adjacent not identical |

## Not covered, by design

- **PDPA and other non-GDPR regimes.** Not researched this pass. Session 6 says so explicitly
  rather than guessing, which matters because Phoebe's audience is partly Singapore-based.
- **Deep learning for entity matching** (deepmatcher, Ditto and the transformer-based line).
  Named only as the source of standard benchmarks. The Fellegi-Sunter model is what the good
  production tools implement and is what a practitioner needs first.
- **Deterministic key design, grain and constraints.** Owned by `learn-data-modeling`, which
  teaches the keys that DO exist. This course is deliberately the other half: what you do when
  there is no shared key at all. Session 1 states that split.
- **Tool-specific implementation walkthroughs.** No Splink API tutorial. The model is
  tool-independent on purpose, and session 6 points at Splink for the implementation.
- **Identity stitching for marketing attribution.** Mentioned once by
  `learn-marketing-attribution`; not restated here.

## The measured numbers, and which one is modelled

The bench renders Meridian into the page and every check runs against the labels.

- **Dataset:** 63 records, 32 entities, 35 true pairs, 1,953 pairs. True pairs are 1.8%.
- **The central result:** two pairs score an identical weight of **0.84** - Sarah Whitfield
  against Sarah Whitfield (the same person, job change and move) and James Whitmore against
  James Whitmore (a father and son on one landline). One cut high: 100% precision, 94% recall,
  F1 0.971. One cut low: 97%, 97%, F1 0.971. A band from 0.5 to 4.0: 100%, 94%, F1 0.971 with
  **2 pairs to a human**, and a human resolves both, reaching 100% on both measures.
- **Email only:** precision 100%, recall 51%, F1 0.679, accuracy 99.1%. 18 of 35 found.
- **Exact name only:** precision 80%, recall 23%, F1 0.356, 2 false matches, accuracy 98.5%.
- **Transitive closure, both directions:** sensible config gives 33 clusters against 32 true
  (under-merges); permissive config gives 28 clusters, 8 false pairs, 81% precision
  (over-merges).
- **Blocking:** none 1,953 candidates / PC 100% / RR 0% / PQ 2%. Postcode 41 / 91% / 98% / 78%.
  Surname soundex 44 / 91% / 98% / 73%. Sorted neighbourhood w5 242 / 91% / 88% / 13%.
  **Every scheme loses 9% of the true pairs permanently.**
- **MODELLED, not measured:** the m and u probability table, which stands in for what
  expectation maximisation would estimate on a real corpus. Labelled as such on the widget.
  Everything computed from it is real arithmetic.

## Re-verification note

Splink and Zingg both move; re-check versions and the Zingg licence before delivery. The 1959,
1969, 1990, 2000 and 2009 sources are stable. The `dedupe` maintenance question should be
re-checked, since it changes whether the course can recommend it.
