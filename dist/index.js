"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const cors_1 = __importDefault(require("cors"));
const user_1 = require("./repositories/user");
const user_2 = require("./handlers/user");
const blacklist_1 = require("./repositories/blacklist");
const jwt_1 = require("./auth/jwt");
const content_1 = require("./repositories/content");
const content_2 = require("./handlers/content");
async function main() {
    const db = new client_1.PrismaClient();
    const redis = (0, redis_1.createClient)();
    try {
        await redis.connect();
        await db.$connect();
    }
    catch (err) {
        console.log(err);
        return;
    }
    const repoUser = (0, user_1.newRepositoryUser)(db);
    const repoBlacklist = (0, blacklist_1.newRepositoryBlacklist)(redis);
    const repoContent = (0, content_1.newRepositoryContent)(db);
    const handlerUser = (0, user_2.newHandlerUser)(repoUser, repoBlacklist);
    const handlerMiddleware = (0, jwt_1.newHandlerMiddleware)(repoBlacklist);
    const handlerContent = (0, content_2.newHandlerContent)(repoContent);
    const port = process.env.PORT || 8000;
    const server = (0, express_1.default)();
    const authRouter = express_1.default.Router();
    const userRouter = express_1.default.Router();
    const contentRouter = express_1.default.Router();
    server.use(express_1.default.json());
    server.use((0, cors_1.default)()); //integrate with front end
    server.use("/auth", authRouter);
    server.use("/user", userRouter);
    server.use("/content", contentRouter);
    //Auth
    authRouter.post("/login", handlerUser.login.bind(handlerUser));
    authRouter.get("/me", handlerUser.getUserByPayloadId.bind(handlerUser), handlerMiddleware.jwtMiddleware.bind(handlerMiddleware));
    authRouter.post("/logout", handlerMiddleware.jwtMiddleware.bind(handlerMiddleware), handlerUser.logout.bind(handlerUser));
    //User API
    userRouter.post("/", handlerUser.register.bind(handlerUser));
    userRouter.get("/:username", handlerUser.getUserByUsername.bind(handlerUser));
    //Content API. For POST, PACTH and DELETE, need to log in first
    contentRouter.get("/", handlerContent.getContents.bind(handlerContent));
    contentRouter.post("/", handlerMiddleware.jwtMiddleware.bind(handlerMiddleware), handlerContent.createContent.bind(handlerContent));
    contentRouter.get("/:id", handlerContent.getContentById.bind(handlerContent));
    contentRouter.patch("/:id", handlerMiddleware.jwtMiddleware.bind(handlerMiddleware), handlerContent.updateContent.bind(handlerContent));
    contentRouter.delete("/id", handlerMiddleware.jwtMiddleware.bind(handlerMiddleware), handlerContent.deleteContentById.bind(handlerContent));
    server.listen(port, () => console.log(`server listening on ${port}`));
}
main();
//# sourceMappingURL=index.js.map