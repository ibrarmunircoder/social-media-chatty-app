import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    username: z.string({
      required_error: 'Username is a required field'
    }),
    // .min(4, 'Invalid username')
    // .max(8, 'Invalid username'),
    password: z
      .string({
        required_error: 'Password is a required field'
      })
      .min(4, 'Password is too short - should be min 6 chars')
      .max(20, 'Password is too long - should be max 20 chars')
      .trim(),
    avatarColor: z
      .string({
        required_error: 'Avatar color is a required field'
      })
      .min(1, 'Avatar color is a required field'),
    avatarImage: z
      .string({
        required_error: 'Avatar image is a required field'
      })
      .min(1, 'Avatar image is a required field'),
    email: z
      .string({
        required_error: 'Email is a required field'
      })
      .min(1, 'Email is a required field')
      .email('Email must be valid')
  })
});

export type CreateUserInput = z.infer<typeof signupSchema>['body'];
