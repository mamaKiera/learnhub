import { IContent, IContentWithUser, ICreateContent } from "../entities";

export interface IRepositoryBlacklist {
  addToBlacklist(token: string): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}

export interface IRepositoryContent {
  createContent(content: ICreateContent): Promise<IContentWithUser>;
  getContents(): Promise<IContentWithUser[]>;
  getContentById(id: number): Promise<IContentWithUser | null>;
  updateContent(arg: {
    id: number;
    comment: string;
    rating: number;
  }): Promise<IContentWithUser>;
  deleteContentById(arg: { id: number; userId: string }): Promise<IContentWithUser>;
}
