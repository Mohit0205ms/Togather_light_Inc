import { z } from 'zod';

export const registrationSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase, one uppercase, and one number'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').trim(),
  password: z.string().min(1, 'Password is required').trim(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
