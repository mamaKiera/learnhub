"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newHandlerContent = void 0;
const util_1 = require("../lib/util");
function newHandlerContent(repo) {
    return new HandlerContent(repo);
}
exports.newHandlerContent = newHandlerContent;
class HandlerContent {
    constructor(repo) {
        this.repo = repo;
    }
    //post content
    async createContent(req, res) {
        const { videoUrl, comment, rating } = req.body;
        if (!videoUrl || !comment || !rating) {
            return res
                .status(400)
                .json({ error: "missing video url or comment or rating" })
                .end();
        }
        const userId = req.payload.id;
        const { videoTitle, creatorName, creatorUrl, thumbnailUrl } = await (0, util_1.getVideoContent)(videoUrl);
        return this.repo
            .createContent({
            videoUrl,
            comment,
            rating,
            userId,
            videoTitle,
            creatorName,
            creatorUrl,
            thumbnailUrl,
        })
            .then((content) => res.status(201).json(content).end())
            .catch((err) => {
            console.error(`failed to create todo: ${err}`);
            return res.status(500).json({ error: `failed to create post` }).end();
        });
    }
    //get content
    async getContents(req, res) {
        return this.repo
            .getContents()
            .then((contents) => res.status(200).json(contents))
            .catch((err) => {
            console.error(`failed to create post: ${err}`);
            return res.status(500).json({ error: `failed to get posts` }).end();
        });
    }
    //get content by id
    async getContentById(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res
                .status(400)
                .json({ error: `id ${req.params.id} is not a number` });
        }
        return this.repo
            .getContentById(id)
            .then((content) => {
            if (!content) {
                return res
                    .status(404)
                    .json({ error: `no such post: ${id}` })
                    .end();
            }
            return res.status(200).json(content).end();
        })
            .catch((err) => {
            const errMsg = `failed to get post ${id}: ${err}`;
            console.error(errMsg);
            return res.status(500).json({ error: errMsg });
        });
    }
    //patch content by id
    async updateContent(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res
                .status(400)
                .json({ error: `id ${req.params.id} is not a number` });
        }
        const { comment, rating } = req.body;
        if (!comment || !rating) {
            return res
                .status(400)
                .json({ error: "missing comment or rating in json body" })
                .end();
        }
        return this.repo
            .updateContent({ id, comment, rating })
            .then((updated) => res.status(201).json(updated).end())
            .catch((err) => {
            const errMsg = `failed to update post ${id}: ${err}`;
            console.error(errMsg);
            return res.status(500).json({ error: errMsg }).end();
        });
    }
    //delete content by id. Only post owner can delete their own post
    async deleteContentById(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res
                .status(400)
                .json({ error: `id ${req.params.id} is not a number` });
        }
        return this.repo
            .deleteContentById({ id, userId: req.payload.id })
            .then((deleted) => res.status(200).json(deleted).end())
            .catch((err) => {
            console.error(`failed to delete post ${id}: ${err}`);
            return res.status(500).json({ error: `failed to delete post ${id}` });
        });
    }
}
//# sourceMappingURL=content.js.map