import { Router } from "express";
import { db } from "@workspace/db";
import { crakaUsers, crakaReferrals } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CRAKA-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

router.post("/user/init", async (req, res) => {
  try {
    const { sessionId, referralCode: usedReferralCode } = req.body as { sessionId: string; referralCode?: string };
    if (!sessionId) {
      res.status(400).json({ error: "sessionId required" });
      return;
    }

    let user = await db.select().from(crakaUsers).where(eq(crakaUsers.sessionId, sessionId)).then(r => r[0]);

    if (!user) {
      let referralCode = generateReferralCode();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await db.select().from(crakaUsers).where(eq(crakaUsers.referralCode, referralCode)).then(r => r[0]);
        if (!existing) break;
        referralCode = generateReferralCode();
        attempts++;
      }

      let referredBy: string | undefined;
      if (usedReferralCode) {
        const referrer = await db.select().from(crakaUsers).where(eq(crakaUsers.referralCode, usedReferralCode)).then(r => r[0]);
        if (referrer && referrer.sessionId !== sessionId) {
          referredBy = usedReferralCode;
          await db.insert(crakaReferrals).values({
            referrerCode: usedReferralCode,
            referredSessionId: sessionId,
            creditsAwarded: 10,
          });
          await db.update(crakaUsers)
            .set({
              totalReferrals: sql`${crakaUsers.totalReferrals} + 1`,
              creditsEarned: sql`${crakaUsers.creditsEarned} + 10`,
            })
            .where(eq(crakaUsers.referralCode, usedReferralCode));
        }
      }

      const inserted = await db.insert(crakaUsers).values({
        sessionId,
        referralCode,
        referredBy,
        isPremium: false,
        creditsEarned: referredBy ? 5 : 0,
        totalReferrals: 0,
      }).returning();
      user = inserted[0];
    }

    res.json({
      referralCode: user.referralCode,
      isPremium: user.isPremium,
      premiumPlan: user.premiumPlan,
      creditsEarned: user.creditsEarned,
      totalReferrals: user.totalReferrals,
      referredBy: user.referredBy,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user/me", async (req, res) => {
  try {
    const sessionId = req.query["sessionId"] as string;
    if (!sessionId) {
      res.status(400).json({ error: "sessionId required" });
      return;
    }

    const user = await db.select().from(crakaUsers).where(eq(crakaUsers.sessionId, sessionId)).then(r => r[0]);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const referrals = await db.select().from(crakaReferrals).where(eq(crakaReferrals.referrerCode, user.referralCode));

    res.json({
      referralCode: user.referralCode,
      isPremium: user.isPremium,
      premiumPlan: user.premiumPlan,
      creditsEarned: user.creditsEarned,
      totalReferrals: user.totalReferrals,
      referredBy: user.referredBy,
      recentReferrals: referrals.slice(-5).map(r => ({
        date: r.createdAt,
        credits: r.creditsAwarded,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
