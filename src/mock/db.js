// RCMS Canonical Mock Database — mirrors Phase 4 Postgres schema exactly.
// Tables: profiles, categories, sub_authorities, category_routing,
//         grievances, evidence, supports, comments, status_history, flags, feedback
//
// PRIVACY RULE: author_id is stored in grievances but NEVER returned on
// public or authority views when is_anonymous=true. The api layer enforces this.

// ─────────────────────────────────────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_PROFILES = [
  {
    id: 'usr_student_1',
    college_email: 'puneet.btmc25@mitsgwl.ac.in',
    name: 'Puneet Chaudhary',
    role: 'student',
    sub_authority_id: null,
    status: 'active',
    department: 'Mathematics and Computing',
    enrollment_no: 'BTMC25O1109',
    hostel: 'Boys Hostel 1 (BH-1)',
    room_no: '204',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_student_2',
    college_email: 'stuti.btmc25@mitsgwl.ac.in',
    name: 'Stuti Jain',
    role: 'student',
    sub_authority_id: null,
    status: 'active',
    department: 'Mathematics and Computing',
    enrollment_no: 'BTMC25O1139',
    hostel: 'Girls Hostel 1 (GH-1)',
    room_no: '112',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_student_3',
    college_email: 'rahul.cs24@mitsgwl.ac.in',
    name: 'Rahul Verma',
    role: 'student',
    sub_authority_id: null,
    status: 'active',
    department: 'Computer Science & Engineering',
    enrollment_no: '0901CS241088',
    hostel: 'Boys Hostel 2 (BH-2)',
    room_no: '310',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_student_4',
    college_email: 'ananya.ec23@mitsgwl.ac.in',
    name: 'Ananya Singh',
    role: 'student',
    sub_authority_id: null,
    status: 'warned',
    department: 'Electronics & Telecommunication',
    enrollment_no: '0901EC231045',
    hostel: 'Girls Hostel 2 (GH-2)',
    room_no: '208',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_authority_1',
    college_email: 'warden.bh1@mitsgwalior.in',
    name: 'Dr. S. K. Sharma',
    role: 'authority',
    sub_authority_id: 'sub_hostel_bh',
    status: 'active',
    department: 'Hostel Administration',
    designation: 'Hostel Chief Warden (BH-1 & BH-2)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_authority_2',
    college_email: 'hod.mac@mitsgwalior.in',
    name: 'Prof. Monika Dandotiya',
    role: 'authority',
    sub_authority_id: 'sub_academics',
    status: 'active',
    department: 'Mathematics and Computing',
    designation: 'Faculty Advisor & Associate Professor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_authority_3',
    college_email: 'estate.officer@mitsgwalior.in',
    name: 'Er. R. K. Saxena',
    role: 'authority',
    sub_authority_id: 'sub_infrastructure',
    status: 'active',
    department: 'Campus Infrastructure & Estate',
    designation: 'Superintending Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_authority_4',
    college_email: 'coe.exam@mitsgwalior.in',
    name: 'Dr. P. K. Singhal',
    role: 'authority',
    sub_authority_id: 'sub_exam',
    status: 'active',
    department: 'Examination Cell',
    designation: 'Controller of Examination',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_admin_1',
    college_email: 'proctor.admin@mitsgwalior.in',
    name: 'Prof. V. K. Gupta',
    role: 'admin',
    sub_authority_id: null,
    status: 'active',
    department: 'Central Proctorial Board',
    designation: 'Dean of Student Welfare & Chief Proctor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SUB_AUTHORITIES (departments that handle grievances)
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_SUB_AUTHORITIES = [
  { id: 'sub_hostel_bh', name: 'Hostel Administration (Boys)', section: 'hostel' },
  { id: 'sub_hostel_gh', name: 'Hostel Administration (Girls)', section: 'hostel' },
  { id: 'sub_mess', name: 'Mess & Catering Committee', section: 'mess' },
  { id: 'sub_academics', name: 'Academic Affairs & Faculty', section: 'college' },
  { id: 'sub_infrastructure', name: 'Campus Infrastructure & Estate', section: 'college' },
  { id: 'sub_exam', name: 'Examination Cell', section: 'college' },
  { id: 'sub_sanitation', name: 'Sanitation & Grounds', section: 'college' },
  { id: 'sub_it', name: 'IT & Network Operations', section: 'college' },
  { id: 'sub_welfare', name: 'Student Welfare & Discipline', section: 'college' }
];

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES (with section: hostel | mess | college)
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_CATEGORIES = [
  { id: 'cat_hostel', section: 'hostel', name: 'Hostel Facilities', sub_authority_id: 'sub_hostel_bh', sla_hours: 24 },
  { id: 'cat_mess', section: 'mess', name: 'Hostel Mess (Food & Hygiene)', sub_authority_id: 'sub_mess', sla_hours: 12 },
  { id: 'cat_canteen', section: 'mess', name: 'Canteen & Food Services', sub_authority_id: 'sub_mess', sla_hours: 24 },
  { id: 'cat_admin', section: 'college', name: 'Administration (Certificates, ID, Fees, Scholarships)', sub_authority_id: 'sub_welfare', sla_hours: 48 },
  { id: 'cat_events', section: 'college', name: 'Events & Logistics', sub_authority_id: 'sub_welfare', sla_hours: 36 },
  { id: 'cat_clubs', section: 'college', name: 'Clubs & Societies', sub_authority_id: 'sub_welfare', sla_hours: 48 },
  { id: 'cat_academic', section: 'college', name: 'Academic & Faculty', sub_authority_id: 'sub_academics', sla_hours: 48 },
  { id: 'cat_infra', section: 'college', name: 'Campus Infrastructure', sub_authority_id: 'sub_infrastructure', sla_hours: 36 },
  { id: 'cat_exam', section: 'college', name: 'Examination & Grading', sub_authority_id: 'sub_exam', sla_hours: 72 },
  { id: 'cat_sanitation', section: 'college', name: 'Sanitation & Hygiene', sub_authority_id: 'sub_sanitation', sla_hours: 12 },
  { id: 'cat_it', section: 'college', name: 'IT & Network', sub_authority_id: 'sub_it', sla_hours: 24 },
  { id: 'cat_welfare', section: 'college', name: 'Student Welfare & Discipline', sub_authority_id: 'sub_welfare', sla_hours: 24 },
  { id: 'cat_other', section: 'college', name: 'Other / General Grievance', sub_authority_id: 'sub_welfare', sla_hours: 48 }
];

// ─────────────────────────────────────────────────────────────────────────────
// GRIEVANCES (author_id always stored; stripped on public/authority views when anon)
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_GRIEVANCES = [
  {
    id: 'grv_001',
    grievance_code: 'GRV-2026-00101',
    author_id: 'usr_student_1',
    is_anonymous: false,
    category_id: 'cat_mess',
    sub_authority_id: 'sub_mess',
    title: 'Mess food quality severely degraded — undercooked food and hygiene violations',
    description: 'During dinner on 25th September at BH-1 dining hall, the chapatis were undercooked and the dal smelled sour. Several hostel residents experienced mild stomach irritation. Catering hygiene inspection is urgently requested. The issue has been recurring since Monday and no action has been taken by the mess contractor.',
    location: 'Boys Hostel 1 (BH-1) Dining Hall',
    status: 'In progress',
    is_deleted: false,
    tracking_token: null,
    created_at: '2026-09-25T19:30:00.000Z',
    updated_at: '2026-09-26T10:15:00.000Z',
    resolved_at: null,
    sla_hours: 12,
    evidence_urls: []
  },
  {
    id: 'grv_002',
    grievance_code: 'GRV-2026-00102',
    author_id: 'usr_student_3',
    is_anonymous: true,
    category_id: 'cat_it',
    sub_authority_id: 'sub_it',
    title: 'Wi-Fi access point failure in Block C hostel corridor — complete outage',
    description: 'The Cisco Wi-Fi Access Point mounted on Corridor 2 of Block C has been unpowered or blinking amber since yesterday evening. Students cannot access NPTEL courses, Moodle lab materials, or the MITS portal for exam prep. No maintenance crew has visited yet.',
    location: 'Block C Hostel, 2nd Floor Corridor',
    status: 'Assigned',
    is_deleted: false,
    tracking_token: 'TRK-8924-MITS',
    created_at: '2026-09-26T08:00:00.000Z',
    updated_at: '2026-09-26T12:00:00.000Z',
    resolved_at: null,
    sla_hours: 24,
    evidence_urls: []
  },
  {
    id: 'grv_003',
    grievance_code: 'GRV-2026-00103',
    author_id: 'usr_student_2',
    is_anonymous: false,
    category_id: 'cat_academic',
    sub_authority_id: 'sub_academics',
    title: 'Projector flickering and HDMI loose in Room 112 Academic Block — lectures disrupted',
    description: 'During 4th semester Discrete Mathematics and Machine Learning lectures in Room 112, the projector display keeps turning black intermittently every 10 minutes. Slides are not visible to back-benchers. Professors are unable to conduct class effectively. This has been ongoing for 3 days.',
    location: 'New Academic Block, Room 112',
    status: 'Under review',
    is_deleted: false,
    tracking_token: null,
    created_at: '2026-09-26T14:20:00.000Z',
    updated_at: '2026-09-26T16:00:00.000Z',
    resolved_at: null,
    sla_hours: 48,
    evidence_urls: []
  },
  {
    id: 'grv_004',
    grievance_code: 'GRV-2026-00104',
    author_id: 'usr_student_3',
    is_anonymous: false,
    category_id: 'cat_sanitation',
    sub_authority_id: 'sub_sanitation',
    title: 'Water cooler leaking with dirty drainage in Mechanical Block Ground Floor',
    description: 'Drinking water cooler outside Fluid Mechanics lab has overflowing dirty water on the floor, posing slippage hazards and hygiene concerns. The drainage pipe is clogged and water has been pooling for 2 days. Urgent safety risk for students.',
    location: 'Mechanical Engineering Block, Ground Floor',
    status: 'Closed',
    is_deleted: false,
    tracking_token: null,
    created_at: '2026-09-24T09:00:00.000Z',
    updated_at: '2026-09-26T11:30:00.000Z',
    resolved_at: '2026-09-25T11:30:00.000Z',
    sla_hours: 12,
    evidence_urls: []
  },
  {
    id: 'grv_005',
    grievance_code: 'GRV-2026-00105',
    author_id: 'usr_student_3',
    is_anonymous: false,
    category_id: 'cat_exam',
    sub_authority_id: 'sub_exam',
    title: 'Mid-Sem exam score discrepancy on AMS portal — Operating Systems (CS-403)',
    description: 'On the AMS portal, my Mid-Semester marks for Operating Systems (CS-403) are displayed as 14/30, whereas my evaluated and signed physical answer booklet clearly indicates 24/30. I have a scanned copy of the answer sheet available as evidence. This discrepancy needs urgent correction before grade compilation.',
    location: 'Examination Control Office / AMS Database',
    status: 'Submitted',
    is_deleted: false,
    tracking_token: null,
    created_at: '2026-09-27T08:30:00.000Z',
    updated_at: '2026-09-27T08:30:00.000Z',
    resolved_at: null,
    sla_hours: 72,
    evidence_urls: []
  },
  {
    id: 'grv_006',
    grievance_code: 'GRV-2026-00106',
    author_id: 'usr_student_2',
    is_anonymous: true,
    category_id: 'cat_infra',
    sub_authority_id: 'sub_infrastructure',
    title: 'Streetlights unlit between Girls Hostel and Central Library walkway — safety hazard',
    description: 'Three pole streetlights along the pathway connecting Girls Hostel to the Central Library have not been turning on after sunset. The area is completely dark and feels unsafe for students walking back after evening library hours. This is a serious safety concern for female students especially.',
    location: 'Central Library to Girls Hostel Road',
    status: 'In progress',
    is_deleted: false,
    tracking_token: 'TRK-4102-MITS',
    created_at: '2026-09-25T18:00:00.000Z',
    updated_at: '2026-09-26T09:00:00.000Z',
    resolved_at: null,
    sla_hours: 24,
    evidence_urls: []
  },
  {
    id: 'grv_007',
    grievance_code: 'GRV-2026-00107',
    author_id: 'usr_student_1',
    is_anonymous: false,
    category_id: 'cat_hostel',
    sub_authority_id: 'sub_hostel_bh',
    title: 'Hot water supply not working in BH-1 Ground Floor bathrooms since 3 days',
    description: 'The geysers in BH-1 ground floor bathrooms (Rooms 101–120) have not been providing hot water since Saturday morning. Students are forced to use cold water in the early morning which is causing health issues as winter approaches. A plumber was called but the issue persists.',
    location: 'Boys Hostel 1 (BH-1), Ground Floor Bathrooms',
    status: 'Escalated',
    is_deleted: false,
    tracking_token: null,
    created_at: '2026-09-23T07:00:00.000Z',
    updated_at: '2026-09-26T14:00:00.000Z',
    resolved_at: null,
    sla_hours: 24,
    evidence_urls: []
  },
  {
    id: 'grv_008',
    grievance_code: 'GRV-2026-00108',
    author_id: 'usr_student_4',
    is_anonymous: false,
    category_id: 'cat_welfare',
    sub_authority_id: 'sub_welfare',
    title: 'Ragging incident reported near workshop — immediate action needed',
    description: 'Three senior students were verbally harassing a first-year student near the mechanical workshop entrance on Saturday evening. The incident was witnessed by at least 5 students. The matter was reported to the hostel guard but no formal action was taken.',
    location: 'Mechanical Workshop Entrance',
    status: 'Under review',
    is_deleted: false,
    tracking_token: null,
    created_at: '2026-09-27T10:00:00.000Z',
    updated_at: '2026-09-27T11:00:00.000Z',
    resolved_at: null,
    sla_hours: 24,
    evidence_urls: []
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// STATUS_HISTORY (append-only audit log)
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_STATUS_HISTORY = [
  // GRV-00101 — Mess food quality
  { id: 'sh_001_1', grievance_id: 'grv_001', from_status: null, to_status: 'Submitted', actor_id: 'usr_student_1', note: 'Complaint lodged by student through student portal.', created_at: '2026-09-25T19:30:00.000Z' },
  { id: 'sh_001_2', grievance_id: 'grv_001', from_status: 'Submitted', to_status: 'Under review', actor_id: 'usr_admin_1', note: 'Triage complete. Flagged as high-priority health & hygiene.', created_at: '2026-09-25T20:15:00.000Z' },
  { id: 'sh_001_3', grievance_id: 'grv_001', from_status: 'Under review', to_status: 'Assigned', actor_id: 'usr_admin_1', note: 'Assigned to Mess & Catering Committee.', created_at: '2026-09-26T07:45:00.000Z' },
  { id: 'sh_001_4', grievance_id: 'grv_001', from_status: 'Assigned', to_status: 'In progress', actor_id: 'usr_authority_1', note: 'Unannounced inspection conducted on mess kitchen. Show-cause notice issued to catering vendor.', created_at: '2026-09-26T10:15:00.000Z' },
  // GRV-00102 — Wi-Fi outage (anonymous)
  { id: 'sh_002_1', grievance_id: 'grv_002', from_status: null, to_status: 'Submitted', actor_id: 'usr_student_3', note: 'Submitted anonymously with one-time tracking token.', created_at: '2026-09-26T08:00:00.000Z' },
  { id: 'sh_002_2', grievance_id: 'grv_002', from_status: 'Submitted', to_status: 'Under review', actor_id: 'usr_admin_1', note: 'Technical issue verified against NOC monitoring.', created_at: '2026-09-26T09:30:00.000Z' },
  { id: 'sh_002_3', grievance_id: 'grv_002', from_status: 'Under review', to_status: 'Assigned', actor_id: 'usr_admin_1', note: 'Assigned to IT & Network Operations.', created_at: '2026-09-26T12:00:00.000Z' },
  // GRV-00103 — Projector
  { id: 'sh_003_1', grievance_id: 'grv_003', from_status: null, to_status: 'Submitted', actor_id: 'usr_student_2', note: 'Submitted with academic batch reference.', created_at: '2026-09-26T14:20:00.000Z' },
  { id: 'sh_003_2', grievance_id: 'grv_003', from_status: 'Submitted', to_status: 'Under review', actor_id: 'usr_authority_2', note: 'Acknowledged. Assessing AV lab schedule for repair window.', created_at: '2026-09-26T16:00:00.000Z' },
  // GRV-00104 — Water cooler (Resolved+Closed)
  { id: 'sh_004_1', grievance_id: 'grv_004', from_status: null, to_status: 'Submitted', actor_id: 'usr_student_3', note: 'Reported water cooler leakage.', created_at: '2026-09-24T09:00:00.000Z' },
  { id: 'sh_004_2', grievance_id: 'grv_004', from_status: 'Submitted', to_status: 'Under review', actor_id: 'usr_admin_1', note: 'Prioritized as safety risk.', created_at: '2026-09-24T09:45:00.000Z' },
  { id: 'sh_004_3', grievance_id: 'grv_004', from_status: 'Under review', to_status: 'Assigned', actor_id: 'usr_admin_1', note: 'Assigned to Plumbing & Sanitation squad.', created_at: '2026-09-24T10:30:00.000Z' },
  { id: 'sh_004_4', grievance_id: 'grv_004', from_status: 'Assigned', to_status: 'In progress', actor_id: 'usr_authority_3', note: 'Main valve shut and drain pipe unclogged.', created_at: '2026-09-24T14:00:00.000Z' },
  { id: 'sh_004_5', grievance_id: 'grv_004', from_status: 'In progress', to_status: 'Resolved', actor_id: 'usr_authority_3', note: 'Drainage pipe replaced, RO filter cleaned, floor disinfected.', created_at: '2026-09-25T11:30:00.000Z' },
  { id: 'sh_004_6', grievance_id: 'grv_004', from_status: 'Resolved', to_status: 'Closed', actor_id: 'usr_student_3', note: 'Student confirmed resolution. Grievance closed.', created_at: '2026-09-26T11:30:00.000Z' },
  // GRV-00105 — Exam score
  { id: 'sh_005_1', grievance_id: 'grv_005', from_status: null, to_status: 'Submitted', actor_id: 'usr_student_3', note: 'Submitted marks correction request with proof available.', created_at: '2026-09-27T08:30:00.000Z' },
  // GRV-00106 — Streetlights (anonymous)
  { id: 'sh_006_1', grievance_id: 'grv_006', from_status: null, to_status: 'Submitted', actor_id: 'usr_student_2', note: 'Anonymous safety complaint filed.', created_at: '2026-09-25T18:00:00.000Z' },
  { id: 'sh_006_2', grievance_id: 'grv_006', from_status: 'Submitted', to_status: 'Under review', actor_id: 'usr_admin_1', note: 'Flagged as high-urgency campus safety concern.', created_at: '2026-09-25T18:40:00.000Z' },
  { id: 'sh_006_3', grievance_id: 'grv_006', from_status: 'Under review', to_status: 'Assigned', actor_id: 'usr_admin_1', note: 'Assigned to Electrical maintenance team.', created_at: '2026-09-25T19:00:00.000Z' },
  { id: 'sh_006_4', grievance_id: 'grv_006', from_status: 'Assigned', to_status: 'In progress', actor_id: 'usr_authority_3', note: 'Underground cable fault identified. Splicing in progress.', created_at: '2026-09-26T09:00:00.000Z' },
  // GRV-00107 — Hostel hot water (Escalated)
  { id: 'sh_007_1', grievance_id: 'grv_007', from_status: null, to_status: 'Submitted', actor_id: 'usr_student_1', note: 'Submitted hot water issue.', created_at: '2026-09-23T07:00:00.000Z' },
  { id: 'sh_007_2', grievance_id: 'grv_007', from_status: 'Submitted', to_status: 'Under review', actor_id: 'usr_admin_1', note: 'Acknowledged.', created_at: '2026-09-23T09:00:00.000Z' },
  { id: 'sh_007_3', grievance_id: 'grv_007', from_status: 'Under review', to_status: 'Assigned', actor_id: 'usr_admin_1', note: 'Assigned to Hostel Administration.', created_at: '2026-09-23T10:00:00.000Z' },
  { id: 'sh_007_4', grievance_id: 'grv_007', from_status: 'Assigned', to_status: 'In progress', actor_id: 'usr_authority_1', note: 'Plumber dispatched.', created_at: '2026-09-23T14:00:00.000Z' },
  { id: 'sh_007_5', grievance_id: 'grv_007', from_status: 'In progress', to_status: 'No Progress', actor_id: 'usr_authority_1', note: 'Plumber visited but geyser element ordered. Delayed.', created_at: '2026-09-24T10:00:00.000Z' },
  { id: 'sh_007_6', grievance_id: 'grv_007', from_status: 'No Progress', to_status: 'Escalated', actor_id: 'usr_admin_1', note: 'Escalated due to 3-day SLA breach. Senior warden alerted.', created_at: '2026-09-26T14:00:00.000Z' },
  // GRV-00108 — Ragging
  { id: 'sh_008_1', grievance_id: 'grv_008', from_status: null, to_status: 'Submitted', actor_id: 'usr_student_4', note: 'Ragging incident reported.', created_at: '2026-09-27T10:00:00.000Z' },
  { id: 'sh_008_2', grievance_id: 'grv_008', from_status: 'Submitted', to_status: 'Under review', actor_id: 'usr_admin_1', note: 'UGC anti-ragging committee notified. Urgent review initiated.', created_at: '2026-09-27T11:00:00.000Z' }
];

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORTS (unique pair: grievance_id + user_id)
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_SUPPORTS = [
  { grievance_id: 'grv_001', user_id: 'usr_student_1' },
  { grievance_id: 'grv_001', user_id: 'usr_student_2' },
  { grievance_id: 'grv_001', user_id: 'usr_student_3' },
  { grievance_id: 'grv_002', user_id: 'usr_student_2' },
  { grievance_id: 'grv_002', user_id: 'usr_student_3' },
  { grievance_id: 'grv_003', user_id: 'usr_student_1' },
  { grievance_id: 'grv_003', user_id: 'usr_student_2' },
  { grievance_id: 'grv_004', user_id: 'usr_student_1' },
  { grievance_id: 'grv_004', user_id: 'usr_student_3' },
  { grievance_id: 'grv_006', user_id: 'usr_student_1' },
  { grievance_id: 'grv_006', user_id: 'usr_student_2' },
  { grievance_id: 'grv_006', user_id: 'usr_student_3' },
  { grievance_id: 'grv_007', user_id: 'usr_student_1' },
  { grievance_id: 'grv_007', user_id: 'usr_student_2' }
];

// ─────────────────────────────────────────────────────────────────────────────
// COMMENTS (is_anonymous supported; internal notes visible to authority+admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_COMMENTS = [
  // GRV-00101
  { id: 'cmt_001_1', grievance_id: 'grv_001', author_id: 'usr_student_2', is_anonymous: false, body: 'This has been happening since Wednesday. Please also inspect water purification filters in the kitchen area.', is_internal: false, created_at: '2026-09-25T21:10:00.000Z' },
  { id: 'cmt_001_2', grievance_id: 'grv_001', author_id: 'usr_authority_1', is_anonymous: false, body: 'INTERNAL: Vendor penalty clause #14 invoked. Food safety officer requested to collect random samples today.', is_internal: true, created_at: '2026-09-26T10:20:00.000Z' },
  { id: 'cmt_001_3', grievance_id: 'grv_001', author_id: 'usr_authority_1', is_anonymous: false, body: 'A formal warning has been issued to the mess contractor. Grain stock and kitchen hygiene are being monitored under warden supervision. Update expected by evening.', is_internal: false, created_at: '2026-09-26T11:00:00.000Z' },
  // GRV-00102
  { id: 'cmt_002_1', grievance_id: 'grv_002', author_id: 'usr_authority_3', is_anonymous: false, body: 'NOC engineers dispatched to inspect PoE switch on Rack C2. Replacement AP unit is on standby.', is_internal: false, created_at: '2026-09-26T12:30:00.000Z' },
  { id: 'cmt_002_2', grievance_id: 'grv_002', author_id: 'usr_authority_3', is_anonymous: false, body: 'INTERNAL: Switch port 18 shows power draw failure. Technician Amit Sharma carrying spare 48V PoE injector.', is_internal: true, created_at: '2026-09-26T13:00:00.000Z' },
  // GRV-00103
  { id: 'cmt_003_1', grievance_id: 'grv_003', author_id: 'usr_authority_2', is_anonymous: false, body: 'Thank you for reporting. AV technician has been scheduled for Room 112 between 4:30–5:30 PM after classes today.', is_internal: false, created_at: '2026-09-26T16:15:00.000Z' },
  // GRV-00104
  { id: 'cmt_004_1', grievance_id: 'grv_004', author_id: 'usr_authority_3', is_anonymous: false, body: 'Pipe assembly replaced with heavy-duty PVC pipe and drainage cleared. Cooler is clean and operational.', is_internal: false, created_at: '2026-09-25T11:32:00.000Z' },
  // GRV-00106
  { id: 'cmt_006_1', grievance_id: 'grv_006', author_id: 'usr_admin_1', is_anonymous: false, body: 'Campus security guards temporarily assigned to patrol this stretch between 7 PM and 11 PM until repairs are complete.', is_internal: false, created_at: '2026-09-25T19:15:00.000Z' },
  { id: 'cmt_006_2', grievance_id: 'grv_006', author_id: 'usr_authority_3', is_anonymous: false, body: 'INTERNAL: LED driver on Pole #4 failed; replaced under warranty from Havells inventory.', is_internal: true, created_at: '2026-09-26T09:30:00.000Z' },
  // GRV-00107
  { id: 'cmt_007_1', grievance_id: 'grv_007', author_id: 'usr_student_1', is_anonymous: true, body: 'Many students in rooms 101-110 are affected. Some people are getting coughs due to cold water exposure early morning.', is_internal: false, created_at: '2026-09-24T06:30:00.000Z' },
  { id: 'cmt_007_2', grievance_id: 'grv_007', author_id: 'usr_authority_1', is_anonymous: false, body: 'We understand the urgency. A replacement geyser heating element has been ordered. Expected delivery by tomorrow.', is_internal: false, created_at: '2026-09-25T09:00:00.000Z' }
];

// ─────────────────────────────────────────────────────────────────────────────
// FLAGS
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_FLAGS = [
  { id: 'flag_001', grievance_id: 'grv_008', flagged_by: 'usr_student_1', reason: 'Contains personally identifying information about accused students', resolved: false, created_at: '2026-09-27T12:00:00.000Z' }
];

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK (post-resolution)
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_FEEDBACK = [
  { grievance_id: 'grv_004', resolved_ok: true, comment: 'Issue was fixed properly. The drainage is now clear and the cooler is working fine.', created_at: '2026-09-26T11:00:00.000Z' }
];
