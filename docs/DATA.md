# City data

`_data/cities.json` holds **indicative editorial estimates**, which are good enough for ranking and for demonstrating the tools. Before you market any figure as authoritative, refresh it from licensed or official sources:

| Field | Suggested source |
|---|---|
| cost, rent | Numbeo API (licensed), Expatistan, national rent reports |
| salary | OECD, national statistics offices, BLS (US), StatCan (CA) |
| safety | Numbeo crime index, national crime statistics |
| health | WHO / OECD health system indicators |
| air | WHO air-quality database, IQAir annual report |
| mbps | Ookla Speedtest Global Index |
| climate/temp | NOAA / national met offices |

**To add a city:** add an object to `_data/cities.json` with the same fields as the others: raw scores, the derived `afford`/`internet`/`monthly`/`score`/`rank`, the `g` letter grades, `budget`, `similar` and so on. Then create `places/<slug>.html` by copying any existing stub and changing `slug`, `title`, `description` and `crumbs`. City pages, rankings, compare, the quiz, the tools and the sitemap pick it up automatically.

**Scoring formula:** `affordability` = 50% absolute cheapness (100 − (monthly − 800)/60) + 50% local purchasing power (salary ÷ monthly × 50), each clamped to 5–100. `internet` = 30 + 8·log2(Mbps). `LiveScore` = 16% safety + 14% health + 16% affordability + 12% jobs + 9% nature + 9% culture + 8% family + 6% walk + 5% air + 5% internet. Grades: A+ ≥90, A ≥84, A- ≥78, B+ ≥72, B ≥66, B- ≥60, C+ ≥54, C ≥48, C- ≥40, else D.
