import prisma from '../config/db.js';

// The 34 official MITS Faculty & Responsible Authorities provided in the prompt
const OFFICIAL_MITS_FACULTY = [
  {
    name: 'Prof. Archana Tiwari',
    responsibilities: 'Chairperson Women Guidance, Grievance & Redressal Cell',
    designation: 'Chairperson, Women Guidance Cell',
    department: 'Women Guidance & Grievance Cell',
    contact_number: '7748884150',
    section: 'college',
    categoryName: 'Other Student Concerns'
  },
  {
    name: 'Dr. Laxmi Srivastava',
    responsibilities: 'Coordinator TEQIP III',
    designation: 'Professor & Coordinator TEQIP III',
    department: 'Electrical Engineering',
    contact_number: '0751-2409363',
    section: 'college',
    categoryName: 'Academic Issues'
  },
  {
    name: 'Dr. Manjaree Pandit',
    responsibilities: 'Incharge Academic Development Cell & NBA Coordinator',
    designation: 'Dean Academics & NBA Coordinator',
    department: 'Academic Development Cell',
    contact_number: '0751-2409380',
    section: 'college',
    categoryName: 'Academic Issues'
  },
  {
    name: 'Dr. R.S. Jadon',
    responsibilities: 'Proctor',
    designation: 'Chief Proctor & Professor',
    department: 'Proctorial Board',
    contact_number: '9425122675',
    section: 'college',
    categoryName: 'Faculty-Related Grievances'
  },
  {
    name: 'Dr. P.K. Singhal',
    responsibilities: 'Controller Examination, Chairman Central Library Chairman Counselling Cell',
    designation: 'Controller of Examination & Chairman Library',
    department: 'Examination Cell & Central Library',
    contact_number: '0751-2409377',
    section: 'college',
    categoryName: 'Examination and Results'
  },
  {
    name: 'Dr. R.K. Gupta',
    responsibilities: 'Incharge International Affairs',
    designation: 'Incharge International Affairs',
    department: 'International Affairs Cell',
    contact_number: '0751-2409391',
    section: 'college',
    categoryName: 'Administrative Issues'
  },
  {
    name: 'Dr. S.K. Jain',
    responsibilities: 'Co-Coordinator Nodal Centre (RGPV)',
    designation: 'Co-Coordinator Nodal Centre',
    department: 'Mechanical Engineering',
    contact_number: '9893367731',
    section: 'college',
    categoryName: 'Academic Issues'
  },
  {
    name: 'Dr. Abhay Mishra',
    responsibilities: 'Chairman, Central Purchase Committee',
    designation: 'Chairman, Central Purchase Committee',
    department: 'Central Administration',
    contact_number: '9425338149',
    section: 'college',
    categoryName: 'Administrative Issues'
  },
  {
    name: 'Dr. Rajeev Kansal',
    responsibilities: 'Incharge Building Committee, Incharge Student Development Cell',
    designation: 'Dean Student Development & Infrastructure Head',
    department: 'Campus Infrastructure & Student Development',
    contact_number: '9165028102',
    section: 'college',
    categoryName: 'Infrastructure and Maintenance'
  },
  {
    name: 'Dr. Sulochana Wadhwani',
    responsibilities: 'Dy. Controller Examination, Outcome Based Education (OBE) Manager',
    designation: 'Dy. Controller Examination',
    department: 'Examination Cell',
    contact_number: '9425112199',
    section: 'college',
    categoryName: 'Examination and Results'
  },
  {
    name: 'Dr. Pratesh Jayaswal',
    responsibilities: 'Incharge Registrar, IQAC Coordinator, Academic Coordinator TEQIP III, QIP Coordinator & NDF Coordinator',
    designation: 'Registrar (Incharge) & IQAC Coordinator',
    department: 'Office of the Registrar',
    contact_number: '0751-2409231',
    section: 'college',
    categoryName: 'Administrative Issues'
  },
  {
    name: 'Dr. C.S. Malvi',
    responsibilities: 'Incharge Innovation Cell',
    designation: 'Head, Innovation & Incubation Cell',
    department: 'Innovation Cell',
    contact_number: '9993207600',
    section: 'college',
    categoryName: 'Academic Issues'
  },
  {
    name: 'Dr. Manoj Gaur',
    responsibilities: 'Incharge Remedial Classes, Incharge Institute Industry Interaction Cell (IIIC)',
    designation: 'Incharge IIIC & Remedial Programs',
    department: 'Institute Industry Interaction Cell',
    contact_number: '9425020318',
    section: 'college',
    categoryName: 'Academic Issues'
  },
  {
    name: 'Dr. Manish Sagar',
    responsibilities: 'Incharge NSS, Incharge SC/ST Cell',
    designation: 'Incharge NSS & SC/ST Cell',
    department: 'Student Welfare & Social Schemes',
    contact_number: '9425338833',
    section: 'college',
    categoryName: 'Other Student Concerns'
  },
  {
    name: 'Dr. Akhilesh Tiwari',
    responsibilities: 'Incharge Startup Cell',
    designation: 'Incharge Startup & Entrepreneurship Cell',
    department: 'Startup Cell',
    contact_number: '9407204907',
    section: 'college',
    categoryName: 'Academic Issues'
  },
  {
    name: 'Dr. Rekha Gupta',
    responsibilities: 'Incharge Girls Counselling / Grievance Cell',
    designation: 'Incharge Girls Grievance & Counselling Cell',
    department: 'Girls Grievance Cell',
    contact_number: '0751-2409369',
    section: 'college',
    categoryName: 'Other Student Concerns'
  },
  {
    name: 'Dr. Manish Dixit',
    responsibilities: 'Cultural Coordinator and Incharge Media Cell',
    designation: 'Cultural Coordinator & Head Media Cell',
    department: 'Media & Cultural Cell',
    contact_number: '9425117866',
    section: 'college',
    categoryName: 'Other Student Concerns'
  },
  {
    name: 'Prof. Prabhakar Sharma',
    responsibilities: 'Incharge Central Computer Centre, Procurement Coordinator TEQIP III, Incharge EDC, Incharge CCTV surveillance system and Incharge Value Aided Courses',
    designation: 'Head, Central Computer Centre',
    department: 'Central Computer Centre (CCC)',
    contact_number: '9425339330',
    section: 'college',
    categoryName: 'IT and Technical Support'
  },
  {
    name: 'Dr. Anjali S. Patil',
    responsibilities: 'Public Relations Officer',
    designation: 'Public Relations Officer (PRO)',
    department: 'Public Relations Office',
    contact_number: '9301118909',
    section: 'college',
    categoryName: 'Administrative Issues'
  },
  {
    name: 'Dr. Hari Mohan Dubey',
    responsibilities: 'Incharge GIAN',
    designation: 'Incharge GIAN & Faculty Member',
    department: 'Electrical Engineering',
    contact_number: '9425776060',
    section: 'college',
    categoryName: 'Academic Issues'
  },
  {
    name: 'Prof. Puneet Johari',
    responsibilities: 'Asst. Controller Examination',
    designation: 'Asst. Controller of Examination',
    department: 'Examination Cell',
    contact_number: '9425618829',
    section: 'college',
    categoryName: 'Examination and Results'
  },
  {
    name: 'Dr. Anjula Gaur',
    responsibilities: 'Incharge Medical Services',
    designation: 'Medical Officer & Health Incharge',
    department: 'Health & Medical Services',
    contact_number: '9425187478',
    section: 'college',
    categoryName: 'Other Student Concerns'
  },
  {
    name: 'Dr. Sunita Sharma',
    responsibilities: 'Associate Coordinator SWAYAM',
    designation: 'Associate Coordinator SWAYAM/MOOCs',
    department: 'Academic Learning Initiatives',
    contact_number: '9826355314',
    section: 'college',
    categoryName: 'Academic Issues'
  },
  {
    name: 'Dr. Vijay Bhuria',
    responsibilities: 'Asst. Controller Examination',
    designation: 'Asst. Controller of Examination',
    department: 'Examination Cell',
    contact_number: '9826513468',
    section: 'college',
    categoryName: 'Examination and Results'
  },
  {
    name: 'Prof. Kuldeep Swarnkar',
    responsibilities: 'Incharge e-News Letter',
    designation: 'Incharge e-News Letter & Publications',
    department: 'Publications & Communications',
    contact_number: '9827569098',
    section: 'college',
    categoryName: 'Other Student Concerns'
  },
  {
    name: 'Prof. Vedansh Chaturvedi',
    responsibilities: 'Incharge-Workshop',
    designation: 'Superintendent, Central Workshop',
    department: 'Central Workshop',
    contact_number: '8989273208',
    section: 'college',
    categoryName: 'Infrastructure and Maintenance'
  },
  {
    name: 'Prof. Praveen Bansal',
    responsibilities: 'SPOC NPTEL/ MOOC/ GATE Cordinator & Twinning Coordinator TEQIP III',
    designation: 'GATE & NPTEL Coordinator',
    department: 'GATE & Career Cell',
    contact_number: '9827577549',
    section: 'college',
    categoryName: 'Academic Issues'
  },
  {
    name: 'Prof. Jamvant Kumre',
    responsibilities: 'Incharge PMSSS Scheme of AICTE',
    designation: 'Nodal Officer PMSSS Scheme',
    department: 'Scholarships & AICTE Schemes',
    contact_number: '8770742641',
    section: 'college',
    categoryName: 'Administrative Issues'
  },
  {
    name: 'Prof. Vishal Chaudhary',
    responsibilities: 'Associate Coordinator GATE',
    designation: 'Associate Coordinator GATE Coaching',
    department: 'Career & GATE Cell',
    contact_number: '9926245805',
    section: 'college',
    categoryName: 'Academic Issues'
  },
  {
    name: 'Prof. Rajni Ranjan Singh Makwana',
    responsibilities: 'Incharge IMS/MIS & Web Manager',
    designation: 'Head IMS/MIS & College Webmaster',
    department: 'Information Management System (IMS)',
    contact_number: '9098054320',
    section: 'college',
    categoryName: 'IT and Technical Support'
  },
  {
    name: 'Er. Shailendra Singh Bhadauria',
    responsibilities: 'Administrative Officer',
    designation: 'Administrative Officer',
    department: 'Administrative Section',
    contact_number: '9827006001',
    section: 'college',
    categoryName: 'Administrative Issues'
  },
  {
    name: 'Shri. Sanjay Bhargava',
    responsibilities: 'Hostel Manager',
    designation: 'Hostel Manager',
    department: 'Hostel Administration',
    contact_number: '9425725155',
    section: 'hostel',
    categoryName: 'Hostel Facilities'
  },
  {
    name: 'Mr. Vikram Singh Rajput',
    responsibilities: 'Training & Placement Officer & Incharge Finishing School',
    designation: 'Training & Placement Officer (TPO)',
    department: 'Training & Placement Cell',
    contact_number: '8516057887',
    section: 'college',
    categoryName: 'Academic Issues'
  }
];

const OFFICIAL_CATEGORIES = [
  { name: 'Academic Issues', sla_hours: 48, description: 'Curriculum delivery, timetable conflicts, attendance disputes, continuous evaluation, and faculty teaching concerns.', section: 'college' },
  { name: 'Examination and Results', sla_hours: 48, description: 'Mid-sem / end-sem exam scheduling, admit card discrepancies, marksheet revaluation, grade card errors.', section: 'college' },
  { name: 'Infrastructure and Maintenance', sla_hours: 36, description: 'Classroom projectors, electrical fittings, laboratory equipment, bench/furniture repairs, building maintenance.', section: 'college' },
  { name: 'Hostel Facilities', sla_hours: 24, description: 'Room allocations, hostel cleanliness, washroom hygiene, mess food quality, water coolers, and geyser functioning.', section: 'hostel' },
  { name: 'Library Services', sla_hours: 24, description: 'Book lending, digital library access, IEEE/ScienceDirect portal, reading hall air conditioning, quiet study zones.', section: 'college' },
  { name: 'IT and Technical Support', sla_hours: 24, description: 'Campus Wi-Fi connectivity, Moodle LMS portal, ERP student portal login, computer lab network issues.', section: 'college' },
  { name: 'Administrative Issues', sla_hours: 48, description: 'Fee payment receipts, scholarship verification, bonafide/character certificates, identity card replacements.', section: 'college' },
  { name: 'Faculty-Related Grievances', sla_hours: 48, description: 'Proctorial matters, student mentoring grievances, behavioral concerns, disciplinary council inquiries.', section: 'college' },
  { name: 'Other Student Concerns', sla_hours: 48, description: 'Campus medical emergencies, counselling cell guidance, transport/bus services, extracurricular and sports facilities.', section: 'college' }
];

export async function seedAuthoritiesAndDataset() {
  console.log('--- Starting MITS Authorities & Realistic Dataset Seeding ---');

  // 1. Seed or Update the 34 Faculty Authorities
  const authorityMap = {};

  for (const fac of OFFICIAL_MITS_FACULTY) {
    const existing = await prisma.authority.findFirst({
      where: { name: fac.name }
    });

    if (existing) {
      const updated = await prisma.authority.update({
        where: { id: existing.id },
        data: {
          responsibilities: fac.responsibilities,
          designation: fac.designation,
          department: fac.department,
          contact_number: fac.contact_number,
          section: fac.section,
          status: 'active'
        }
      });
      authorityMap[fac.name] = updated;
    } else {
      const created = await prisma.authority.create({
        data: {
          name: fac.name,
          responsibilities: fac.responsibilities,
          designation: fac.designation,
          department: fac.department,
          contact_number: fac.contact_number,
          section: fac.section,
          status: 'active'
        }
      });
      authorityMap[fac.name] = created;
    }
  }

  console.log(`✓ Synchronized ${OFFICIAL_MITS_FACULTY.length} MITS faculty authorities in PostgreSQL.`);

  // 2. Seed Official Categories and Route to Responsible Authorities
  const categoryMap = {};

  const categoryRouting = {
    'Academic Issues': 'Dr. Manjaree Pandit',
    'Examination and Results': 'Dr. P.K. Singhal',
    'Infrastructure and Maintenance': 'Dr. Rajeev Kansal',
    'Hostel Facilities': 'Shri. Sanjay Bhargava',
    'Library Services': 'Dr. P.K. Singhal',
    'IT and Technical Support': 'Prof. Prabhakar Sharma',
    'Administrative Issues': 'Dr. Pratesh Jayaswal',
    'Faculty-Related Grievances': 'Dr. R.S. Jadon',
    'Other Student Concerns': 'Prof. Archana Tiwari'
  };

  for (const cat of OFFICIAL_CATEGORIES) {
    const routedAuthorityName = categoryRouting[cat.name];
    const routedAuth = routedAuthorityName ? authorityMap[routedAuthorityName] : null;

    const existingCat = await prisma.category.findUnique({
      where: { name: cat.name }
    });

    if (existingCat) {
      const updatedCat = await prisma.category.update({
        where: { id: existingCat.id },
        data: {
          description: cat.description,
          sla_hours: cat.sla_hours,
          section: cat.section,
          authority_id: routedAuth?.id || existingCat.authority_id
        }
      });
      categoryMap[cat.name] = updatedCat;
    } else {
      const createdCat = await prisma.category.create({
        data: {
          name: cat.name,
          description: cat.description,
          sla_hours: cat.sla_hours,
          section: cat.section,
          authority_id: routedAuth?.id || null
        }
      });
      categoryMap[cat.name] = createdCat;
    }
  }

  console.log(`✓ Synchronized all ${OFFICIAL_CATEGORIES.length} official categories with designated authorities.`);

  // 3. Ensure a Verified Demo Submitter exists
  let demoAuthor = await prisma.user.findFirst({
    where: { role: 'student' }
  });

  if (!demoAuthor) {
    demoAuthor = await prisma.user.create({
      data: {
        name: 'Aarav Sharma',
        email: 'aarav.btmc25@mitsgwl.ac.in',
        password_hash: '$2a$10$v0v7v4YfL.5qM74VjP4uEO7K46k9Yl.XFqg0lX9qB5d6y2t8uP6jK',
        role: 'student',
        department: 'Mathematics and Computing',
        enrollment_no: '0901MC251001',
        status: 'active'
      }
    });
  }

  // 4. Sample Demonstration Grievance Dataset across all 9 categories
  // All marked with is_demo: true and dataset_tag: 'mits_dataset_v1'
  const SAMPLE_GRIEVANCES = [
    {
      ticket_number: 'GRV-DEMO-001',
      title: 'Discrepancy in Continuous Assessment marks for Advanced Algorithms Lab',
      description: 'The uploaded lab marksheet on the MITS Portal reflects 12/20 for Lab Assignment 4, whereas the verified evaluation sheet signed by the instructor on 18th October shows 19/20.',
      categoryName: 'Academic Issues',
      priority: 'Medium',
      status: 'In progress',
      location: 'MAC Department Lab 3',
      is_anonymous: false
    },
    {
      ticket_number: 'GRV-DEMO-002',
      title: 'Mid-Semester Exam schedule clash between Data Structures and Discrete Math',
      description: 'According to the revised notification dated 24th October, both Data Structures (CS301) and Discrete Mathematics (MC302) are scheduled for Slot 2 (2:00 PM to 4:00 PM) on Monday.',
      categoryName: 'Examination and Results',
      priority: 'High',
      status: 'Under review',
      location: 'Exam Control Division',
      is_anonymous: false
    },
    {
      ticket_number: 'GRV-DEMO-003',
      title: 'Ceiling projector lamp failure in Seminar Hall Block B',
      description: 'The EPSON ceiling projector in Seminar Hall B flickers intermittently and shuts off within 5 minutes of powering on. Required for departmental symposium and project presentations.',
      categoryName: 'Infrastructure and Maintenance',
      priority: 'High',
      status: 'Assigned',
      location: 'Block B Seminar Hall',
      is_anonymous: false
    },
    {
      ticket_number: 'GRV-DEMO-004',
      title: 'Water cooler purification filter replacement required on BH-1 2nd Floor',
      description: 'The drinking water cooler near Room 218 in Boys Hostel 1 is dispensing water with high turbidity and metallic taste. The filter replacement indicator light has turned solid red.',
      categoryName: 'Hostel Facilities',
      priority: 'High',
      status: 'Assigned',
      location: 'Boys Hostel 1 (BH-1) 2nd Floor',
      is_anonymous: false
    },
    {
      ticket_number: 'GRV-DEMO-005',
      title: 'Unable to access IEEE Xplore digital library subscription from campus subnet',
      description: 'When accessing ieeexplore.ieee.org from the campus LAN in Central Library, the portal shows "Institutional Access Not Recognized". Kindly verify institutional IP range whitelist.',
      categoryName: 'Library Services',
      priority: 'Medium',
      status: 'Resolved',
      location: 'Central Library E-Resource Section',
      is_anonymous: false
    },
    {
      ticket_number: 'GRV-DEMO-006',
      title: 'Wi-Fi access point reboot loop on 3rd Floor Academic Complex',
      description: 'The Cisco Wi-Fi AP installed in the corridor outside Room 304 is constantly rebooting every 2 minutes. Students cannot download course lecture slides or submit assignments.',
      categoryName: 'IT and Technical Support',
      priority: 'Medium',
      status: 'In progress',
      location: 'Academic Complex 3rd Floor Corridor',
      is_anonymous: true
    },
    {
      ticket_number: 'GRV-DEMO-007',
      title: 'Delay in issuing fee payment verification clearance for scholarship portal',
      description: 'Fee payment receipt for 3rd semester was submitted on 12th October, but the clearance status on the national scholarship portal (NSP) has not been validated by the accounts section.',
      categoryName: 'Administrative Issues',
      priority: 'High',
      status: 'Under review',
      location: 'Accounts Section Administrative Block',
      is_anonymous: false
    },
    {
      ticket_number: 'GRV-DEMO-008',
      title: 'Request for Proctorial counseling session regarding hostel curfew guidelines',
      description: 'Clarification required regarding late laboratory passes for research students working in the AI & Robotics lab after 8:30 PM under faculty supervision.',
      categoryName: 'Faculty-Related Grievances',
      priority: 'Low',
      status: 'Submitted',
      location: 'Proctorial Office',
      is_anonymous: false
    },
    {
      ticket_number: 'GRV-DEMO-009',
      title: 'First-aid kit replenishment in Mechanical Engineering Workshop',
      description: 'The emergency medical kit in the Machine Shop section of the central workshop requires urgent restocking of antiseptic solution, burn ointment, and sterile gauze bandages.',
      categoryName: 'Other Student Concerns',
      priority: 'Medium',
      status: 'Closed',
      location: 'Central Workshop Machine Shop',
      is_anonymous: false
    }
  ];

  let importedCount = 0;

  for (const item of SAMPLE_GRIEVANCES) {
    const existing = await prisma.grievance.findUnique({
      where: { ticket_number: item.ticket_number }
    });

    if (existing) {
      continue; // Prevent duplicates
    }

    const cat = categoryMap[item.categoryName];
    if (!cat) continue;

    const assignedAuthId = cat.authority_id || null;

    const createdGrievance = await prisma.grievance.create({
      data: {
        ticket_number: item.ticket_number,
        title: item.title,
        description: item.description,
        category_id: cat.id,
        priority: item.priority,
        status: item.status,
        location: item.location,
        is_anonymous: item.is_anonymous,
        is_demo: true,
        dataset_tag: 'mits_dataset_v1',
        tracking_token: `TRK-${Math.floor(1000 + Math.random() * 9000)}-MITS`,
        sla_hours: cat.sla_hours,
        submitted_by: demoAuthor.id,
        assigned_authority_id: assignedAuthId,
        resolved_at: (item.status === 'Resolved' || item.status === 'Closed') ? new Date() : null
      }
    });

    // Add initial status history log
    await prisma.statusHistory.create({
      data: {
        grievance_id: createdGrievance.id,
        previous_status: null,
        new_status: 'Submitted',
        updated_by: demoAuthor.id,
        remarks: 'Sample institutional ticket imported from verified demonstration dataset.'
      }
    });

    if (item.status !== 'Submitted') {
      await prisma.statusHistory.create({
        data: {
          grievance_id: createdGrievance.id,
          previous_status: 'Submitted',
          new_status: item.status,
          updated_by: demoAuthor.id,
          remarks: `Lifecycle advanced to ${item.status} by departmental authority.`
        }
      });
    }

    importedCount++;
  }

  console.log(`✓ Imported ${importedCount} realistic sample grievances across 9 institutional categories (is_demo: true).`);
  console.log('--- Seeding Completed Successfully ---');
}

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('seedAuthoritiesAndDataset.js')) {
  seedAuthoritiesAndDataset()
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
