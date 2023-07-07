import { PrismaClient } from "@prisma/client";
import { ICreateContent, IContent } from "../entities";
import { IRepositoryContent } from ".";

export function newRepositoryContent(db: PrismaClient): IRepositoryContent {
  return new RepositoryContent(db);
}

class RepositoryContent implements IRepositoryContent {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  //create post
  async createContent(content: ICreateContent): Promise<IContent> {
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
        userId: undefined, //set userId as undefined first in case there is a random userId sent in with content
        user: {
          connect: {
            id: content.userId, //use userId to connect
          },
        },
      },
    });
  }

  //get all posts
  async getContents(): Promise<IContent[]> {
    return await this.db.content.findMany();
  }

  //get 1 post by id
  async getContentById(id: number): Promise<IContent | null> {
    return await this.db.content.findUnique({
      where: { id },
    });
  }

  //edit post
  async updateContent(arg: {
    id: number;
    comment: string;
    rating: number;
  }): Promise<IContent> {
    return await this.db.content.update({
      where: { id: arg.id },
      data: {
        comment: arg.comment,
        rating: arg.rating,
      },
    });
  }

  //delete post by id
  async deleteContentById(arg: {
    id: number;
    userId: string;
  }): Promise<IContent> {
    const content = await this.db.content.findFirst({
      where: { id: arg.id, userId: arg.userId },
    });

    if (!content) {
      return Promise.reject(`no such content: ${arg.id}`);
    }

    return await this.db.content.delete({ where: { id: arg.id } });
  }
}
