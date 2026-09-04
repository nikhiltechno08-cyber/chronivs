import { z } from 'zod';

export const detailsFormSchema = z.object({
  senderName: z.string().min(1, 'Please enter your name'),
  receiverName: z.string().min(1, 'Please enter their name'),
  specialDate: z.string().optional(),
  customMessage: z.string().min(4, 'Share a little more — at least a few words'),
});

export type DetailsFormValues = z.infer<typeof detailsFormSchema>;
