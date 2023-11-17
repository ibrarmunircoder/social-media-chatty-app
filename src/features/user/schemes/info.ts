import { z } from 'zod';

export const basicInfoSchema = z.object({
  body: z.object({
    quote: z.string().optional().default(''),
    work: z.string().optional().default(''),
    school: z.string().optional().default(''),
    location: z.string().optional().default('')
  })
});
export const socialLinksSchema = z.object({
  body: z.object({
    facebook: z.string().optional().default(''),
    twitter: z.string().optional().default(''),
    instagram: z.string().optional().default(''),
    youtube: z.string().optional().default('')
  })
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({
          required_error: 'Password is a required!'
        })
        .min(4, 'Password must have a minimum length of 4')
        .max(8, 'Password must have a maximum length of 8'),
      newPassword: z
        .string({
          required_error: 'Password is a required!'
        })
        .min(4, 'Password must have a minimum length of 4')
        .max(8, 'Password must have a maximum length of 8'),
      confirmPassword: z
        .string({
          required_error: 'Password is a required!'
        })
        .min(4, 'Password must have a minimum length of 4')
        .max(8, 'Password must have a maximum length of 8')
    })
    .refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
      message: 'Passwords should be matched',
      path: ['confirmPassword']
    })
});

export const notificationSettingsSchema = z.object({
  body: z.object({
    messages: z.boolean().optional(),
    reactions: z.boolean().optional(),
    comments: z.boolean().optional(),
    follows: z.boolean().optional()
  })
});

export type NotificationSettingsSchemaInput = z.infer<typeof notificationSettingsSchema>['body'];
export type ChangePasswordSchemaInput = z.infer<typeof changePasswordSchema>['body'];
export type BasicInfoSchemaInput = z.infer<typeof basicInfoSchema>['body'];
export type SocialLinksSchemaInput = z.infer<typeof socialLinksSchema>['body'];
