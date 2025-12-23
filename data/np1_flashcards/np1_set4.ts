
import { Flashcard } from '../../types';

// Helper to create cards with NP1 Set 4 defaults
const c = (id: string, front: string, back: string, tags: string[], hint?: string): Flashcard => ({
  id,
  deckId: 'np1_set4',
  np: 'NP1',
  setId: 'np1_set4',
  setName: 'Leadership & Management',
  setDescription: 'Nursing Leadership, Management Process, and Clinical Prioritization.',
  setTags: ['MGMT', 'LEADERSHIP', 'PRIORITY'],
  front,
  back,
  tags: ['NP1', ...tags],
  hint,
  status: 'new',
  interval: 0,
  easeFactor: 2.5
});

export const NP1_SET4: Flashcard[] = [
  c('np1_set4_001', 
    'Which leadership style is most effective in a **Code Blue** (Emergency) situation?', 
    '**Autocratic / Authoritative**\n\n_Reason:_ Quick decision-making is required; no time for discussion.', 
    ['Leadership', 'Management', 'Emergency']
  ),
  c('np1_set4_002', 
    'Describe **Laissez-Faire** leadership.', 
    '**\'Hands-off\' approach**.\n\n_Best for:_ Highly skilled, self-motivated, and professional staff (e.g., expert researchers).', 
    ['Leadership', 'Styles']
  ),
  c('np1_set4_003', 
    'What is the **First Step** in the management process?', 
    '**Planning**\n\n_Activity:_ Setting goals, objectives, and determining the course of action.', 
    ['Management', 'POSDC']
  ),
  c('np1_set4_004', 
    'In Management, what does **Staffing** involve?', 
    'Recruiting, selecting, scheduling, and assigning personnel to jobs.', 
    ['Management', 'POSDC']
  ),
  c('np1_set4_005', 
    'Can a Nurse Manager delegate **Accountability**?', 
    '**NO.**\n\n_Rule:_ You can delegate _responsibility_ and _authority_, but **Accountability** remains with the delegator.', 
    ['Management', 'Delegation']
  ),
  c('np1_set4_006', 
    'Which task can be delegated to a **Nursing Aide** (UAP)?', 
    '**Standard, unchanging procedures** (e.g., Vital signs on stable patients, bathing, feeding).', 
    ['Management', 'Delegation']
  ),
  c('np1_set4_007', 
    'Can you delegate **Patient Assessment** or **Health Teaching** to an LPN/LVN?', 
    '**Generally NO** (in PH/US NCLEX context for RNs).\n\n_RN Scope:_ Assessment, Teaching, Evaluation, and Unstable patients.', 
    ['Management', 'Delegation']
  ),
  c('np1_set4_008', 
    'What is **Functional Nursing**?', 
    '**Task-oriented**. Nurses are assigned specific _tasks_ (e.g., Medication Nurse, Treatment Nurse) rather than patients.\n\n_Pro:_ Efficient. _Con:_ Fragmented care.', 
    ['Management', 'Models']
  ),
  c('np1_set4_009', 
    'What is **Primary Nursing**?', 
    'One nurse (Primary Nurse) assumes **24-hour responsibility** for planning the care of a patient from admission to discharge.', 
    ['Management', 'Models']
  ),
  c('np1_set4_010', 
    'What is the **Collaborating** (Win-Win) conflict resolution strategy?', 
    'Both parties work together to find a solution that satisfies **all** concerns.\n\n_Note:_ Most time-consuming but most effective long-term.', 
    ['Management', 'Conflict']
  ),
  c('np1_set4_011', 
    'What is **Accommodating** (Win-Lose)?', 
    'One party **sacrifices** their own beliefs to satisfy the other.\n\n_Use:_ To preserve harmony or earn \'credits\'.', 
    ['Management', 'Conflict']
  ),
  c('np1_set4_012', 
    'What is a **Sentinel Event**?', 
    'An unexpected occurrence involving **death or serious physical/psychological injury**.\n\n_Action:_ Requires immediate Root Cause Analysis (RCA).', 
    ['Management', 'Quality']
  ),
  c('np1_set4_013', 
    'What is **Benchmarking**?', 
    'Comparing one\'s performance metrics against the **best practices** or industry leaders to improve quality.', 
    ['Management', 'Quality']
  ),
  c('np1_set4_014', 
    'In **SOAPIE** documentation, what does **\'S\'** stand for?', 
    '**Subjective Data**\n\n_Example:_ What the patient _says_ ("My chest hurts").', 
    ['Documentation', 'Formats']
  ),
  c('np1_set4_015', 
    'In **FDAR** charting, what does **\'R\'** stand for?', 
    '**Response**\n\n_Definition:_ The patient\'s reaction to the intervention (e.g., "Pain decreased to 2/10").', 
    ['Documentation', 'Formats']
  ),
  c('np1_set4_016', 
    'What is **Informed Consent**?', 
    'The legal right of a patient to receive adequate information about a procedure before agreeing to it.\n\n_Nurse\'s Role:_ Witness the signature and ensure voluntariness.', 
    ['Ethics', 'Legal']
  ),
  c('np1_set4_017', 
    'Who is legally responsible for obtaining Informed Consent?', 
    'The **Physician / Surgeon** performing the procedure.\n\n_Not_ the nurse.', 
    ['Legal', 'Roles']
  ),
  c('np1_set4_018', 
    'What is **Span of Control**?', 
    'The number of subordinates a supervisor can effectively manage.\n\n_Narrow Span:_ Few subordinates (for new staff). _Wide Span:_ Many subordinates.', 
    ['Management', 'Concepts']
  ),
  c('np1_set4_019', 
    'What is **Unity of Command**?', 
    'The principle that each employee should report to **only one** boss to avoid confusion.', 
    ['Management', 'Concepts']
  ),
  c('np1_set4_020', 
    'Differentiate **Authority** vs. **Power**?', 
    '**Authority:** The _right_ to command (given by position).\n**Power:** The _ability_ to influence others (can be personal).', 
    ['Management', 'Definitions']
  ),
  c('np1_set4_021', 
    'In Emergency Department Triage (Non-Disaster), who is seen **First**?', 
    '**Emergent / Resuscitation**\n\n_Examples:_ Cardiac arrest, active severe hemorrhage, anaphylaxis.', 
    ['Triage', 'Prioritization']
  ),
  c('np1_set4_022', 
    'What is **Transactional Leadership**?', 
    'Focuses on day-to-day operations and uses **Rewards and Punishments** (quid pro quo).', 
    ['Leadership', 'Styles']
  ),
  c('np1_set4_023', 
    'What is **Transformational Leadership**?', 
    'Leaders who **inspire** and motivate followers to achieve a shared vision and go beyond expectations.', 
    ['Leadership', 'Styles']
  ),
  c('np1_set4_024', 
    'What is the **ABC** principle of prioritization?', 
    '**Airway, Breathing, Circulation**.\n\n_Exceptions:_ CPR (C-A-B).', 
    ['Prioritization', 'Fundamentals']
  ),
  c('np1_set4_025', 
    'Level 1 Patient Classification refers to?', 
    '**Self-Care / Minimal Care**.\n\n_Example:_ Pre-op patient, waiting for discharge.', 
    ['Management', 'Staffing']
  ),
  c('np1_set4_026', 
    'Level 4 Patient Classification refers to?', 
    '**Intensive Care**.\n\n_Example:_ Unstable vitals, requires 1:1 nursing ratio.', 
    ['Management', 'Staffing']
  ),
  c('np1_set4_027', 
    'What is the **Cognitive Domain** of learning?', 
    'Involves **Knowledge** and intellectual skills (Thinking).\n\n_Example:_ Patient explains the side effects of insulin.', 
    ['Education', 'Domains']
  ),
  c('np1_set4_028', 
    'What is the **Psychomotor Domain** of learning?', 
    'Involves **Skills** and physical movement (Doing).\n\n_Example:_ Patient demonstrates how to inject insulin.', 
    ['Education', 'Domains']
  ),
  c('np1_set4_029', 
    'What is the **Affective Domain** of learning?', 
    'Involves **Feelings**, attitudes, and values (Feeling).\n\n_Example:_ Patient expresses acceptance of their diagnosis.', 
    ['Education', 'Domains']
  ),
  c('np1_set4_030', 
    'What should you do if you make an **error** in handwritten charting?', 
    'Draw a **single line** through it, write \'Error\', and sign/initial.\n\n_Never:_ Erase, white-out, or scratch out.', 
    ['Documentation', 'Legal']
  ),
  c('np1_set4_031', 
    'What is a **Gantt Chart**?', 
    'A visual tool used for **scheduling** and tracking the progress of tasks over time.', 
    ['Management', 'Tools']
  ),
  c('np1_set4_032', 
    'What is **Evidence-Based Practice (EBP)**?', 
    'Integrating the **best research evidence** with clinical expertise and patient values.', 
    ['Research', 'Concepts']
  ),
  c('np1_set4_033', 
    'Which patient do you see first: Post-op Day 1 stable or Asthma patient with wheezing?', 
    '**Asthma patient with wheezing**.\n\n_Reason:_ Airway/Breathing issue (Acute) vs. Stable condition.', 
    ['Prioritization', 'Scenarios']
  ),
  c('np1_set4_034', 
    'What is **Fidelity**?', 
    'Being faithful to agreements and **promises**.\n\n_Example:_ Returning to check on a patient when you said you would.', 
    ['Ethics', 'Principles']
  ),
  c('np1_set4_035', 
    'What is the **Generic Act of 1988**?', 
    '**RA 6675**.\n\n_Mandate:_ Prescriptions must use the generic name of the drug.', 
    ['Laws', 'Pharmacology']
  ),
  c('np1_set4_036', 
    'What is the correct order of **Abdominal Assessment**?', 
    '**I-A-P-P**: Inspection, Auscultation, Percussion, Palpation.\n\n_Why:_ Palpation can alter bowel sounds.', 
    ['Assessment', 'Skills']
  ),
  c('np1_set4_037', 
    'What is **Orthostatic Hypotension**?', 
    'A drop in BP (Systolic >20, Diastolic >10) when moving from **lying to standing**.', 
    ['Vital Signs', 'Assessment']
  ),
  c('np1_set4_038', 
    'What is the normal **Potassium (K+)** level?', 
    '**3.5 to 5.0 mEq/L**.\n\n_Risk:_ Hyperkalemia causes cardiac dysrhythmias.', 
    ['Labs', 'Electrolytes']
  ),
  c('np1_set4_039', 
    'What is the normal **Sodium (Na+)** level?', 
    '**135 to 145 mEq/L**.\n\n_Effect:_ Hyponatremia causes confusion/seizures (Brain).', 
    ['Labs', 'Electrolytes']
  ),
  c('np1_set4_040', 
    'What is **Defamation**?', 
    'Ruining a person\'s reputation. Includes **Libel** (Written) and **Slander** (Spoken).', 
    ['Legal', 'Torts']
  ),
  c('np1_set4_041', 
    'What is **Strategic Planning**?', 
    'Long-term planning (3-5 years) that looks at the organization\'s mission and vision.', 
    ['Management', 'Planning']
  ),
  c('np1_set4_042', 
    'What is **Veracity**?', 
    'The duty to tell the **truth** and not deceive the patient.', 
    ['Ethics', 'Principles']
  ),
  c('np1_set4_043', 
    'What is **Nosocomial Infection**?', 
    'Hospital-acquired infection (HAI) that appears **48 hours or more** after admission.', 
    ['Infection Control', 'Definitions']
  ),
  c('np1_set4_044', 
    'What is the most effective way to prevent infection spread?', 
    '**Hand Hygiene** (Hand washing).', 
    ['Infection Control', 'Basics']
  ),
  c('np1_set4_045', 
    'What is a **Maslow\'s Hierarchy** priority?', 
    '**Physiological Needs** (Oxygen, Fluids, Nutrition) come before Safety and Security.', 
    ['Prioritization', 'Theories']
  ),
  c('np1_set4_046', 
    'What is **Effectiveness** vs. **Efficiency**?', 
    '**Effectiveness:** Doing the _right_ things (Goal met).\n**Efficiency:** Doing things _right_ (Using fewest resources).', 
    ['Management', 'Concepts']
  ),
  c('np1_set4_047', 
    'What is **False Imprisonment**?', 
    'Restraining a patient without legal justification or consent (e.g., using restraints without an order).', 
    ['Legal', 'Torts']
  ),
  c('np1_set4_048', 
    'What is the **Sims Position** used for?', 
    'Enema administration or rectal examination.\n\n_Position:_ Side-lying with upper leg flexed.', 
    ['Fundamentals', 'Positions']
  ),
  c('np1_set4_049', 
    'What is **Fowler\'s Position** used for?', 
    'To improve **Breathing** (Chest expansion).\n\n_High Fowler\'s:_ 90 degrees.', 
    ['Fundamentals', 'Positions']
  ),
  c('np1_set4_050', 
    'What is the **Chain of Command**?', 
    'The line of authority and responsibility along which orders are passed.', 
    ['Management', 'Structure']
  )
];
