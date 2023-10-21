import { z } from 'zod';

export const postSchema = z.object({
  body: z.object({
    post: z.string().default(''),
    bgColor: z.string().default(''),
    privacy: z.string().default(''),
    feelings: z.string().default(''),
    gifUrl: z.string().default(''),
    profilePicture: z.string().default(''),
    imgVersion: z.string().default(''),
    imageId: z.string().default(''),
    image: z.string().default('')
  }),
  params: z
    .object({
      postId: z.string().default('')
    })
    .optional()
});
export const postWithImageSchema = z.object({
  body: z.object({
    image: z
      .string({
        required_error: 'Image is a required field'
      })
      .min(1, 'Image is a required field'),
    bgColor: z.string().default(''),
    privacy: z.string().default(''),
    feelings: z.string().default(''),
    gifUrl: z.string().default(''),
    profilePicture: z.string().default(''),
    imgVersion: z.string().default(''),
    imageId: z.string().default(''),
    post: z.string().default('')
  }),
  params: z
    .object({
      postId: z.string().default('')
    })
    .optional()
});

export type PostInput = z.infer<typeof postSchema>['body'];
export type PostWithImageInput = z.infer<typeof postWithImageSchema>['body'];
