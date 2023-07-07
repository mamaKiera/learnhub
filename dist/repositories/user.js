"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRepositoryUser = void 0;
function newRepositoryUser(db) {
    return new RepositoryUser(db);
}
exports.newRepositoryUser = newRepositoryUser;
class RepositoryUser {
    constructor(db) {
        this.db = db;
    }
    //create user
    async createUser(user) {
        return await this.db.user
            .create({ data: user })
            .catch((err) => Promise.reject(`failed to create user ${user.username}: ${err}`));
    }
    //find user with the input username to use for log in
    async getUser(username) {
        return await this.db.user
            .findUnique({ where: { username } })
            .then((user) => {
            if (!user) {
                return Promise.reject(`${username} does not exist`);
            }
            return Promise.resolve(user);
        });
    }
    //find user with payload id and return user info
    async getUserByPayloadId(id) {
        return await this.db.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                name: true,
                registeredAt: true,
            },
        });
    }
    //get user with username param and return user info
    async getUserByUsername(username) {
        return await this.db.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                registeredAt: true,
            },
        });
    }
}
//# sourceMappingURL=user.js.map