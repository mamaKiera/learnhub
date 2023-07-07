import { IContent, ICreateContent } from "../entities";

export interface IRepositoryBlacklist {
  addToBlacklist(token: string): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}

export interface IRepositoryContent {
  createContent(content: ICreateContent): Promise<IContent>;
  getContents(): Promise<IContent[]>;
  getContentById(id: number): Promise<IContent | null>;
  updateContent(arg: {
    id: number;
    comment: string;
    rating: number;
  }): Promise<IContent>;
  deleteContentById(arg: { id: number; userId: string }): Promise<IContent>;
}
