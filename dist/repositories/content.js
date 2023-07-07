"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRepositoryContent = void 0;
function newRepositoryContent(db) {
    return new RepositoryContent(db);
}
exports.newRepositoryContent = newRepositoryContent;
class RepositoryContent {
    constructor(db) {
        this.db = db;
    }
    //create post
    async createContent(content) {
        return await this.db.content.create({
            include: {
                //select items to display here from user table
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        registeredAt: true,
                        password: false,
                    },
                },
            },
            data: {
                ...content,
                userId: undefined,
                user: {
                    connect: {
                        id: content.userId, //use userId to connect
                    },
                },
            },
        });
    }
    //get all posts
    async getContents() {
        return await this.db.content.findMany();
    }
    //get 1 post by id
    async getContentById(id) {
        return await this.db.content.findUnique({
            where: { id },
        });
    }
    //edit post
    async updateContent(arg) {
        return await this.db.content.update({
            where: { id: arg.id },
            data: {
                comment: arg.comment,
                rating: arg.rating,
            },
        });
    }
    //delete post by id
    async deleteContentById(arg) {
        const content = await this.db.content.findFirst({
            where: { id: arg.id, userId: arg.userId },
        });
        if (!content) {
            return Promise.reject(`no such content: ${arg.id}`);
        }
        return await this.db.content.delete({ where: { id: arg.id } });
    }
}
//# sourceMappingURL=content.js.map