import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

async function seedStudentDemoAccount() {
  const email = '25mc1st139@mitsgwl.ac.in';
  const plainPassword = 'S@just';
  const role = 'student';
  const name = 'MITS Student Demo';
  const department = 'Mathematics and Computing';
  const enrollmentNo = '25MC1ST139';

  console.log(`Seeding required student demo account: ${email}`);

  const password_hash = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password_hash,
      role: 'student',
      status: 'active',
      department,
      enrollment_no: enrollmentNo
    },
    create: {
      email,
      name,
      password_hash,
      role: 'student',
      status: 'active',
      department,
      enrollment_no: enrollmentNo
    }
  });

  console.log(`✓ Student demo account verified successfully in PostgreSQL (ID: ${user.id}, Email: ${user.email})`);
}

seedStudentDemoAccount()
  .catch((err) => {
    console.error('Error seeding student demo account:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
