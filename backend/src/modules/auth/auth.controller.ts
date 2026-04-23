import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import jwt from "jsonwebtoken";

const usersPath = path.join(process.cwd(), "backend", "fixtures", "mock-users.json");

export class AuthController {
  public static async login(req: Request, res: Response) {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "username and password required" });
      return;
    }

    const raw = fs.readFileSync(usersPath, "utf-8");
    const users = JSON.parse(raw) as any[];
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }

    const payload = { username: user.username, name: user.name, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || process.env.API_KEY || "dev-secret", { expiresIn: "8h" });
    res.json({ token, user: payload });
  }
}
