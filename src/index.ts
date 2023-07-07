import { PrismaClient } from "@prisma/client";
import express from "express";
import { createClient } from "redis";

import { newRepositoryUser } from "./repositories/user";

import { newHandlerUser } from "./handlers/user";
import { newRepositoryBlacklist } from "./repositories/blacklist";
import { newHandlerMiddleware } from "./auth/jwt";
import { newRepositoryContent } from "./repositories/content";
import { newHandlerContent } from "./handlers/content";

async function main() {
  const db = new PrismaClient();
  const redis = createClient();

  try {
    await redis.connect();
    await db.$connect();
  } catch (err) {
    console.log(err);
    return;
  }

  const repoUser = newRepositoryUser(db);
  const repoBlacklist = newRepositoryBlacklist(redis);
  const repoContent = newRepositoryContent(db);
  const handlerUser = newHandlerUser(repoUser, repoBlacklist);
  const handlerMiddleware = newHandlerMiddleware(repoBlacklist);
  const handlerContent = newHandlerContent(repoContent);

  const port = process.env.PORT || 8000;
  const server = express();
  const authRouter = express.Router();
  const userRouter = express.Router();
  const contentRouter = express.Router();

  server.use(express.json());
  server.use("/auth", authRouter);
  server.use("/user", userRouter);
  server.use("/content", contentRouter);

  //Auth
  authRouter.post("/login", handlerUser.login.bind(handlerUser));
  authRouter.get(
    "/me",
    handlerUser.getUserByPayloadId.bind(handlerUser),
    handlerMiddleware.jwtMiddleware.bind(handlerMiddleware)
  );
  authRouter.post(
    "/logout",
    handlerMiddleware.jwtMiddleware.bind(handlerMiddleware),
    handlerUser.logout.bind(handlerUser)
  );

  //User API
  userRouter.post("/", handlerUser.register.bind(handlerUser));
  userRouter.get("/:username", handlerUser.getUserByUsername.bind(handlerUser));

  //Content API. For POST, PACTH and DELETE, need to log in first
  contentRouter.get("/", handlerContent.getContents.bind(handlerContent));
  contentRouter.post(
    "/",
    handlerMiddleware.jwtMiddleware.bind(handlerMiddleware),
    handlerContent.createContent.bind(handlerContent)
  );
  contentRouter.get("/:id", handlerContent.getContentById.bind(handlerContent));
  contentRouter.patch(
    "/:id",
    handlerMiddleware.jwtMiddleware.bind(handlerMiddleware),
    handlerContent.updateContent.bind(handlerContent)
  );
  contentRouter.delete(
    "/id",
    handlerMiddleware.jwtMiddleware.bind(handlerMiddleware),
    handlerContent.deleteContentById.bind(handlerContent)
  );

  server.listen(port, () => console.log(`server listening on ${port}`));
}

main();
