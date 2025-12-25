
import { Flashcard } from '../../types';

// Helper function adapted for Cloze:
// 'front' contains the sentence with {{cloze}}
// 'back' contains the extra notes/explanation
const c = (id: string, front: string, back: string, tags: string[]): Flashcard => ({
  id,
  deckId: 'medsurg_signs_set1',
  np: 'MEDSURG_SIGNS',
  setId: 'medsurg_signs_set1',
  setName: 'Signs & Triads',
  setDescription: 'Pathognomonic Signs, Triads, and Syndromes (Cloze/Gizmo Style).',
  setTags: ['SIGNS', 'CLOZE'],
  front, // Contains the {{cloze}} syntax
  back,  // Contains the rationale/notes
  tags: ['SUPPLEMENTAL', ...tags],
  status: 'new',
  interval: 0,
  easeFactor: 2.5
});

export const MEDSURG_SIGNS_SET1: Flashcard[] = [
  c('sign_001', 'The pathognomonic sign of **Basilar Skull Fracture** appearing as bruising behind the ears is {{Battle\'s Sign}}.', 'Often accompanied by Raccoon Eyes (periorbital ecchymosis).', ['Neuro', 'Trauma']),
  c('sign_002', 'The hallmark sign of **Systemic Lupus Erythematosus (SLE)** is the {{Butterfly Rash}} on the face.', 'Also called Malar Rash.', ['Immune', 'Skin']),
  c('sign_003', 'The classic sign of **Deep Vein Thrombosis (DVT)** characterized by calf pain on dorsiflexion is {{Homan\'s Sign}}.', 'Note: Do not perform vigorously due to risk of embolus.', ['Cardio', 'Vascular']),
  c('sign_004', 'The pathognomonic sign of **Measles (Rubeola)** found in the buccal mucosa is {{Koplik\'s Spots}}.', 'Small red spots with bluish-white centers.', ['Peds', 'Infection']),
  c('sign_005', 'The sign of **Hypocalcemia** involving facial muscle twitching when the cheek is tapped is {{Chvostek\'s Sign}}.', 'Think: C = Cheek.', ['Electrolytes', 'Endocrine']),
  c('sign_006', 'The sign of **Hypocalcemia** involving carpal spasm when the BP cuff is inflated is {{Trousseau\'s Sign}}.', 'More specific than Chvostek\'s.', ['Electrolytes', 'Endocrine']),
  c('sign_007', 'The hallmark sign of **Pyloric Stenosis** in infants is an {{Olive-shaped Mass}} in the epigastrium.', 'Also presents with projectile vomiting.', ['Peds', 'GI']),
  c('sign_008', 'The pathognomonic sign of **Intussusception** (telescoping bowel) is {{Currant Jelly Stool}}.', 'Stool mixed with blood and mucus.', ['Peds', 'GI']),
  c('sign_009', 'The hallmark sign of **Hirschsprung\'s Disease** (Megacolon) is {{Ribbon-like Stool}}.', 'Due to lack of ganglion cells in the colon.', ['Peds', 'GI']),
  c('sign_010', 'The specific sign for **Pancreatitis** appearing as bruising around the umbilicus is {{Cullen\'s Sign}}.', 'Think: C = Circle/Center (Umbilicus).', ['GI', 'Emergency']),
  c('sign_011', 'The specific sign for **Pancreatitis** appearing as bruising on the flank/side is {{Turner\'s Sign}}.', 'Think: Turn to the side.', ['GI', 'Emergency']),
  c('sign_012', 'The classic triad of **Meningitis** includes Fever, Headache, and {{Nuchal Rigidity}} (stiff neck).', 'Often positive for Kernig\'s and Brudzinski\'s.', ['Neuro', 'Infection']),
  c('sign_013', 'The hallmark sign of **Parkinson\'s Disease** seen in the hands at rest is {{Pill-rolling Tremor}}.', 'Disappears with voluntary movement.', ['Neuro', 'Degenerative']),
  c('sign_014', 'The characteristic sign of **Myasthenia Gravis** (drooping eyelids) is {{Ptosis}}.', 'Worsens with fatigue/end of day.', ['Neuro', 'Autoimmune']),
  c('sign_015', 'The hallmark sign of **Multiple Sclerosis** involving electric shock sensation on neck flexion is {{Lhermitte\'s Sign}}.', 'Indicates spinal cord involvement.', ['Neuro', 'Autoimmune']),
  c('sign_016', 'The classic sound heard in **Patent Ductus Arteriosus (PDA)** is a {{Machine-like Murmur}}.', 'Continuous murmur heard at left upper sternal border.', ['Peds', 'Cardio']),
  c('sign_017', 'The pathognomonic sign of **Tetralogy of Fallot** on X-ray is the {{Boot-shaped Heart}}.', 'Due to right ventricular hypertrophy.', ['Peds', 'Cardio']),
  c('sign_018', 'The classic sign of **Cholera** (severe dehydration) is {{Rice-water Stool}}.', 'Caused by Vibrio cholerae.', ['Infection', 'GI']),
  c('sign_019', 'The hallmark sign of **Typhoid Fever** appearing on the chest/abdomen is {{Rose Spots}}.', 'Caused by Salmonella typhi.', ['Infection', 'GI']),
  c('sign_020', 'The sign of **Appendicitis** involving pain in the RLQ when the LLQ is palpated is {{Rovsing\'s Sign}}.', 'Referred rebound tenderness.', ['GI', 'Assessment']),
  c('sign_021', 'The specific point of tenderness in **Appendicitis** located in the RLQ is {{McBurney\'s Point}}.', '1/3 distance from iliac spine to umbilicus.', ['GI', 'Assessment']),
  c('sign_022', 'The pathognomonic sign of **Duchenne Muscular Dystrophy** where a child uses hands to "walk up" their legs is {{Gowers\' Sign}}.', 'Indicates proximal muscle weakness.', ['Peds', 'Ortho']),
  c('sign_023', 'The hallmark sign of **Lyme Disease** (Borrelia) is the {{Bull\'s Eye Rash}}.', 'Also called Erythema Migrans.', ['Infection', 'Skin']),
  c('sign_024', 'The characteristic finding in **Rheumatic Fever** involving distinct, non-itchy rash is {{Erythema Marginatum}}.', 'Usually on the trunk.', ['Peds', 'Cardio']),
  c('sign_025', 'The hallmark sign of **Kawasaki Disease** involving the tongue is {{Strawberry Tongue}}.', 'Also seen in Scarlet Fever.', ['Peds', 'Cardio']),
  c('sign_026', 'The pathognomonic sign of **Tetanus** involving a fixed, cynical smile is {{Risus Sardonicus}}.', 'Often with Trismus (Lockjaw).', ['Infection', 'Neuro']),
  c('sign_027', 'The sign of **Increased Intracranial Pressure (ICP)** in infants involving the eyes is {{Sunset Eyes}}.', 'Sclera visible above the iris.', ['Peds', 'Neuro']),
  c('sign_028', 'The characteristic finding in **Cystic Fibrosis** relating to skin is {{Salty Skin}}.', 'Diagnosed via Sweat Chloride Test.', ['Peds', 'Resp']),
  c('sign_029', 'The hallmark sign of **Gout** (Uric Acid crystals) often found in the big toe is {{Tophi}}.', 'Inflammation of the 1st metatarsophalangeal joint (Podagra).', ['Ortho', 'Metabolic']),
  c('sign_030', 'The classic sign of **Osteoarthritis** involving nodes on the DISTAL finger joints is {{Heberden\'s Nodes}}.', 'Proximal nodes are Bouchard\'s.', ['Ortho', 'Aging']),
  c('sign_031', 'The classic sign of **Rheumatoid Arthritis** involving deviation of fingers is {{Ulnar Drift}}.', 'Or Swan-neck deformity.', ['Ortho', 'Autoimmune']),
  c('sign_032', 'The sign of **Carpal Tunnel Syndrome** elicited by tapping the median nerve is {{Tinel\'s Sign}}.', 'Causes tingling in the fingers.', ['Neuro', 'Ortho']),
  c('sign_033', 'The sign of **Carpal Tunnel Syndrome** elicited by flexing wrists back-to-back is {{Phalen\'s Sign}}.', 'Hold for 60 seconds.', ['Neuro', 'Ortho']),
  c('sign_034', 'The hallmark finding in **Placenta Previa** is {{Painless Bright Red Bleeding}}.', 'Do NOT perform internal exam.', ['OB', 'Emergency']),
  c('sign_035', 'The hallmark finding in **Abruptio Placenta** is {{Painful Dark Red Bleeding}}.', 'With board-like rigid abdomen.', ['OB', 'Emergency']),
  c('sign_036', 'The pathognomonic sign of **Hydatidiform Mole** (Molar Pregnancy) is {{Grape-like Vesicles}}.', 'Discharge looks like prune juice.', ['OB', 'Oncology']),
  c('sign_037', 'The classic sign of **Candidiasis** (Yeast Infection) is {{Cheesy White Discharge}}.', 'Often causes intense itching.', ['OB', 'Infection']),
  c('sign_038', 'The characteristic sign of **Trichomoniasis** is {{Frothy Yellow-Green Discharge}}.', 'Often foul-smelling.', ['OB', 'Infection']),
  c('sign_039', 'The hallmark sign of **Bacterial Vaginosis** is the {{Fishy Odor}}.', 'Positive "Whiff Test".', ['OB', 'Infection']),
  c('sign_040', 'The sign of **Pregnancy** involving bluish discoloration of the cervix/vagina is {{Chadwick\'s Sign}}.', 'Presumptive/Probable sign.', ['OB', 'Assessment']),
  c('sign_041', 'The sign of **Pregnancy** involving softening of the cervix is {{Goodell\'s Sign}}.', 'Think: Good = Soft.', ['OB', 'Assessment']),
  c('sign_042', 'The sign of **Pregnancy** involving softening of the lower uterine segment is {{Hegar\'s Sign}}.', 'Palpated bimanually.', ['OB', 'Assessment']),
  c('sign_043', 'The classic sign of **Emphysema** (COPD) seen in the chest structure is {{Barrel Chest}}.', 'Due to air trapping/hyperinflation.', ['Resp', 'Chronic']),
  c('sign_044', 'The hallmark sign of **Pulmonary Edema** involving sputum is {{Pink Frothy Sputum}}.', 'Medical emergency (Flash pulmonary edema).', ['Resp', 'Cardio']),
  c('sign_045', 'The classic sign of **Tuberculosis** involving sweat is {{Night Sweats}}.', 'With low-grade afternoon fever.', ['Infection', 'Resp']),
  c('sign_046', 'The characteristic sign of **Pneumonia** involving sound on percussion is {{Dullness}}.', 'Due to consolidation.', ['Resp', 'Assessment']),
  c('sign_047', 'The sign of **Pneumothorax** involving the trachea is {{Tracheal Deviation}}.', 'Deviates to the UNAFFECTED side.', ['Resp', 'Emergency']),
  c('sign_048', 'The hallmark sign of **Carbon Monoxide Poisoning** is {{Cherry Red Skin}}.', 'Despite hypoxia.', ['Toxicology', 'Emergency']),
  c('sign_049', 'The classic sign of **Addison\'s Disease** (Adrenal Insufficiency) is {{Bronze Skin Pigmentation}}.', 'Hyperpigmentation due to high ACTH.', ['Endocrine', 'Metabolic']),
  c('sign_050', 'The classic sign of **Cushing\'s Syndrome** (Excess Cortisol) seen on the back of the neck is the {{Buffalo Hump}}.', 'Also Moon Face.', ['Endocrine', 'Metabolic']),
];