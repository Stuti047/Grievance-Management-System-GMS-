import 'dotenv/config';
import prisma from '../config/db.js';

const INSTITUTIONAL_AUTHORITIES = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. INSTITUTION LEADERSHIP & CORE ADMINISTRATION
  // ─────────────────────────────────────────────────────────────────────────────
  {
    name: 'Dr. Rajindra Kumar Pandit',
    designation: 'Vice Chancellor',
    department: 'Institution Leadership',
    responsibilities: 'Executive Institutional Head & Appellate Authority for Grievance Redressal',
    official_emails: ['vicechancellor@mitsgwalior.in'],
    email: 'vicechancellor@mitsgwalior.in',
    category_group: 'leadership',
    section: 'central',
    status: 'active'
  },
  {
    name: 'Dr. Pratesh Jayaswal',
    designation: 'Registrar',
    department: 'Office of the Registrar',
    responsibilities: 'Chief Administrative Officer, Institutional Compliance, Governance & Legal Affairs',
    official_emails: ['registrar@mitsgwalior.in'],
    email: 'registrar@mitsgwalior.in',
    category_group: 'leadership',
    section: 'central',
    status: 'active'
  },
  {
    name: 'Prof. Prabhakar Sharma',
    designation: 'Deputy Registrar',
    department: 'Office of the Registrar / Central Computer Centre',
    responsibilities: 'Administrative Coordination, Central Computing Support, and Registry Administration',
    official_emails: ['dr@mitsgwalior.in', 'goffice@mitsgwalior.in'],
    email: 'dr@mitsgwalior.in',
    category_group: 'leadership',
    section: 'central',
    status: 'active'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. ACADEMIC & STUDENT RESPONSIBILITIES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    name: 'Dr. R.S. Jadon',
    designation: 'Proctor / Anti-Ragging Chairperson',
    department: 'Proctorial Board & Student Welfare',
    responsibilities: 'Campus Discipline, Anti-Ragging Committee Operations, Campus Security, and Behavioral Integrity',
    official_emails: ['proctor@mitsgwalior.in', 'rsjadon@mitsgwalior.in'],
    email: 'proctor@mitsgwalior.in',
    category_group: 'academic_student',
    section: 'college',
    status: 'active'
  },
  {
    name: 'Dr. P.K. Singhal',
    designation: 'Controller of Examination',
    department: 'Examination Cell',
    responsibilities: 'Examination Schedules, Hall Tickets, Grading, Evaluation, Re-verification, and Degree Processing',
    official_emails: ['exam@mitsgwalior.in', 'pks_65@mitsgwalior.in'],
    email: 'exam@mitsgwalior.in',
    category_group: 'academic_student',
    section: 'college',
    status: 'active'
  },
  {
    name: 'Dr. Rajeev Kansal',
    designation: 'Dean of Student Welfare',
    department: 'Student Welfare & Development',
    responsibilities: 'Student Welfare Schemes, Scholarship Facilitation, Extracurricular Affairs, and Campus Life Support',
    official_emails: ['deanstudents@mitsgwalior.in', 'rkansal19@mitsgwalior.in'],
    email: 'deanstudents@mitsgwalior.in',
    category_group: 'academic_student',
    section: 'college',
    status: 'active'
  },
  {
    name: 'Sh. Vikram Rajpoot',
    matchNames: ['Mr. Vikram Singh Rajput', 'Sh. Vikram Rajpoot', 'Vikram Rajput'],
    designation: 'Training & Placement Officer',
    department: 'Training & Placement Cell',
    responsibilities: 'Corporate Placement Drives, Internships, Industry Partnerships, and Career Transition Inquiries',
    official_emails: ['tnp@mitsgwalior.in', 'vikram.rajput@mitsgwalior.in'],
    email: 'tnp@mitsgwalior.in',
    category_group: 'academic_student',
    section: 'college',
    status: 'active'
  },
  {
    name: 'Dr. Manish Sagar',
    designation: 'Chief Warden (Boys Hostel)',
    department: 'Hostel Administration (Boys)',
    responsibilities: 'Residential Infrastructure, Mess Supervision, Allocation, Maintenance & Security for Boys Hostels',
    official_emails: ['mksagar@mitsgwalior.in'],
    email: 'mksagar@mitsgwalior.in',
    category_group: 'academic_student',
    section: 'hostel',
    status: 'active'
  },
  {
    name: 'Dr. Neha Bhardwaj',
    designation: 'Warden (Girls Hostel)',
    department: 'Hostel Administration (Girls)',
    responsibilities: 'Residential Infrastructure, Curfew Administration, Safety & Room Maintenance for Girls Hostels',
    official_emails: ['nehabhardwaj@mitsgwalior.in'],
    email: 'nehabhardwaj@mitsgwalior.in',
    category_group: 'academic_student',
    section: 'hostel',
    status: 'active'
  },
  {
    name: 'Dr. B.P.S. Bhadauria',
    designation: 'Sports Officer',
    department: 'Sports & Physical Education',
    responsibilities: 'Sports Complexes, Gymnasium Equipment, University Tournaments & Athletic Welfare Facilities',
    official_emails: ['bhanu@mitsgwalior.in'],
    email: 'bhanu@mitsgwalior.in',
    category_group: 'academic_student',
    section: 'college',
    status: 'active'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. DEPARTMENTAL HEADS
  // ─────────────────────────────────────────────────────────────────────────────
  {
    name: 'Dr. Manish Dixit',
    designation: 'Dean & Chairperson (Student Grievance), CSE',
    department: 'Computer Science & Engineering',
    responsibilities: 'Designated Student Grievance Redressal Chairperson, Escalations & Academic Operations',
    official_emails: ['director@mitsgwalior.in'],
    email: 'director@mitsgwalior.in',
    category_group: 'department_head',
    section: 'college',
    status: 'active'
  },
  {
    name: 'Dr. Laxmi Shrivastava',
    matchNames: ['Dr. Laxmi Srivastava', 'Dr. Laxmi Shrivastava'],
    designation: 'Head of Department, Electronics Engineering',
    department: 'Electronics Engineering',
    responsibilities: 'Departmental Faculty, Lab Facilities, Curriculum Logistics, and Electronics Student Affairs',
    official_emails: ['lselex@mitsgwalior.in'],
    email: 'lselex@mitsgwalior.in',
    category_group: 'department_head',
    section: 'college',
    status: 'active'
  },
  {
    name: 'Dr. Khushboo Agarwal',
    designation: 'Assistant Professor & Head, CSE',
    department: 'Computer Science & Engineering',
    responsibilities: 'CSE Departmental Coordination, Undergraduate Laboratories, and Academic Course Schedules',
    official_emails: [],
    email: null,
    category_group: 'department_head',
    section: 'college',
    status: 'active'
  },
  {
    name: 'Dr. Mahesh Parmar',
    designation: 'Head of Department, Computer Science and Design',
    department: 'Computer Science and Design',
    responsibilities: 'CSD Departmental Governance, Design Studio Labs, Faculty Allotments, and Coursework',
    official_emails: [],
    email: null,
    category_group: 'department_head',
    section: 'college',
    status: 'active'
  }
];

async function sync() {
  console.log('🔄 Starting Institutional Authorities & Routing Synchronization...');

  const authorityMap = {};

  for (const item of INSTITUTIONAL_AUTHORITIES) {
    const namesToSearch = item.matchNames || [item.name];

    // Find if authority already exists by name or email
    const existing = await prisma.authority.findFirst({
      where: {
        OR: [
          { name: { in: namesToSearch } },
          ...(item.email ? [{ email: item.email }] : [])
        ]
      }
    });

    if (existing) {
      console.log(`  Updating existing authority: ${existing.name} -> ${item.name}`);
      const updated = await prisma.authority.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          designation: item.designation,
          department: item.department,
          responsibilities: item.responsibilities,
          official_emails: item.official_emails,
          email: item.email || existing.email,
          category_group: item.category_group,
          section: item.section || existing.section,
          status: item.status
        }
      });
      authorityMap[item.name] = updated.id;
    } else {
      console.log(`  Creating new institutional authority: ${item.name}`);
      const created = await prisma.authority.create({
        data: {
          name: item.name,
          designation: item.designation,
          department: item.department,
          responsibilities: item.responsibilities,
          official_emails: item.official_emails,
          email: item.email,
          category_group: item.category_group,
          section: item.section,
          status: item.status
        }
      });
      authorityMap[item.name] = created.id;
    }
  }

  // Also classify other existing authorities into category_group
  await prisma.authority.updateMany({
    where: {
      category_group: 'academic_student',
      department: { contains: 'Administration' }
    },
    data: { category_group: 'leadership' }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. GRIEVANCE RESPONSIBILITY ROUTING MAPPINGS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n🧭 Configuring Responsibility Routing & Escalations across Categories...');

  const ROUTING_MAPPINGS = [
    {
      categoryKeyword: 'Examination',
      primaryAuthorityName: 'Dr. P.K. Singhal',
      escalationAuthorityName: 'Dr. Rajindra Kumar Pandit',
      slaHours: 48,
      department: 'Examination Cell',
      designation: 'Controller of Examination'
    },
    {
      categoryKeyword: 'Evaluation',
      primaryAuthorityName: 'Dr. P.K. Singhal',
      escalationAuthorityName: 'Dr. Rajindra Kumar Pandit',
      slaHours: 72,
      department: 'Examination Cell',
      designation: 'Controller of Examination'
    },
    {
      categoryKeyword: 'Hostel',
      primaryAuthorityName: 'Dr. Manish Sagar',
      escalationAuthorityName: 'Dr. R.S. Jadon',
      slaHours: 24,
      department: 'Hostel Administration',
      designation: 'Chief Warden (Boys Hostel)'
    },
    {
      categoryKeyword: 'Mess',
      primaryAuthorityName: 'Dr. Manish Sagar',
      escalationAuthorityName: 'Dr. Rajeev Kansal',
      slaHours: 12,
      department: 'Mess & Catering Committee',
      designation: 'Chief Warden (Boys Hostel)'
    },
    {
      categoryKeyword: 'Canteen',
      primaryAuthorityName: 'Dr. Manish Sagar',
      escalationAuthorityName: 'Dr. Rajeev Kansal',
      slaHours: 24,
      department: 'Campus Amenities',
      designation: 'Chief Warden (Boys Hostel)'
    },
    {
      categoryKeyword: 'Placement',
      primaryAuthorityName: 'Sh. Vikram Rajpoot',
      escalationAuthorityName: 'Dr. Manish Dixit',
      slaHours: 48,
      department: 'Training & Placement Cell',
      designation: 'Training & Placement Officer'
    },
    {
      categoryKeyword: 'Discipline',
      primaryAuthorityName: 'Dr. R.S. Jadon',
      escalationAuthorityName: 'Dr. Rajindra Kumar Pandit',
      slaHours: 24,
      department: 'Proctorial Board & Student Welfare',
      designation: 'Proctor / Anti-Ragging Chairperson'
    },
    {
      categoryKeyword: 'Welfare',
      primaryAuthorityName: 'Dr. Rajeev Kansal',
      escalationAuthorityName: 'Dr. Manish Dixit',
      slaHours: 24,
      department: 'Student Welfare & Development',
      designation: 'Dean of Student Welfare'
    },
    {
      categoryKeyword: 'Infrastructure',
      primaryAuthorityName: 'Dr. Rajeev Kansal',
      escalationAuthorityName: 'Dr. Pratesh Jayaswal',
      slaHours: 36,
      department: 'Estate Maintenance Section',
      designation: 'Dean of Student Welfare'
    },
    {
      categoryKeyword: 'Sanitation',
      primaryAuthorityName: 'Dr. Rajeev Kansal',
      escalationAuthorityName: 'Dr. Pratesh Jayaswal',
      slaHours: 12,
      department: 'Sanitation & Grounds',
      designation: 'Dean of Student Welfare'
    },
    {
      categoryKeyword: 'IT & Network',
      primaryAuthorityName: 'Prof. Prabhakar Sharma',
      escalationAuthorityName: 'Dr. Pratesh Jayaswal',
      slaHours: 24,
      department: 'Central Computer Centre (CCC)',
      designation: 'Deputy Registrar'
    },
    {
      categoryKeyword: 'Academic',
      primaryAuthorityName: 'Dr. Manish Dixit',
      escalationAuthorityName: 'Dr. Rajindra Kumar Pandit',
      slaHours: 48,
      department: 'Academic Grievance Cell',
      designation: 'Dean & Chairperson (Student Grievance), CSE'
    },
    {
      categoryKeyword: 'General',
      primaryAuthorityName: 'Dr. Manish Dixit',
      escalationAuthorityName: 'Dr. Pratesh Jayaswal',
      slaHours: 48,
      department: 'Central Student Grievance Cell',
      designation: 'Dean & Chairperson (Student Grievance), CSE'
    }
  ];

  const categories = await prisma.category.findMany();

  for (const cat of categories) {
    const matchedRule = ROUTING_MAPPINGS.find(m =>
      cat.name.toLowerCase().includes(m.categoryKeyword.toLowerCase())
    );

    if (matchedRule) {
      const primaryAuthId = authorityMap[matchedRule.primaryAuthorityName];
      const escalationAuthId = authorityMap[matchedRule.escalationAuthorityName];

      await prisma.category.update({
        where: { id: cat.id },
        data: {
          authority_id: primaryAuthId || cat.authority_id,
          escalation_authority_id: escalationAuthId || null,
          sla_hours: matchedRule.slaHours,
          department: matchedRule.department,
          responsible_designation: matchedRule.designation,
          is_active: true
        }
      });
      console.log(`  ✓ Routed [${cat.name}] -> Primary: ${matchedRule.primaryAuthorityName} | Escalation: ${matchedRule.escalationAuthorityName}`);
    }
  }

  // Log to audit log
  await prisma.auditLog.create({
    data: {
      action: 'SYNC_INSTITUTIONAL_AUTHORITIES_AND_ROUTING',
      entity_type: 'authority',
      details: {
        total_synced: INSTITUTIONAL_AUTHORITIES.length,
        timestamp: new Date().toISOString()
      }
    }
  });

  console.log('✅ Synchronization completed successfully.');
}

sync()
  .catch(err => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

