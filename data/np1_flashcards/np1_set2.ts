
import { Flashcard } from '../../types';

// Helper to create cards with NP1 Set 2 defaults
const c = (id: string, front: string, back: string, tags: string[], hint?: string): Flashcard => ({
  id,
  deckId: 'np1_set2',
  np: 'NP1',
  setId: 'np1_set2',
  setName: 'Ethics, Law & Research',
  setDescription: 'Professional Adjustment, Nursing Jurisprudence, and Research Methodology.',
  setTags: ['ETHICS', 'LAW', 'RESEARCH'],
  front,
  back,
  tags: ['NP1', ...tags],
  hint,
  status: 'new',
  interval: 0,
  easeFactor: 2.5
});

export const NP1_SET2: Flashcard[] = [
  c('np1_set2_001', 
    'What is the DOH-approved herbal medicine for **Asthma** and Cough?', 
    '**Lagundi** (Vitex negundo)\n\n_Preparation:_ Decoction (Boil leaves).', 
    ['Herbal Medicine', 'DOH Program', 'Herbal', 'Respiratory']
  ),
  c('np1_set2_002', 
    'What herbal medicine is prescribed for **Edema** and acts as a diuretic?', 
    '**Sambong** (Blumea balsamifera)\n\n_Also for:_ Anti-urolithiasis (Dissolving kidney stones).', 
    ['Herbal Medicine', 'DOH Program', 'Herbal', 'Renal']
  ),
  c('np1_set2_003', 
    'Which ethical principle refers to the **duty to do good**?', 
    '**Beneficence**\n\n_Contrast:_ Non-maleficence means \'do no harm\'.', 
    ['Bioethics', 'Ethics', 'Principles']
  ),
  c('np1_set2_004', 
    'What is the principle of **Veracity**?', 
    'The duty to **tell the truth**.\n\n_Application:_ Informed consent and accurate documentation.', 
    ['Bioethics', 'Ethics', 'Principles']
  ),
  c('np1_set2_005', 
    'Differentiate **Negligence** from **Malpractice**.', 
    '**Negligence:** Failure to do what a prudent nurse would do (carelessness).\n**Malpractice:** Negligence committed by a professional that requires skill.', 
    ['Jurisprudence', 'Law', 'Definitions', 'Liability']
  ),
  c('np1_set2_006', 
    'What is the doctrine of **Res Ipsa Loquitur**?', 
    '**\'The thing speaks for itself\'**.\n\n_Example:_ Surgical sponge left inside a patient\'s abdomen.', 
    ['Jurisprudence', 'Law', 'Doctrines']
  ),
  c('np1_set2_007', 
    'What crime is committed if a nurse **threatens** a patient without physical contact?', 
    '**Assault**\n\n_Note:_ If physical contact occurs, it becomes **Battery**.', 
    ['Jurisprudence', 'Law', 'Crimes']
  ),
  c('np1_set2_008', 
    'In research, what is the **Independent Variable**?', 
    'The variable that is **manipulated** or the \'cause\'.\n\n_Example:_ The new drug being tested.', 
    ['Research', 'Variables']
  ),
  c('np1_set2_009', 
    'What type of research explores the **lived experience** of individuals (Phenomenology)?', 
    '**Qualitative Research**\n\n_Focus:_ Understanding meaning, not measuring statistics.', 
    ['Research', 'Types']
  ),
  c('np1_set2_010', 
    'What is the **Gold Standard** for bacteriological testing of water?', 
    '**E. coli** count (Coliform test).\n\n_Significance:_ Indicates fecal contamination.', 
    ['Environmental Health', 'Environment', 'Water Safety', 'Diagnostics']
  ),
  c('np1_set2_011', 
    'What does **Garantisadong Pambata** promote?', 
    'Twice a year **Vitamin A supplementation** and Deworming.\n\n_Schedule:_ April and October.', 
    ['DOH Programs', 'DOH Program', 'Pediatrics', 'Nutrition']
  ),
  c('np1_set2_012', 
    'What herbal medicine is used to lower **blood sugar** (Anti-diabetes)?', 
    '**Ampalaya** (Momordica charantia)\n\n_Part used:_ Young leaves.', 
    ['Herbal Medicine', 'DOH Program', 'Herbal', 'Endocrine']
  ),
  c('np1_set2_013', 
    'Which herbal medicine is known as a natural **analgesic** for body aches?', 
    '**Yerba Buena** (Peppermint)\n\n_Mnemonic:_ \'Yerba body\' (Your body aches).', 
    ['Herbal Medicine', 'DOH Program', 'Herbal', 'Pain']
  ),
  c('np1_set2_014', 
    'What is the **Window Period** in HIV infection?', 
    'The time between infection and the production of antibodies (approx. 6 weeks to 6 months).\n\n_Risk:_ Test may be false negative, but patient is infectious.', 
    ['Communicable Diseases', 'STI', 'HIV', 'Concepts']
  ),
  c('np1_set2_015', 
    'What is **Case Fatality Rate (CFR)**?', 
    'Percentage of people with a specific disease who **die** from it.\n\n_Indication:_ Measures the killing power or virulence of a disease.', 
    ['Statistics', 'Epidemiology', 'Rates']
  ),
  c('np1_set2_016', 
    'What is a **Subpoena Duces Tecum**?', 
    'A court order to bring **documents** or evidence (e.g., medical charts) to court.', 
    ['Jurisprudence', 'Law', 'Court Orders']
  ),
  c('np1_set2_017', 
    'What is the **Principle of Justice** in healthcare?', 
    '**Fairness** in the distribution of resources and care.\n\n_Example:_ Triage based on need, not social status.', 
    ['Ethics', 'Principles']
  ),
  c('np1_set2_018', 
    'What is the **Hawthorne Effect**?', 
    'Subjects modify their behavior simply because they know they are being **observed**.', 
    ['Research', 'Bias']
  ),
  c('np1_set2_019', 
    'What is **Bawang** (Garlic) primarily used for?', 
    '**Anti-hyperlipidemia** (Lowers cholesterol) and Hypertension.\n\n_Preparation:_ Eaten raw or fried.', 
    ['Herbal Medicine', 'DOH Program', 'Herbal', 'Cardiovascular']
  ),
  c('np1_set2_020', 
    'What is **Bayabas** (Guava) used for?', 
    '**Antiseptic** for wound washing.\n\n_Use:_ Washing wounds or as a gargle for tooth decay.', 
    ['Herbal Medicine', 'DOH Program', 'Herbal', 'First Aid']
  ),
  c('np1_set2_021', 
    'What is the most fatal complication of **Meningococcemia**?', 
    '**Waterhouse-Friderichsen Syndrome** (Adrenal Hemorrhage).\n\n_Sign:_ Purpuric rash and shock.', 
    ['Communicable Diseases', 'Bacterial', 'Emergency', 'Signs']
  ),
  c('np1_set2_022', 
    'Which law requires **Newborn Screening**?', 
    '**RA 9288** (Newborn Screening Act of 2004).', 
    ['Health Laws', 'Laws', 'Pediatrics']
  ),
  c('np1_set2_023', 
    'Which act regulates the **Nursing Practice** in the Philippines?', 
    '**RA 9173** (Philippine Nursing Act of 2002).', 
    ['Health Laws', 'Laws', 'Professional Adjustment']
  ),
  c('np1_set2_024', 
    'What is the hallmark sign of **Diphtheria**?', 
    '**Pseudomembrane** (Greyish membrane) on the tonsils/pharynx.\n\n_Danger:_ Airway obstruction.', 
    ['Communicable Diseases', 'Bacterial', 'Respiratory', 'Signs']
  ),
  c('np1_set2_025', 
    'What test distinguishes **Active TB** from Latent TB?', 
    '**Sputum AFB Smear** (Acid-Fast Bacilli) or GeneXpert.\n\n_Note:_ Skin test (PPD) only shows exposure.', 
    ['Communicable Diseases', 'Diagnostics', 'Respiratory', 'TB']
  ),
  c('np1_set2_026', 
    'What is **Ulasimang Bato** (Pansit-Pansitan) used for?', 
    '**Gout / Arthritis** (Lowers Uric Acid).', 
    ['Herbal Medicine', 'DOH Program', 'Herbal', 'MSK']
  ),
  c('np1_set2_027', 
    'What is **Tsaang Gubat** used for?', 
    '**Stomach ache** (Anti-spasmodic).', 
    ['Herbal Medicine', 'DOH Program', 'Herbal', 'Gastrointestinal']
  ),
  c('np1_set2_028', 
    'What is **Akapulko** used for?', 
    '**Anti-fungal** (Ringworm, Tinea flava).\n\n_Preparation:_ Poultice of crushed leaves.', 
    ['Herbal Medicine', 'DOH Program', 'Herbal', 'Integumentary']
  ),
  c('np1_set2_029', 
    'What is the **Fully Immunized Child (FIC)** criteria?', 
    'Child <1 year old who received:\n1 BCG, 3 Hep B, 3 DPT, 3 OPV, 1 Measles/MMR.', 
    ['Immunization', 'EPI', 'Definitions', 'Pediatrics']
  ),
  c('np1_set2_030', 
    'What is the approved method for **Hospital Waste Disposal**?', 
    '**Incineration** (Modern/Clean) or Autoclaving/Microwaving.\n\n_Open burning is prohibited._', 
    ['Environment', 'Waste Management']
  ),
  c('np1_set2_031', 
    'What is **Libel**?', 
    'Defamation of character through **writing** or printed words.', 
    ['Jurisprudence', 'Law', 'Crimes']
  ),
  c('np1_set2_032', 
    'What is **Slander**?', 
    'Defamation of character through **spoken** words.', 
    ['Jurisprudence', 'Law', 'Crimes']
  ),
  c('np1_set2_033', 
    'What is the principle of **Autonomy**?', 
    'The patient\'s right to **self-determination** and decision-making.\n\n_Key:_ Informed consent respects autonomy.', 
    ['Bioethics', 'Ethics', 'Principles']
  ),
  c('np1_set2_034', 
    'What is **Paternalism**?', 
    'When the healthcare provider makes decisions **for** the patient, limiting their autonomy.', 
    ['Bioethics', 'Ethics', 'Concepts']
  ),
  c('np1_set2_035', 
    'What is the vector for **Zika Virus**?', 
    '**Aedes** mosquito.\n\n_Risk:_ Microcephaly in newborns if mother is infected.', 
    ['Communicable Diseases', 'Vector-borne', 'Maternal', 'Viral']
  ),
  c('np1_set2_036', 
    'What is **Soil-Transmitted Helminthiasis (STH)**?', 
    'Intestinal worms transmitted via contaminated soil.\n\n_Main types:_ Roundworm (Ascaris), Whipworm (Trichuris), Hookworm.', 
    ['Communicable Diseases', 'Parasitic', 'Environment']
  ),
  c('np1_set2_037', 
    'Which law is the **Cheaper Medicines Act**?', 
    '**RA 9502**\n\n_Impact:_ Allows generic prescribing and lowers drug prices.', 
    ['Health Laws', 'Laws', 'Pharmacology']
  ),
  c('np1_set2_038', 
    'What is the hallmark sign of **Mumps**?', 
    '**Parotitis** (Swelling of the parotid glands).\n\n_Complication:_ Orchitis (inflammation of testes) in males.', 
    ['Communicable Diseases', 'Viral', 'Signs', 'Pediatrics']
  ),
  c('np1_set2_039', 
    'In research, what is a **Randomized Controlled Trial (RCT)**?', 
    'The Gold Standard in research where subjects are randomly assigned to experimental or control groups.', 
    ['Research', 'Design']
  ),
  c('np1_set2_040', 
    'What is **Fidelity**?', 
    'The duty to keep **promises** and be faithful to commitments.', 
    ['Ethics', 'Principles']
  ),
  c('np1_set2_041', 
    'What acronym describes the warning signs of **Cancer**?', 
    '**CAUTION US**\nC: Change in bowel/bladder\nA: Sore that doesn\'t heal\nU: Unusual bleeding\n...', 
    ['NCDs', 'Oncology', 'Acronyms']
  ),
  c('np1_set2_042', 
    'What is the primary cause of **Cervical Cancer**?', 
    '**Human Papillomavirus (HPV)**\n\n_Prevention:_ HPV Vaccine.', 
    ['NCDs', 'Oncology', 'Viral', 'Women\'s Health']
  ),
  c('np1_set2_043', 
    'Which water treatment method kills **all** microorganisms?', 
    '**Disinfection / Chlorination** (or Boiling).\n\n_Filtration:_ Only removes solids.', 
    ['Environment', 'Sanitation', 'Environment']
  ),
  c('np1_set2_044', 
    'What is the **Neonatal Mortality Rate**?', 
    'Deaths of infants under **28 days** of age per 1,000 live births.', 
    ['Statistics', 'Epidemiology', 'Rates', 'Pediatrics']
  ),
  c('np1_set2_045', 
    'Which law protects **Data Privacy**?', 
    '**RA 10173** (Data Privacy Act of 2012).', 
    ['Health Laws', 'Laws', 'Documentation']
  ),
  c('np1_set2_046', 
    'What is the drug of choice for **Schistosomiasis**?', 
    '**Praziquantel**\n\n_Action:_ Causes paralysis of the worm.', 
    ['Communicable Diseases', 'Pharmacology', 'Parasitic', 'DOH Program']
  ),
  c('np1_set2_047', 
    'What is the **4 o\'clock Habit**?', 
    'A DOH campaign to stop and search for/destroy **mosquito breeding sites** daily.', 
    ['DOH Programs', 'DOH Program', 'Vector-borne', 'Dengue']
  ),
  c('np1_set2_048', 
    'What is **Informed Consent**?', 
    'Voluntary permission given by a patient who understands the risks, benefits, and alternatives.', 
    ['Research', 'Ethics', 'Legal']
  ),
  c('np1_set2_049', 
    'What is the **Leading Cause of Mortality** in the Philippines?', 
    '**Ischemic Heart Diseases** (Cardiovascular diseases).', 
    ['Statistics', 'Epidemiology', 'Facts']
  ),
  c('np1_set2_050', 
    'What is the causative agent of **Bird Flu**?', 
    '**Avian Influenza A (H5N1)**\n\n_Transmission:_ Contact with infected poultry.', 
    ['Communicable Diseases', 'Viral', 'Zoonotic']
  )
];
