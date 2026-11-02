import prisma from '../config/db.js';

/**
 * Generate sequential ticket number in format GRV-YYYY-XXXXX
 */
export async function generateTicketNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.grievance.count();
  const sequentialNum = String(count + 101).padStart(5, '0');
  let code = `GRV-${year}-${sequentialNum}`;

  // Ensure uniqueness
  let existing = await prisma.grievance.findUnique({ where: { ticket_number: code } });
  let counter = count + 102;
  while (existing) {
    code = `GRV-${year}-${String(counter).padStart(5, '0')}`;
    existing = await prisma.grievance.findUnique({ where: { ticket_number: code } });
    counter++;
  }

  return code;
}

/**
 * Generate anonymous tracking token in format TRK-XXXX-MITS
 */
export async function generateTrackingToken() {
  let token = '';
  let exists = true;

  while (exists) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    token = `TRK-${randomNum}-MITS`;
    const found = await prisma.grievance.findUnique({ where: { tracking_token: token } });
    if (!found) {
      exists = false;
    }
  }

  return token;
}
