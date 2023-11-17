import { z } from 'zod';

export const addReactionSchema = z.object({
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
      .min(1, 'user is a required field'),
    type: z
      .string({
        required_error: 'reaction type is a required field'
      })
      .min(1, 'reaction type is a required field'),
    profilePicture: z.string().optional().default(''),
    previousReaction: z.string().optional().default(''),
    postReactions: z.object({
      like: z.number().default(0),
      happy: z.number().default(0),
      wow: z.number().default(0),
      sad: z.number().default(0),
      angry: z.number().default(0),
      love: z.number().default(0)
    })
  })
});

export const removeReactionSchema = z.object({
  body: z.object({
    postReactions: z.object({}).optional().default({})
  })
});

export type AddReactionInput = z.infer<typeof addReactionSchema>['body'];
export type RemoveReactionInput = z.infer<typeof removeReactionSchema>['body'];
