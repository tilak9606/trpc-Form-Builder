import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import {
    createUserWithEmailAndPasswordInpuModel,
    createUserWithEmailAndPasswordOutputModel,
    getLogggedInUserInfoInputModel,
    getLogggedInUserInfoOutputModel,
    signInUserWithEmailAndPasswordInputModel,
    signInUserWithEmailAndPasswordOutputModel,
} from "./model";

import { userService } from "../../services";
import { generatePath } from "../../utils/path-generator";

const getPath = generatePath("/authentication");
const TAGS = ["Authentication"];

export const authRouter = router({
    createUserWithEmailAndPassword: publicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/createUserWithEmailAndPassword"),
                tags: TAGS,
            },
        })
        .input(createUserWithEmailAndPasswordInpuModel)
        .output(createUserWithEmailAndPasswordOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { fullName, email, password } = input;
            const { id, token } = await userService.createUserWithEmailAndPassword({
                fullName,
                email,
                password,
            });

            ctx.setCookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            return { id };
        }),

    signInUserWithEmailAndPassword: publicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/signInUserWithEmailAndPassword"),
                tags: TAGS,
            },
        })
        .input(signInUserWithEmailAndPasswordInputModel)
        .output(signInUserWithEmailAndPasswordOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { email, password } = input;
            const { id, token } = await userService.signInWithEmailAndPassword({
                email,
                password,
            });
            ctx.setCookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });
            return { id };
        }),

    getLoggedInUserInfo: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getLoggedInUserInfo"),
                tags: TAGS,
            },
        })
        .input(getLogggedInUserInfoInputModel)
        .output(getLogggedInUserInfoOutputModel)
        .query(async ({ ctx }) => {
            const { email, fullName, id } = await userService.getUserInfoById(ctx.userId.id);
            return { email, fullName, id };
        }),
});
