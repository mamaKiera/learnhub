"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRepositoryBlacklist = void 0;
const keyBlacklist = "learnhub-jwt-blacklist";
function newRepositoryBlacklist(db) {
    return new RepositoryBlacklist(db);
}
exports.newRepositoryBlacklist = newRepositoryBlacklist;
class RepositoryBlacklist {
    constructor(db) {
        this.db = db;
    }
    //add token to blacklist
    async addToBlacklist(token) {
        await this.db.sAdd(keyBlacklist, token);
    }
    //check if the token is in the blacklist
    async isBlacklisted(token) {
        return await this.db.sIsMember(keyBlacklist, token);
    }
}
//# sourceMappingURL=blacklist.js.map