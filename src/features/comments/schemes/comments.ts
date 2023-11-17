import { z } from 'zod';

export const addCommentSchema = z.object({
  body: z.object({
    userTo: z
      .string({
        required_error: 'user is a required field'
      })
      .min(1, 'user is a required field'),
    postId: z
      .string({
        required_error: 'post id is a required field'
      })
      .min(1, 'post id is a required field'),
    comment: z
      .string({
        required_error: 'Comment is a required field'
      })
      .min(1, 'Comment is a required field'),
    profilePicture: z.string().optional().default(''),
    commentsCount: z.number().optional().default(0)
  })
});

export type AddCommentInput = z.infer<typeof addCommentSchema>['body'];
