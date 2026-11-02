import { z } from 'zod';

export const createAuthoritySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address').refine(val => {
      return val.trim().toLowerCase().endsWith('@mitsgwalior.in');
    }, 'Authority accounts require an official @mitsgwalior.in email domain'),
    password: z.string().min(6).optional().default('Authority@123'),
    department: z.string().optional(),
    sub_authority_id: z.string().optional(),
    designation: z.string().optional().default('Authority Officer'),
    section: z.enum(['hostel', 'mess', 'college']).optional().default('college')
  })
});

export const setUserStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required')
  }),
  body: z.object({
    status: z.enum(['active', 'warned', 'blocked']),
    reason: z.string().optional()
  })
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    description: z.string().optional(),
    section: z.enum(['hostel', 'mess', 'college']).optional().default('college'),
    sla_hours: z.number().int().positive().optional().default(48),
    authority_id: z.string().optional()
  })
});
