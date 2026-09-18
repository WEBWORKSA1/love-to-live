# City data

`src/data/cities.mjs` holds **indicative editorial estimates**, which are good enough for ranking and for demonstrating the tools. Before you market any figure as authoritative, refresh it from licensed or official sources:

| Field | Suggested source |
|---|---|
| cost, rent | Numbeo API (licensed), Expatistan, national rent reports |
| salary | OECD, national statistics offices, BLS (US), StatCan (CA) |
| safety | Numbeo crime index, national crime statistics |
| health | WHO / OECD health system indicators |
| air | WHO air-quality database, IQAir annual report |
| mbps | Ookla Speedtest Global Index |
| climate/temp | NOAA / national met offices |

**To add a city:** append a row to `R` in `src/data/cities.mjs` (the field order is documented at the top of the file), then run `node scripts/build.mjs`. The city page, rankings, JSON, compare, quiz and sitemap all update automatically.
