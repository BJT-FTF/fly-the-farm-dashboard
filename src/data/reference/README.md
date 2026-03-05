# Chemical Reference Master Folder

This folder contains research data for chemicals and weeds that are candidates
for addition to the curated Fly The Farm database.

## Structure

- `chemicals-to-add.json` — Verified chemicals ready to be added to the database
- `weeds-to-add.json` — Weed species with known drone treatments not yet in DB
- `tank-mixes-to-add.json` — Tank mix recipes researched but not yet in DB
- `research-notes.md` — Ongoing research notes, sources, and verification status

## Process

1. Research goes into research-notes.md first
2. Once verified against labels, data moves to the *-to-add.json files
3. From there it gets added to the live database (chemicals.ts / tankMixes.ts)

## Sources

- APVMA PubCRIS Register (data.gov.au)
- Product labels (via APVMA portal)
- Gold Standard Field Job Card v1.3
- State weed management guides (NSW DPI, QLD DAF, VIC DEECA)
- Manufacturer technical bulletins (Corteva, Nufarm, BASF, Bayer, FMC)
