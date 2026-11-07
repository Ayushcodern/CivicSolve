/**
 * CivicSolve — Client-Side Reactive Data Store
 * Provides persistent local state with automatic synchronization to localStorage.
 * Ensures the platform functions flawlessly offline, in standalone demos,
 * or when seamlessly connected to the Spring Boot and FastAPI backends.
 */

export interface Challenge {
  challengeId: number;
  userId: number;
  title: string;
  description: string;
  domain: string;
  subDomain?: string;
  priorityScore: number;
  priorityExplanation?: string;
  status:
  | "SUBMITTED"
  | "AI_ANALYZED"
  | "VALIDATED"
  | "MATCHED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "MERGED";
  lat: number;
  lon: number;
  district: string;
  villageOrWard: string;
  reportedPopulation: number;
  duplicateOfId?: number | null;
  createdAt: string;
  updatedAt?: string;
  evidenceUrls: string[];
  matchedUniversity?: {
    institutionId?: number;
    name: string;
    department: string;
    matchScore: number;
  };
}

export interface Institution {
  institutionId: number;
  name: string;
  shortName: string;
  type: string;
  city: string;
  district: string;
  lat: number;
  lon: number;
  departments: string[];
  capabilities: string[];
  activeProjects: number;
  completedProjects: number;
  contactEmail: string;
  website: string;
  accentColor: string;
}

export interface ImpactLedgerEntry {
  id: number;
  challengeId: number;
  title: string;
  district: string;
  domain: string;
  partnerUniversity: string;
  baselineMetric: string;
  outcomeMetric: string;
  improvementPercentage: string;
  beneficiaries: number;
  verifiedBy: string;
  verificationDate: string;
  status: "VERIFIED_AUDITED" | "PILOT_DEPLOYED";
  notes: string;
  photoBefore?: string;
  photoAfter?: string;
}

export interface UniversityProject {
  projectId: number;
  challengeId: number;
  title: string;
  university: string;
  leadResearcher: string;
  department: string;
  district: string;
  currentStage: "DISCOVERY" | "PROTOTYPE" | "PILOT_TESTING" | "FIELD_DEPLOYMENT" | "IMPACT_VERIFIED";
  progressPercent: number;
  milestones: { id: number; title: string; completed: boolean; dueDate: string }[];
  deliverables: { name: string; url: string; uploadedAt: string }[];
}

const STORAGE_KEYS = {
  CHALLENGES: "civicsolve_challenges_v2",
  PROJECTS: "civicsolve_projects_v2",
  LEDGER: "civicsolve_ledger_v2",
};

// INITIAL SEED DATA: High-fidelity Madhya Pradesh societal challenges
const INITIAL_CHALLENGES: Challenge[] = [
  {
    challengeId: 1,
    userId: 1,
    title: "High Arsenic & Heavy Metal Contamination in Community Borewells",
    description:
      "Groundwater testing across Sanwer Ward 4 revealed severe arsenic concentrations of 0.08 mg/L (exceeding permissible limit of 0.01 mg/L). Over 3,500 residents across three sub-localities rely entirely on these two primary community borewells for domestic cooking and drinking. Multiple cases of skin keratosis and gastrointestinal distress have been recorded in the past two months. Immediate bio-filtration or electro-coagulation water purification unit required alongside alternative tanker supply.",
    domain: "WATER",
    subDomain: "Groundwater Contaminant Mitigation & Bio-Filtration",
    priorityScore: 88.5,
    priorityExplanation:
      "गाँव के 3,500 निवासियों के स्वास्थ्य व पीने के पानी पर सीधा असर होने तथा त्वचा रोग के मामलों के कारण इसे अति-आवश्यक प्राथमिकता दी गई है। (Direct severe drinking water toxicity and health hazard impacting 3,500 residents).",
    status: "AI_ANALYZED",
    lat: 22.9734,
    lon: 75.8321,
    district: "Indore",
    villageOrWard: "Sanwer Ward 4",
    reportedPopulation: 3500,
    duplicateOfId: null,
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    evidenceUrls: [
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    challengeId: 2,
    userId: 2,
    title: "Seasonal Flash Washout of Earthen Approach Causeway & Culvert",
    description:
      "The primary approach road connecting Gram Badnawar to the state highway gets severed completely during July-August heavy showers. Over 2,100 villagers including 320 daily high-school students and emergency ambulances are cut off from essential medical centers for 3-5 days per occurrence. The existing single-pipe hume culvert is heavily silted and inadequate for peak monsoon discharge.",
    domain: "ROAD_INFRASTRUCTURE",
    subDomain: "Rural Connectivity, All-Weather Slab Culvert & Slope Stabilization",
    priorityScore: 76.2,
    priorityExplanation:
      "बारिश में 2,100 ग्रामीणों व स्कूल के बच्चों का मुख्य मार्ग पूरी तरह कट जाने और एम्बुलेंस न पहुँच पाने के कारण इसे उच्च प्राथमिकता दी गई है। (Crucial road connection severed, blocking ambulances and 320 daily students during monsoon).",
    status: "MATCHED",
    lat: 23.0245,
    lon: 75.2415,
    district: "Dhar",
    villageOrWard: "Gram Badnawar",
    reportedPopulation: 2100,
    duplicateOfId: null,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    evidenceUrls: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80",
    ],
    matchedUniversity: {
      institutionId: 2,
      name: "SGSITS Indore",
      department: "Department of Civil Engineering & Transportation Systems",
      matchScore: 94,
    },
  },
  {
    challengeId: 3,
    userId: 1,
    title: "Unsegregated Organic & Plastic Waste Dumping at Weekly Haat Bazaar",
    description:
      "The regional bi-weekly vegetable and cattle haat bazaar generates over 4.5 metric tons of mixed agro-waste, single-use polythene, and animal excreta that sits rotting in unlined open trenches. Leachate is seeping into the adjacent minor irrigation pond, triggering insect vectors and foul odor.",
    domain: "SANITATION",
    subDomain: "Micro-Composting Units & Decentralized Solid Waste Segregation",
    priorityScore: 68.4,
    priorityExplanation:
      "साप्ताहिक हाट बाज़ार के कचरे से पास के तालाब में गंदगी व बीमारियाँ फैलने का जोखिम होने से इसे प्राथमिकता में लिया गया है। (Environmental health hazard and groundwater contamination from unmanaged market waste).",
    status: "IN_PROGRESS",
    lat: 22.5539,
    lon: 75.7612,
    district: "Indore",
    villageOrWard: "Mhow Haat Ground",
    reportedPopulation: 4200,
    duplicateOfId: null,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    evidenceUrls: [
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
    ],
    matchedUniversity: {
      institutionId: 1,
      name: "Indian Institute of Technology (IIT) Indore",
      department: "Discipline of Bioscience & Environmental Engineering",
      matchScore: 92,
    },
  },
  {
    challengeId: 4,
    userId: 3,
    title: "Rapid Yellow Mosaic Virus & Stem Fly Outbreak in Khargone Soybean Belt",
    description:
      "Over 450 hectares of flowering soybean crop across three panchayats have developed characteristic yellow mottling, stunted stem nodes, and pod shattering caused by whitefly vector infestation. Traditional chemical pesticides have failed to control vector resurgence due to high humidity. Farmers face an estimated 60-70% yield reduction unless targeted biological pest deterrence and pheromone lure strategy is deployed.",
    domain: "AGRICULTURE",
    subDomain: "Integrated Pest Management (IPM) & Bio-Formulation Spray Pilot",
    priorityScore: 84.1,
    priorityExplanation:
      "450 हेक्टेयर में सोयाबीन फ़सल पर पीला मोज़ेक वायरस का तेज़ी से फैलाव और 1,850 किसान परिवारों के आर्थिक नुकसान को रोकने हेतु उच्च प्राथमिकता। (Severe agricultural threat threatening crop yields across 1,850 farm households).",
    status: "VALIDATED",
    lat: 21.8234,
    lon: 75.6189,
    district: "Khargone",
    villageOrWard: "Kasrawad Tehsil",
    reportedPopulation: 1850,
    duplicateOfId: null,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    evidenceUrls: [
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    challengeId: 5,
    userId: 4,
    title: "Frequent Grid Outages Causing Vaccine Cold-Chain Failures in Tribal PHC",
    description:
      "The Primary Health Center in Pati block experiences 6 to 10 hours of unannounced daily load shedding during summer and early monsoon. The existing kerosene and backup battery refrigerators frequently trip, risking deterioration of critical hepatitis B, measles, and polio vaccine vials serving 14 interior tribal hamlets. A dedicated solar-hybrid ice-lined refrigeration (ILR) system with IoT temperature telemetry is needed.",
    domain: "PUBLIC_HEALTH",
    subDomain: "Solar-Assisted Cold Chain Infrastructure & Remote Telemetry",
    priorityScore: 92.8,
    priorityExplanation:
      "14 आदिवासी मजरों के 5,400 लोगों के लिए टीकों के खराब होने के खतरे को देखते हुए इसे सर्वोच्च प्राथमिकता दी गई है। (Maternal and child health hazard from power outages risking critical vaccine supply).",
    status: "RESOLVED",
    lat: 21.9324,
    lon: 74.8921,
    district: "Barwani",
    villageOrWard: "Pati Block Center",
    reportedPopulation: 5400,
    duplicateOfId: null,
    createdAt: new Date(Date.now() - 3600000 * 240).toISOString(),
    evidenceUrls: [
      "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80",
    ],
    matchedUniversity: {
      institutionId: 3,
      name: "MANIT Bhopal",
      department: "Department of Electrical Engineering & Renewable Energy Systems",
      matchScore: 96,
    },
  },
  {
    challengeId: 6,
    userId: 5,
    title: "Structural Leakage & Overhead Tank Seepage at Government Girls School",
    description:
      "The 50,000-liter reinforced concrete overhead water storage tank constructed in 2011 has developed severe shear cracks along its eastern perimeter column and base ring. Water seepage is actively infiltrating the ceiling of classroom blocks 3 and 4 directly below, producing damp walls and peeling plaster. Engineering structural audit and polymer-modified mortar rehabilitation required before the academic term resumes.",
    domain: "WATER",
    subDomain: "Structural Health Audit & Waterproofing Polymer Rehabilitation",
    priorityScore: 64.0,
    priorityExplanation:
      "कक्षा 3 और 4 की छत पर सीधे 50,000 लीटर पानी की टंकी का रिसाव होने से 450 छात्राओं की सुरक्षा हेतु तुरंत मरम्मत की आवश्यकता है। (Structural danger of water tank leakage directly over classrooms serving 450 students).",
    status: "VALIDATED",
    lat: 22.9676,
    lon: 76.0534,
    district: "Dewas",
    villageOrWard: "Ward 12, Tonk Khurd",
    reportedPopulation: 450,
    duplicateOfId: null,
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    evidenceUrls: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    challengeId: 7,
    userId: 6,
    title: "Low Voltage Fluctuations Damaging Deep Tubewell Submersible Motors",
    description:
      "End-of-line agricultural power distribution transformers in Sehore farming clusters drop voltage to as low as 160V during peak irrigation pumping hours (6 PM - 11 PM). Over 42 submersible induction motors have burnt out in the past three weeks, resulting in crop desiccation and financial distress. Feasibility of automated smart static VAR compensators or localized solar booster micro-grids requested.",
    domain: "POWER",
    subDomain: "Distribution Grid Voltage Stabilization & Smart Reactive Power",
    priorityScore: 78.9,
    priorityExplanation:
      "सिंचाई के मुख्य समय में वोल्टेज 160V गिरने से 42 मोटरें जल चुकी हैं, जिससे 1,200 किसानों की फ़सल सूखने का जोखिम है। (Critical voltage drop causing pump motor burnouts across 1,200 farms).",
    status: "SUBMITTED",
    lat: 23.2032,
    lon: 77.0844,
    district: "Sehore",
    villageOrWard: "Gram Shyampur",
    reportedPopulation: 1200,
    duplicateOfId: null,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    evidenceUrls: [],
  },
  {
    challengeId: 8,
    userId: 7,
    title: "High Fluoride Content in Tap Water Causing Dental Fluorosis in Children",
    description:
      "Clinical screening of 180 primary school pupils in Ujjain rural belt revealed severe yellow-brown enamel mottling and skeletal stiffness. Water samples from three piped water supply handpumps showed fluoride levels of 3.4 mg/L, more than double the national permissible limit (1.5 mg/L). Immediate Nalgonda technique or activated alumina defluoridation pilot unit proposed.",
    domain: "WATER",
    subDomain: "Groundwater Fluoride Removal & Community Defluoridation Units",
    priorityScore: 89.2,
    priorityExplanation:
      "हैंडपंप के पानी में फ्लोराइड 3.4 mg/L मिलने से 2,800 ग्रामीणों व 180 बच्चों में दाँत व हड्डियों की बीमारी रोकने हेतु तत्काल फ़िल्टर की ज़रूरत है। (Dangerous fluoride level 3.4 mg/L causing severe fluorosis in children).",
    status: "AI_ANALYZED",
    lat: 23.1765,
    lon: 75.7885,
    district: "Ujjain",
    villageOrWard: "Ghatiya Tehsil",
    reportedPopulation: 2800,
    duplicateOfId: null,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    evidenceUrls: [
      "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

// INSTITUTIONS: Higher Education & Research Institutes in Madhya Pradesh
export const INSTITUTIONS_DATA: Institution[] = [
  {
    institutionId: 1,
    name: "Indian Institute of Technology (IIT) Indore",
    shortName: "IIT Indore",
    type: "CENTRAL_INSTITUTE",
    city: "Simrol, Indore",
    district: "Indore",
    lat: 22.5204,
    lon: 75.9207,
    departments: [
      "Center of Excellence in Water Quality & Environmental Science",
      "Department of Electrical Engineering",
      "Discipline of Mechanical Engineering & Smart Materials",
      "Biosciences & Biomedical Engineering",
    ],
    capabilities: [
      "Atomic Absorption Spectrophotometry",
      "Membrane Bio-Reactor Lab",
      "Mobile Water Quality van",
      "IoT Remote Telemetry Sensors",
      "Drone Hyperspectral Imaging",
    ],
    activeProjects: 6,
    completedProjects: 14,
    contactEmail: "civic.innovation@iiti.ac.in",
    website: "https://www.iiti.ac.in",
    accentColor: "#2d5a43",
  },
  {
    institutionId: 2,
    name: "Shri Govindram Seksaria Institute of Technology and Science (SGSITS)",
    shortName: "SGSITS Indore",
    type: "STATE_AUTONOMOUS",
    city: "Indore",
    district: "Indore",
    lat: 22.7244,
    lon: 75.8711,
    departments: [
      "Department of Civil & Environmental Engineering",
      "Department of Applied Chemistry",
      "Center for Structural Safety & Geotechnical Testing",
    ],
    capabilities: [
      "Water Contamination Filtration Testbed",
      "GIS & Spatial Hydrology Lab",
      "Asphalt & Aggregate Durability Rig",
      "Hydraulic Concrete Permeability Analysis",
    ],
    activeProjects: 4,
    completedProjects: 9,
    contactEmail: "civictech@sgsits.ac.in",
    website: "https://www.sgsits.ac.in",
    accentColor: "#15803d",
  },
  {
    institutionId: 3,
    name: "Maulana Azad National Institute of Technology (MANIT Bhopal)",
    shortName: "MANIT Bhopal (NIT)",
    type: "CENTRAL_NIT",
    city: "Bhopal",
    district: "Bhopal",
    lat: 23.2163,
    lon: 77.4068,
    departments: [
      "Department of Chemical & Environmental Engineering",
      "Energy Center & Renewable Technologies",
      "Department of Civil Engineering",
    ],
    capabilities: [
      "Adsorption Column Testing Setup",
      "Solar Micro-grid Test Bench",
      "Community Drinking Water Pilot Lead",
      "Rural Transportation Materials Lab",
    ],
    activeProjects: 5,
    completedProjects: 11,
    contactEmail: "societal.solutions@manit.ac.in",
    website: "https://www.manit.ac.in",
    accentColor: "#b45309",
  },
  {
    institutionId: 4,
    name: "Devi Ahilya Vishwavidyalaya (DAVV)",
    shortName: "DAVV Indore",
    type: "STATE_UNIVERSITY",
    city: "Indore",
    district: "Indore",
    lat: 22.7126,
    lon: 75.8772,
    departments: [
      "School of Biotechnology & Life Sciences",
      "Institute of Engineering and Technology (IET-DAVV)",
      "School of Energy and Environmental Studies",
    ],
    capabilities: [
      "Biomass Conversion & Bio-fertilizer Formulation",
      "Soil Microbiome Sequencing",
      "Thermal Solar Energy Pilot Unit",
    ],
    activeProjects: 3,
    completedProjects: 8,
    contactEmail: "iet.civic@dauniv.ac.in",
    website: "https://www.dauniv.ac.in",
    accentColor: "#3f3f46",
  },
  {
    institutionId: 5,
    name: "Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV Bhopal)",
    shortName: "RGPV Bhopal",
    type: "STATE_TECHNICAL_UNIVERSITY",
    city: "Bhopal",
    district: "Bhopal",
    lat: 23.3102,
    lon: 77.3601,
    departments: [
      "School of Nanotechnology",
      "Department of Civil & Structural Infrastructure",
      "Center for Green Energy Technologies",
    ],
    capabilities: [
      "Low-Cost Polymer Coagulant Formulation",
      "Bridge & Culvert Load Stress Sensors",
      "Smart Irrigation Controller Design",
    ],
    activeProjects: 4,
    completedProjects: 7,
    contactEmail: "solutions@rgpv.ac.in",
    website: "https://www.rgpv.ac.in",
    accentColor: "#1e3a8a",
  },
  {
    institutionId: 6,
    name: "Jawaharlal Nehru Krishi Vishwavidyalaya (JNKVV)",
    shortName: "JNKVV Jabalpur",
    type: "STATE_AGRICULTURAL_UNIVERSITY",
    city: "Jabalpur",
    district: "Jabalpur",
    lat: 23.2125,
    lon: 79.9577,
    departments: [
      "Department of Plant Pathology & Entomology",
      "Department of Agronomy & Soil Science",
      "College of Agricultural Engineering",
    ],
    capabilities: [
      "Pheromone Trap Design for Soybean Stem Fly",
      "Bio-fungicide Laboratory Fermentation",
      "Drip Irrigation Optimization Lab",
    ],
    activeProjects: 5,
    completedProjects: 12,
    contactEmail: "kisan.solutions@jnkvv.org",
    website: "https://www.jnkvv.org",
    accentColor: "#166534",
  },
];

// IMPACT LEDGER: Phase 4 public verified societal outcomes
const INITIAL_LEDGER: ImpactLedgerEntry[] = [
  {
    id: 101,
    challengeId: 5,
    title: "Solar-Assisted Cold Chain Retrofit for Pati Tribal Primary Health Center",
    district: "Barwani",
    domain: "PUBLIC_HEALTH",
    partnerUniversity: "MANIT Bhopal (NIT)",
    baselineMetric: "6-10 hrs daily grid failure; 42% vaccine spoilage risk during heatwave",
    outcomeMetric: "100% 2-8°C thermal compliance maintained across 90 days; 0 spoiled doses",
    improvementPercentage: "100% Zero-Loss",
    beneficiaries: 5400,
    verifiedBy: "Dr. R. K. Verma (Chief Medical & Health Officer, Barwani District)",
    verificationDate: "14 Oct 2026",
    status: "VERIFIED_AUDITED",
    notes:
      "Installed a 2.4 kWp rooftop solar photovoltaic array with lithium-ferro-phosphate backup and GSM temperature logger transmitting alarms every 15 minutes.",
    photoBefore:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    photoAfter:
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 102,
    challengeId: 2,
    title: "Box Culvert & Geo-Textile Scour Protection at Gram Badnawar Causeway",
    district: "Dhar",
    domain: "ROAD_INFRASTRUCTURE",
    partnerUniversity: "SGSITS Indore",
    baselineMetric: "Road cut-off for 18 days per monsoon; 45 min ambulance detour",
    outcomeMetric: "Zero transit interruption during 220mm peak rainfall; transit time 8 min",
    improvementPercentage: "82% Transit Reduction",
    beneficiaries: 2100,
    verifiedBy: "Executive Engineer (Madhya Pradesh Rural Road Development Authority)",
    verificationDate: "28 Sep 2026",
    status: "VERIFIED_AUDITED",
    notes:
      "Upgraded silted single hume pipe to a dual 2.5m x 2.0m precast reinforced concrete box culvert with stone pitching and geo-synthetic embankment stabilization.",
    photoBefore:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80",
    photoAfter:
      "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 103,
    challengeId: 1,
    title: "Electro-Coagulation & Low-Cost Iron-Arsenic Removal Plant",
    district: "Indore",
    domain: "WATER",
    partnerUniversity: "Indian Institute of Technology (IIT) Indore",
    baselineMetric: "Arsenic concentration: 0.08 mg/L (8x permissible limit)",
    outcomeMetric: "Arsenic reduced to 0.004 mg/L (well within WHO safe threshold)",
    improvementPercentage: "95% Contaminant Removal",
    beneficiaries: 3500,
    verifiedBy: "Executive Engineer (Public Health Engineering Department, Indore Division)",
    verificationDate: "02 Oct 2026",
    status: "VERIFIED_AUDITED",
    notes:
      "Installed community solar-powered electro-coagulation unit processing 5,000 liters/hour with automatic sand and activated carbon polisher.",
    photoBefore:
      "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80",
    photoAfter:
      "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80",
  },
];

// UNIVERSITY PROJECTS: Active projects undergoing development & piloting
const INITIAL_PROJECTS: UniversityProject[] = [
  {
    projectId: 1,
    challengeId: 1,
    title: "Electro-Coagulation Arsenic Filtration Unit (Indore Sanwer)",
    university: "Indian Institute of Technology (IIT) Indore",
    leadResearcher: "Dr. Santosh K. Sahu (Dept. of Environmental Engineering)",
    department: "Center of Excellence in Water Quality",
    district: "Indore",
    currentStage: "PILOT_TESTING",
    progressPercent: 75,
    milestones: [
      { id: 1, title: "Field Water Sampling & AAS Baseline Testing", completed: true, dueDate: "2026-08-15" },
      { id: 2, title: "Lab Bench-Scale Reactor Optimization", completed: true, dueDate: "2026-09-01" },
      { id: 3, title: "Fabrication of 5000 LPH Community Pilot Rig", completed: true, dueDate: "2026-09-25" },
      { id: 4, title: "Village Installation & 30-Day Water Purity Audit", completed: false, dueDate: "2026-11-10" },
    ],
    deliverables: [
      { name: "Baseline_HeavyMetal_Sanwer_Report.pdf", url: "#", uploadedAt: "2026-08-20" },
      { name: "Electrode_Consumption_Datasheet.xlsx", url: "#", uploadedAt: "2026-09-15" },
    ],
  },
  {
    projectId: 2,
    challengeId: 2,
    title: "Gram Badnawar Box Culvert & Slope Stabilization Design",
    university: "SGSITS Indore",
    leadResearcher: "Prof. Vandana Tare (Civil Engineering)",
    department: "Civil & Transportation Engineering",
    district: "Dhar",
    currentStage: "FIELD_DEPLOYMENT",
    progressPercent: 90,
    milestones: [
      { id: 1, title: "Hydrological Catchment & Discharge Modeling", completed: true, dueDate: "2026-07-20" },
      { id: 2, title: "Reinforced Precast Box Culvert Structural Design", completed: true, dueDate: "2026-08-10" },
      { id: 3, title: "Civil Construction & Stream Bed Scour Proofing", completed: true, dueDate: "2026-09-15" },
      { id: 4, title: "Post-Monsoon Transit Validation Signoff", completed: false, dueDate: "2026-11-05" },
    ],
    deliverables: [
      { name: "Hydrology_Discharge_Badnawar_v2.pdf", url: "#", uploadedAt: "2026-07-28" },
      { name: "Structural_Drawings_Dual_Box_Culvert.dwg", url: "#", uploadedAt: "2026-08-18" },
    ],
  },
  {
    projectId: 3,
    challengeId: 3,
    title: "Mhow Weekly Haat Agro-Waste Rapid Composting Digester",
    university: "Indian Institute of Technology (IIT) Indore",
    leadResearcher: "Dr. Kiran Bala (Biosciences & Bioengineering)",
    department: "Biosciences & Bioengineering",
    district: "Indore",
    currentStage: "PROTOTYPE",
    progressPercent: 45,
    milestones: [
      { id: 1, title: "Haat Waste Characterization & Composition Survey", completed: true, dueDate: "2026-09-10" },
      { id: 2, title: "Thermophilic Bacterial Consortium Inoculant Prep", completed: true, dueDate: "2026-10-05" },
      { id: 3, title: "Rotary Drum In-Vessel Composter Fabrication", completed: false, dueDate: "2026-11-20" },
      { id: 4, title: "Gram Panchayat Field Pilot Run & Training", completed: false, dueDate: "2026-12-15" },
    ],
    deliverables: [
      { name: "Waste_Audit_Mhow_Haat.pdf", url: "#", uploadedAt: "2026-09-18" },
    ],
  },
];

// CLIENT-SIDE STORAGE ACCESSORS (SSR-Safe)
function isClient(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export const CivicStore = {
  // CHALLENGES
  getChallenges(): Challenge[] {
    if (!isClient()) return INITIAL_CHALLENGES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(INITIAL_CHALLENGES));
        return INITIAL_CHALLENGES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_CHALLENGES;
    }
  },

  getChallengeById(id: number | string): Challenge | null {
    const list = this.getChallenges();
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const found = list.find((c) => c.challengeId === numericId);
    if (found) return found;

    // Fallback search by string match (e.g. CS-2611 -> maps to ID 1)
    if (typeof id === "string" && id.startsWith("CS-")) {
      const parsedNum = parseInt(id.replace("CS-", ""), 10);
      const matched = list.find((c) => c.challengeId === parsedNum || c.challengeId === 1);
      if (matched) return matched;
    }

    return list[0] || null;
  },

  addChallenge(data: Partial<Challenge>): Challenge {
    const list = this.getChallenges();
    const maxId = list.reduce((m, item) => Math.max(m, item.challengeId), 0);
    const newId = maxId + 1;

    const newChallenge: Challenge = {
      challengeId: newId,
      userId: data.userId || 1,
      title: data.title || "Community Civic Issue",
      description: data.description || "Detailed problem report submitted via Civic Intake.",
      domain: data.domain || "CIVIC_GENERAL",
      subDomain: data.subDomain || "Community Infrastructure",
      priorityScore: data.priorityScore ?? 75,
      priorityExplanation:
        data.priorityExplanation ||
        "Automated AI Priority: Calculated from population, reported severity, and environmental hazard.",
      status: "AI_ANALYZED",
      lat: data.lat ?? 22.9734,
      lon: data.lon ?? 75.8321,
      district: data.district || "Indore",
      villageOrWard: data.villageOrWard || "Ward 1",
      reportedPopulation: data.reportedPopulation ?? 1000,
      duplicateOfId: data.duplicateOfId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidenceUrls: data.evidenceUrls || [],
    };

    const updated = [newChallenge, ...list];
    if (isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
      } catch (e) {
        console.error("CivicStore: Failed to save challenge", e);
      }
    }
    return newChallenge;
  },

  updateChallengeStatus(
    id: number,
    status: Challenge["status"],
    extra?: Partial<Challenge>
  ): Challenge | null {
    const list = this.getChallenges();
    const idx = list.findIndex((c) => c.challengeId === id);
    if (idx === -1) return null;

    const updatedChallenge: Challenge = {
      ...list[idx],
      status,
      updatedAt: new Date().toISOString(),
      ...extra,
    };
    list[idx] = updatedChallenge;

    if (isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(list));
      } catch (e) {
        console.error("CivicStore: Failed to update challenge", e);
      }
    }
    return updatedChallenge;
  },

  // INSTITUTIONS
  getInstitutions(): Institution[] {
    return INSTITUTIONS_DATA;
  },

  getInstitutionById(id: number): Institution | null {
    return INSTITUTIONS_DATA.find((i) => i.institutionId === id) || null;
  },

  // IMPACT LEDGER
  getImpactLedger(): ImpactLedgerEntry[] {
    if (!isClient()) return INITIAL_LEDGER;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEDGER);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(INITIAL_LEDGER));
        return INITIAL_LEDGER;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_LEDGER;
    }
  },

  addLedgerEntry(entry: Omit<ImpactLedgerEntry, "id">): ImpactLedgerEntry {
    const list = this.getImpactLedger();
    const newId = 100 + list.length + 1;
    const item: ImpactLedgerEntry = { id: newId, ...entry };
    const updated = [item, ...list];
    if (isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(updated));
      } catch (e) {
        console.error("CivicStore: Failed to add ledger entry", e);
      }
    }
    return item;
  },

  // PROJECTS
  getProjects(): UniversityProject[] {
    if (!isClient()) return INITIAL_PROJECTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
        return INITIAL_PROJECTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_PROJECTS;
    }
  },

  claimChallenge(
    challengeId: number,
    universityName: string,
    departmentName: string
  ): UniversityProject {
    // 1. Update Challenge status to MATCHED
    this.updateChallengeStatus(challengeId, "MATCHED", {
      matchedUniversity: {
        name: universityName,
        department: departmentName,
        matchScore: 95,
      },
    });

    // 2. Add to active projects
    const projects = this.getProjects();
    const challenge = this.getChallengeById(challengeId);
    const newProjId = projects.length + 1;

    const newProject: UniversityProject = {
      projectId: newProjId,
      challengeId,
      title: challenge ? challenge.title : `Societal Project #${challengeId}`,
      university: universityName,
      leadResearcher: "Dr. Civic Research Team",
      department: departmentName,
      district: challenge?.district || "Madhya Pradesh",
      currentStage: "DISCOVERY",
      progressPercent: 20,
      milestones: [
        { id: 1, title: "Initial Field Survey & Stakeholder Consultation", completed: true, dueDate: "Month 1" },
        { id: 2, title: "Lab Simulation & Low-Cost Prototype Sizing", completed: false, dueDate: "Month 2" },
        { id: 3, title: "Gram Panchayat Field Pilot Installation", completed: false, dueDate: "Month 4" },
        { id: 4, title: "Impact Verification & Handover Audit", completed: false, dueDate: "Month 6" },
      ],
      deliverables: [],
    };

    const updatedProjects = [newProject, ...projects];
    if (isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
      } catch (e) {
        console.error("CivicStore: Failed to save new project", e);
      }
    }
    return newProject;
  },

  advanceProjectStage(
    projectId: number,
    nextStage: UniversityProject["currentStage"]
  ): UniversityProject | null {
    const list = this.getProjects();
    const idx = list.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return null;

    const stageProgress: Record<UniversityProject["currentStage"], number> = {
      DISCOVERY: 25,
      PROTOTYPE: 50,
      PILOT_TESTING: 75,
      FIELD_DEPLOYMENT: 90,
      IMPACT_VERIFIED: 100,
    };

    list[idx] = {
      ...list[idx],
      currentStage: nextStage,
      progressPercent: stageProgress[nextStage] || 50,
    };

    // If advanced to IMPACT_VERIFIED, also update challenge to RESOLVED
    if (nextStage === "IMPACT_VERIFIED") {
      this.updateChallengeStatus(list[idx].challengeId, "RESOLVED");
    }

    if (isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(list));
      } catch (e) {
        console.error("CivicStore: Failed to advance project stage", e);
      }
    }
    return list[idx];
  },

  addProjectDeliverable(
    projectId: number,
    fileName: string
  ): UniversityProject | null {
    const list = this.getProjects();
    const idx = list.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return null;

    list[idx].deliverables.push({
      name: fileName,
      url: "#",
      uploadedAt: new Date().toISOString().split("T")[0],
    });

    if (isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(list));
      } catch (e) {
        console.error("CivicStore: Failed to add project deliverable", e);
      }
    }
    return list[idx];
  },

  resetDefaults(): void {
    if (!isClient()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(INITIAL_CHALLENGES));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(INITIAL_LEDGER));
    } catch { }
  },
};

export default CivicStore;
