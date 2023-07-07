import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { IRepositoryBlacklist } from "../repositories";

const secret = process.env.JWT_SECRET || "todo-secrets";

export interface Payload {
  id: string;
  username: string;
}

export function newHandlerMiddleware(repoBlacklist: IRepositoryBlacklist) {
  return new HandlerMiddleware(repoBlacklist);
}

export function newJwt(payload: Payload): string {
  return jwt.sign(payload, secret, {
    algorithm: "HS512",
    expiresIn: "12h",
    issuer: "academy",
    subject: "registration",
    audience: "students",
  });
}

export interface JwtAuthRequest extends Request {
  token: string;
  payload: Payload;
}

export class HandlerMiddleware {
  private repoBlacklist: IRepositoryBlacklist;

  constructor(repoblacklist: IRepositoryBlacklist) {
    this.repoBlacklist = repoblacklist;
  }

  async jwtMiddleware(req: JwtAuthRequest, res: Response, next: NextFunction) {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      //check it token is provided
      if (!token) {
        return res.status(401).json({ error: "missing JWT token" }).end();
      }

      //check if this token is blacklisted
      const isBlacklisted = await this.repoBlacklist.isBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).json({ error: "please login" }).end();
      }

      const decoded = jwt.verify(token, secret);
      const id = decoded["id"];
      const username = decoded["username"];

      if (!id) {
        return res.status(401).json({ error: "missing payload `id`" }).end();
      }
      if (!username) {
        return res
          .status(401)
          .json({ error: "missing payload `username`" })
          .end();
      }

      req.token = token;
      req.payload = {
        id,
        username,
      };

      return next();
    } catch (err) {
      console.error(`Auth failed for token ${token}: ${err}`);
      return res.status(401).json({ error: "authentication failed" }).end();
    }
  }
}
