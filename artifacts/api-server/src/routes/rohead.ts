import { Router, type IRouter } from "express";
import * as bcrypt from "bcryptjs";
import { count, desc, eq } from "drizzle-orm";
import {
  activityTable,
  db,
  musicTable,
  settingsTable,
  usersTable,
  videosTable,
} from "@workspace/db";
import {
  CreateAdminMusicBody,
  CreateAdminUserBody,
  CreateAdminVideoBody,
  DeleteAdminMusicParams,
  DeleteAdminUserParams,
  DeleteAdminVideoParams,
  GetAdminDashboardResponse,
  GetAdminSettingsResponse,
  GetAuthStatusResponse,
  GetMeResponse,
  GetPublicHomeResponse,
  ListAdminMusicResponse,
  ListAdminUsersResponse,
  ListAdminVideosResponse,
  ListPublicMusicQueryParams,
  ListPublicMusicResponse,
  ListPublicVideosQueryParams,
  ListPublicVideosResponse,
  LoginBody,
  LoginResponse,
  SignupBody,
  UpdateAdminMusicBody,
  UpdateAdminMusicParams,
  UpdateAdminMusicResponse,
  UpdateAdminSettingsBody,
  UpdateAdminSettingsResponse,
  UpdateAdminUserBody,
  UpdateAdminUserParams,
  UpdateAdminUserResponse,
  UpdateAdminVideoBody,
  UpdateAdminVideoParams,
  UpdateAdminVideoResponse,
} from "@workspace/api-zod";
import { getCurrentUser, hasPermission, isAdmin, signToken, toPublicUser } from "../lib/auth";

const router: IRouter = Router();

type MusicRow = typeof musicTable.$inferSelect;
type VideoRow = typeof videosTable.$inferSelect;
type SettingsRow = typeof settingsTable.$inferSelect;

const mediaArt = (title: string, a: string, b: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="55"/></filter></defs><rect width="1200" height="800" fill="#050505"/><circle cx="260" cy="180" r="260" fill="${a}" opacity=".75" filter="url(#blur)"/><circle cx="930" cy="560" r="310" fill="${b}" opacity=".65" filter="url(#blur)"/><path d="M0 610 C240 520 390 760 620 630 C850 500 980 520 1200 430 L1200 800 L0 800Z" fill="rgba(255,255,255,.12)"/><text x="70" y="680" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="800" letter-spacing="8">${title}</text></svg>`)}`;

const musicDefaults = [
  {
    title: "Midnight Motion",
    description: "A polished embed-ready single for the ROHEAD OFFICIAL launch library.",
    coverImage: mediaArt("MIDNIGHT MOTION", "#ef4444", "#7c3aed"),
    embedLink: "https://open.spotify.com/embed/track/11dFghVXANMlKmJXsNCbNl",
    genre: "R&B",
    artist: "Rohead",
    producer: "Rohead Studio",
    featured: true,
  },
  {
    title: "Glass Room Freestyle",
    description: "A clean Apple-style music card entry using embeds first.",
    coverImage: mediaArt("GLASS ROOM", "#38bdf8", "#a855f7"),
    embedLink: "https://soundcloud.com/discover/sets/charts-top:all-music:us",
    genre: "Hip-Hop",
    artist: "Rohead",
    producer: "North Room",
    featured: true,
  },
  {
    title: "Redline Dream",
    description: "Recommended listening with cinematic cover treatment.",
    coverImage: mediaArt("REDLINE DREAM", "#fb7185", "#f97316"),
    embedLink: "https://music.apple.com/us/browse",
    genre: "Alternative",
    artist: "Rohead",
    producer: "Rohead Studio",
    featured: false,
  },
];

const videoDefaults = [
  {
    title: "ROHEAD OFFICIAL: Visual Drop",
    description: "A featured video slot built for YouTube-first embeds.",
    thumbnail: mediaArt("VISUAL DROP", "#ef4444", "#111827"),
    videoLink: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    featured: true,
    trending: true,
  },
  {
    title: "Studio Session Cut",
    description: "Behind-the-scenes style video card for the Netflix-inspired rows.",
    thumbnail: mediaArt("STUDIO SESSION", "#06b6d4", "#0f172a"),
    videoLink: "https://www.youtube.com/embed/ysz5S6PUM-U",
    featured: true,
    trending: false,
  },
  {
    title: "Latest Motion Piece",
    description: "A clean latest-upload video entry for the public video page.",
    thumbnail: mediaArt("MOTION PIECE", "#ec4899", "#7f1d1d"),
    videoLink: "https://www.youtube.com/embed/jfKfPfyJRdk",
    featured: false,
    trending: true,
  },
];

const toSettings = (settings: SettingsRow) => ({
  id: settings.id,
  siteName: settings.siteName,
  description: settings.description,
  bannerUrl: settings.bannerUrl,
  profileImageUrl: settings.profileImageUrl,
  aboutText: settings.aboutText,
  footerText: settings.footerText,
  defaultTheme: settings.defaultTheme as "light" | "dark" | "ocean" | "purple" | "pink" | "red",
  publicSignupEnabled: settings.publicSignupEnabled,
  updatedAt: settings.updatedAt.toISOString(),
});

const toMusic = (item: MusicRow) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  coverImage: item.coverImage,
  embedLink: item.embedLink,
  genre: item.genre,
  artist: item.artist,
  producer: item.producer,
  featured: item.featured,
  createdAt: item.createdAt.toISOString(),
});

const toVideo = (item: VideoRow) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  thumbnail: item.thumbnail,
  videoLink: item.videoLink,
  featured: item.featured,
  trending: item.trending,
  createdAt: item.createdAt.toISOString(),
});

const ensureSettings = async () => {
  const [existing] = await db.select().from(settingsTable).where(eq(settingsTable.id, 1));
  if (existing) {
    return existing;
  }

  const [created] = await db.insert(settingsTable).values({ id: 1 }).returning();
  return created;
};

const ensureSeedMedia = async () => {
  const [musicCount] = await db.select({ value: count() }).from(musicTable);
  if (Number(musicCount?.value ?? 0) === 0) {
    await db.insert(musicTable).values(musicDefaults);
  }

  const [videoCount] = await db.select({ value: count() }).from(videosTable);
  if (Number(videoCount?.value ?? 0) === 0) {
    await db.insert(videosTable).values(videoDefaults);
  }
};

const getAuthedUser = async (req: import("express").Request, res: import("express").Response) => {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return user;
};

const requireAdminOrPermission = async (
  req: import("express").Request,
  res: import("express").Response,
  permission?: Parameters<typeof hasPermission>[1],
) => {
  const user = await getAuthedUser(req, res);
  if (!user) {
    return null;
  }

  if (!permission && !isAdmin(user)) {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }

  if (permission && !hasPermission(user, permission)) {
    res.status(403).json({ error: "Permission denied" });
    return null;
  }

  return user;
};

const logActivity = async (message: string) => {
  await db.insert(activityTable).values({ message });
};

router.get("/auth/status", async (_req, res): Promise<void> => {
  const [adminCount] = await db.select({ value: count() }).from(usersTable).where(eq(usersTable.role, "admin"));
  const settings = await ensureSettings();
  res.json(
    GetAuthStatusResponse.parse({
      hasAdmin: Number(adminCount?.value ?? 0) > 0,
      signupEnabled: !Number(adminCount?.value ?? 0) || settings.publicSignupEnabled,
    }),
  );
});

router.post("/auth/signup", async (req, res): Promise<void> => {
  const body = SignupBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [adminCount] = await db.select({ value: count() }).from(usersTable).where(eq(usersTable.role, "admin"));
  const settings = await ensureSettings();
  const firstAdmin = Number(adminCount?.value ?? 0) === 0;

  if (!firstAdmin && !settings.publicSignupEnabled) {
    res.status(403).json({ error: "Public signup is disabled" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, body.data.email.toLowerCase()));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(body.data.password, 12);
  const [user] = await db
    .insert(usersTable)
    .values({
      email: body.data.email.toLowerCase(),
      passwordHash,
      role: firstAdmin ? "admin" : "user",
      canUploadMusic: firstAdmin,
      canUploadVideo: firstAdmin,
      canEditSite: firstAdmin,
      canDeleteContent: firstAdmin,
      canManageUsers: firstAdmin,
    })
    .returning();

  await logActivity(`${firstAdmin ? "Admin" : "User"} account created: ${user.email}`);
  res.status(201).json(LoginResponse.parse({ token: signToken(user.id), user: toPublicUser(user) }));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const body = LoginBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, body.data.email.toLowerCase()));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(body.data.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  res.json(LoginResponse.parse({ token: signToken(user.id), user: toPublicUser(user) }));
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const user = await getAuthedUser(req, res);
  if (!user) {
    return;
  }
  res.json(GetMeResponse.parse(toPublicUser(user)));
});

router.get("/public/home", async (_req, res): Promise<void> => {
  await ensureSeedMedia();
  const settings = await ensureSettings();
  const featuredMusic = await db.select().from(musicTable).where(eq(musicTable.featured, true)).orderBy(desc(musicTable.createdAt)).limit(8);
  const latestVideos = await db.select().from(videosTable).orderBy(desc(videosTable.createdAt)).limit(8);
  const recommendedMusic = await db.select().from(musicTable).orderBy(desc(musicTable.createdAt)).limit(8);

  res.json(
    GetPublicHomeResponse.parse({
      settings: toSettings(settings),
      featuredMusic: featuredMusic.map(toMusic),
      latestVideos: latestVideos.map(toVideo),
      recommendedMusic: recommendedMusic.map(toMusic),
    }),
  );
});

router.get("/public/music", async (req, res): Promise<void> => {
  await ensureSeedMedia();
  const query = ListPublicMusicQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const items = await db.select().from(musicTable).orderBy(desc(musicTable.createdAt)).limit(query.data.limit ?? 24);
  res.json(ListPublicMusicResponse.parse(items.map(toMusic)));
});

router.get("/public/videos", async (req, res): Promise<void> => {
  await ensureSeedMedia();
  const query = ListPublicVideosQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const items = await db.select().from(videosTable).orderBy(desc(videosTable.createdAt)).limit(query.data.limit ?? 24);
  res.json(ListPublicVideosResponse.parse(items.map(toVideo)));
});

router.get("/admin/dashboard", async (req, res): Promise<void> => {
  const user = await getAuthedUser(req, res);
  if (!user) {
    return;
  }

  const [totalUsers] = await db.select({ value: count() }).from(usersTable);
  const [totalMusic] = await db.select({ value: count() }).from(musicTable);
  const [totalVideos] = await db.select({ value: count() }).from(videosTable);
  const [featuredMusic] = await db.select({ value: count() }).from(musicTable).where(eq(musicTable.featured, true));
  const [trendingVideos] = await db.select({ value: count() }).from(videosTable).where(eq(videosTable.trending, true));
  const recentActivity = await db.select().from(activityTable).orderBy(desc(activityTable.createdAt)).limit(5);

  res.json(
    GetAdminDashboardResponse.parse({
      totalUsers: Number(totalUsers?.value ?? 0),
      totalMusic: Number(totalMusic?.value ?? 0),
      totalVideos: Number(totalVideos?.value ?? 0),
      featuredMusic: Number(featuredMusic?.value ?? 0),
      trendingVideos: Number(trendingVideos?.value ?? 0),
      recentActivity: recentActivity.map((item) => item.message),
    }),
  );
});

router.get("/admin/settings", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canEditSite");
  if (!user) {
    return;
  }
  const settings = await ensureSettings();
  res.json(GetAdminSettingsResponse.parse(toSettings(settings)));
});

router.patch("/admin/settings", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canEditSite");
  if (!user) {
    return;
  }
  const body = UpdateAdminSettingsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  await ensureSettings();
  const [settings] = await db.update(settingsTable).set(body.data).where(eq(settingsTable.id, 1)).returning();
  await logActivity("Website settings updated");
  res.json(UpdateAdminSettingsResponse.parse(toSettings(settings)));
});

router.get("/admin/music", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canUploadMusic");
  if (!user) {
    return;
  }
  const items = await db.select().from(musicTable).orderBy(desc(musicTable.createdAt));
  res.json(ListAdminMusicResponse.parse(items.map(toMusic)));
});

router.post("/admin/music", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canUploadMusic");
  if (!user) {
    return;
  }
  const body = CreateAdminMusicBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [item] = await db.insert(musicTable).values(body.data).returning();
  await logActivity(`Music added: ${item.title}`);
  res.status(201).json(toMusic(item));
});

router.patch("/admin/music/:id", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canUploadMusic");
  if (!user) {
    return;
  }
  const params = UpdateAdminMusicParams.safeParse(req.params);
  const body = UpdateAdminMusicBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid music update" });
    return;
  }
  const [item] = await db.update(musicTable).set(body.data).where(eq(musicTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Music not found" });
    return;
  }
  await logActivity(`Music updated: ${item.title}`);
  res.json(UpdateAdminMusicResponse.parse(toMusic(item)));
});

router.delete("/admin/music/:id", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canDeleteContent");
  if (!user) {
    return;
  }
  const params = DeleteAdminMusicParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(musicTable).where(eq(musicTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Music not found" });
    return;
  }
  await logActivity(`Music deleted: ${item.title}`);
  res.sendStatus(204);
});

router.get("/admin/videos", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canUploadVideo");
  if (!user) {
    return;
  }
  const items = await db.select().from(videosTable).orderBy(desc(videosTable.createdAt));
  res.json(ListAdminVideosResponse.parse(items.map(toVideo)));
});

router.post("/admin/videos", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canUploadVideo");
  if (!user) {
    return;
  }
  const body = CreateAdminVideoBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [item] = await db.insert(videosTable).values(body.data).returning();
  await logActivity(`Video added: ${item.title}`);
  res.status(201).json(toVideo(item));
});

router.patch("/admin/videos/:id", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canUploadVideo");
  if (!user) {
    return;
  }
  const params = UpdateAdminVideoParams.safeParse(req.params);
  const body = UpdateAdminVideoBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid video update" });
    return;
  }
  const [item] = await db.update(videosTable).set(body.data).where(eq(videosTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  await logActivity(`Video updated: ${item.title}`);
  res.json(UpdateAdminVideoResponse.parse(toVideo(item)));
});

router.delete("/admin/videos/:id", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canDeleteContent");
  if (!user) {
    return;
  }
  const params = DeleteAdminVideoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(videosTable).where(eq(videosTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  await logActivity(`Video deleted: ${item.title}`);
  res.sendStatus(204);
});

router.get("/admin/users", async (req, res): Promise<void> => {
  const user = await requireAdminOrPermission(req, res, "canManageUsers");
  if (!user) {
    return;
  }
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(ListAdminUsersResponse.parse(users.map(toPublicUser)));
});

router.post("/admin/users", async (req, res): Promise<void> => {
  const currentUser = await requireAdminOrPermission(req, res, "canManageUsers");
  if (!currentUser) {
    return;
  }
  const body = CreateAdminUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const passwordHash = await bcrypt.hash(body.data.password, 12);
  const [user] = await db
    .insert(usersTable)
    .values({
      email: body.data.email.toLowerCase(),
      passwordHash,
      role: body.data.role,
      ...body.data.permissions,
    })
    .returning();
  await logActivity(`User created: ${user.email}`);
  res.status(201).json(toPublicUser(user));
});

router.patch("/admin/users/:id", async (req, res): Promise<void> => {
  const currentUser = await requireAdminOrPermission(req, res, "canManageUsers");
  if (!currentUser) {
    return;
  }
  const params = UpdateAdminUserParams.safeParse(req.params);
  const body = UpdateAdminUserBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid user update" });
    return;
  }
  const setValues = {
    ...(body.data.role ? { role: body.data.role } : {}),
    ...(body.data.permissions ?? {}),
  };
  const [user] = await db.update(usersTable).set(setValues).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  await logActivity(`User updated: ${user.email}`);
  res.json(UpdateAdminUserResponse.parse(toPublicUser(user)));
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const currentUser = await requireAdminOrPermission(req, res, "canManageUsers");
  if (!currentUser) {
    return;
  }
  const params = DeleteAdminUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (currentUser.id === params.data.id) {
    res.status(400).json({ error: "You cannot delete your own account" });
    return;
  }
  const [user] = await db.delete(usersTable).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  await logActivity(`User deleted: ${user.email}`);
  res.sendStatus(204);
});

export default router;
