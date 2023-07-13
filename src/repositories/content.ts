import { PrismaClient } from "@prisma/client";
import { ICreateContent, IContentWithUser } from "../entities";
import { IRepositoryContent } from ".";

export function newRepositoryContent(db: PrismaClient): IRepositoryContent {
  return new RepositoryContent(db);
}

const includeUser = {
  user: {
    select: {
      id: true,
      username: true,
      name: true,
      password: false,
      registeredAt: true,
    }
    
  }
}

class RepositoryContent implements IRepositoryContent {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  //create post
  async createContent(content: ICreateContent): Promise<IContentWithUser> {
    return await this.db.content.create({
      include: includeUser,
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
  async getContents(): Promise<IContentWithUser[]> {
    return await this.db.content.findMany({      
      include: includeUser
    });
  }

  //get 1 post by id
  async getContentById(id: number): Promise<IContentWithUser | null> {
    return await this.db.content.findUnique({
      include: includeUser,
      where: { id },
    });
  }

  //edit post
  async updateContent(arg: {
    id: number;
    comment: string;
    rating: number;
  }): Promise<IContentWithUser> {
    return await this.db.content.update({
      include: includeUser,
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
  }): Promise<IContentWithUser> {
    const content = await this.db.content.findFirst({
      include: includeUser,
      where: { id: arg.id, userId: arg.userId },
    });

    if (!content) {
      return Promise.reject(`no such content: ${arg.id}`);
    }

    return await this.db.content.delete({ include: includeUser, where: { id: arg.id } });
  }
}
