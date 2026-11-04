// Demo data provider for MITS GMS frontend
import { SEED_USERS, SEED_COMPLAINTS, DEPARTMENTS, CATEGORIES, PRIORITIES } from './seedData';

export { SEED_USERS, SEED_COMPLAINTS, DEPARTMENTS, CATEGORIES, PRIORITIES };

export const DEMO_STATS = {
  totalGrievances: 124,
  pendingGrievances: 18,
  inProgressGrievances: 26,
  resolvedGrievances: 80,
  registeredUsers: 1420,
  averageResolutionHours: 32,
  resolutionRate: '87.4%'
};

export const DEMO_ACTIVITIES = [
  {
    id: 'act_1',
    title: 'Grievance Assigned to Estate Office',
    description: 'Complaint regarding water dispenser in Block B has been assigned to Er. R.K. Saxena.',
    ticketId: 'GMS-2026-103',
    time: '25 mins ago'
  },
  {
    id: 'act_2',
    title: 'Investigation Initiated',
    description: 'Hostel Chief Warden visited BH-1 dining hall to inspect dinner food quality standards.',
    ticketId: 'GMS-2026-101',
    time: '1 hour ago'
  },
  {
    id: 'act_3',
    title: 'Grievance Resolved & Verified',
    description: 'Library high-speed WiFi node repaired and certified by IT Centre.',
    ticketId: 'GMS-2026-104',
    time: '3 hours ago'
  },
  {
    id: 'act_4',
    title: 'New Grievance Registered',
    description: 'Air conditioning malfunction in MCA Computing Lab 3 reported.',
    ticketId: 'GMS-2026-105',
    time: '5 hours ago'
  }
];

export const DEMO_DEPARTMENT_STATS = [
  { department: 'Hostel Administration', total: 38, resolved: 31, pending: 7 },
  { department: 'Campus Infrastructure & Estate', total: 42, resolved: 33, pending: 9 },
  { department: 'Mathematics and Computing', total: 16, resolved: 14, pending: 2 },
  { department: 'Computer Science & Engineering', total: 14, resolved: 12, pending: 2 },
  { department: 'Examination Cell', total: 14, resolved: 10, pending: 4 }
];

