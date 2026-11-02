import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address').refine(val => {
      const clean = val.trim().toLowerCase();
      return clean.endsWith('@mitsgwl.ac.in') || clean.endsWith('@mitsgwalior.in');
    }, 'Registration requires an official MITS email ending in @mitsgwl.ac.in or @mitsgwalior.in'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().default('Password@123'),
    department: z.string().optional().default('General'),
    enrollment_no: z.string().optional().default(''),
    enrollmentNo: z.string().optional(),
    hostel: z.string().optional(),
    room_no: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().optional()
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    department: z.string().optional(),
    enrollment_no: z.string().optional(),
    hostel: z.string().optional(),
    room_no: z.string().optional(),
    avatar: z.string().url('Invalid avatar URL').optional().nullable(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional()
  })
});
