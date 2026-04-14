import { Router } from "express";
import { db, osintApis, osintHistory, osintCache, crakaUsers } from "@workspace/db";
import { eq, sql, desc, not } from "drizzle-orm";

const router = Router();

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "craka@admin123";

function adminAuth(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  if (token !== Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString("base64")) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  next();
}

router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString("base64");
    res.json({ success: true, token, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

router.get("/admin/apis", adminAuth, async (req, res) => {
  const apis = await db.select().from(osintApis).orderBy(osintApis.id);
  res.json(apis.map(a => ({
    id: a.id, slug: a.slug, name: a.name, url: a.url, command: a.command,
    example: a.example, pattern: a.pattern, category: a.category, credits: a.credits,
    isActive: a.isActive, createdAt: a.createdAt.toISOString(),
  })));
});

router.post("/admin/apis", adminAuth, async (req, res) => {
  const { slug, name, url, command, example, pattern, category, credits, isActive } = req.body;
  const [created] = await db.insert(osintApis).values({
    slug, name, url, command, example, pattern: pattern || null,
    category: category || "Miscellaneous", credits: credits ?? 1, isActive: isActive ?? true,
  }).returning();
  res.status(201).json({
    id: created.id, slug: created.slug, name: created.name, url: created.url, command: created.command,
    example: created.example, pattern: created.pattern, category: created.category, credits: created.credits,
    isActive: created.isActive, createdAt: created.createdAt.toISOString(),
  });
});

router.put("/admin/apis/:slug", adminAuth, async (req, res) => {
  const { slug } = req.params;
  const { name, url, command, example, pattern, category, credits, isActive } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (url !== undefined) updates.url = url;
  if (command !== undefined) updates.command = command;
  if (example !== undefined) updates.example = example;
  if (pattern !== undefined) updates.pattern = pattern;
  if (category !== undefined) updates.category = category;
  if (credits !== undefined) updates.credits = credits;
  if (isActive !== undefined) updates.isActive = isActive;

  const [updated] = await db.update(osintApis).set(updates).where(eq(osintApis.slug, slug)).returning();
  if (!updated) {
    res.status(404).json({ error: "API not found" });
    return;
  }
  res.json({
    id: updated.id, slug: updated.slug, name: updated.name, url: updated.url, command: updated.command,
    example: updated.example, pattern: updated.pattern, category: updated.category, credits: updated.credits,
    isActive: updated.isActive, createdAt: updated.createdAt.toISOString(),
  });
});

router.delete("/admin/apis/:slug", adminAuth, async (req, res) => {
  const { slug } = req.params;
  await db.delete(osintApis).where(eq(osintApis.slug, slug));
  res.json({ success: true, message: "API deleted" });
});

router.get("/admin/history", adminAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const offset = (page - 1) * limit;

  const [entries, totalResult] = await Promise.all([
    db.select().from(osintHistory).orderBy(desc(osintHistory.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(osintHistory),
  ]);

  res.json({
    entries: entries.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })),
    total: Number(totalResult[0].count),
    page,
    limit,
  });
});

router.get("/admin/stats", adminAuth, async (req, res) => {
  const [totalResult, successResult, activeApisResult, totalApisResult, cacheResult, totalUsersResult, premiumUsersResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(osintHistory),
    db.select({ count: sql<number>`count(*)` }).from(osintHistory).where(eq(osintHistory.success, true)),
    db.select({ count: sql<number>`count(*)` }).from(osintApis).where(eq(osintApis.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(osintApis),
    db.select({ count: sql<number>`count(*)` }).from(osintCache),
    db.select({ count: sql<number>`count(*)` }).from(crakaUsers),
    db.select({ count: sql<number>`count(*)` }).from(crakaUsers).where(eq(crakaUsers.isPremium, true)),
  ]);

  const categoryBreakdown = await db.select({
    category: osintApis.category,
    count: sql<number>`count(${osintHistory.id})`,
  }).from(osintHistory).leftJoin(osintApis, eq(osintHistory.slug, osintApis.slug)).groupBy(osintApis.category);

  const topApis = await db.select({
    apiName: osintHistory.apiName,
    count: sql<number>`count(*)`,
  }).from(osintHistory).groupBy(osintHistory.apiName).orderBy(desc(sql`count(*)`)).limit(10);

  const recentActivity = await db.select().from(osintHistory).orderBy(desc(osintHistory.createdAt)).limit(10);

  const totalLookups = Number(totalResult[0].count);
  const successfulLookups = Number(successResult[0].count);

  res.json({
    totalLookups,
    successfulLookups,
    failedLookups: totalLookups - successfulLookups,
    activeApis: Number(activeApisResult[0].count),
    totalApis: Number(totalApisResult[0].count),
    cachedResults: Number(cacheResult[0].count),
    totalUsers: Number(totalUsersResult[0].count),
    premiumUsers: Number(premiumUsersResult[0].count),
    categoryBreakdown: categoryBreakdown.map(r => ({ category: r.category ?? "Unknown", count: Number(r.count) })),
    topApis: topApis.map(r => ({ apiName: r.apiName, count: Number(r.count) })),
    recentActivity: recentActivity.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })),
  });
});

router.delete("/admin/cache", adminAuth, async (req, res) => {
  await db.delete(osintCache);
  res.json({ success: true, message: "Cache cleared successfully" });
});

router.post("/admin/grant-premium", adminAuth, async (req, res) => {
  const { referralCode: code, plan } = req.body as { referralCode: string; plan: string };
  const user = await db.select().from(crakaUsers).where(eq(crakaUsers.referralCode, code)).then(r => r[0]);
  if (!user) {
    res.status(404).json({ error: "User not found with that ID" });
    return;
  }
  await db.update(crakaUsers).set({ isPremium: true, premiumPlan: plan }).where(eq(crakaUsers.referralCode, code));
  res.json({ success: true, message: `Premium (${plan}) granted to user ${code}` });
});

router.post("/admin/revoke-premium", adminAuth, async (req, res) => {
  const { referralCode: code } = req.body as { referralCode: string };
  const user = await db.select().from(crakaUsers).where(eq(crakaUsers.referralCode, code)).then(r => r[0]);
  if (!user) {
    res.status(404).json({ error: "User not found with that ID" });
    return;
  }
  await db.update(crakaUsers).set({ isPremium: false, premiumPlan: null }).where(eq(crakaUsers.referralCode, code));
  res.json({ success: true, message: `Premium revoked from user ${code}` });
});

router.get("/admin/users", adminAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const offset = (page - 1) * limit;

  const [users, totalResult] = await Promise.all([
    db.select().from(crakaUsers).orderBy(desc(crakaUsers.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(crakaUsers),
  ]);

  res.json({
    users: users.map(u => ({
      referralCode: u.referralCode,
      isPremium: u.isPremium,
      premiumPlan: u.premiumPlan,
      totalReferrals: u.totalReferrals,
      creditsEarned: u.creditsEarned,
      createdAt: u.createdAt.toISOString(),
    })),
    total: Number(totalResult[0].count),
    page,
    limit,
  });
});

export default router;
