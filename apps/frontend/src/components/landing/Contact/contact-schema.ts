import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(80, 'Name must be 80 characters or fewer.'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(120, 'Email must be 120 characters or fewer.'),
  subject: z
    .string()
    .trim()
    .min(3, 'Please enter a subject.')
    .max(120, 'Subject must be 120 characters or fewer.'),
  message: z
    .string()
    .trim()
    .min(10, 'Please enter at least 10 characters.')
    .max(2000, 'Message must be 2000 characters or fewer.'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
