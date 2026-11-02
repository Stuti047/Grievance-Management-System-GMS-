// Seed Data for MITS Gwalior Grievance Management System (GMS)
// Aligned with official institutional departments, academic structures, and the specified data models.

export const SEED_USERS = [
  {
    id: 'usr_student_1',
    name: 'Puneet Chaudhary',
    email: 'puneet.btmc25@mitsgwl.ac.in',
    hashedPassword: 'sha256$mits2026$password123',
    role: 'student',
    department: 'Mathematics and Computing',
    enrollmentNo: 'BTMC25O1109',
    hostel: 'Boys Hostel 1 (BH-1)',
    emailVerified: true
  },
  {
    id: 'usr_student_2',
    name: 'Stuti Jain',
    email: 'stuti.btmc25@mitsgwl.ac.in',
    hashedPassword: 'sha256$mits2026$password123',
    role: 'student',
    department: 'Mathematics and Computing',
    enrollmentNo: 'BTMC25O1139',
    hostel: 'Girls Hostel 1 (GH-1)',
    emailVerified: true
  },
  {
    id: 'usr_student_3',
    name: 'Rahul Verma',
    email: 'rahul.cs24@mitsgwl.ac.in',
    hashedPassword: 'sha256$mits2026$password123',
    role: 'student',
    department: 'Computer Science & Engineering',
    enrollmentNo: '0901CS241088',
    hostel: 'Boys Hostel 2 (BH-2)',
    emailVerified: true
  },
  {
    id: 'usr_authority_1',
    name: 'Dr. S. K. Sharma',
    email: 'warden.bh1@mitsgwalior.in',
    hashedPassword: 'sha256$mits2026$authority123',
    role: 'authority',
    department: 'Hostel Administration',
    designation: 'Hostel Chief Warden',
    emailVerified: true
  },
  {
    id: 'usr_authority_2',
    name: 'Prof. Monika Dandotiya',
    email: 'hod.mac@mitsgwalior.in',
    hashedPassword: 'sha256$mits2026$authority123',
    role: 'authority',
    department: 'Mathematics and Computing',
    designation: 'Faculty Advisor & Associate Professor',
    emailVerified: true
  },
  {
    id: 'usr_authority_3',
    name: 'Er. R. K. Saxena',
    email: 'estate.officer@mitsgwalior.in',
    hashedPassword: 'sha256$mits2026$authority123',
    role: 'authority',
    department: 'Campus Infrastructure & Estate',
    designation: 'Superintending Engineer',
    emailVerified: true
  },
  {
    id: 'usr_authority_4',
    name: 'Dr. P. K. Singhal',
    email: 'coe.exam@mitsgwalior.in',
    hashedPassword: 'sha256$mits2026$authority123',
    role: 'authority',
    department: 'Examination Cell',
    designation: 'Controller of Examination',
    emailVerified: true
  },
  {
    id: 'usr_admin_1',
    name: 'Prof. V. K. Gupta',
    email: 'proctor.admin@mitsgwalior.in',
    hashedPassword: 'sha256$mits2026$admin123',
    role: 'admin',
    department: 'Central Proctorial Board',
    designation: 'Dean of Student Welfare & Chief Proctor',
    emailVerified: true
  }
];

export const DEPARTMENTS = [
  'Mathematics and Computing',
  'Computer Science & Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Hostel Administration',
  'Campus Infrastructure & Estate',
  'Examination Cell',
  'Central Proctorial Board',
  'Sanitation & Grounds'
];

export const CATEGORIES = [
  { id: 'Hostel & Mess', name: 'Hostel & Mess', department: 'Hostel Administration', targetHours: 24 },
  { id: 'Academic & Faculty', name: 'Academic & Faculty', department: 'Mathematics and Computing', targetHours: 48 },
  { id: 'Campus Infrastructure', name: 'Campus Infrastructure', department: 'Campus Infrastructure & Estate', targetHours: 48 },
  { id: 'Examination & Grading', name: 'Examination & Grading', department: 'Examination Cell', targetHours: 72 },
  { id: 'Sanitation & Hygiene', name: 'Sanitation & Hygiene', department: 'Sanitation & Grounds', targetHours: 24 },
  { id: 'IT & Network', name: 'IT & Network', department: 'Campus Infrastructure & Estate', targetHours: 24 }
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const SEED_COMPLAINTS = [
  {
    id: 'cmp_101',
    ticketId: 'GMS-2026-101',
    title: 'Mess food quality severely degraded in dinner; undercooked food and hygiene issues',
    description: 'During dinner on 25th September at BH-1 dining hall, the chapatis were undercooked and the dal smelled sour. Several hostel residents experienced mild food poisoning symptoms. Catering hygiene inspection is urgently requested.',
    category: 'Hostel & Mess',
    department: 'Hostel Administration',
    location: 'Boys Hostel 1 (BH-1) Dining Hall',
    priority: 'High',
    status: 'In progress',
    isAnonymous: false,
    submittedBy: {
      id: 'usr_student_1',
      name: 'Puneet Chaudhary',
      email: 'puneet.btmc25@mitsgwl.ac.in',
      department: 'Mathematics and Computing'
    },
    assignedTo: {
      id: 'usr_authority_1',
      name: 'Dr. S. K. Sharma',
      role: 'authority',
      department: 'Hostel Administration'
    },
    upvotes: ['usr_student_1', 'usr_student_2', 'usr_student_3'],
    isDeleted: false,
    trackingKey: null,
    createdAt: '2026-09-25T19:30:00.000Z',
    updatedAt: '2026-09-26T10:15:00.000Z',
    resolvedAt: null,
    slaTargetHours: 24,
    history: [
      {
        status: 'Submitted',
        actor: { name: 'Puneet Chaudhary', role: 'student' },
        timestamp: '2026-09-25T19:30:00.000Z',
        note: 'Complaint lodged by student through student portal.'
      },
      {
        status: 'Under review',
        actor: { name: 'Central Proctorial Board', role: 'admin' },
        timestamp: '2026-09-25T20:15:00.000Z',
        note: 'Triage complete. Flagged as high priority health & hygiene issue.'
      },
      {
        status: 'Assigned',
        actor: { name: 'Central Proctorial Board', role: 'admin' },
        timestamp: '2026-09-26T07:45:00.000Z',
        note: 'Assigned to Dr. S. K. Sharma (Chief Warden BH-1).'
      },
      {
        status: 'In progress',
        actor: { name: 'Dr. S. K. Sharma', role: 'authority' },
        timestamp: '2026-09-26T10:15:00.000Z',
        note: 'Unannounced inspection conducted on mess kitchen. Show-cause notice issued to catering vendor.'
      }
    ],
    comments: [
      {
        id: 'cmt_101_1',
        complaintRef: 'cmp_101',
        author: 'Stuti Jain',
        authorRole: 'student',
        isInternal: false,
        text: 'This has been happening since Wednesday. Please also inspect water purification filters in the kitchen area.',
        timestamp: '2026-09-25T21:10:00.000Z'
      },
      {
        id: 'cmt_101_2',
        complaintRef: 'cmp_101',
        author: 'Dr. S. K. Sharma',
        authorRole: 'authority',
        isInternal: true,
        text: 'Internal Note: Vendor penalty clause #14 invoked. Food safety officer requested to collect random samples today.',
        timestamp: '2026-09-26T10:20:00.000Z'
      },
      {
        id: 'cmt_101_3',
        complaintRef: 'cmp_101',
        author: 'Dr. S. K. Sharma',
        authorRole: 'authority',
        isInternal: false,
        text: 'A formal warning has been issued to the mess contractor. Grain stock and kitchen hygiene are being monitored under warden supervision.',
        timestamp: '2026-09-26T11:00:00.000Z'
      }
    ]
  },
  {
    id: 'cmp_102',
    ticketId: 'GMS-2026-102',
    title: 'Wi-Fi access point failure in Block C corridor; no internet in hostel rooms',
    description: 'The Cisco Wi-Fi Access Point mounted on Corridor 2 of Block C has been unpowered or blinking amber since yesterday. Students cannot access NPTEL courses, lab materials, or MITS portal.',
    category: 'IT & Network',
    department: 'Campus Infrastructure & Estate',
    location: 'Block C Hostel, 2nd Floor Corridor',
    priority: 'High',
    status: 'Assigned',
    isAnonymous: true,
    submittedBy: null, // Anonymous submission
    assignedTo: {
      id: 'usr_authority_3',
      name: 'Er. R. K. Saxena',
      role: 'authority',
      department: 'Campus Infrastructure & Estate'
    },
    upvotes: ['usr_student_2', 'usr_student_3'],
    isDeleted: false,
    trackingKey: 'TRK-8924-MITS',
    createdAt: '2026-09-26T08:00:00.000Z',
    updatedAt: '2026-09-26T12:00:00.000Z',
    resolvedAt: null,
    slaTargetHours: 24,
    history: [
      {
        status: 'Submitted',
        actor: { name: 'Anonymous Student', role: 'student' },
        timestamp: '2026-09-26T08:00:00.000Z',
        note: 'Submitted anonymously with one-time tracking key.'
      },
      {
        status: 'Under review',
        actor: { name: 'Central Proctorial Board', role: 'admin' },
        timestamp: '2026-09-26T09:30:00.000Z',
        note: 'Technical issue verified against NOC monitoring telemetry.'
      },
      {
        status: 'Assigned',
        actor: { name: 'Central Proctorial Board', role: 'admin' },
        timestamp: '2026-09-26T12:00:00.000Z',
        note: 'Assigned to Er. R. K. Saxena (Campus Infrastructure).'
      }
    ],
    comments: [
      {
        id: 'cmt_102_1',
        complaintRef: 'cmp_102',
        author: 'Er. R. K. Saxena',
        authorRole: 'authority',
        isInternal: false,
        text: 'NOC engineers dispatched to inspect PoE switch on Rack C2. Replacement AP unit is on standby.',
        timestamp: '2026-09-26T12:30:00.000Z'
      },
      {
        id: 'cmt_102_2',
        complaintRef: 'cmp_102',
        author: 'Er. R. K. Saxena',
        authorRole: 'authority',
        isInternal: true,
        text: 'Internal Note: Switch port 18 shows power draw failure. Technician Amit Sharma carrying spare 48V PoE injector.',
        timestamp: '2026-09-26T13:00:00.000Z'
      }
    ]
  },
  {
    id: 'cmp_103',
    ticketId: 'GMS-2026-103',
    title: 'Ceiling projector flickering and HDMI port loose in Room 112 Academic Block',
    description: 'During 4th semester Discrete Mathematics and Machine Learning lectures in Room 112, the projector display keeps turning black intermittently. Slides are not visible to back-benchers.',
    category: 'Academic & Faculty',
    department: 'Mathematics and Computing',
    location: 'New Academic Block, Room 112',
    priority: 'Medium',
    status: 'Under review',
    isAnonymous: false,
    submittedBy: {
      id: 'usr_student_2',
      name: 'Stuti Jain',
      email: 'stuti.btmc25@mitsgwl.ac.in',
      department: 'Mathematics and Computing'
    },
    assignedTo: null,
    upvotes: ['usr_student_1', 'usr_student_2'],
    isDeleted: false,
    trackingKey: null,
    createdAt: '2026-09-26T14:20:00.000Z',
    updatedAt: '2026-09-26T16:00:00.000Z',
    resolvedAt: null,
    slaTargetHours: 48,
    history: [
      {
        status: 'Submitted',
        actor: { name: 'Stuti Jain', role: 'student' },
        timestamp: '2026-09-26T14:20:00.000Z',
        note: 'Submitted with academic batch reference.'
      },
      {
        status: 'Under review',
        actor: { name: 'Prof. Monika Dandotiya', role: 'authority' },
        timestamp: '2026-09-26T16:00:00.000Z',
        note: 'Class representative complaint acknowledged. Assessing AV lab schedule for repair window.'
      }
    ],
    comments: [
      {
        id: 'cmt_103_1',
        complaintRef: 'cmp_103',
        author: 'Prof. Monika Dandotiya',
        authorRole: 'authority',
        isInternal: false,
        text: 'Thank you for reporting. Audio-Visual technician has been asked to service Room 112 between 4:30 PM and 5:30 PM after classes.',
        timestamp: '2026-09-26T16:15:00.000Z'
      }
    ]
  },
  {
    id: 'cmp_104',
    ticketId: 'GMS-2026-104',
    title: 'Water cooler filtration unit leaking and dirty drainage in Mechanical Block Ground Floor',
    description: 'Drinking water cooler outside Fluid Mechanics lab has overflowing dirty water on the floor, posing slippage hazards and hygiene concerns.',
    category: 'Sanitation & Hygiene',
    department: 'Campus Infrastructure & Estate',
    location: 'Mechanical Engineering Block, Ground Floor',
    priority: 'Critical',
    status: 'Resolved',
    isAnonymous: false,
    submittedBy: {
      id: 'usr_student_3',
      name: 'Rahul Verma',
      email: 'rahul.cs24@mitsgwl.ac.in',
      department: 'Computer Science & Engineering'
    },
    assignedTo: {
      id: 'usr_authority_3',
      name: 'Er. R. K. Saxena',
      role: 'authority',
      department: 'Campus Infrastructure & Estate'
    },
    upvotes: ['usr_student_1', 'usr_student_3'],
    isDeleted: false,
    trackingKey: null,
    createdAt: '2026-09-24T09:00:00.000Z',
    updatedAt: '2026-09-25T11:30:00.000Z',
    resolvedAt: '2026-09-25T11:30:00.000Z',
    slaTargetHours: 24,
    history: [
      {
        status: 'Submitted',
        actor: { name: 'Rahul Verma', role: 'student' },
        timestamp: '2026-09-24T09:00:00.000Z',
        note: 'Reported water cooler leakage.'
      },
      {
        status: 'Under review',
        actor: { name: 'Central Proctorial Board', role: 'admin' },
        timestamp: '2026-09-24T09:45:00.000Z',
        note: 'Acknowledged and prioritized due to safety risk.'
      },
      {
        status: 'Assigned',
        actor: { name: 'Central Proctorial Board', role: 'admin' },
        timestamp: '2026-09-24T10:30:00.000Z',
        note: 'Assigned to Plumbing & Sanitation squad.'
      },
      {
        status: 'In progress',
        actor: { name: 'Er. R. K. Saxena', role: 'authority' },
        timestamp: '2026-09-24T14:00:00.000Z',
        note: 'Main valve shut down and drain pipe unclogged.'
      },
      {
        status: 'Resolved',
        actor: { name: 'Er. R. K. Saxena', role: 'authority' },
        timestamp: '2026-09-25T11:30:00.000Z',
        note: 'Drainage pipe replaced, RO filter cleaned, floor disinfected and signed off.'
      }
    ],
    comments: [
      {
        id: 'cmt_104_1',
        complaintRef: 'cmp_104',
        author: 'Er. R. K. Saxena',
        authorRole: 'authority',
        isInternal: false,
        text: 'Pipe assembly has been replaced with heavy-duty PVC pipe and drainage cleared. Cooler is clean and operational.',
        timestamp: '2026-09-25T11:32:00.000Z'
      }
    ]
  },
  {
    id: 'cmp_105',
    ticketId: 'GMS-2026-105',
    title: 'Discrepancy in Mid-Sem exam score entry on Academics portal (AMS)',
    description: 'On the AMS portal, my Mid-Semester marks for Operating Systems (CS-403) are displayed as 14/30, whereas my evaluated and signed physical answer booklet clearly indicates 24/30.',
    category: 'Examination & Grading',
    department: 'Examination Cell',
    location: 'Examination Control Office / AMS Database',
    priority: 'Medium',
    status: 'Submitted',
    isAnonymous: false,
    submittedBy: {
      id: 'usr_student_3',
      name: 'Rahul Verma',
      email: 'rahul.cs24@mitsgwl.ac.in',
      department: 'Computer Science & Engineering'
    },
    assignedTo: null,
    upvotes: ['usr_student_3'],
    isDeleted: false,
    trackingKey: null,
    createdAt: '2026-09-27T08:30:00.000Z',
    updatedAt: '2026-09-27T08:30:00.000Z',
    resolvedAt: null,
    slaTargetHours: 72,
    history: [
      {
        status: 'Submitted',
        actor: { name: 'Rahul Verma', role: 'student' },
        timestamp: '2026-09-27T08:30:00.000Z',
        note: 'Submitted marks correction request with proof verification.'
      }
    ],
    comments: []
  },
  {
    id: 'cmp_106',
    ticketId: 'GMS-2026-106',
    title: 'Streetlights unlit between Girls Hostel and Central Library walkway',
    description: 'Three pole streetlights along the pathway connecting Girls Hostel to the Central Library have not been turning on after sunset. The area is poorly lit and feels unsafe for students walking back after evening library hours.',
    category: 'Campus Infrastructure',
    department: 'Campus Infrastructure & Estate',
    location: 'Central Library to Girls Hostel Road',
    priority: 'Critical',
    status: 'In progress',
    isAnonymous: true,
    submittedBy: null,
    assignedTo: {
      id: 'usr_authority_3',
      name: 'Er. R. K. Saxena',
      role: 'authority',
      department: 'Campus Infrastructure & Estate'
    },
    upvotes: ['usr_student_1', 'usr_student_2', 'usr_student_3'],
    isDeleted: false,
    trackingKey: 'TRK-4102-MITS',
    createdAt: '2026-09-25T18:00:00.000Z',
    updatedAt: '2026-09-26T09:00:00.000Z',
    resolvedAt: null,
    slaTargetHours: 24,
    history: [
      {
        status: 'Submitted',
        actor: { name: 'Anonymous Student', role: 'student' },
        timestamp: '2026-09-25T18:00:00.000Z',
        note: 'Anonymous safety complaint filed.'
      },
      {
        status: 'Under review',
        actor: { name: 'Central Proctorial Board', role: 'admin' },
        timestamp: '2026-09-25T18:40:00.000Z',
        note: 'Flagged as high-urgency campus safety concern.'
      },
      {
        status: 'Assigned',
        actor: { name: 'Central Proctorial Board', role: 'admin' },
        timestamp: '2026-09-25T19:00:00.000Z',
        note: 'Assigned to Electrical maintenance team.'
      },
      {
        status: 'In progress',
        actor: { name: 'Er. R. K. Saxena', role: 'authority' },
        timestamp: '2026-09-26T09:00:00.000Z',
        note: 'Underground cable fault identified. Line electrician currently splicing and repairing cable junction box.'
      }
    ],
    comments: [
      {
        id: 'cmt_106_1',
        complaintRef: 'cmp_106',
        author: 'Central Proctorial Board',
        authorRole: 'admin',
        isInternal: false,
        text: 'Campus security guards have been temporarily assigned to patrol this stretch between 7 PM and 11 PM until repairs are complete.',
        timestamp: '2026-09-25T19:15:00.000Z'
      },
      {
        id: 'cmt_106_2',
        complaintRef: 'cmp_106',
        author: 'Er. R. K. Saxena',
        authorRole: 'authority',
        isInternal: true,
        text: 'Internal Note: LED driver on Pole #4 failed; replaced under warranty from Havells inventory.',
        timestamp: '2026-09-26T09:30:00.000Z'
      }
    ]
  }
];
