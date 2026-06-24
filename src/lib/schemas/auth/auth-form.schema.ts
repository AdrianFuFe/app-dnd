import { z } from 'zod';

export const authFormSchema = z.object({
	email: z.email().trim(),
	password: z.string().min(8).max(128)
});

export type AuthFormInput = z.infer<typeof authFormSchema>;
