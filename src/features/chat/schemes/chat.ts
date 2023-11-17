import { z } from 'zod';

export const addChatSchema = z.object({
  body: z.object({
    conversationId: z.string().optional(),
    receiverId: z
      .string({
        required_error: 'receiverId is a required field'
      })
      .min(1, 'receiverId is a required field'),
    receiverUsername: z
      .string({
        required_error: 'receiverUsername is a required field'
      })
      .min(1, 'receiverUsername is a required field'),
    receiverAvatarColor: z
      .string({
        required_error: 'receiverAvatarColor is a required field'
      })
      .min(1, 'receiverAvatarColor is a required field'),
    receiverProfilePicture: z
      .string({
        required_error: 'receiverProfilePicture is a required field'
      })
      .min(1, 'receiverProfilePicture is a required field'),
    body: z.string().optional(),
    gifUrl: z.string().optional(),
    selectedImage: z.string().optional(),
    isRead: z.boolean().optional()
  })
});

export const markChatSchema = z.object({
  body: z.object({
    senderId: z.string().min(1),
    receiverId: z.string().min(1)
  })
});

export type MarkChatInput = z.infer<typeof markChatSchema>['body'];
export type AddChatInput = z.infer<typeof addChatSchema>['body'];
