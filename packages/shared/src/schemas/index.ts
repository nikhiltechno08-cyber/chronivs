import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const experienceStatusSchema = z.enum(['draft', 'published', 'archived']);

export const templateCategorySchema = z.enum([
  'birthday',
  'proposal',
  'anniversary',
  'celebration',
  'custom',
]);

export type PaginationInput = z.infer<typeof paginationSchema>;
export type ExperienceStatusInput = z.infer<typeof experienceStatusSchema>;
export type TemplateCategoryInput = z.infer<typeof templateCategorySchema>;
