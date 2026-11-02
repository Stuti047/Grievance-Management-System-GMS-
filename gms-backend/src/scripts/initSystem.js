import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

async function main() {
  console.log('--- Initializing GMS Institutional Setup in PostgreSQL ---');

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
  const authorityPasswordHash = await bcrypt.hash('Authority@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // 1. Create or ensure Authorities & Admin users
  const authoritiesData = [
    {
      email: 'warden.bh1@mitsgwalior.in',
      name: 'Dr. S. K. Sharma',
      department: 'Hostel Administration (Boys)',
      designation: 'Hostel Chief Warden (BH-1 & BH-2)',
      section: 'hostel'
    },
    {
      email: 'warden.gh1@mitsgwalior.in',
      name: 'Dr. Sunita Bansal',
      department: 'Hostel Administration (Girls)',
      designation: 'Chief Warden (GH-1 & GH-2)',
      section: 'hostel'
    },
    {
      email: 'mess.committee@mitsgwalior.in',
      name: 'Prof. Rajesh Kumar',
      department: 'Mess & Catering Committee',
      designation: 'Convener, Mess Committee',
      section: 'mess'
    },
    {
      email: 'hod.mac@mitsgwalior.in',
      name: 'Prof. Monika Dandotiya',
      department: 'Mathematics and Computing',
      designation: 'Faculty Advisor & Associate Professor',
      section: 'college'
    },
    {
      email: 'estate.officer@mitsgwalior.in',
      name: 'Er. R. K. Saxena',
      department: 'Campus Infrastructure & Estate',
      designation: 'Superintending Engineer',
      section: 'college'
    },
    {
      email: 'coe.exam@mitsgwalior.in',
      name: 'Dr. P. K. Singhal',
      department: 'Examination Cell',
      designation: 'Controller of Examination',
      section: 'college'
    },
    {
      email: 'sanitation.officer@mitsgwalior.in',
      name: 'Shri Manoj Sharma',
      department: 'Sanitation & Grounds',
      designation: 'Sanitary Inspector',
      section: 'college'
    },
    {
      email: 'head.it@mitsgwalior.in',
      name: 'Er. Vikas Sejwar',
      department: 'IT & Network Operations',
      designation: 'System Administrator',
      section: 'college'
    },
    {
      email: 'dean.sw@mitsgwalior.in',
      name: 'Prof. R. S. Jadon',
      department: 'Student Welfare & Discipline',
      designation: 'Dean of Student Welfare',
      section: 'college'
    }
  ];

  const authorityMap = {};

  for (const auth of authoritiesData) {
    const user = await prisma.user.upsert({
      where: { email: auth.email },
      update: {
        name: auth.name,
        role: 'authority',
        department: auth.department,
        status: 'active'
      },
      create: {
        email: auth.email,
        name: auth.name,
        password_hash: authorityPasswordHash,
        role: 'authority',
        department: auth.department,
        status: 'active'
      }
    });

    const authority = await prisma.authority.upsert({
      where: { user_id: user.id },
      update: {
        department: auth.department,
        designation: auth.designation,
        section: auth.section
      },
      create: {
        user_id: user.id,
        department: auth.department,
        designation: auth.designation,
        section: auth.section
      }
    });

    authorityMap[auth.department] = authority.id;
  }

  // 2. Create Admin user
  await prisma.user.upsert({
    where: { email: 'proctor.admin@mitsgwalior.in' },
    update: {
      name: 'Prof. V. K. Gupta',
      role: 'admin',
      department: 'Central Proctorial Board',
      status: 'active'
    },
    create: {
      email: 'proctor.admin@mitsgwalior.in',
      name: 'Prof. V. K. Gupta',
      password_hash: adminPasswordHash,
      role: 'admin',
      department: 'Central Proctorial Board',
      status: 'active'
    }
  });

  // 3. Create initial verified Student accounts
  const studentsData = [
    {
      email: 'puneet.btmc25@mitsgwl.ac.in',
      name: 'Puneet Chaudhary',
      enrollment_no: 'BTMC25O1109',
      department: 'Mathematics and Computing',
      hostel: 'Boys Hostel 1 (BH-1)',
      room_no: '204'
    },
    {
      email: 'stuti.btmc25@mitsgwl.ac.in',
      name: 'Stuti Jain',
      enrollment_no: 'BTMC25O1139',
      department: 'Mathematics and Computing',
      hostel: 'Girls Hostel 1 (GH-1)',
      room_no: '112'
    },
    {
      email: 'rahul.cs24@mitsgwl.ac.in',
      name: 'Rahul Verma',
      enrollment_no: '0901CS241088',
      department: 'Computer Science & Engineering',
      hostel: 'Boys Hostel 2 (BH-2)',
      room_no: '310'
    }
  ];

  for (const stu of studentsData) {
    await prisma.user.upsert({
      where: { email: stu.email },
      update: {
        name: stu.name,
        enrollment_no: stu.enrollment_no,
        department: stu.department,
        hostel: stu.hostel,
        room_no: stu.room_no,
        status: 'active'
      },
      create: {
        email: stu.email,
        name: stu.name,
        password_hash: defaultPasswordHash,
        role: 'student',
        department: stu.department,
        enrollment_no: stu.enrollment_no,
        hostel: stu.hostel,
        room_no: stu.room_no,
        status: 'active'
      }
    });
  }

  // 4. Create Institutional Categories with mapped Authorities and SLA
  const categoriesData = [
    {
      name: 'Hostel Facilities',
      section: 'hostel',
      description: 'Hostel room amenities, water supply, geysers, electricity, and room maintenance.',
      sla_hours: 24,
      department: 'Hostel Administration (Boys)'
    },
    {
      name: 'Hostel Mess (Food & Hygiene)',
      section: 'mess',
      description: 'Dining hall food quality, hygiene violations, undercooked meals, and catering issues.',
      sla_hours: 12,
      department: 'Mess & Catering Committee'
    },
    {
      name: 'Canteen & Food Services',
      section: 'mess',
      description: 'Campus cafeteria, food stall pricing, cleanliness, and vendor standards.',
      sla_hours: 24,
      department: 'Mess & Catering Committee'
    },
    {
      name: 'Academic & Faculty',
      section: 'college',
      description: 'Lectures, classroom projectors, smart boards, course coverage, and faculty guidance.',
      sla_hours: 48,
      department: 'Mathematics and Computing'
    },
    {
      name: 'Campus Infrastructure',
      section: 'college',
      description: 'Streetlights, road pathways, academic building repairs, washrooms, and lifts.',
      sla_hours: 36,
      department: 'Campus Infrastructure & Estate'
    },
    {
      name: 'Examination & Grading',
      section: 'college',
      description: 'Mid-Sem and End-Sem evaluation discrepancies, hall tickets, AMS portal grades.',
      sla_hours: 72,
      department: 'Examination Cell'
    },
    {
      name: 'Sanitation & Hygiene',
      section: 'college',
      description: 'Water coolers, washroom sanitation, waste bins, campus drainage, and cleanliness.',
      sla_hours: 12,
      department: 'Sanitation & Grounds'
    },
    {
      name: 'IT & Network',
      section: 'college',
      description: 'Hostel and campus Wi-Fi access points, Moodle LMS portal, lab systems, and network.',
      sla_hours: 24,
      department: 'IT & Network Operations'
    },
    {
      name: 'Student Welfare & Discipline',
      section: 'college',
      description: 'Anti-ragging, safety, harassment, scholarship documentation, and student counseling.',
      sla_hours: 24,
      department: 'Student Welfare & Discipline'
    },
    {
      name: 'Administration (Certificates, ID, Fees)',
      section: 'college',
      description: 'Bonafide certificates, fee receipts, student identity cards, and library cards.',
      sla_hours: 48,
      department: 'Student Welfare & Discipline'
    },
    {
      name: 'Events & Logistics',
      section: 'college',
      description: 'College fests, auditorium booking, sports ground equipment, and club logistics.',
      sla_hours: 36,
      department: 'Student Welfare & Discipline'
    },
    {
      name: 'Other / General Grievance',
      section: 'college',
      description: 'General campus grievances not falling under specific listed departments.',
      sla_hours: 48,
      department: 'Student Welfare & Discipline'
    }
  ];

  for (const cat of categoriesData) {
    const authorityId = authorityMap[cat.department] || null;
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        section: cat.section,
        description: cat.description,
        sla_hours: cat.sla_hours,
        authority_id: authorityId
      },
      create: {
        name: cat.name,
        section: cat.section,
        description: cat.description,
        sla_hours: cat.sla_hours,
        authority_id: authorityId
      }
    });
  }

  console.log(' Institutional accounts & categories initialized successfully in PostgreSQL.');
}

main()
  .catch((e) => {
    console.error('Initialization error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
