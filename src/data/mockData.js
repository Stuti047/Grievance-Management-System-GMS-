// RCMS Mock Database & System State
// Review & Complaint Management System — MITS-DU Gwalior

export const INITIAL_USERS = [
  {
    id: 'usr_student_1',
    name: 'Puneet Chaudhary',
    email: 'puneet.btmc25@mitsgwl.ac.in',
    enrollmentNo: 'BTMC25O1109',
    role: 'student',
    department: 'Mathematics and Computing',
    hostel: 'Boys Hostel 1 (BH-1)',
    roomNo: '204',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    emailVerified: true
  },
  {
    id: 'usr_student_2',
    name: 'Stuti Jain',
    email: 'stuti.btmc25@mitsgwl.ac.in',
    enrollmentNo: 'BTMC25O1139',
    role: 'student',
    department: 'Mathematics and Computing',
    hostel: 'Girls Hostel 1 (GH-1)',
    roomNo: '112',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    emailVerified: true
  },
  {
    id: 'usr_authority_1',
    name: 'Dr. S. K. Sharma',
    email: 'warden.bh1@mitsgwalior.in',
    role: 'authority',
    title: 'Hostel Chief Warden',
    department: 'Hostel Administration (BH-1 & BH-2)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    emailVerified: true
  },
  {
    id: 'usr_authority_2',
    name: 'Prof. Monika Dandotiya',
    email: 'hod.mac@mitsgwalior.in',
    role: 'authority',
    title: 'Faculty Advisor & Associate Professor',
    department: 'Mathematics and Computing',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    emailVerified: true
  },
  {
    id: 'usr_admin_1',
    name: 'Chief Proctorial Office',
    email: 'proctor.admin@mitsgwalior.in',
    role: 'admin',
    title: 'Dean of Student Welfare & Chief Proctor',
    department: 'Central Administration',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    emailVerified: true
  }
];

export const CATEGORIES = [
  { id: 'hostel_mess', name: 'Hostel & Mess', icon: 'Utensils', slaHours: 24, dept: 'Hostel Administration' },
  { id: 'academic', name: 'Academic & Faculty', icon: 'GraduationCap', slaHours: 48, dept: 'Dean Academics' },
  { id: 'infrastructure', name: 'Campus Infrastructure & Wi-Fi', icon: 'Wifi', slaHours: 36, dept: 'IT & Works Dept' },
  { id: 'cleanliness', name: 'Sanitation & Hygiene', icon: 'Sparkles', slaHours: 12, dept: 'Estate Maintenance' },
  { id: 'welfare', name: 'Student Welfare & Discipline', icon: 'ShieldAlert', slaHours: 24, dept: 'Chief Proctorial Board' }
];

export const LIFECYCLE_STAGES = [
  { id: 'Submitted', label: 'Submitted', color: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-300' },
  { id: 'Under review', label: 'Under Review', color: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-300' },
  { id: 'Assigned', label: 'Assigned', color: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-300' },
  { id: 'In progress', label: 'In Progress', color: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-300' },
  { id: 'Resolved', label: 'Resolved', color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300' }
];

export const INITIAL_COMPLAINTS = [
  {
    ticketId: 'RCMS-2026-104',
    title: 'Mess food quality poor in dinner and undercooked chapatis',
    description: 'During dinner on 26th September, the dal was completely watery and chapatis were uncooked. Several hostel students reported severe stomach irritation afterwards. Need immediate inspection of catering staff hygiene.',
    category: 'Hostel & Mess',
    priority: 'High',
    status: 'In progress',
    isAnonymous: false,
    submittedBy: {
      name: 'Puneet Chaudhary',
      email: 'puneet.btmc25@mitsgwl.ac.in',
      enrollmentNo: 'BTMC25O1109',
      department: 'Mathematics and Computing'
    },
    locationDetails: {
      block: 'Boys Hostel 1 (BH-1)',
      room: 'Dining Hall Ground Floor',
      specificArea: 'Mess Kitchen & Serving Counters'
    },
    assignedTo: {
      name: 'Dr. S. K. Sharma',
      role: 'Hostel Chief Warden',
      email: 'warden.bh1@mitsgwalior.in'
    },
    upvotes: ['usr_student_1', 'usr_student_2', 'usr_sim_3', 'usr_sim_4', 'usr_sim_5', 'usr_sim_6', 'usr_sim_7', 'usr_sim_8', 'usr_sim_9'],
    createdAt: '2026-09-26T20:15:00.000Z',
    updatedAt: '2026-09-27T09:30:00.000Z',
    slaDeadline: '2026-09-27T20:15:00.000Z',
    isDeleted: false,
    history: [
      {
        step: 1,
        fromStatus: 'None',
        toStatus: 'Submitted',
        actor: 'Puneet Chaudhary (Student)',
        timestamp: '2026-09-26T20:15:00.000Z',
        note: 'Grievance lodged with authentic student identity.',
        hash: '8f4a18c9b4e13d9a10243e8d91c83401fa940e7293b1ec27d84a7e9140231abc'
      },
      {
        step: 2,
        fromStatus: 'Submitted',
        toStatus: 'Under review',
        actor: 'Chief Proctorial Office',
        timestamp: '2026-09-26T21:05:00.000Z',
        note: 'Screened by automated duplicate triage. Verified valid grievance.',
        hash: '3c8e41a90b4d17f22149b01c38fa482d9213ef9081237a6c984210fabcd89123'
      },
      {
        step: 3,
        fromStatus: 'Under review',
        toStatus: 'Assigned',
        actor: 'Dr. S. K. Sharma (Hostel Warden)',
        timestamp: '2026-09-27T08:00:00.000Z',
        note: 'Assigned to Hostel BH-1 Food Committee and Catering Supervisor.',
        hash: 'e92bc01481f3029dafe41908234bcfe12398401efac981432109841fbcde4901'
      },
      {
        step: 4,
        fromStatus: 'Assigned',
        toStatus: 'In progress',
        actor: 'Dr. S. K. Sharma (Hostel Warden)',
        timestamp: '2026-09-27T09:30:00.000Z',
        note: 'Surprise inspection conducted on mess kitchen. Show-cause notice issued to head chef.',
        hash: '57a1b09234fcb1284910248192348abcdafe9012481093412098412340981249'
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'Stuti Jain',
        authorRole: 'Student',
        text: 'This is happening frequently since Monday. Quality checks are urgently needed.',
        timestamp: '2026-09-26T21:40:00.000Z',
        isInternal: false
      },
      {
        id: 'c2',
        author: 'Dr. S. K. Sharma',
        authorRole: 'Hostel Chief Warden',
        text: 'INTERNAL AUDIT NOTE: Catering contractor Mr. Verma summoned for emergency hearing today at 2 PM. Penalties will be deducted from monthly invoice.',
        timestamp: '2026-09-27T09:35:00.000Z',
        isInternal: true
      },
      {
        id: 'c3',
        author: 'Dr. S. K. Sharma',
        authorRole: 'Hostel Chief Warden',
        text: 'We have warned the catering vendor. Surprise flour and oil quality testing has been ordered. An update will be posted by tonight.',
        timestamp: '2026-09-27T09:40:00.000Z',
        isInternal: false
      }
    ]
  },
  {
    ticketId: 'RCMS-2026-105',
    title: 'Wi-Fi access point down on 2nd Floor Block C hostel wing',
    description: 'The router on Corridor C2 has been blinking red since yesterday evening. No student can connect to eduroam / campus-wifi to access online labs and Moodle assignments.',
    category: 'Campus Infrastructure & Wi-Fi',
    priority: 'High',
    status: 'Assigned',
    isAnonymous: true,
    anonymousToken: 'RCMS-SEC-710492',
    anonymousHash: 'a5712e0984bf321d8492041289fe9401ab3210948cba43210984321fabcde091',
    locationDetails: {
      block: 'Hostel Block C',
      room: 'Floor 2 Corridor',
      specificArea: 'Opposite Room C-214'
    },
    assignedTo: {
      name: 'Network Administration Cell',
      role: 'IT Infrastructure Head',
      email: 'networking@mitsgwalior.in'
    },
    upvotes: ['usr_student_1', 'usr_student_2', 'usr_sim_10', 'usr_sim_11', 'usr_sim_12'],
    createdAt: '2026-09-26T18:20:00.000Z',
    updatedAt: '2026-09-27T08:15:00.000Z',
    slaDeadline: '2026-09-28T06:20:00.000Z',
    isDeleted: false,
    history: [
      {
        step: 1,
        fromStatus: 'None',
        toStatus: 'Submitted',
        actor: 'Anonymous Student (SHA-256 Verified Token)',
        timestamp: '2026-09-26T18:20:00.000Z',
        note: 'Submitted anonymously with one-time secret tracking token.',
        hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
      },
      {
        step: 2,
        fromStatus: 'Submitted',
        toStatus: 'Under review',
        actor: 'Chief Proctorial Office',
        timestamp: '2026-09-26T19:00:00.000Z',
        note: 'Automated triage: Valid IT network complaint.',
        hash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c'
      },
      {
        step: 3,
        fromStatus: 'Under review',
        toStatus: 'Assigned',
        actor: 'System Admin',
        timestamp: '2026-09-27T08:15:00.000Z',
        note: 'Assigned to Cisco AP hardware technician on campus.',
        hash: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'
      }
    ],
    comments: [
      {
        id: 'c201',
        author: 'Network Cell Support',
        authorRole: 'Authority',
        text: 'PoE switch port 18 power cycle attempted remotely. Technician dispatched with replacement AP-4800 unit.',
        timestamp: '2026-09-27T08:45:00.000Z',
        isInternal: false
      }
    ]
  },
  {
    ticketId: 'RCMS-2026-106',
    title: 'Classroom 112 Projector lamp flickering during lectures',
    description: 'In Room 112 (New Academic Block), the ceiling projector is flickering green and turning off every 10 minutes. Professors are unable to show slides.',
    category: 'Academic & Faculty',
    priority: 'Medium',
    status: 'Under review',
    isAnonymous: false,
    submittedBy: {
      name: 'Stuti Jain',
      email: 'stuti.btmc25@mitsgwl.ac.in',
      enrollmentNo: 'BTMC25O1139',
      department: 'Mathematics and Computing'
    },
    locationDetails: {
      block: 'New Academic Block (NAB)',
      room: 'Lecture Hall 112',
      specificArea: 'Podium & Ceiling mount'
    },
    assignedTo: null,
    upvotes: ['usr_student_2', 'usr_sim_20'],
    createdAt: '2026-09-27T09:10:00.000Z',
    updatedAt: '2026-09-27T09:10:00.000Z',
    slaDeadline: '2026-09-29T09:10:00.000Z',
    isDeleted: false,
    history: [
      {
        step: 1,
        fromStatus: 'None',
        toStatus: 'Submitted',
        actor: 'Stuti Jain (Student)',
        timestamp: '2026-09-27T09:10:00.000Z',
        note: 'Submitted with academic enrollment validation.',
        hash: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e'
      },
      {
        step: 2,
        fromStatus: 'Submitted',
        toStatus: 'Under review',
        actor: 'Central Administration',
        timestamp: '2026-09-27T10:00:00.000Z',
        note: 'Routing to Estate & AV Maintenance department.',
        hash: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f'
      }
    ],
    comments: []
  },
  {
    ticketId: 'RCMS-2026-107',
    title: 'Water cooler on 1st Floor SAC building not cooling',
    description: 'The drinking water cooler near the Student Activity Centre gym is dispensing warm tap water. Needs thermostat replacement and filter cleaning.',
    category: 'Sanitation & Hygiene',
    priority: 'Low',
    status: 'Resolved',
    isAnonymous: false,
    submittedBy: {
      name: 'Puneet Chaudhary',
      email: 'puneet.btmc25@mitsgwl.ac.in',
      enrollmentNo: 'BTMC25O1109',
      department: 'Mathematics and Computing'
    },
    locationDetails: {
      block: 'Student Activity Centre (SAC)',
      room: '1st Floor Water Station',
      specificArea: 'Near Indoor Badminton Court'
    },
    assignedTo: {
      name: 'Estate Maintenance Team',
      role: 'HVAC Technician',
      email: 'estate@mitsgwalior.in'
    },
    upvotes: ['usr_student_1', 'usr_student_2', 'usr_sim_14', 'usr_sim_15'],
    createdAt: '2026-09-24T11:00:00.000Z',
    updatedAt: '2026-09-25T16:30:00.000Z',
    slaDeadline: '2026-09-25T23:00:00.000Z',
    isDeleted: false,
    history: [
      {
        step: 1,
        fromStatus: 'None',
        toStatus: 'Submitted',
        actor: 'Puneet Chaudhary (Student)',
        timestamp: '2026-09-24T11:00:00.000Z',
        note: 'Submitted.',
        hash: '6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a'
      },
      {
        step: 2,
        fromStatus: 'Submitted',
        toStatus: 'Under review',
        actor: 'Estate Officer',
        timestamp: '2026-09-24T12:00:00.000Z',
        note: 'Acknowledged and verified.',
        hash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b'
      },
      {
        step: 3,
        fromStatus: 'Under review',
        toStatus: 'Assigned',
        actor: 'Estate Officer',
        timestamp: '2026-09-24T14:30:00.000Z',
        note: 'Assigned to cooling technician Rakesh.',
        hash: '8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c'
      },
      {
        step: 4,
        fromStatus: 'Assigned',
        toStatus: 'In progress',
        actor: 'Estate Maintenance Team',
        timestamp: '2026-09-25T10:00:00.000Z',
        note: 'Compressor relay replaced and new UV filter installed.',
        hash: '9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d'
      },
      {
        step: 5,
        fromStatus: 'In progress',
        toStatus: 'Resolved',
        actor: 'Estate Maintenance Team',
        timestamp: '2026-09-25T16:30:00.000Z',
        note: 'Cooling test passed: Water output at 12°C. Verified working.',
        hash: '0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e'
      }
    ],
    comments: [
      {
        id: 'c301',
        author: 'Estate Maintenance Team',
        authorRole: 'Authority',
        text: 'The thermostat and water filter cartridges were replaced today. Cold drinking water is restored.',
        timestamp: '2026-09-25T16:32:00.000Z',
        isInternal: false
      }
    ]
  },
  {
    ticketId: 'RCMS-2026-108',
    title: 'Timetable clash between Discrete Mathematics and Machine Learning Lab',
    description: 'On Fridays Slot 3 (1:30 PM - 3:30 PM), BTMC 3rd Semester has both Discrete Math tutorial and ML Lab scheduled in the same slot on AMS portal.',
    category: 'Academic & Faculty',
    priority: 'Urgent',
    status: 'In progress',
    isAnonymous: false,
    submittedBy: {
      name: 'Stuti Jain',
      email: 'stuti.btmc25@mitsgwl.ac.in',
      enrollmentNo: 'BTMC25O1139',
      department: 'Mathematics and Computing'
    },
    locationDetails: {
      block: 'Department of Mathematics and Computing',
      room: 'Computing Lab 2 & Room 204',
      specificArea: 'Friday Time Table Slots'
    },
    assignedTo: {
      name: 'Prof. Monika Dandotiya',
      role: 'Faculty Advisor & Associate Professor',
      email: 'hod.mac@mitsgwalior.in'
    },
    upvotes: ['usr_student_1', 'usr_student_2', 'usr_sim_30', 'usr_sim_31', 'usr_sim_32', 'usr_sim_33', 'usr_sim_34'],
    createdAt: '2026-09-25T14:00:00.000Z',
    updatedAt: '2026-09-26T11:00:00.000Z',
    slaDeadline: '2026-09-27T14:00:00.000Z',
    isDeleted: false,
    history: [
      {
        step: 1,
        fromStatus: 'None',
        toStatus: 'Submitted',
        actor: 'Stuti Jain (Student)',
        timestamp: '2026-09-25T14:00:00.000Z',
        note: 'Submitted.',
        hash: 'ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12'
      },
      {
        step: 2,
        fromStatus: 'Submitted',
        toStatus: 'Under review',
        actor: 'Dean Academics',
        timestamp: '2026-09-25T15:30:00.000Z',
        note: 'Forwarded to Department Time Table Committee.',
        hash: 'bc23de45fa67bc23de45fa67bc23de45fa67bc23de45fa67bc23de45fa67bc23'
      },
      {
        step: 3,
        fromStatus: 'Under review',
        toStatus: 'In progress',
        actor: 'Prof. Monika Dandotiya (Associate Professor)',
        timestamp: '2026-09-26T11:00:00.000Z',
        note: 'Department reviewing revised slot allotment. Moving tutorial to Thursday 4 PM.',
        hash: 'cd34ef56ab78cd34ef56ab78cd34ef56ab78cd34ef56ab78cd34ef56ab78cd34'
      }
    ],
    comments: [
      {
        id: 'c401',
        author: 'Prof. Monika Dandotiya',
        authorRole: 'Faculty Advisor',
        text: 'INTERNAL NOTE: Reallocated Room 204 tutorial to Thursday 4:00-5:00 PM. Coordination with Dean Academics portal pending.',
        timestamp: '2026-09-26T11:05:00.000Z',
        isInternal: true
      },
      {
        id: 'c402',
        author: 'Prof. Monika Dandotiya',
        authorRole: 'Faculty Advisor',
        text: 'The timetable clash is being resolved. Updated batch schedules will reflect on AMS portal by Monday morning.',
        timestamp: '2026-09-26T11:10:00.000Z',
        isInternal: false
      }
    ]
  }
];
