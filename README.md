# Learn Entity Resolution with Phoebe

Six sessions on matching records that share no key: string similarity, the Fellegi-Sunter model and the clerical review band almost every system drops, blocking, honest evaluation, and master data. Built on **Meridian** - 63 labelled records covering 32 real people and 35 true pairs.

**Live:** https://phoebefu6.github.io/learn-entity-resolution-with-phoebe/

- `assets/er-live.js` holds a **real matcher**, not a simulator. Jaro-Winkler (prefix capped at 4, scale 0.1), Levenshtein, Damerau-Levenshtein, Jaro, Jaccard and Soundex are genuine implementations, and every Fellegi-Sunter weight, precision, recall, F1, pair-completeness and cluster count is computed against the labels when you move a control. It also ships a string-metric lab where all seven measures recompute as you type.
- **The finding the course is built around:** two pairs score an identical match weight of **0.84**. One is Sarah Whitfield after a job change and a move; the other is a father and son sharing a household landline. Both single-threshold rules measure **F1 0.971** and neither can do better at any cutoff. A band between two thresholds sends **2 pairs out of 1,953** to a human, which takes the result to 100 percent precision and 100 percent recall. That is Fellegi and Sunter's 1969 argument, measured.
- **Anti-levers, both measured:** matching on email only scores **100 percent precision, 51 percent recall and 99.1 percent accuracy** while missing half the duplicates - which is why this field never reports accuracy. Exact name only scores **80 percent precision at 23 percent recall**, and its false matches are real people who share a name.
- **Blocking is not free:** all four schemes cost **9 percent of the true pairs, permanently**. Measured as pair completeness, reduction ratio and pairs quality.
- **Every source carries its verification tier.** Master data management has no academic canon: "golden record" has no traceable originating citation, "survivorship rules" is vendor vocabulary, and the four implementation styles trace to Gartner through vendor sources with no primary note obtainable. The course says so rather than implying rigour it does not have.
- Full source map: `materials/official-course-map.md`

by Phoebe Fu
