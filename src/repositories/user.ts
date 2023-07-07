import { PrismaClient } from "@prisma/client";
import { ICreateUser, IUser, IUserDto } from "../entities";

export interface IRepositoryUser {
  createUser(user: ICreateUser): Promise<IUser>;
  getUser(username: string): Promise<IUser>;
  getUserByPayloadId(id: string): Promise<IUserDto | null>;
  getUserByUsername(username: string): Promise<IUserDto | null>;
}

export function newRepositoryUser(db: PrismaClient): IRepositoryUser {
  return new RepositoryUser(db);
}

class RepositoryUser implements IRepositoryUser {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  //create user
  async createUser(user: ICreateUser): Promise<IUser> {
    return await this.db.user
      .create({ data: user })
      .catch((err) =>
        Promise.reject(`failed to create user ${user.username}: ${err}`)
      );
  }

  //find user with the input username to use for log in
  async getUser(username: string): Promise<IUser> {
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
  async getUserByPayloadId(id: string): Promise<IUserDto | null> {
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
  async getUserByUsername(username: string): Promise<IUserDto | null> {
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
