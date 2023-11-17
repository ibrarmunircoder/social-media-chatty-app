import { z } from 'zod';

export const addImageSchema = z.object({
  body: z.object({
    image: z.string().min(1, 'Image is required!')
  })
});

export type AddImageInput = z.infer<typeof addImageSchema>['body'];
