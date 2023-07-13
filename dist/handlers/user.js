"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newHandlerUser = void 0;
const becrypt_1 = require("../auth/becrypt");
const jwt_1 = require("../auth/jwt");
function newHandlerUser(repo, repoBlacklist) {
    return new HandlerUser(repo, repoBlacklist);
}
exports.newHandlerUser = newHandlerUser;
class HandlerUser {
    constructor(repo, repoBlacklist) {
        this.repo = repo;
        this.repoBlacklist = repoBlacklist;
    }
    //register
    async register(req, res) {
        const { username, name, password } = req.body;
        if (!username || !name || !password) {
            return res
                .status(400)
                .json({ error: "username, name or password is missinng" })
                .end();
        }
        return this.repo
            .createUser({ username, name, password: (0, becrypt_1.hashPassword)(password) })
            .then((user) => res.status(201).json({ username, name }).end())
            .catch((err) => {
            const errMsg = `failed to create user ${username}`;
            console.error(`${errMsg}: ${err}`);
            return res.status(500).json({ error: errMsg }).end();
        });
    }
    //login
    async login(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "username or password is missinng" })
                .end();
        }
        return this.repo
            .getUser(username)
            .then((user) => {
            if (!(0, becrypt_1.compareHash)(password, user.password)) {
                return res.status(401).json({ error: "invalid password" }).end();
            }
            const accessToken = (0, jwt_1.newJwt)({ username, id: user.id });
            return res
                .status(200)
                .json({ status: "You have logged in", accessToken })
                .end();
        })
            .catch((err) => {
            console.error(`failed to get user: ${err}`);
            return res.status(500).end();
        });
    }
    //get auth/me
    async getUserByPayloadId(req, res) {
        const userId = req.payload.id;
        return this.repo
            .getUserByPayloadId(userId)
            .then((user) => {
            if (!user) {
                return res
                    .status(404)
                    .json({ error: `user ${userId} not found` })
                    .end();
            }
            return res.status(200).json(user).end();
        })
            .catch((err) => {
            const errMsg = `failed to get user: ${userId}`;
            console.error(`${errMsg}: ${err}`);
            return res.status(500).json({ error: errMsg }).end();
        });
    }
    //get user/{username}
    async getUserByUsername(req, res) {
        const username = req.params.username;
        return this.repo
            .getUserByUsername(username)
            .then((user) => {
            if (!user) {
                return res
                    .status(404)
                    .json({ error: `user ${username} not found` })
                    .end();
            }
            return res.status(200).json(user).end();
        })
            .catch((err) => {
            const errMsg = `failed to get user: ${username}`;
            console.error(`${errMsg}: ${err}`);
            return res.status(500).json({ error: errMsg }).end();
        });
    }
    //logout
    async logout(req, res) {
        try {
            //when log out, add token to blacklist
            await this.repoBlacklist.addToBlacklist(req.token);
            return res
                .status(200)
                .json({ status: "successfully logged out", token: req.token })
                .end();
        }
        catch (err) {
            console.error(`failed to log out: ${err} `);
            return res.status(500).end();
        }
    }
}
//# sourceMappingURL=user.js.map