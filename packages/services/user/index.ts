import { db, eq } from "@repo/database";
import { userTable } from "@repo/database/models/user";
import bcrypt from "bcryptjs";
import {
    createUserWithEmailAndPassword,
    generateUserPayloadToken,
    GenerateUserPayloadTokenType,
    signInWithEmailAndPassword,
    SignInWithEmailAndPasswordType,
    type CreateUserWithEmailAndPasswordType,
} from "./model";
import { env } from "../env";
import * as JWT from "jsonwebtoken";
import { email } from "zod";

export default class UserService {
    private async getUserByEmail(email: string) {
        const result = await db.select().from(userTable).where(eq(userTable.email, email));

        if (!result || result.length === 0) {
            return null;
        }
        return result[0];
    }

    private async generateuserToken(payload: GenerateUserPayloadTokenType) {
        const { id } = await generateUserPayloadToken.parseAsync(payload);
        const token = JWT.sign({ id }, env.JWT_SECRET);
        return { token };
    }
    public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordType) {
        const { email, fullName, password } =
            await createUserWithEmailAndPassword.parseAsync(payload);
        const existingUser = await this.getUserByEmail(email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await db
            .insert(userTable)
            .values({
                email,
                fullName,
                passwordHash,
            })
            .returning({
                id: userTable.id,
            });

        if (!result || result.length === 0 || !result[0]?.id) {
            throw new Error("Failed to create user");
        }

        const { token } = await this.generateuserToken({ id: result[0].id });

        return { id: result[0].id, token };
    }

    public async signInWithEmailAndPassword(payload: SignInWithEmailAndPasswordType) {
        const { email, password } = await signInWithEmailAndPassword.parseAsync(payload);

        const existingUser = await this.getUserByEmail(email);
        if (!existingUser) {
            throw new Error("User with this email does not exist");
        }
        if (!existingUser.passwordHash) {
            throw new Error("Invalid Authentication Method");
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash);
        if (!isPasswordValid) {
            throw new Error("Invalid Credentials");
        }

        const { token } = await this.generateuserToken({ id: existingUser.id });

        return { id: existingUser.id, token };
    }

    public async getUserInfoById(id: string) {
        const user = await db
            .select({ id: userTable.id, email: userTable.email, fullName: userTable.fullName })
            .from(userTable)
            .where(eq(userTable.id, id));

        if (!user || user.length === 0) {
            throw new Error("User with this ID does not exists");
        }
        return user[0]!;
    }

    public async verifyAndDecodeUserToken(token: string) {
        try {
            const decoded = JWT.verify(token, env.JWT_SECRET) as GenerateUserPayloadTokenType;
            return decoded;
        } catch (error) {
            throw new Error("Invalid token");
        }
    }
}
