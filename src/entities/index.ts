export interface ICreateUser {
  username: string;
  name: string;
  password: string;
}

export interface IUser extends ICreateUser {
  id: string;
}

export interface IUserDto extends Omit<IUser, "password"> {}

export interface ICreateContent {
  videoTitle: string;
  thumbnailUrl: string;
  creatorName: string;
  creatorUrl: string;
  videoUrl: string;
  comment: string;
  rating: number;

  userId: string;
}

export interface IContent extends ICreateContent {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentWithUser extends IContent {
  user: IUserDto;
}

export interface IContentDto extends IContent {
  postedBy: IUserDto
}

export function toIContentDto(content: IContentWithUser): IContentDto {
  return {...content, postedBy: content.user}
}

export function toIContentDtos(contents: IContentWithUser[]): IContentDto[] {
  return contents.map(content => toIContentDto(content))
}