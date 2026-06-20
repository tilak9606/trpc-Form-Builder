import {z} from "zod"; 

export const createUserWithEmailAndPassword = z.object({
  email: z.string().email().describe("The user's email address"),
  password: z.string().min(8).describe("The user's password"),
  fullName: z.string().min(1).describe("The user's full name"),

});

export type CreateUserWithEmailAndPasswordType = z.infer<typeof createUserWithEmailAndPassword>;

export const generateUserPayloadToken = z.object({
  id: z.string().uuid().describe("The user's unique identifier"),
});

export type GenerateUserPayloadTokenType = z.infer<typeof generateUserPayloadToken>;

export const signInWithEmailAndPassword = z.object({
  email: z.string().email().describe("The user's email address"),
  password: z.string().min(8).describe("The user's password"),
});

export type SignInWithEmailAndPasswordType = z.infer<typeof signInWithEmailAndPassword>;