import { WeedTreatment } from '../types/chemical';
import { getSavedChemicals } from '../services/savedChemicals';

function getAllTreatments(): WeedTreatment[] {
  return [...treatments, ...getSavedChemicals()];
}

const defaultDroneParams = {
  dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)',
  flightHeightM: '2.5–3 m AGL',
  speedMs: '4–6 m/s',
};

// APVMA PubCRIS label search helper
const apvmaLabel = (product: string) =>
  `https://portal.apvma.gov.au/pubcris?p=search&type=all&q=${encodeURIComponent(product)}`;

// Well-known label URLs — manufacturer product pages
const LABEL_URLS: Record<string, string> = {
  'grazon-extra': apvmaLabel('Grazon Extra'),
  'taskforce-745': apvmaLabel('Taskforce'),
  'metsulfuron-600': apvmaLabel('Metsulfuron'),
  'graslan-aerial': apvmaLabel('Graslan'),
  'garlon-600': apvmaLabel('Garlon 600'),
  'roundup-biactive': apvmaLabel('Roundup Biactive'),
  'weedmaster-duo': apvmaLabel('Weedmaster Duo'),
  'hotshot': apvmaLabel('Hotshot'),
};

export const treatments: WeedTreatment[] = [
  {
    id: 'blackberry-grazon-extra-1',
    weed: 'Blackberry',
    brands: 'Grazon Extra (triclopyr+picloram+aminopyralid)',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA)',
    aerialRate: '10 L/ha (Table B)',
    waterLHa: '≥150',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Late spring–early summer, full leaf',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },
  {
    id: 'blackberry-grazon-extra-2',
    weed: 'Blackberry',
    brands: 'Grazon Extra',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label specifies helicopter — drones included under APVMA; use caution)',
    aerialRate: '10 L/ha (helicopter)',
    waterLHa: '≥150',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Late spring–early summer, full leaf',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },
  {
    id: 'madeira-vine-grazon-extra',
    weed: 'Madeira vine',
    brands: 'Grazon Extra',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label specifies helicopter — drones included under APVMA; use caution)',
    aerialRate: '3–5 L/ha (helicopter)',
    waterLHa: '≥150',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Late spring–early summer, full leaf',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },
  {
    id: 'st-johns-wort-grazon-extra',
    weed: "St John's wort",
    brands: 'Grazon Extra',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label specifies helicopter — drones included under APVMA; use caution)',
    aerialRate: '4 L/ha (helicopter)',
    waterLHa: '≥150',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Late spring–early summer, full leaf',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },
  {
    id: 'fireweed-grazon-extra',
    weed: 'Fireweed',
    brands: 'Grazon Extra',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA)',
    aerialRate: 'Table mix (incl. 10 L/ha or helicopter mix)',
    waterLHa: '≥150',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },
  {
    id: 'lantana-grazon-extra',
    weed: 'Lantana',
    brands: 'Grazon Extra',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA)',
    aerialRate: 'Per label table',
    waterLHa: '≥150',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },
  {
    id: 'giant-rats-tail-grass-taskforce',
    weed: "Giant rat's tail grass",
    brands: 'Taskforce 745',
    activeIngredient: 'Flupropanate 745g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA)',
    aerialRate: '2 L/ha',
    waterLHa: '40–80',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–350 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Active growth phase, moist soil',
    adjuvantNotes: 'No surfactant (label); avoid tank mix with surfactants',
    labelUrl: LABEL_URLS['taskforce-745'],
  },
  {
    id: 'serrated-tussock-taskforce',
    weed: 'Serrated tussock',
    brands: 'Taskforce 745',
    activeIngredient: 'Flupropanate 745g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA)',
    aerialRate: '1.5–2 L/ha',
    waterLHa: '35–80',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–350 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'No surfactant (label); avoid tank mix with surfactants',
    labelUrl: LABEL_URLS['taskforce-745'],
  },
  {
    id: 'african-lovegrass-taskforce',
    weed: 'African lovegrass',
    brands: 'Taskforce 745',
    activeIngredient: 'Flupropanate 745g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA)',
    aerialRate: '3 L/ha',
    waterLHa: '40–80',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–350 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Active growth phase, moist soil',
    adjuvantNotes: 'No surfactant (label); avoid tank mix with surfactants',
    labelUrl: LABEL_URLS['taskforce-745'],
  },
  {
    id: 'chilean-needle-grass-taskforce',
    weed: 'Chilean needle grass',
    brands: 'Taskforce 745 (+/- glyphosate)',
    activeIngredient: 'Flupropanate 745g/L (+/- Glyphosate)',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA)',
    aerialRate: '1.5–3 L/ha Taskforce',
    waterLHa: '≥40',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–350 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Active growth phase, moist soil',
    adjuvantNotes: 'No surfactant (label); avoid tank mix with surfactants',
    labelUrl: LABEL_URLS['taskforce-745'],
  },
  {
    id: 'mimosa-pigra-metsulfuron',
    weed: 'Mimosa pigra',
    brands: 'Metsulfuron 600 WG (Associate, etc.)',
    activeIngredient: 'Metsulfuron-methyl 600g/kg',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label specifies helicopter — drones included under APVMA; use caution)',
    aerialRate: 'Per label (helicopter aerial brush rates)',
    waterLHa: '≥60–100',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–375 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'BS1000 at label rate',
    labelUrl: LABEL_URLS['metsulfuron-600'],
  },
  {
    id: 'blackberry-metsulfuron',
    weed: 'Blackberry',
    brands: 'Metsulfuron 600 WG',
    activeIngredient: 'Metsulfuron-methyl 600g/kg',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label specifies helicopter — drones included under APVMA; use caution)',
    aerialRate: 'Per label (helicopter)',
    waterLHa: '≥100',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–375 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Late spring–early summer, full leaf',
    adjuvantNotes: 'BS1000 at label rate',
    labelUrl: LABEL_URLS['metsulfuron-600'],
  },
  {
    id: 'parkinsonia-tebuthiuron',
    weed: 'Parkinsonia',
    brands: 'Graslan Aerial / Valpar / other tebuthiuron pellets',
    activeIngredient: 'Tebuthiuron',
    droneStatus: 'permitted-granular',
    droneStatusNote: 'Permitted via aerial (granular/pellet label)',
    aerialRate: 'kg/ha per label tables',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Per label',
    labelUrl: LABEL_URLS['graslan-aerial'],
  },
  {
    id: 'prickly-acacia-tebuthiuron',
    weed: 'Prickly acacia',
    brands: 'Graslan Aerial / Valpar / other tebuthiuron pellets',
    activeIngredient: 'Tebuthiuron',
    droneStatus: 'permitted-granular',
    droneStatusNote: 'Permitted via aerial (granular/pellet label)',
    aerialRate: 'kg/ha per label tables',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Per label',
    labelUrl: LABEL_URLS['graslan-aerial'],
  },
  {
    id: 'mesquite-tebuthiuron',
    weed: 'Mesquite',
    brands: 'Graslan Aerial / Valpar / other tebuthiuron pellets',
    activeIngredient: 'Tebuthiuron',
    droneStatus: 'permitted-granular',
    droneStatusNote: 'Permitted via aerial (granular/pellet label)',
    aerialRate: 'kg/ha per label tables',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Per label',
    labelUrl: LABEL_URLS['graslan-aerial'],
  },
  {
    id: 'african-boxthorn-tebuthiuron',
    weed: 'African boxthorn',
    brands: 'Graslan Aerial / Valpar / other tebuthiuron pellets',
    activeIngredient: 'Tebuthiuron',
    droneStatus: 'permitted-granular',
    droneStatusNote: 'Permitted via aerial (granular/pellet label)',
    aerialRate: 'kg/ha per label tables',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Per label',
    labelUrl: LABEL_URLS['graslan-aerial'],
  },
  {
    id: 'prickly-apple-tebuthiuron',
    weed: 'Prickly apple regrowth',
    brands: 'Graslan Aerial / Valpar / other tebuthiuron pellets',
    activeIngredient: 'Tebuthiuron',
    droneStatus: 'permitted-granular',
    droneStatusNote: 'Permitted via aerial (granular/pellet label)',
    aerialRate: 'kg/ha per label tables',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Per label',
    labelUrl: LABEL_URLS['graslan-aerial'],
  },
  {
    id: 'water-hyacinth-glyphosate-aquatic',
    weed: 'Water hyacinth',
    brands: 'Glyphosate aquatic (Roundup Biactive / Weedmaster Duo)',
    activeIngredient: 'Glyphosate (aquatic formulation)',
    droneStatus: 'not-permitted-aquatic',
    droneStatusNote: 'Not permitted via drone over water (aquatic labels restrict aerial)',
    aerialRate: '—',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Per label',
    labelUrl: LABEL_URLS['roundup-biactive'],
  },
  {
    id: 'salvinia-glyphosate-aquatic',
    weed: 'Salvinia',
    brands: 'Glyphosate aquatic (Roundup Biactive / Weedmaster Duo)',
    activeIngredient: 'Glyphosate (aquatic formulation)',
    droneStatus: 'not-permitted-aquatic',
    droneStatusNote: 'Not permitted via drone over water (aquatic labels restrict aerial)',
    aerialRate: '—',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Per label',
    labelUrl: LABEL_URLS['roundup-biactive'],
  },
  {
    id: 'cabomba-glyphosate-aquatic',
    weed: 'Cabomba / Hydrilla / Elodea',
    brands: 'Glyphosate aquatic (Roundup Biactive / Weedmaster Duo)',
    activeIngredient: 'Glyphosate (aquatic formulation)',
    droneStatus: 'not-permitted-aquatic',
    droneStatusNote: 'Not permitted via drone over water (aquatic labels restrict aerial)',
    aerialRate: '—',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Per label',
    labelUrl: LABEL_URLS['roundup-biactive'],
  },
  {
    id: 'alligator-weed-glyphosate-aquatic',
    weed: 'Alligator weed',
    brands: 'Glyphosate aquatic (Roundup Biactive / Weedmaster Duo)',
    activeIngredient: 'Glyphosate (aquatic formulation)',
    droneStatus: 'not-permitted-aquatic',
    droneStatusNote: 'Not permitted via drone over water (aquatic labels restrict aerial)',
    aerialRate: '—',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Per label',
    labelUrl: LABEL_URLS['roundup-biactive'],
  },
  {
    id: 'woody-regrowth-fallow-garlon',
    weed: 'General woody regrowth (fallow)',
    brands: 'Garlon 600 (triclopyr 600)',
    activeIngredient: 'Triclopyr 600g/L',
    droneStatus: 'permitted-fallow-only',
    droneStatusNote: 'Aerial permitted in fallow situations only (triclopyr labels) — not for woody foliar',
    aerialRate: 'Per label fallow aerial',
    waterLHa: '≥35',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['garlon-600'],
  },
  {
    id: 'tobacco-tree-grazon-extra',
    weed: 'Tobacco tree',
    brands: 'Grazon Extra (ground)',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'not-permitted',
    droneStatusNote: 'Not permitted via drone application (label has no aerial method)',
    aerialRate: '—',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },
  {
    id: 'calotropis-tebuthiuron',
    weed: 'Calotropis (Rubber bush)',
    brands: 'Garlon 600 / Starane Advanced (ground); Tebuthiuron pellets',
    activeIngredient: 'Triclopyr / Fluroxypyr (ground); Tebuthiuron (aerial)',
    droneStatus: 'permitted-granular',
    droneStatusNote: 'Permitted via aerial (granular/pellet label)',
    aerialRate: 'kg/ha per pellet table',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['graslan-aerial'],
  },
  {
    id: 'blackberry-alt-hotshot-grazon',
    weed: 'Blackberry (alt. brands)',
    brands: 'Hotshot (ground); Grazon Extra',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label specifies helicopter — drones included under APVMA; use caution)',
    aerialRate: '10 L/ha (helicopter)',
    waterLHa: '≥150',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Late spring–early summer, full leaf',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },
  {
    id: 'madeira-vine-alt-hotshot-grazon',
    weed: 'Madeira vine (alt. brands)',
    brands: 'Hotshot (ground); Grazon Extra',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label specifies helicopter — drones included under APVMA; use caution)',
    aerialRate: '3–5 L/ha (helicopter)',
    waterLHa: '≥150',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Late spring–early summer, full leaf',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },
  {
    id: 'gorse-tas-grazon-extra',
    weed: 'Gorse (TAS helicopter)',
    brands: 'Grazon Extra',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label specifies helicopter — drones included under APVMA; use caution)',
    aerialRate: 'Helicopter-only rate (TAS)',
    waterLHa: '≥150',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },
  {
    id: 'camphor-laurel-grazon-extra',
    weed: 'Camphor laurel',
    brands: 'Grazon Extra (ground)',
    activeIngredient: 'Triclopyr + Picloram + Aminopyralid',
    droneStatus: 'not-permitted',
    droneStatusNote: 'Not permitted via drone application (label has no aerial method)',
    aerialRate: '—',
    waterLHa: '—',
    droneParams: null,
    bestTiming: 'Best seasonal window per label',
    adjuvantNotes: 'Penetrant (e.g. Pulse) at label rate',
    labelUrl: LABEL_URLS['grazon-extra'],
  },

  // ── New Priority 1 chemicals ──

  // Glyphosate 450 — fallow/general knockdown
  {
    id: 'fallow-glyphosate-450',
    weed: 'Fallow / general knockdown',
    brands: 'Roundup PowerMAX / Weedmaster DST / Glyphosate 450',
    activeIngredient: 'Glyphosate 450g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA). Many glyphosate labels include aerial directions.',
    aerialRate: '2–6 L/ha (rate varies by target weed and growth stage)',
    waterLHa: '20–80',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–375 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Apply to actively growing weeds with adequate leaf area. Avoid moisture stress.',
    adjuvantNotes: 'Most formulations self-surfactant. Do NOT add extra surfactant unless label directs.',
    labelUrl: apvmaLabel('Glyphosate'),
  },

  // 2,4-D Amine — pasture broadleaf
  {
    id: 'pasture-broadleaf-2-4-d',
    weed: 'Thistles / Paterson\'s curse / capeweed',
    brands: 'Amicide Advance 700 / Surpass 480 / 2,4-D Amine 625',
    activeIngredient: '2,4-D Amine 625–700g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA). CAUTION: High drift risk — Coarse+ droplets mandatory, observe buffer zones.',
    aerialRate: '1.5–3 L/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 350–450 µm) — DRIFT SENSITIVE', flightHeightM: '2–2.5 m AGL', speedMs: '3–5 m/s' },
    bestTiming: 'Apply to actively growing rosette-stage weeds. Spring before bolting for thistles.',
    adjuvantNotes: 'Most amine formulations self-surfactant. Do not add oil-based adjuvants — increases drift.',
    labelUrl: apvmaLabel('2,4-D Amine'),
  },

  // MCPA 750 — pasture broadleaf
  {
    id: 'pasture-broadleaf-mcpa',
    weed: 'Thistles / capeweed / dock / sorrel',
    brands: 'MCPA 750 / Agritone 750',
    activeIngredient: 'MCPA 750g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA). CAUTION: Drift risk — use Coarse+ droplets.',
    aerialRate: '1–2 L/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 350–450 µm) — DRIFT SENSITIVE', flightHeightM: '2–2.5 m AGL', speedMs: '3–5 m/s' },
    bestTiming: 'Apply to actively growing rosette-stage broadleaf weeds. Avoid drought stress.',
    adjuvantNotes: 'Most formulations self-surfactant. Do not add oil-based adjuvants.',
    labelUrl: apvmaLabel('MCPA'),
  },

  // Fluroxypyr 333 — broadleaf selective
  {
    id: 'pasture-broadleaf-fluroxypyr',
    weed: 'Thistles / bindweed / woody seedlings',
    brands: 'Starane Advanced / Comet 333 / Flagship 333',
    activeIngredient: 'Fluroxypyr 333g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial where label includes aerial directions (check specific product label).',
    aerialRate: '0.5–1 L/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Apply when weeds are actively growing. Best on young growth.',
    adjuvantNotes: 'Wetting agent at label rate (e.g. BS1000). Oil adjuvants may improve uptake on waxy leaves.',
    labelUrl: apvmaLabel('Starane'),
  },

  // Dicamba — broadleaf (drift-sensitive)
  {
    id: 'pasture-broadleaf-dicamba',
    weed: 'Thistles / dock / hardheads / bindweed',
    brands: 'Kamba 750 / Dicamba 700',
    activeIngredient: 'Dicamba 700–750g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial. EXTREME CAUTION: Highly volatile — mandatory buffer zones, temp restrictions, Coarse+ droplets.',
    aerialRate: '0.3–0.7 L/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 350–450 µm) — DRIFT CRITICAL', flightHeightM: '2–2.5 m AGL', speedMs: '3–4 m/s' },
    bestTiming: 'Apply when weeds actively growing. DO NOT apply when temp >28°C. Avoid inversions.',
    adjuvantNotes: 'Per label only. Do NOT add extra surfactants or oil — increases volatility and drift.',
    labelUrl: apvmaLabel('Dicamba'),
  },

  // Imazapyr 250 — woody weeds / total veg
  {
    id: 'woody-imazapyr',
    weed: 'Rubber vine / woody weeds / total vegetation',
    brands: 'Arsenal Xpress / OnDuty / Imazapyr 250',
    activeIngredient: 'Imazapyr 250g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial. Non-selective with soil residual — do NOT use near desirable vegetation.',
    aerialRate: '2–4 L/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–350 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Apply to actively growing woody weeds. Soil residual prevents regrowth 12+ months.',
    adjuvantNotes: 'Wetting agent at label rate. Surfactant improves foliar uptake on woody species.',
    labelUrl: apvmaLabel('Imazapyr'),
  },

  // Clopyralid — thistles (Asteraceae specialist)
  {
    id: 'thistles-clopyralid',
    weed: 'Scotch thistle / spear thistle / variegated thistle',
    brands: 'Lontrel 300 / Archer 300 / Clopyralid 300',
    activeIngredient: 'Clopyralid 300g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial where label includes aerial directions. Highly selective — safe in grass.',
    aerialRate: '0.3–0.5 L/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–375 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Rosette to early bolt stage. Excellent residual on Asteraceae family weeds.',
    adjuvantNotes: 'Wetting agent at label rate.',
    labelUrl: apvmaLabel('Clopyralid'),
  },

  // Parthenium — 2,4-D
  {
    id: 'parthenium-2-4-d',
    weed: 'Parthenium weed',
    brands: '2,4-D Amine 625 / Amicide Advance',
    activeIngredient: '2,4-D Amine 625g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA). Parthenium is a Weed of National Significance.',
    aerialRate: '2–3 L/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 350–450 µm)', flightHeightM: '2–2.5 m AGL', speedMs: '3–5 m/s' },
    bestTiming: 'Apply at rosette stage before bolting. Once flowering, efficacy drops significantly.',
    adjuvantNotes: 'Self-surfactant amine formulations. Do not add oils.',
    labelUrl: apvmaLabel('2,4-D Amine'),
  },

  // Parthenium — metsulfuron
  {
    id: 'parthenium-metsulfuron',
    weed: 'Parthenium weed',
    brands: 'Metsulfuron 600 WG / Associate / Brush-Off',
    activeIngredient: 'Metsulfuron-methyl 600g/kg',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA).',
    aerialRate: '5–7 g/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–375 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Rosette to early bolt. Residual suppresses germinating seedlings 3–6 months.',
    adjuvantNotes: 'BS1000 wetting agent at label rate.',
    labelUrl: LABEL_URLS['metsulfuron-600'],
  },

  // Rubber vine — triclopyr
  {
    id: 'rubber-vine-triclopyr',
    weed: 'Rubber vine',
    brands: 'Garlon 600 / Access (triclopyr+picloram)',
    activeIngredient: 'Triclopyr 600g/L (or Triclopyr + Picloram)',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial. Rubber vine is a Weed of National Significance.',
    aerialRate: 'Per aerial label rate',
    waterLHa: '≥100',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Active growth (wet season). Full leaf coverage critical for systemic uptake.',
    adjuvantNotes: 'Pulse Penetrant at 200 mL/100 L — essential for waxy vine leaves.',
    labelUrl: LABEL_URLS['garlon-600'],
  },

  // Rubber vine — imazapyr
  {
    id: 'rubber-vine-imazapyr',
    weed: 'Rubber vine',
    brands: 'Arsenal Xpress / Imazapyr 250',
    activeIngredient: 'Imazapyr 250g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial. Non-selective with long soil residual — keep away from desirable vegetation.',
    aerialRate: '2–3 L/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–350 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Wet season active growth. Soil residual prevents regrowth 12+ months.',
    adjuvantNotes: 'Wetting agent at label rate.',
    labelUrl: apvmaLabel('Imazapyr'),
  },

  // Bellyache bush — triclopyr
  {
    id: 'bellyache-bush-triclopyr',
    weed: 'Bellyache bush',
    brands: 'Garlon 600 / Grazon Extra',
    activeIngredient: 'Triclopyr 600g/L (or Triclopyr + Picloram + Aminopyralid)',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial. Bellyache bush is a Weed of National Significance.',
    aerialRate: 'Per aerial label rate',
    waterLHa: '≥100',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Wet season active growth before seed set.',
    adjuvantNotes: 'Pulse Penetrant at 200 mL/100 L.',
    labelUrl: LABEL_URLS['garlon-600'],
  },

  // Paterson's curse — 2,4-D
  {
    id: 'patersons-curse-2-4-d',
    weed: "Paterson's curse",
    brands: '2,4-D Amine 625 / Amicide Advance',
    activeIngredient: '2,4-D Amine 625g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA). Paterson\'s curse is a WoNS.',
    aerialRate: '2–3 L/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 350–450 µm)', flightHeightM: '2–2.5 m AGL', speedMs: '3–5 m/s' },
    bestTiming: 'Rosette stage before bolting (late autumn–winter). Once flowering, efficacy drops.',
    adjuvantNotes: 'Self-surfactant amine. Do not add oils.',
    labelUrl: apvmaLabel('2,4-D Amine'),
  },

  // Paterson's curse — metsulfuron
  {
    id: 'patersons-curse-metsulfuron',
    weed: "Paterson's curse",
    brands: 'Metsulfuron 600 WG / Associate / Brush-Off',
    activeIngredient: 'Metsulfuron-methyl 600g/kg',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial.',
    aerialRate: '5–7 g/ha',
    waterLHa: '≥50',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–375 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Rosette to early bolt. Residual suppresses germinating seedlings.',
    adjuvantNotes: 'BS1000 wetting agent at label rate.',
    labelUrl: LABEL_URLS['metsulfuron-600'],
  },

  // Giant Parramatta grass — taskforce
  {
    id: 'giant-parramatta-grass-taskforce',
    weed: 'Giant Parramatta grass',
    brands: 'Taskforce 745',
    activeIngredient: 'Flupropanate 745g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA).',
    aerialRate: '2–3 L/ha',
    waterLHa: '40–80',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–350 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Active growth phase with adequate soil moisture.',
    adjuvantNotes: 'NO surfactant — label prohibits. Do not tank mix with surfactants.',
    labelUrl: LABEL_URLS['taskforce-745'],
  },

  // Coolatai grass — taskforce
  {
    id: 'coolatai-grass-taskforce',
    weed: 'Coolatai grass',
    brands: 'Taskforce 745',
    activeIngredient: 'Flupropanate 745g/L',
    droneStatus: 'permitted',
    droneStatusNote: 'Permitted via aerial (drones = aircraft per APVMA).',
    aerialRate: '2–3 L/ha',
    waterLHa: '40–80',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–350 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Active growth with good soil moisture. Spring–summer.',
    adjuvantNotes: 'NO surfactant — label prohibits.',
    labelUrl: LABEL_URLS['taskforce-745'],
  },

  // Cat's claw creeper — triclopyr
  {
    id: 'cats-claw-creeper-triclopyr',
    weed: "Cat's claw creeper",
    brands: 'Garlon 600 / Grazon Extra',
    activeIngredient: 'Triclopyr 600g/L (or Triclopyr + Picloram + Aminopyralid)',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label may specify helicopter — drones included under APVMA; use caution).',
    aerialRate: 'Per aerial label rate',
    waterLHa: '≥100',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Active growth when vine canopy visible. Repeat treatments needed for underground tubers.',
    adjuvantNotes: 'Pulse Penetrant at 200 mL/100 L — essential for vine leaf penetration.',
    labelUrl: LABEL_URLS['garlon-600'],
  },

  // Groundsel bush — metsulfuron
  {
    id: 'groundsel-bush-metsulfuron',
    weed: 'Groundsel bush',
    brands: 'Metsulfuron 600 WG / Brush-Off',
    activeIngredient: 'Metsulfuron-methyl 600g/kg',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label may specify helicopter — drones included under APVMA).',
    aerialRate: '10–15 g/ha',
    waterLHa: '≥80',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–375 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Active growth before flowering. Spring–early summer.',
    adjuvantNotes: 'BS1000 wetting agent at label rate.',
    labelUrl: LABEL_URLS['metsulfuron-600'],
  },

  // Bitou bush — metsulfuron
  {
    id: 'bitou-bush-metsulfuron',
    weed: 'Bitou bush',
    brands: 'Metsulfuron 600 WG / Brush-Off',
    activeIngredient: 'Metsulfuron-methyl 600g/kg',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label may specify helicopter — drones included under APVMA). Bitou bush is a WoNS.',
    aerialRate: '10–15 g/ha',
    waterLHa: '≥80',
    droneParams: { dropletSize: 'Medium–Coarse (VMD 250–375 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Active growth. Late spring–summer. Follow-up for seedlings from soil bank.',
    adjuvantNotes: 'BS1000 wetting agent at label rate.',
    labelUrl: LABEL_URLS['metsulfuron-600'],
  },

  // Privet — triclopyr + metsulfuron
  {
    id: 'privet-triclopyr-metsulfuron',
    weed: 'Privet (broad-leaf / small-leaf)',
    brands: 'Garlon 600 + Metsulfuron 600 WG',
    activeIngredient: 'Triclopyr 600g/L + Metsulfuron-methyl 600g/kg',
    droneStatus: 'permitted-helicopter-caution',
    droneStatusNote: 'Permitted via aerial (label may specify helicopter — drones included under APVMA; use caution).',
    aerialRate: 'Per aerial label rates for each product',
    waterLHa: '≥100',
    droneParams: { dropletSize: 'Coarse–Very Coarse (VMD 300–450 µm)', flightHeightM: '2.5–3 m AGL', speedMs: '4–6 m/s' },
    bestTiming: 'Active growth with full leaf cover. Spring–summer.',
    adjuvantNotes: 'Pulse Penetrant at 200 mL/100 L.',
    labelUrl: LABEL_URLS['garlon-600'],
  },
];

export function searchTreatments(query: string): WeedTreatment[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return getAllTreatments().filter((t) =>
    [t.weed, t.brands, t.activeIngredient, t.adjuvantNotes, t.registrant || '', t.apvmaNumber || ''].some((f) =>
      f.toLowerCase().includes(q)
    )
  );
}

export function getTreatmentById(id: string): WeedTreatment | undefined {
  return getAllTreatments().find((t) => t.id === id);
}

export function searchByWeed(query: string): WeedTreatment[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return getAllTreatments().filter((t) => t.weed.toLowerCase().includes(q));
}

export function searchByChemical(query: string): WeedTreatment[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return getAllTreatments().filter((t) =>
    [t.brands, t.activeIngredient, t.registrant || '', t.apvmaNumber || ''].some((f) => f.toLowerCase().includes(q))
  );
}

export function getAllWeeds(): string[] {
  const weeds = new Set<string>();
  getAllTreatments().forEach((t) => { if (t.weed !== '—') weeds.add(t.weed); });
  return Array.from(weeds).sort();
}

export function getAllBrands(): string[] {
  const brands = new Set<string>();
  getAllTreatments().forEach((t) => brands.add(t.brands));
  return Array.from(brands).sort();
}

export function getTreatmentsForWeed(weed: string): WeedTreatment[] {
  const w = weed.toLowerCase();
  return getAllTreatments().filter((t) => t.weed.toLowerCase().includes(w));
}

export function getCuratedCount(): number {
  return treatments.length;
}

export function getSavedAPVMACount(): number {
  return getSavedChemicals().length;
}
