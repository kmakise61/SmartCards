
import { Flashcard } from '../../types';

const c = (id: string, front: string, back: string, tags: string[], hint?: string): Flashcard => ({
  id,
  deckId: 'np1_set1',
  np: 'NP1',
  setId: 'np1_set1',
  setName: 'Foundations & CD',
  setDescription: 'Nursing Foundations & Communicable Diseases',
  setTags: ['COMMUNICABLE', 'FOUNDATIONS'],
  front,
  back,
  tags,
  hint,
  status: 'new',
  interval: 0,
  easeFactor: 2.5
});

export const NP1_SET1: Flashcard[] = [
  c('np1_001', 
    'What is the causative agent of **Cholera**?', 
    '**Vibrio cholerae**\n\n_Key Note:_ Known for \'Rice-water stool\' (pathognomonic sign).', 
    ['NP1', 'Communicable Diseases', 'Bacterial', 'Water-borne', 'Pathognomonic']
  ),
  c('np1_002', 
    'What is the primary vector for **Malaria**?', 
    'Female **Anopheles** mosquito\n\n_Mnemonic:_ \'Anopheles loves the night\' (Night-biting).', 
    ['NP1', 'Communicable Diseases', 'Vector-borne', 'Parasitic']
  ),
  c('np1_003', 
    'Identify the pathognomonic sign of **Measles (Rubeola)** found in the buccal mucosa.', 
    '**Koplik\'s Spots**\n\n_Description:_ Small, irregular red spots with a bluish-white center.', 
    ['NP1', 'Communicable Diseases', 'Viral', 'Pediatrics', 'Signs']
  ),
  c('np1_004', 
    'What is the **Silent Killer** due to its asymptomatic nature in early stages?', 
    '**Hypertension**\n\n_Fact:_ Persistent elevation of BP ≥ 140/90 mmHg based on two separate readings.', 
    ['NP1', 'NCD', 'NCDs', 'Cardiovascular', 'Chronic', 'Vital Signs']
  ),
  c('np1_005', 
    'Which Republic Act is known as the **Universal Health Care Act**?', 
    '**RA 11223**\n\n_Goal:_ Automatically enrolls all Filipino citizens in the National Health Insurance Program (PhilHealth).', 
    ['NP1', 'Health Laws', 'Laws', 'UHC', 'PhilHealth']
  ),
  c('np1_006', 
    'In the **Bag Technique**, which part of the bag is considered clean?', 
    'The **Inside** of the bag.\n\n_Principle:_ The outside is considered contaminated; the inside is clean/sterile.', 
    ['NP1', 'Family Nursing', 'CHN', 'Skills', 'Infection Control']
  ),
  c('np1_007', 
    'What is the drug of choice for **Leprosy** (Hansen\'s Disease)?', 
    '**Multi-Drug Therapy (MDT)**: Rifampicin, Clofazimine, and Dapsone.\n\n_Mnemonic:_ **RCD** (Review Center Day).', 
    ['NP1', 'Communicable Diseases', 'Pharmacology', 'Bacterial', 'DOH Program']
  ),
  c('np1_008', 
    'Which vital statistic measures the **risk of dying from pregnancy-related causes**?', 
    '**Maternal Mortality Rate (MMR)**\n\n_Formula:_ (Maternal Deaths / Total Live Births) x 1,000', 
    ['NP1', 'Statistics', 'Epidemiology', 'Formulas', 'Maternal']
  ),
  c('np1_009', 
    'In which phase of COPAR does the **selection of potential leaders** occur?', 
    '**Entry Phase** (Social Preparation Phase)\n\n_Note:_ Integration with the community happens here.', 
    ['NP1', 'COPAR', 'Community Organizing', 'Phases']
  ),
  c('np1_010', 
    'What is the causative agent of **Syphilis**?', 
    '**Treponema pallidum**\n\n_Type:_ Spirochete bacterium.', 
    ['NP1', 'Communicable Diseases', 'STI', 'Bacterial', 'Agents']
  ),
  c('np1_011', 
    'What is the hallmark sign of **Tetanus**?', 
    '**Risus Sardonicus** (Sardonic Smile) or **Trismus** (Lockjaw).\n\n_Agent:_ Clostridium tetani (Anaerobic).', 
    ['NP1', 'Communicable Diseases', 'Bacterial', 'Neurologic', 'Signs']
  ),
  c('np1_012', 
    'What is the primary risk factor for **Chronic Obstructive Pulmonary Disease (COPD)**?', 
    '**Cigarette Smoking**\n\n_Pathology:_ Causes chronic bronchitis and emphysema.', 
    ['NP1', 'NCD', 'NCDs', 'Respiratory', 'Lifestyle', 'Prevention']
  ),
  c('np1_013', 
    'What is the route of administration for the **BCG Vaccine**?', 
    '**Intradermal (ID)**\n\n_Site:_ Right deltoid region of the arm.', 
    ['NP1', 'Immunization', 'EPI', 'Pediatrics', 'Skills']
  ),
  c('np1_014', 
    'What is the vector for **Dengue Hemorrhagic Fever**?', 
    '**Aedes aegypti**\n\n_Characteristics:_ Day-biting, low-flying, breeds in clear stagnant water.', 
    ['NP1', 'Communicable Diseases', 'Vector-borne', 'Viral', 'DOH Program']
  ),
  c('np1_015', 
    'Which law deals with **Solid Waste Management**?', 
    '**RA 9003**\n\n_Key Concept:_ Segregation, recycling, and composting.', 
    ['NP1', 'Health Laws', 'Environmental Health', 'Laws']
  ),
  c('np1_016', 
    'What is the incubation period for **Chickenpox**?', 
    '**2-3 weeks (14-21 days)**\n\n_Agent:_ Varicella-Zoster Virus.', 
    ['NP1', 'Communicable Diseases', 'Viral', 'Incubation', 'Pediatrics']
  ),
  c('np1_017', 
    'Differentiate **Incidence** vs. **Prevalence**.', 
    '**Incidence:** Number of _NEW_ cases.\n**Prevalence:** Total number of _OLD and NEW_ cases at a point in time.', 
    ['NP1', 'Statistics', 'Epidemiology', 'Definitions']
  ),
  c('np1_018', 
    'What is the drug of choice for **Amebiasis** and **Giardiasis**?', 
    '**Metronidazole (Flagyl)**\n\n_Teaching:_ Avoid alcohol due to Disulfiram-like reaction.', 
    ['NP1', 'Communicable Diseases', 'Pharmacology', 'Parasitic']
  ),
  c('np1_019', 
    'What are the **3 Ps** of Diabetes Mellitus?', 
    '1. **Polyuria** (Excessive urination)\n2. **Polydipsia** (Excessive thirst)\n3. **Polyphagia** (Excessive hunger)', 
    ['NP1', 'NCD', 'NCDs', 'Endocrine', 'Signs', 'Triad']
  ),
  c('np1_020', 
    'What is the diagnostic test for **Typhoid Fever**?', 
    '**Widal Test** (Blood culture is the Gold Standard).\n\n_Agent:_ Salmonella typhi.', 
    ['NP1', 'Communicable Diseases', 'Diagnostics', 'Water-borne', 'Bacterial']
  ),
  c('np1_021', 
    'What is the vector for **Schistosomiasis**?', 
    '**Oncomelania quadrasi** snail.\n\n_Prevention:_ Proper sanitation and snail control.', 
    ['NP1', 'Communicable Diseases', 'Parasitic', 'Vector-borne', 'Snail']
  ),
  c('np1_022', 
    'What is the **primary goal** of Community Health Nursing?', 
    'To raise the **level of health of the citizenry**.\n\n_Focus:_ Health promotion and disease prevention.', 
    ['NP1', 'CHN Concepts', 'Definitions', 'Foundations']
  ),
  c('np1_023', 
    'What is the causative agent of **Whooping Cough**?', 
    '**Bordetella pertussis**\n\n_Sign:_ Paroxysmal cough with high-pitched inspiratory \'whoop\'.', 
    ['NP1', 'Communicable Diseases', 'Bacterial', 'Respiratory', 'Pediatrics']
  ),
  c('np1_024', 
    'Which law created the **Dangerous Drugs Board**?', 
    '**RA 9165** (Comprehensive Dangerous Drugs Act of 2002).', 
    ['NP1', 'Health Laws', 'Laws', 'Drugs', 'Regulatory']
  ),
  c('np1_025', 
    'Which family assessment tool illustrates **generational health patterns**?', 
    '**Genogram**\n\n_Structure:_ Must include at least 3 generations.', 
    ['NP1', 'Family Nursing', 'Assessment Tools', 'Family']
  ),
  c('np1_026', 
    'What is the confirmatory test for **HIV/AIDS** in the Philippines?', 
    '**Western Blot Test**\n\n_Screening:_ ELISA (Enzyme-Linked Immunosorbent Assay).', 
    ['NP1', 'Communicable Diseases', 'STI', 'Diagnostics', 'Viral']
  ),
  c('np1_027', 
    'What is the **Mode of Transmission** for Hepatitis A?', 
    '**Fecal-Oral Route**\n\n_Mnemonic:_ Hep **A** and **E** are from **A**n*s to **E**at (Fecal-Oral).', 
    ['NP1', 'Communicable Diseases', 'Viral', 'Gastrointestinal', 'Transmission']
  ),
  c('np1_028', 
    'What is the most common cancer among **Filipino women**?', 
    '**Breast Cancer**\n\n_Screening:_ BSE (Monthly), Mammography (Age 40+).', 
    ['NP1', 'NCD', 'NCDs', 'Oncology', 'Women\'s Health', 'Statistics']
  ),
  c('np1_029', 
    'In water sanitation, what does **Level I** refer to?', 
    '**Point Source** (e.g., protected well, spring).\n\n_Service:_ 15-25 households within 250 meters.', 
    ['NP1', 'Environmental Health', 'Sanitation', 'Levels', 'Environment']
  ),
  c('np1_030', 
    'What is the causative agent of **Anthrax**?', 
    '**Bacillus anthracis**\n\n_Types:_ Cutaneous, Inhalational (Woolsorter\'s disease), Gastrointestinal.', 
    ['NP1', 'Communicable Diseases', 'Bacterial', 'Zoonotic', 'Bioterrorism']
  ),
  c('np1_031', 
    'What is the drug of choice for **Leptospirosis** prophylaxis?', 
    '**Doxycycline**\n\n_Note:_ Taken within 24-72 hours of exposure to flood waters.', 
    ['NP1', 'Communicable Diseases', 'Pharmacology', 'Zoonotic', 'Prevention']
  ),
  c('np1_032', 
    'Identify the vector for **Filariasis** (Elephantiasis).', 
    '**Aedes poecilus** (primary in PH) or Culex/Anopheles.\n\n_Agent:_ Wuchereria bancrofti.', 
    ['NP1', 'Communicable Diseases', 'Vector-borne', 'Parasitic', 'DOH Program']
  ),
  c('np1_033', 
    'Immunization falls under which **Level of Prevention**?', 
    '**Primary Prevention**\n\n_Goal:_ Health promotion and specific protection against disease.', 
    ['NP1', 'Levels of Prevention', 'Prevention', 'Concepts']
  ),
  c('np1_034', 
    'What is the definitive diagnostic test for **Malaria**?', 
    '**Blood Smear** (Thick and Thin).\n\n_Timing:_ Best done at the peak of fever.', 
    ['NP1', 'Communicable Diseases', 'Diagnostics', 'Vector-borne']
  ),
  c('np1_035', 
    'What is the characteristic stool appearance in **Bacillary Dysentery** (Shigellosis)?', 
    '**Bloody, mucoid stool** with tenesmus (painful straining).', 
    ['NP1', 'Communicable Diseases', 'Gastrointestinal', 'Bacterial', 'Signs']
  ),
  c('np1_036', 
    'In Triage (START method), what does the **RED tag** signify?', 
    '**Immediate / Emergent**\n\n_Condition:_ Life-threatening but treatable (e.g., airway obstruction, uncontrolled bleeding).', 
    ['NP1', 'Disaster Nursing', 'Triage', 'Emergency', 'Colors']
  ),
  c('np1_037', 
    'Which law provides for the **Magna Carta of Public Health Workers**?', 
    '**RA 7305**\n\n_Benefits:_ Hazard pay, subsistence allowance, laundry allowance.', 
    ['NP1', 'Health Laws', 'Laws', 'Professional Adjustment']
  ),
  c('np1_038', 
    'What is the **Swaroop\'s Index**?', 
    'Percentage of deaths aged **50 years or older**.\n\n_Significance:_ A sensitive indicator of the standard of health care in a country.', 
    ['NP1', 'Statistics', 'Indicators', 'Formulas', 'Epidemiology']
  ),
  c('np1_039', 
    'What is the causative agent of **Gonorrhea**?', 
    '**Neisseria gonorrhoeae**\n\n_Slang:_ \'The Clap\' or \'Drip\'.', 
    ['NP1', 'Communicable Diseases', 'STI', 'Bacterial', 'Agents']
  ),
  c('np1_040', 
    'What is the hallmark sign of **Rabies**?', 
    '**Hydrophobia** (fear of water) and **Aerophobia** (fear of air).\n\n_Agent:_ Lyssavirus / Rhabdovirus.', 
    ['NP1', 'Communicable Diseases', 'Viral', 'Zoonotic', 'Signs']
  ),
  c('np1_041', 
    'Which type of prevention involves **Rehabilitation**?', 
    '**Tertiary Prevention**\n\n_Goal:_ Restore function and limit disability after disease has occurred.', 
    ['NP1', 'NCD', 'NCDs', 'Prevention', 'Concepts']
  ),
  c('np1_042', 
    'What is the treatment strategy for **Tuberculosis**?', 
    '**DOTS** (Directly Observed Treatment, Short-course).\n\n_Duration:_ Minimum of 6 months.', 
    ['NP1', 'Communicable Diseases', 'Respiratory', 'Bacterial', 'DOH Program']
  ),
  c('np1_043', 
    'What causes **Paralytic Shellfish Poisoning** (Red Tide)?', 
    '**Dinoflagellates** (Pyrodinium bahamense).\n\n_Neurotoxin:_ Saxitoxin.', 
    ['NP1', 'Environmental Health', 'Toxicology', 'Environment', 'Agents']
  ),
  c('np1_044', 
    'What is a **Nuclear Family**?', 
    'A family unit composed of **Husband, Wife, and Children** (natural or adopted).\n\n_Note:_ Also known as the \'Primary\' or \'Elementary\' family.', 
    ['NP1', 'Family Nursing', 'Family Types', 'Definitions']
  ),
  c('np1_045', 
    'What is the causative agent of **Trichomoniasis**?', 
    '**Trichomonas vaginalis** (Protozoan).\n\n_Sign:_ Yellow-green, frothy, foul-smelling vaginal discharge.', 
    ['NP1', 'Communicable Diseases', 'STI', 'Parasitic', 'Signs']
  ),
  c('np1_046', 
    'At what temperature should **OPV** (Oral Polio Vaccine) be stored?', 
    '**-15°C to -25°C** (Freezer).\n\n_Note:_ OPV and Measles vaccines are the most heat-sensitive.', 
    ['NP1', 'Immunization', 'Cold Chain', 'EPI', 'Pediatrics']
  ),
  c('np1_047', 
    'What is the vector for **Japanese Encephalitis**?', 
    '**Culex** mosquito.\n\n_Reservoir:_ Pigs and wading birds.', 
    ['NP1', 'Communicable Diseases', 'Vector-borne', 'Viral']
  ),
  c('np1_048', 
    'In the **Health Belief Model**, what prompts a person to take action?', 
    '**Cues to Action**\n\n_Examples:_ Media campaigns, advice from family/friends, physical symptoms.', 
    ['NP1', 'CHN Concepts', 'Models', 'Health Promotion']
  ),
  c('np1_049', 
    'What is the **Incubation Period** for Hepatitis B?', 
    '**45 to 160 days** (Average 120 days).\n\n_Transmission:_ Blood and body fluids.', 
    ['NP1', 'Communicable Diseases', 'Viral', 'Hepatitis', 'Incubation']
  ),
  c('np1_050', 
    'What formula is used for **Crude Birth Rate (CBR)**?', 
    '(Total Live Births / Mid-year Population) x 1,000', 
    ['NP1', 'Statistics', 'Epidemiology', 'Formulas', 'Fertility']
  )
];
