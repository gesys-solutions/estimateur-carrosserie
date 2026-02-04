import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Le courriel est requis")
    .email("Format de courriel invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginInput = LoginFormData; // Alias

/**
 * User creation schema (admin)
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Le courriel est requis")
    .email("Format de courriel invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .optional(),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  role: z.enum(["ADMIN", "MANAGER", "ESTIMATEUR"], {
    message: "Rôle invalide",
  }),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type CreateUserInput = CreateUserFormData; // Alias

/**
 * User update schema (admin)
 */
export const updateUserSchema = z.object({
  email: z.string().email("Format de courriel invalide").optional(),
  firstName: z.string().min(1, "Le prénom est requis").optional(),
  lastName: z.string().min(1, "Le nom est requis").optional(),
  role: z.enum(["ADMIN", "MANAGER", "ESTIMATEUR"]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type UpdateUserInput = UpdateUserFormData; // Alias

/**
 * Password change schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ChangePasswordInput = ChangePasswordFormData; // Alias

/**
 * Profile update schema
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Format de courriel invalide"),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type UpdateProfileInput = UpdateProfileFormData; // Alias
