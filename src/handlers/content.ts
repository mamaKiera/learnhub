import { Response } from "express";
import { JwtAuthRequest } from "../auth/jwt";
import { IRepositoryContent } from "../repositories";
import { getVideoContent } from "../lib/util";
import { toIContentDto, toIContentDtos } from "../entities";

export interface IHandlerContent {
  createContent(req: JwtAuthRequest, res: Response): Promise<Response>;
  getContents(req: JwtAuthRequest, res: Response): Promise<Response>;
  getContentById(req: JwtAuthRequest, res: Response): Promise<Response>;
  updateContent(req: JwtAuthRequest, res: Response): Promise<Response>;
  deleteContentById(req: JwtAuthRequest, res: Response): Promise<Response>;
}

export function newHandlerContent(repo: IRepositoryContent) {
  return new HandlerContent(repo);
}

class HandlerContent implements IHandlerContent {
  private repo: IRepositoryContent;

  constructor(repo: IRepositoryContent) {
    this.repo = repo;
  }

  //post content
  async createContent(req: JwtAuthRequest, res: Response): Promise<Response> {
    const { videoUrl, comment, rating } = req.body;
    if (!videoUrl || !comment || !rating) {
      return res
        .status(400)
        .json({ error: "missing video url or comment or rating" })
        .end();
    }

    const userId = req.payload.id;
    const { videoTitle, creatorName, creatorUrl, thumbnailUrl } =
      await getVideoContent(videoUrl);

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
      .then((content) => res.status(201).json({data: toIContentDto(content)}).end())
      .catch((err) => {
        console.error(`failed to create todo: ${err}`);
        return res.status(500).json({ error: `failed to create post` }).end();
      });
  }

  //get content
  async getContents(req: JwtAuthRequest, res: Response): Promise<Response> {
    return this.repo
      .getContents()
      .then((contents) =>{
        const contentDto = toIContentDtos(contents)
        return res.status(200).json({data: contentDto })
      } )
      .catch((err) => {
        console.error(`failed to create post: ${err}`);
        return res.status(500).json({ error: `failed to get posts` }).end();
      });
  }

  //get content by id
  async getContentById(req: JwtAuthRequest, res: Response): Promise<Response> {
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

        const contentDto = toIContentDto(content)
        console.log(contentDto)
        return res.status(200).json({data: contentDto}).end();
      })
      .catch((err) => {
        const errMsg = `failed to get post ${id}: ${err}`;
        console.error(errMsg);
        return res.status(500).json({ error: errMsg });
      });
  }

  //patch content by id
  async updateContent(req: JwtAuthRequest, res: Response): Promise<Response> {
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
  async deleteContentById(
    req: JwtAuthRequest,
    res: Response
  ): Promise<Response> {
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
