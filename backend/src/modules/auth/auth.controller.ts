import { Request, Response } from "express";
import * as fs from "fs/promises";
import * as path from "path";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import config from "../../config";
import logger from "../../utils/logger";

interface User {
  username: string;
  password: string; // bcrypt hash
  name: string;
  role?: string;
}

interface TokenPayload {
  username: string;
  name: string;
  role?: string;
}

export class AuthController {
  private static usersPath = path.join(__dirname, "../../../fixtures/mock-users.json");

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        logger.warn("Login attempt with missing credentials", { ip: req.ip });
        res.status(400).json({ error: "Username and password required" });
        return;
      }

      if (!config.auth.jwtSecret) {
        logger.error("JWT_SECRET not configured");
        res.status(500).json({ error: "Server misconfiguration" });
        return;
      }

      // Load and parse users file
      let users: User[];
      try {
        const raw = await fs.readFile(this.usersPath, "utf-8");
        users = JSON.parse(raw);
      } catch (error) {
        logger.error("Failed to load users file", { error });
        res.status(500).json({ error: "Authentication service unavailable" });
        return;
      }

      // Find user by username
      const user = users.find((u) => u.username === username);

      if (!user) {
        logger.warn("Failed login attempt", { username, ip: req.ip });
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Verify password - support both bcrypt hashes and plaintext during migration
      let passwordMatch = false;
      
      // Check if stored password is a bcrypt hash
      const isBcryptHash = user.password.startsWith("$2a$") || 
                          user.password.startsWith("$2b$") || 
                          user.password.startsWith("$2y$");
      
      if (isBcryptHash) {
        // Compare with bcrypt hash
        passwordMatch = await bcryptjs.compare(password, user.password);
      } else {
        // Support plaintext during migration (will be hashed on next update)
        // TODO: Remove this after migration to bcrypt
        passwordMatch = password === user.password;
        if (passwordMatch) {
          logger.warn("User authenticated with plaintext password (migration needed)", { username });
        }
      }
      
      if (!passwordMatch) {
        logger.warn("Failed login attempt - incorrect password", { username, ip: req.ip });
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Create JWT token with standardized payload
      const payload: TokenPayload = {
        username: user.username,
        name: user.name,
        role: user.role
      };
      const token = jwt.sign(payload, config.auth.jwtSecret, { expiresIn: "8h" });

      logger.info("User logged in successfully", { username, ip: req.ip });

      res.status(200).json({
        data: {
          token,
          user: payload
        }
      });
    } catch (error) {
      logger.error("Login error", { error });
      res.status(500).json({ error: "Login failed" });
    }
  }
}