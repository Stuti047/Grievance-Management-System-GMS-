import { z } from 'zod';

export const addCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Grievance ID is required')
  }),
  body: z.object({
    body: z.string().optional(),
    comment_text: z.string().optional(),
    is_anonymous: z.boolean().optional().default(false),
    is_internal: z.boolean().optional().default(false)
  }).refine(data => (data.body && data.body.trim().length > 0) || (data.comment_text && data.comment_text.trim().length > 0), {
    message: 'Comment text cannot be empty'
  })
});
