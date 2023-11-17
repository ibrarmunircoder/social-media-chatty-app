import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    password: z
      .string({
        required_error: 'Password is a required field'
      })
      .min(1, 'Password is a required field')
      .trim(),
    username: z
      .string({
        required_error: 'Username is a required field'
      })
      .min(4, 'Invalid username')
      .max(8, 'Invalid username')
  })
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
