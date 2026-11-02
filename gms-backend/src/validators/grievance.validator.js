import { z } from 'zod';

export const createGrievanceSchema = z.object({
  body: z.object({
    title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be under 200 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    category_id: z.string().min(1, 'Category is required'),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional().default('Medium'),
    location: z.string().optional().default('MITS Campus'),
    is_anonymous: z.boolean().optional().default(false),
    evidence_urls: z.array(z.string()).optional().default([])
  })
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Grievance ID is required')
  }),
  body: z.object({
    status: z.string().min(1, 'New status is required'),
    note: z.string().optional().default(''),
    remarks: z.string().optional()
  })
});

export const reopenSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Grievance ID is required')
  }),
  body: z.object({
    note: z.string().optional().default('')
  })
});

export const flagSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Grievance ID is required')
  }),
  body: z.object({
    reason: z.string().min(5, 'Reason must be at least 5 characters')
  })
});
