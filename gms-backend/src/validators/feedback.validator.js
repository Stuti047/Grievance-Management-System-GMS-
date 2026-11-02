import { z } from 'zod';

export const submitFeedbackSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Grievance ID is required')
  }),
  body: z.object({
    resolved_ok: z.boolean().optional().default(true),
    rating: z.number().int().min(1).max(5).optional().default(5),
    comment: z.string().optional().default(''),
    feedback_text: z.string().optional()
  })
});
