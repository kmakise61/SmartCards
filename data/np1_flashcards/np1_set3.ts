
import { Flashcard } from '../../types';

// Helper to create cards with NP1 Set 3 defaults
const c = (id: string, front: string, back: string, tags: string[], hint?: string): Flashcard => ({
  id,
  deckId: 'np1_set3',
  np: 'NP1',
  setId: 'np1_set3',
  setName: 'COPAR & IMCI',
  setDescription: 'Community Organizing Participatory Action Research & Integrated Management of Childhood Illness.',
  setTags: ['COPAR', 'IMCI', 'PEDIA'],
  front,
  back,
  tags: ['NP1', ...tags],
  hint,
  status: 'new',
  interval: 0,
  easeFactor: 2.5
});

export const NP1_SET3: Flashcard[] = [
  c('np1_set3_001', 
    'What is the **Pre-Entry Phase** of COPAR also known as?', 
    'The **Site Selection Phase**.\n\n_Activity:_ Preliminary social investigation (PSI) to choose the community.', 
    ['Community Organizing', 'Phases']
  ),
  c('np1_set3_002', 
    'In which COPAR phase does the **Core Group Formation** happen?', 
    '**Entry Phase** (Social Preparation).\n\n_Goal:_ identifying potential leaders.', 
    ['Community Organizing', 'Phases']
  ),
  c('np1_set3_003', 
    'What is the **Sustenance and Strengthening Phase** of COPAR?', 
    'Also known as the **Phase-Out Phase**.\n\n_Goal:_ The community becomes self-reliant and the nurse gradually withdraws.', 
    ['Community Organizing', 'Phases']
  ),
  c('np1_set3_004', 
    'Describe a **Blended Family**.', 
    'Also called a **Step-Family**.\n\n_Structure:_ At least one stepparent, stepsibling, or half-sibling.', 
    ['Family Nursing', 'Family Types', 'Definitions']
  ),
  c('np1_set3_005', 
    'What is a **Cohabitating Family**?', 
    'A couple living together **without legal marriage** (Live-in).', 
    ['Family Nursing', 'Family Types', 'Definitions']
  ),
  c('np1_set3_006', 
    'In the Family Nursing Process, what is a **Health Threat**?', 
    'Conditions that promote disease or injury, but **disease is not yet present**.\n\n_Examples:_ Poor sanitation, lack of immunization, smoking.', 
    ['Family Nursing', 'Diagnosis']
  ),
  c('np1_set3_007', 
    'In the Family Nursing Process, what is a **Health Deficit**?', 
    'A gap between actual and achievable health status (**Illness is present**).\n\n_Examples:_ TB infection, disability, pregnancy complications.', 
    ['Family Nursing', 'Diagnosis']
  ),
  c('np1_set3_008', 
    'What is a **Foreseeable Crisis**?', 
    'Anticipated periods of unusual demand on the family.\n\n_Examples:_ Marriage, pregnancy, retirement, death.', 
    ['Family Nursing', 'Diagnosis']
  ),
  c('np1_set3_009', 
    'In IMCI, what does the **PINK** color code indicate?', 
    '**Urgent Referral** needed.\n\n_Action:_ Give first dose of treatment and refer immediately to a hospital.', 
    ['IMCI', 'Pediatrics', 'Triage']
  ),
  c('np1_set3_010', 
    'In IMCI, what does the **YELLOW** color code indicate?', 
    '**Specific Medical Treatment** needed.\n\n_Action:_ Treat at the health center (e.g., antibiotics) and follow up.', 
    ['IMCI', 'Pediatrics', 'Triage']
  ),
  c('np1_set3_011', 
    'In IMCI, what does the **GREEN** color code indicate?', 
    '**Home Care**.\n\n_Action:_ Advise mother on home management (fluids, feeding) and when to return.', 
    ['IMCI', 'Pediatrics', 'Triage']
  ),
  c('np1_set3_012', 
    'What are the **4 General Danger Signs** in IMCI?', 
    '1. Convulsions\n2. Lethargic or Unconscious\n3. Cannot drink/breastfeed\n4. Vomits everything', 
    ['IMCI', 'Pediatrics', 'Signs']
  ),
  c('np1_set3_013', 
    'In Disaster Triage, what does the **BLACK tag** mean?', 
    '**Deceased or Expectant**.\n\n_Criteria:_ Not breathing even after opening the airway.', 
    ['Disaster Nursing', 'Disaster', 'Triage', 'Colors']
  ),
  c('np1_set3_014', 
    'In Disaster Triage, what does the **GREEN tag** mean?', 
    '**Walking Wounded** (Minor).\n\n_Criteria:_ Can walk and follow commands; injuries are not life-threatening.', 
    ['Disaster Nursing', 'Disaster', 'Triage', 'Colors']
  ),
  c('np1_set3_015', 
    'What is a **Biological Hazard** in the workplace?', 
    'Exposure to living organisms like bacteria, viruses, or fungi.\n\n_Example:_ Needlestick injury in a hospital.', 
    ['Occupational Health', 'Hazards']
  ),
  c('np1_set3_016', 
    'What is an **Ergonomic Hazard**?', 
    'Factors that cause musculoskeletal strain.\n\n_Examples:_ Poor posture, heavy lifting, repetitive movements.', 
    ['Occupational Health', 'Hazards']
  ),
  c('np1_set3_017', 
    'Differentiate **Isolation** vs. **Quarantine**.', 
    '**Isolation:** Separates _sick_ people.\n**Quarantine:** Separates/restricts movement of _exposed/healthy_ people to see if they become sick.', 
    ['Communicable Diseases', 'Concepts', 'Infection Control']
  ),
  c('np1_set3_018', 
    'Which vaccines are given **Subcutaneously (SQ)**?', 
    '**Measles**, MMR, Varicella, Yellow Fever.\n\n_Mnemonic:_ \'Put it under the skin if it\'s a live virus\' (mostly).', 
    ['Immunization', 'EPI', 'Skills', 'Pediatrics']
  ),
  c('np1_set3_019', 
    'What is the only vaccine given **Orally** in the EPI?', 
    '**OPV** (Oral Polio Vaccine) and Rotavirus.\n\n_Dose:_ 2 drops.', 
    ['Immunization', 'EPI', 'Pediatrics', 'Routes']
  ),
  c('np1_set3_020', 
    'What is the **Sex Ratio**?', 
    'The number of **Males per 100 Females**.\n\n_Formula:_ (Males / Females) x 100.', 
    ['Statistics', 'Demography', 'Formulas']
  ),
  c('np1_set3_021', 
    'Which law mandated the **reporting of communicable diseases**?', 
    '**RA 3573** (Law on Reporting of Communicable Diseases).', 
    ['Health Laws', 'Epidemiology']
  ),
  c('np1_set3_022', 
    'What is the BMI range for **Obesity** (Asian Standards)?', 
    '**≥ 25 kg/m²** (International is ≥ 30).\n\n_Normal (Asian):_ 18.5 - 22.9.', 
    ['NCDs', 'Nutrition', 'NCD', 'Values']
  ),
  c('np1_set3_023', 
    'What is the drug of choice for **Malaria** (treatment)?', 
    '**Chloroquine** (First line).\n\n_If resistant:_ Artemether-Lumefantrine (Coartem).', 
    ['Communicable Diseases', 'Pharmacology', 'Vector-borne']
  ),
  c('np1_set3_024', 
    'What is the **Sangkap Pinoy Seal**?', 
    'A seal on food products indicating they are fortified with **Vitamin A, Iron, or Iodine**.', 
    ['DOH Programs', 'Nutrition', 'DOH Program']
  ),
  c('np1_set3_025', 
    'Which law is the **ASIN Law**?', 
    '**RA 8172** (Act for Salt Iodization Nationwide).\n\n_Goal:_ Prevent Iodine Deficiency Disorders (Goiter, Cretinism).', 
    ['Health Laws', 'Nutrition']
  ),
  c('np1_set3_026', 
    'What is the primary focus of **School Nursing**?', 
    'Health promotion and **health education** for the school population.', 
    ['School Nursing', 'Specialized Fields', 'School Health']
  ),
  c('np1_set3_027', 
    'What is the **Incident Command System (ICS)**?', 
    'A standardized approach to the command, control, and coordination of emergency response.', 
    ['Disaster Nursing', 'Disaster', 'Management']
  ),
  c('np1_set3_028', 
    'What is the **SCREEM** assessment tool?', 
    'Assesses family **Resources**:\nSocial, Cultural, Religious, Economic, Educational, Medical.', 
    ['Family Nursing', 'Assessment Tools', 'Family']
  ),
  c('np1_set3_029', 
    'What is an **Eco-Map**?', 
    'A diagram showing the family\'s **connection to the community** and external environment.', 
    ['Family Nursing', 'Assessment Tools', 'Family']
  ),
  c('np1_set3_030', 
    'What is the **Alma Ata Declaration** famous for?', 
    'Establishing **Primary Health Care (PHC)** as the key to \'Health for All\'.\n\n_Year:_ 1978.', 
    ['CHN Concepts', 'History', 'PHC']
  ),
  c('np1_set3_031', 
    'What is the causative agent of **Leptospirosis**?', 
    '**Leptospira interrogans** (Spirochete).\n\n_Source:_ Rat urine.', 
    ['Communicable Diseases', 'Zoonotic', 'Bacterial', 'Agents']
  ),
  c('np1_set3_032', 
    'What is the hallmark sign of **Typhoid Fever**?', 
    '**Rose Spots** on the abdomen and a \'stepladder\' fever.', 
    ['Communicable Diseases', 'Bacterial', 'Signs', 'Water-borne']
  ),
  c('np1_set3_033', 
    'In IMCI, how do you assess for **Severe Dehydration**?', 
    'Two of the following:\n1. Unconscious/Lethargic\n2. Sunken eyes\n3. Cannot drink\n4. Skin pinch goes back **very slowly** (>2 secs).', 
    ['IMCI', 'Assessment', 'Pediatrics']
  ),
  c('np1_set3_034', 
    'What is **Modifiable Risk Factor**?', 
    'A risk that **can be changed** or controlled.\n\n_Examples:_ Diet, Smoking, Sedentary lifestyle.', 
    ['NCDs', 'NCD', 'Concepts']
  ),
  c('np1_set3_035', 
    'What is a **Non-Modifiable Risk Factor**?', 
    'A risk that **cannot** be changed.\n\n_Examples:_ Age, Gender, Genetics/Heredity.', 
    ['NCDs', 'NCD', 'Concepts']
  ),
  c('np1_set3_036', 
    'What does a high **Infant Mortality Rate (IMR)** indicate?', 
    'Poor health status of the community and poor maternal/child health services.', 
    ['Statistics', 'Epidemiology', 'Indicators']
  ),
  c('np1_set3_037', 
    'Which law regulates **Organ Donation**?', 
    '**RA 7170** (Organ Donation Act of 1991).', 
    ['Health Laws', 'Laws', 'Ethics']
  ),
  c('np1_set3_038', 
    'What is the **Good Samaritan Law**?', 
    'Protects healthcare providers from liability when providing emergency care in **good faith** outside the hospital.', 
    ['Bioethics', 'Law', 'Emergency']
  ),
  c('np1_set3_039', 
    'When is the **Hepatitis B** vaccine ideally given?', 
    '**At birth** (within 24 hours).\n\n_Why:_ To prevent mother-to-child transmission.', 
    ['Immunization', 'EPI', 'Pediatrics', 'Timing']
  ),
  c('np1_set3_040', 
    'What is the **Tsekap** (Tamang Serbisyo sa Kalusugan ng Pamilya) program?', 
    'A package of essential health services for the poor (under PhilHealth).', 
    ['DOH Programs', 'DOH Program', 'UHC']
  ),
  c('np1_set3_041', 
    'What is the vector for **Chikungunya**?', 
    '**Aedes aegypti** and **Aedes albopictus**.', 
    ['Communicable Diseases', 'Vector-borne', 'Viral']
  ),
  c('np1_set3_042', 
    'What is the **Unit of Service** in Community Health Nursing?', 
    'The **Family**.\n\n_Note:_ The patient is the Community; the unit of care is the Family.', 
    ['CHN Concepts', 'Concepts', 'Foundations']
  ),
  c('np1_set3_043', 
    'What is **Level II** Water Supply?', 
    '**Communal Faucet** System.\n\n_Service:_ Pipe system with a faucet for a cluster of households.', 
    ['Environmental Health', 'Environment', 'Water Safety']
  ),
  c('np1_set3_044', 
    'What is **Level III** Water Supply?', 
    '**Individual House Connections** (Waterworks System).\n\n_Service:_ Piped directly into the house.', 
    ['Environmental Health', 'Environment', 'Water Safety']
  ),
  c('np1_set3_045', 
    'What is **Proportionate Mortality Rate**?', 
    'Percentage of deaths due to a specific cause out of the **total deaths**.', 
    ['Statistics', 'Epidemiology', 'Rates']
  ),
  c('np1_set3_046', 
    'What is the primary focus of **School Nursing**?', 
    'Health promotion and **health education** for the school population.', 
    ['School Nursing', 'Specialized Fields', 'School Health']
  ),
  c('np1_set3_047', 
    'What is the drug of choice for **Tetanus**?', 
    '**Penicillin G** (Antibiotic) and **TIG** (Tetanus Immunoglobulin).\n\n_Also:_ Muscle relaxants (Diazepam).', 
    ['Communicable Diseases', 'Pharmacology', 'Emergency']
  ),
  c('np1_set3_048', 
    'What is the **contraindication** for Pertussis vaccine (DPT)?', 
    'History of **Convulsions** or active CNS disease.\n\n_Action:_ Give DT instead.', 
    ['Immunization', 'EPI', 'Contraindications', 'Pediatrics']
  ),
  c('np1_set3_049', 
    'Which law deals with **Violence Against Women and Children (VAWC)**?', 
    '**RA 9262**.\n\n_Protection:_ Barangay Protection Order (BPO).', 
    ['Health Laws', 'Laws', 'Women\'s Health']
  ),
  c('np1_set3_050', 
    'What is the primary mode of transmission for **SARS**?', 
    '**Respiratory Droplets** and contact with contaminated objects.', 
    ['Communicable Diseases', 'Viral', 'Respiratory', 'Transmission']
  )
];
