import { z } from 'zod';

export const emailSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is a required field'
      })
      .email('Email must be valid')
  })
});

export const passwordSchema = z.object({
  body: z
    .object({
      password: z
        .string({
          required_error: 'Password is a required field'
        })
        .min(4, 'Password is too short - should be min 6 chars')
        .max(20, 'Password is too long - should be max 20 chars')
        .trim(),
      confirmPassword: z
        .string({
          required_error: 'Confirm Password is a required field'
        })
        .min(1, 'Password is a required field')
    })
    .refine(({ password, confirmPassword }) => password !== confirmPassword, {
      message: 'Passwords should be matched',
      path: ['confirmPassword']
    })
});
