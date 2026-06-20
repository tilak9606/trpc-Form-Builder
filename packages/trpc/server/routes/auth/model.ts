import {z} from 'zod';

export const createUserWithEmailAndPasswordInpuModel = z.object({
    fullName: z.string().describe("The full name of the user").min(1, "Full name is required"),
    email: z.email().describe("The email address of the user"),
    password: z.string().describe("The password for the user account").min(8, "Password must be at least 8 characters long"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("The unique identifier of the user"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
    email: z.email().describe("The email address of the user"),
    password: z.string().describe("The password for the user account").min(8, "Password must be at least 8 characters long"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("The unique identifier of the user"),
});

export const getLogggedInUserInfoInputModel = z.undefined();

export const getLogggedInUserInfoOutputModel = z.object({
    id: z.string().describe("The unique identifier of the user"),
    email: z.email().describe("The email address of the user"),
    fullName: z.string().describe("The full name of the user"),
});