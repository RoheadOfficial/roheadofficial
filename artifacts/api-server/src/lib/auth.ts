import type { Request } from "express";
import * as jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, type User, usersTable } from "@workspace/db";

export type PublicUser = {
  id: number;
  email: string;
  role: string;
  permissions: {
    canUploadMusic: boolean;
    canUploadVideo: boolean;
    canEditSite: boolean;
    canDeleteContent: boolean;
    canManageUsers: boolean;
  };
  createdAt: string;
};

type TokenPayload = {
  userId: number;
};

const getJwtSecret = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be set for authentication");
  }
  return secret;
};

export const signToken = (userId: number) =>
  jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  role: user.role,
  permissions: {
    canUploadMusic: user.canUploadMusic,
    canUploadVideo: user.canUploadVideo,
    canEditSite: user.canEditSite,
    canDeleteContent: user.canDeleteContent,
    canManageUsers: user.canManageUsers,
  },
  createdAt: user.createdAt.toISOString(),
});

export const getCurrentUser = async (req: Request) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as TokenPayload;
    if (!payload.userId) {
      return null;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId));

    return user ?? null;
  } catch {
    return null;
  }
};

export const isAdmin = (user: User) => user.role === "admin";

export const hasPermission = (user: User, permission: keyof PublicUser["permissions"]) => {
  if (isAdmin(user)) {
    return true;
  }
  return Boolean(user[permission]);
};
