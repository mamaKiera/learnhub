import { RedisClientType } from "redis";
import { IRepositoryBlacklist } from ".";

const keyBlacklist = "learnhub-jwt-blacklist";

export function newRepositoryBlacklist(
  db: RedisClientType<any, any, any>
): IRepositoryBlacklist {
  return new RepositoryBlacklist(db);
}

class RepositoryBlacklist {
  private db: RedisClientType<any, any, any>;

  constructor(db: RedisClientType<any, any, any>) {
    this.db = db;
  }

  //add token to blacklist
  async addToBlacklist(token: string): Promise<void> {
    await this.db.sAdd(keyBlacklist, token);
  }

  //check if the token is in the blacklist
  async isBlacklisted(token: string): Promise<boolean> {
    return await this.db.sIsMember(keyBlacklist, token);
  }
}
