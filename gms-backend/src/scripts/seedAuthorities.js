/**
 * seedAuthorities.js
 * Populates the MITS Responsible Authorities Directory in PostgreSQL.
 * Source of truth: Official MITS Institutional Authorities (34 entries, with 1 duplicate deduplicated).
 * Confidential contact numbers are securely persisted in PostgreSQL.
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const MITS_AUTHORITIES = [
  {
    name: "Prof. Archana Tiwari",
    designation: "Chairperson",
    responsibilities: "Women Guidance, Grievance & Redressal Cell",
    department: "Women Grievance Cell",
    contact_number: "7748884150",
    section: "college",
    categoryHint: "Women Grievance & Guidance"
  },
  {
    name: "Dr. Laxmi Srivastava",
    designation: "Coordinator",
    responsibilities: "Coordinator TEQIP III",
    department: "TEQIP Cell",
    contact_number: "0751-2409363",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Dr. Manjaree Pandit",
    designation: "Incharge",
    responsibilities: "Academic Development Cell & NBA Coordinator",
    department: "Academic Development Cell",
    contact_number: "0751-2409380",
    section: "academic",
    categoryHint: "Academic Issues"
  },
  {
    name: "Dr. R.S. Jadon",
    designation: "Proctor",
    responsibilities: "Chief Proctor, Campus Discipline, Anti-Ragging",
    department: "Proctorial Board",
    contact_number: "9425122675",
    section: "college",
    categoryHint: "Campus Discipline & Ragging"
  },
  {
    name: "Dr. P.K. Singhal",
    designation: "Controller Examination",
    responsibilities: "Controller Examination, Chairman Central Library, Chairman Counselling Cell",
    department: "Examination & Central Library",
    contact_number: "0751-2409377",
    section: "academic",
    categoryHint: "Examination & Evaluation"
  },
  {
    name: "Dr. R.K. Gupta",
    designation: "Incharge",
    responsibilities: "Incharge International Affairs",
    department: "International Affairs",
    contact_number: "0751-2409391",
    section: "college",
    categoryHint: null
  },
  {
    name: "Dr. S.K. Jain",
    designation: "Co-Coordinator",
    responsibilities: "Co-Coordinator Nodal Centre (RGPV)",
    department: "Nodal Centre (RGPV)",
    contact_number: "9893367731",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Dr. Abhay Mishra",
    designation: "Chairman",
    responsibilities: "Chairman, Central Purchase Committee",
    department: "Central Purchase Committee",
    contact_number: "9425338149",
    section: "administrative",
    categoryHint: null
  },
  {
    name: "Dr. Rajeev Kansal",
    designation: "Incharge",
    responsibilities: "Incharge Building Committee, Incharge Student Development Cell",
    department: "Building Committee & Student Development",
    contact_number: "9165028102",
    section: "college",
    categoryHint: "Building & Campus Infrastructure"
  },
  {
    name: "Dr. Sulochana Wadhwani",
    designation: "Dy. Controller Examination",
    responsibilities: "Dy. Controller Examination, Outcome Based Education (OBE) Manager",
    department: "Examination Cell",
    contact_number: "9425112199",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Dr. Pratesh Jayaswal",
    designation: "Incharge Registrar",
    responsibilities: "Incharge Registrar, IQAC Coordinator, Academic Coordinator TEQIP III, QIP Coordinator & NDF Coordinator",
    department: "Registrar Office",
    contact_number: "0751-2409231",
    section: "administrative",
    categoryHint: "Administrative & Fee Disputes"
  },
  {
    name: "Dr. C.S. Malvi",
    designation: "Incharge",
    responsibilities: "Incharge Innovation Cell",
    department: "Innovation Cell",
    contact_number: "9993207600",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Dr. Manoj Gaur",
    designation: "Incharge",
    responsibilities: "Incharge Remedial Classes, Incharge Institute Industry Interaction Cell (IIIC)",
    department: "IIIC & Remedial Cell",
    contact_number: "9425020318",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Dr. Manish Sagar",
    designation: "Incharge",
    responsibilities: "Incharge NSS, Incharge SC/ST Cell",
    department: "NSS & SC/ST Cell",
    contact_number: "9425338833",
    section: "college",
    categoryHint: "SC/ST Cell & Social Welfare"
  },
  {
    name: "Dr. Akhilesh Tiwari",
    designation: "Incharge",
    responsibilities: "Incharge Startup Cell",
    department: "Startup Cell",
    contact_number: "9407204907",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Dr. Rekha Gupta",
    designation: "Incharge",
    responsibilities: "Incharge Girls Counselling / Grievance Cell",
    department: "Girls Counselling Cell",
    contact_number: "0751-2409369",
    section: "college",
    categoryHint: null
  },
  {
    name: "Dr. Manish Dixit",
    designation: "Cultural Coordinator",
    responsibilities: "Cultural Coordinator and Incharge Media Cell",
    department: "Cultural & Media Cell",
    contact_number: "9425117866",
    section: "college",
    categoryHint: null
  },
  {
    name: "Prof. Prabhakar Sharma",
    designation: "Incharge",
    responsibilities: "Incharge Central Computer Centre, Procurement Coordinator TEQIP III, Incharge EDC, Incharge CCTV surveillance system and Incharge Value Aided Courses",
    department: "Central Computer Centre & IT Services",
    contact_number: "9425339330",
    section: "college",
    categoryHint: "Central Computer Centre & IT"
  },
  {
    name: "Dr. Anjali S. Patil",
    designation: "Public Relations Officer",
    responsibilities: "Public Relations Officer",
    department: "Public Relations Office",
    contact_number: "9301118909",
    section: "administrative",
    categoryHint: null
  },
  {
    name: "Dr. Hari Mohan Dubey",
    designation: "Incharge",
    responsibilities: "Incharge GIAN",
    department: "GIAN Cell",
    contact_number: "9425776060",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Prof. Puneet Johari",
    designation: "Asst. Controller Examination",
    responsibilities: "Asst. Controller Examination",
    department: "Examination Cell",
    contact_number: "9425618829",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Dr. Anjula Gaur",
    designation: "Incharge",
    responsibilities: "Incharge Medical Services, Campus Dispensary & Healthcare",
    department: "Medical Services & Health Centre",
    contact_number: "9425187478",
    section: "college",
    categoryHint: "Campus Medical & Health Services"
  },
  {
    name: "Dr. Sunita Sharma",
    designation: "Associate Coordinator",
    responsibilities: "Associate Coordinator SWAYAM",
    department: "SWAYAM Cell",
    contact_number: "9826355314",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Dr. Vijay Bhuria",
    designation: "Asst. Controller Examination",
    responsibilities: "Asst. Controller Examination",
    department: "Examination Cell",
    contact_number: "9826513468",
    section: "academic",
    categoryHint: null
  },
  // Note: Entry 25 (Prof. Puneet Johari) is deduplicated as instructed
  {
    name: "Prof. Kuldeep Swarnkar",
    designation: "Incharge",
    responsibilities: "Incharge e-News Letter",
    department: "Publications & e-News Letter",
    contact_number: "9827569098",
    section: "college",
    categoryHint: null
  },
  {
    name: "Prof. Vedansh Chaturvedi",
    designation: "Incharge",
    responsibilities: "Incharge Workshop, Lab Machining & Mechanical Fabrication",
    department: "Central Workshop",
    contact_number: "8989273208",
    section: "college",
    categoryHint: "Workshop & Lab Maintenance"
  },
  {
    name: "Prof. Praveen Bansal",
    designation: "SPOC / Coordinator",
    responsibilities: "SPOC NPTEL/ MOOC/ GATE Cordinator & Twinning Coordinator TEQIP III",
    department: "NPTEL/MOOC/GATE Cell",
    contact_number: "9827577549",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Prof. Jamvant Kumre",
    designation: "Incharge",
    responsibilities: "Incharge PMSSS Scheme of AICTE",
    department: "PMSSS Cell",
    contact_number: "8770742641",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Prof. Vishal Chaudhary",
    designation: "Associate Coordinator",
    responsibilities: "Associate Coordinator GATE",
    department: "GATE Cell",
    contact_number: "9926245805",
    section: "academic",
    categoryHint: null
  },
  {
    name: "Prof. Rajni Ranjan Singh Makwana",
    designation: "Incharge",
    responsibilities: "Incharge IMS/MIS & Web Manager, ERP Systems, Student Portal",
    department: "IMS/MIS & Web Cell",
    contact_number: "9098054320",
    section: "administrative",
    categoryHint: "Student Portal & IMS/MIS"
  },
  {
    name: "Er. Shailendra Singh Bhadauria",
    designation: "Administrative Officer",
    responsibilities: "General Campus Administration, Facilities & Staff Logistics",
    department: "Administrative Office",
    contact_number: "9827006001",
    section: "administrative",
    categoryHint: null
  },
  {
    name: "Shri. Sanjay Bhargava",
    designation: "Hostel Manager",
    responsibilities: "Hostel Maintenance, Mess Hygiene, Room Allocation, Resident Welfare",
    department: "Hostel & Mess Administration",
    contact_number: "9425725155",
    section: "hostel",
    categoryHint: "Hostel Facilities & Maintenance"
  },
  {
    name: "Mr. Vikram Singh Rajput",
    designation: "Training & Placement Officer",
    responsibilities: "Training & Placement Officer & Incharge Finishing School",
    department: "Training & Placement Cell",
    contact_number: "8516057887",
    section: "college",
    categoryHint: "Training & Placement Cell"
  }
];

async function seed() {
  console.log("Seeding MITS Responsible Authorities Directory...");

  for (const auth of MITS_AUTHORITIES) {
    const existing = await prisma.authority.findFirst({
      where: {
        name: auth.name,
        department: auth.department
      }
    });

    let authorityRecord;
    if (existing) {
      authorityRecord = await prisma.authority.update({
        where: { id: existing.id },
        data: {
          designation: auth.designation,
          responsibilities: auth.responsibilities,
          contact_number: auth.contact_number,
          section: auth.section,
          status: "active"
        }
      });
      console.log(`Updated: ${auth.name} (${auth.department})`);
    } else {
      authorityRecord = await prisma.authority.create({
        data: {
          name: auth.name,
          designation: auth.designation,
          responsibilities: auth.responsibilities,
          department: auth.department,
          contact_number: auth.contact_number,
          section: auth.section,
          status: "active"
        }
      });
      console.log(`Created: ${auth.name} (${auth.department})`);
    }

    // Auto-map category if categoryHint is specified and exists
    if (auth.categoryHint) {
      const cat = await prisma.category.findFirst({
        where: { name: { contains: auth.categoryHint, mode: 'insensitive' } }
      });
      if (cat) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { authority_id: authorityRecord.id }
        });
        console.log(`  -> Mapped Category "${cat.name}" to Authority "${auth.name}"`);
      } else {
        // Create the category if it doesn't exist
        const newCat = await prisma.category.create({
          data: {
            name: auth.categoryHint,
            description: `Grievances handled by ${auth.name} (${auth.designation})`,
            section: auth.section,
            sla_hours: 48,
            authority_id: authorityRecord.id
          }
        });
        console.log(`  -> Created Category "${newCat.name}" mapped to "${auth.name}"`);
      }
    }
  }

  // Record an audit log for seeding
  await prisma.auditLog.create({
    data: {
      action: "INITIAL_DIRECTORY_SEED",
      entity_type: "Authority",
      details: {
        count: MITS_AUTHORITIES.length,
        notes: "MITS Official 34 Authorities Directory seeded (with 1 duplicate deduplicated)."
      }
    }
  });

  console.log(`Finished seeding ${MITS_AUTHORITIES.length} MITS authorities.`);
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
