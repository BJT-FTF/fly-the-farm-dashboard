// Australian Agricultural Surfactants & Adjuvants Database

export type SurfactantCategory =
  | 'Non-ionic surfactant'
  | 'Organosilicone'
  | 'Crop oil concentrate'
  | 'Methylated seed oil'
  | 'Drift retardant'
  | 'Water conditioner'
  | 'Acidifier'
  | 'Penetrant'
  | 'Wetting agent'
  | 'Spray marker';

export interface Surfactant {
  id: string;
  name: string;
  category: SurfactantCategory;
  activeIngredient: string;
  typicalRate: string;
  description: string;
  bestUsedWith: string;
  notes: string;
}

export const surfactants: Surfactant[] = [
  // ─── Non-ionic surfactants ──────────────────────────────────
  {
    id: 'sf-bs1000',
    name: 'BS1000',
    category: 'Non-ionic surfactant',
    activeIngredient: 'Alcohol alkoxylate 1000 g/L',
    typicalRate: '100–200 mL/100L',
    description: 'General-purpose non-ionic wetting agent. Reduces surface tension and improves spray coverage on waxy or hairy leaf surfaces.',
    bestUsedWith: 'Metsulfuron, glyphosate, 2,4-D, MCPA — most broadleaf herbicides where a wetter is recommended on the label.',
    notes: 'One of the most widely used NIS in Australia. Compatible with most tank mixes. Do not use with paraquat or diquat.',
  },
  {
    id: 'sf-agral',
    name: 'Agral',
    category: 'Non-ionic surfactant',
    activeIngredient: 'Nonylphenol ethoxylate 600 g/L',
    typicalRate: '100–200 mL/100L',
    description: 'Non-ionic wetting and spreading agent. Improves uptake through leaf cuticle and increases spray deposit retention.',
    bestUsedWith: 'General herbicides — particularly metsulfuron-methyl and sulfonylurea products where NIS is specified.',
    notes: 'Well-established product. Check label as some formulations already contain surfactant.',
  },
  {
    id: 'sf-activator',
    name: 'Activator Non-Ionic Surfactant',
    category: 'Non-ionic surfactant',
    activeIngredient: 'Alcohol ethoxylate 800 g/L',
    typicalRate: '100–200 mL/100L',
    description: 'Premium non-ionic surfactant that reduces surface tension for improved wetting and spreading on difficult-to-wet targets.',
    bestUsedWith: 'Broad range of herbicides where a non-ionic surfactant is required. Good with Group B sulfonylureas.',
    notes: 'Low foam formulation suitable for drone applications where tank foaming can be an issue.',
  },
  {
    id: 'sf-wetspray',
    name: 'Wetspray 1000',
    category: 'Non-ionic surfactant',
    activeIngredient: 'Polyoxyethylene nonylphenol 1000 g/L',
    typicalRate: '100 mL/100L',
    description: 'Concentrated non-ionic surfactant for improved leaf wetting and herbicide penetration.',
    bestUsedWith: 'Most herbicide applications where NIS is specified on the label.',
    notes: 'Cost-effective option. Widely available through rural supply stores.',
  },

  // ─── Organosilicones ────────────────────────────────────────
  {
    id: 'sf-pulse',
    name: 'Pulse Penetrant',
    category: 'Organosilicone',
    activeIngredient: 'Organosilicone + non-ionic surfactant blend',
    typicalRate: '100–200 mL/100L',
    description: 'Superspreader that provides rapid wetting and stomatal infiltration. Spray droplets spread to 10x their original area, covering more leaf surface.',
    bestUsedWith: 'Glyphosate, paraquat, diquat, fungicides. Excellent for hard-to-wet weeds like grasses and sedges.',
    notes: 'Can cause phytotoxicity if used with certain crop-selective herbicides. Not recommended with oil-based formulations. Very effective for drone applications due to low-volume coverage.',
  },
  {
    id: 'sf-silwet',
    name: 'Silwet L-77',
    category: 'Organosilicone',
    activeIngredient: 'Trisiloxane ethoxylate 800 g/L',
    typicalRate: '20–40 mL/100L',
    description: 'High-performance organosilicone superspreader. Provides exceptional wetting and stomatal penetration even at very low rates.',
    bestUsedWith: 'Systemic herbicides, fungicides, insecticides. Particularly effective where rapid uptake is needed before rain.',
    notes: 'Very concentrated — use at low rates. Can increase drift potential due to fine droplet generation. Monitor spray quality carefully for drone use.',
  },
  {
    id: 'sf-breakthru',
    name: 'Break-Thru',
    category: 'Organosilicone',
    activeIngredient: 'Polyether-modified trisiloxane 100%',
    typicalRate: '30–50 mL/100L',
    description: 'Organosilicone superspreader for difficult-to-wet targets. Enables spray to penetrate dense canopy and spread across waxy leaf surfaces.',
    bestUsedWith: 'Systemic herbicides on waxy-leaved weeds. Good with glyphosate on established grasses.',
    notes: 'Effective for hard-to-wet weeds like lippia, paspalum, and kikuyu. Use lower rates for drone application.',
  },

  // ─── Crop oil concentrates ──────────────────────────────────
  {
    id: 'sf-uptake',
    name: 'Uptake Spraying Oil',
    category: 'Crop oil concentrate',
    activeIngredient: 'Paraffinic oil 582 g/L + non-ionic surfactants 240 g/L',
    typicalRate: '500 mL/100L (0.5% v/v)',
    description: 'Dual-action adjuvant combining mineral oil and surfactants. Dissolves waxy cuticle layer while surfactants improve spreading and penetration.',
    bestUsedWith: 'Haloxyfop, clethodim, sethoxydim (Group A grass herbicides). Also with fluroxypyr and some Group B herbicides.',
    notes: 'Industry standard crop oil for grass-selective herbicides. Often specified on labels as the preferred adjuvant. Essential for drone application of grass herbicides.',
  },
  {
    id: 'sf-hasten',
    name: 'Hasten Spray Adjuvant',
    category: 'Methylated seed oil',
    activeIngredient: 'Ethyl and methyl esters of vegetable oil 704 g/L',
    typicalRate: '500 mL–1 L/100L (0.5–1% v/v)',
    description: 'Esterified vegetable oil adjuvant that enhances herbicide penetration through the leaf cuticle. Superior performance to standard crop oils on many targets.',
    bestUsedWith: 'Clethodim, haloxyfop, imazapic, imazapyr. Particularly effective with Group B (ALS) and Group A (ACCase) herbicides.',
    notes: 'Often delivers better efficacy than mineral oil-based COCs. Plant-derived oil base. Good rainfastness properties.',
  },
  {
    id: 'sf-supercharge',
    name: 'Supercharge Elite',
    category: 'Crop oil concentrate',
    activeIngredient: 'Methylated canola oil + non-ionic surfactant',
    typicalRate: '500 mL–1 L/100L',
    description: 'Premium methylated seed oil adjuvant for enhanced herbicide absorption and rainfastness.',
    bestUsedWith: 'Group A and Group B herbicides, particularly in broadacre cropping situations.',
    notes: 'Australian-made from canola oil. Provides good emulsion stability in cold water.',
  },

  // ─── Drift retardants ───────────────────────────────────────
  {
    id: 'sf-gondor',
    name: 'Gondor',
    category: 'Drift retardant',
    activeIngredient: 'Polyacrylamide polymer blend',
    typicalRate: '100–400 mL/100L',
    description: 'Drift reduction agent that increases droplet size and reduces the proportion of fine, drift-prone droplets. Can shift spray quality by 1–2 categories coarser.',
    bestUsedWith: 'Any herbicide application where drift is a concern — near sensitive crops, waterways, or neighbours.',
    notes: 'Critical for drone applications to meet APVMA drift requirements. Some labels mandate a drift retardant for aerial application. Check compatibility — some can clog nozzles at high rates.',
  },
  {
    id: 'sf-interlock',
    name: 'Interlock',
    category: 'Drift retardant',
    activeIngredient: 'Modified vegetable oil + surfactant blend',
    typicalRate: '250–500 mL/100L',
    description: 'Dual-function adjuvant that provides drift reduction while also improving spray deposition and retention on the target.',
    bestUsedWith: 'Broadacre herbicide applications, particularly 2,4-D ester/amine, dicamba, and other volatile herbicides.',
    notes: 'Good option for drone use as it combines DRA function with deposition aid. Reduces off-target movement.',
  },
  {
    id: 'sf-driftguard',
    name: 'In-Place DRA',
    category: 'Drift retardant',
    activeIngredient: 'Polymer-based drift reduction agent',
    typicalRate: '200–400 mL/100L',
    description: 'Polymer-based drift retardant that creates larger, more uniform droplets. Reduces driftable fines by up to 80%.',
    bestUsedWith: 'All spray applications where drift control is required. Essential for aerial application near sensitive areas.',
    notes: 'Compatible with most herbicide tank mixes. Helps meet buffer zone requirements.',
  },

  // ─── Water conditioners / Acidifiers ────────────────────────
  {
    id: 'sf-li700',
    name: 'LI-700',
    category: 'Water conditioner',
    activeIngredient: 'Phosphatidylcholine (lecithin) + propionic acid 350 g/L',
    typicalRate: '500 mL/100L',
    description: 'Multi-function adjuvant that acidifies spray water, buffers pH, and improves penetration. Reduces alkaline hydrolysis of pH-sensitive herbicides.',
    bestUsedWith: 'Glyphosate (essential in hard/alkaline water), 2,4-D amine, insecticides. Critical where bore water pH exceeds 7.',
    notes: 'Widely used across Australia where water quality varies. Indicator dye shows when pH is in optimal range. Also provides mild surfactant action.',
  },
  {
    id: 'sf-liase',
    name: 'Liase',
    category: 'Acidifier',
    activeIngredient: 'Acidifying surfactant blend',
    typicalRate: '200–500 mL/100L',
    description: 'Water conditioner and acidifier that lowers spray water pH to the optimal 4–6 range. Protects acid-sensitive active ingredients from breakdown.',
    bestUsedWith: 'Glyphosate, synthetic pyrethroids, organophosphates. Use whenever spray water pH is above 7.',
    notes: 'Contains pH indicator — solution turns colour when optimal pH is reached. Simple to use in the field.',
  },
  {
    id: 'sf-primabuff',
    name: 'Spray-Aide pH Buffering Agent',
    category: 'Water conditioner',
    activeIngredient: 'Blend of organic acids and buffering agents',
    typicalRate: '100–300 mL/100L',
    description: 'Buffers and acidifies spray water. Also sequesters hard water cations (calcium, magnesium) that can reduce glyphosate efficacy.',
    bestUsedWith: 'Glyphosate in hard water, 2,4-D, Group A herbicides. Essential in bore water and high-bicarbonate situations.',
    notes: 'Hard water antagonism is a common cause of poor glyphosate performance. Add this before glyphosate in the tank mix order.',
  },

  // ─── Penetrants / Stickers ──────────────────────────────────
  {
    id: 'sf-agroil',
    name: 'Agroil Spray Oil',
    category: 'Penetrant',
    activeIngredient: 'Paraffinic mineral oil 822 g/L',
    typicalRate: '1–2 L/100L (1–2% v/v)',
    description: 'Mineral spray oil that improves herbicide penetration through plant cuticle. Also provides insecticidal smothering action.',
    bestUsedWith: 'Grass-selective herbicides, horticultural sprays, insect pest management.',
    notes: 'Higher rates used for scale and mite control. Lower rates as herbicide adjuvant.',
  },
  {
    id: 'sf-bond',
    name: 'Bond Sticker-Spreader',
    category: 'Wetting agent',
    activeIngredient: 'Latex-based polymer + surfactant',
    typicalRate: '100–200 mL/100L',
    description: 'Sticker-spreader that improves spray adhesion and rainfastness. Holds the spray deposit on the leaf surface through rain events.',
    bestUsedWith: 'Fungicides, insecticides, and herbicides where rainfastness is critical. Good with contact herbicides.',
    notes: 'Particularly useful when rain is forecast within 1–4 hours of application. Improves performance of contact-mode products.',
  },

  // ─── Spray markers ─────────────────────────────────────────
  {
    id: 'sf-flagman',
    name: 'Flagman Spray Marker Dye',
    category: 'Spray marker',
    activeIngredient: 'Brilliant blue FCF dye',
    typicalRate: '50–100 mL/100L',
    description: 'Blue spray marker dye for identifying treated areas. Visible on foliage for 1–3 days then fades with UV exposure.',
    bestUsedWith: 'Any spray application where visual coverage confirmation is needed. Particularly useful for spot spraying and drone applications.',
    notes: 'Helps identify missed strips or overlaps. Essential for professional spray contractors to show clients treated areas. Will not stain permanently.',
  },
  {
    id: 'sf-dyemark',
    name: 'Dyemark Blue',
    category: 'Spray marker',
    activeIngredient: 'Water-soluble blue dye 400 g/L',
    typicalRate: '30–50 mL/100L',
    description: 'Concentrated spray indicator dye. Shows exactly where spray has been applied for quality assurance and overlap avoidance.',
    bestUsedWith: 'All applications — especially useful for drone spraying where the pilot needs visual confirmation of coverage from the ground.',
    notes: 'Dissipates within a few days. Compatible with all common herbicides and adjuvants.',
  },
];

export function getAllSurfactants(): Surfactant[] {
  return surfactants;
}

export function getSurfactantById(id: string): Surfactant | undefined {
  return surfactants.find((s) => s.id === id);
}

export function getSurfactantsByCategory(category: SurfactantCategory): Surfactant[] {
  return surfactants.filter((s) => s.category === category);
}

export function getAllCategories(): SurfactantCategory[] {
  return Array.from(new Set(surfactants.map((s) => s.category)));
}

export function searchSurfactants(query: string): Surfactant[] {
  const q = query.toLowerCase().trim();
  if (!q) return surfactants;
  return surfactants.filter((s) =>
    [s.name, s.category, s.activeIngredient, s.description, s.bestUsedWith].some((f) =>
      f.toLowerCase().includes(q)
    )
  );
}
