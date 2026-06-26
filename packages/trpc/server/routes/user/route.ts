import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import UserService from "@repo/services/user/index";

import {
  getUserPlanOutputModel,
  updateUserPlanInputModel,
  updateUserPlanOutputModel,
} from "./model";

const TAGS = ["User"];
const getPath = generatePath("/user");
const userService = new UserService();

export const userRouter = router({
  getUserPlan: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getUserPlan"), tags: TAGS, protect: true } })
    .output(getUserPlanOutputModel)
    .query(async ({ ctx }) => {
      return userService.getUserPlan(ctx.user!.id);
    }),

  updateUserPlan: authenticatedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/updateUserPlan"), tags: TAGS, protect: true } })
    .input(updateUserPlanInputModel)
    .output(updateUserPlanOutputModel)
    .mutation(async ({ input, ctx }) => {
      return userService.updateUserPlan(ctx.user!.id, input.plan);
    }),
});

export default userRouter;
