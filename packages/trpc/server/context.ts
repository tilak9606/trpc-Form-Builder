import type {CookieOptions} from "express";
import {clearCookie as clearCookieUtils,getCookie as getCookieUtil, setCookie as setCookieUtil} from "./utils/cookie";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export interface TRPCCtxUser {
    id: string;
}

export interface TRPCContext {
    setCookie(name: string, value: string, opts: CookieOptions): void;
    getCookie(name: string): string | undefined;
    clearCookie(name: string): void;

    user?: TRPCCtxUser;
}

export async function createContext({
    req, res
}: CreateExpressContextOptions ){
    const ctx: TRPCContext= {
        setCookie(name: string, value: string, opts: CookieOptions) {
            return setCookieUtil(res, name, value, opts);
        },
        getCookie(name: string) {
            return getCookieUtil(req, name);
        },
        clearCookie(name: string) {
            return clearCookieUtils(res, name);
        },
        user: undefined,
    };
    
    return ctx;
}



export type Context = Awaited<ReturnType<typeof createContext>>;

