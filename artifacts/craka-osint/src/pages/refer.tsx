import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, Users, Star, ExternalLink } from "lucide-react";
import { getOrCreateSession } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface UserData {
  referralCode: string;
  isPremium: boolean;
  premiumPlan?: string | null;
  creditsEarned: number;
  totalReferrals: number;
  referredBy?: string | null;
  recentReferrals?: Array<{ date: string; credits: number }>;
}

export default function Refer() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const initUser = useCallback(async () => {
    const sessionId = getOrCreateSession();
    try {
      const res = await fetch(`${API_BASE}/api/user/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      setUserData(data);
    } catch {}
  }, []);

  useEffect(() => { initUser(); }, [initUser]);

  const handleCopy = () => {
    if (!userData?.referralCode) return;
    const link = `${window.location.origin}/?ref=${userData.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!userData?.referralCode) return;
    const link = `${window.location.origin}/?ref=${userData.referralCode}`;
    const msg = `Bhai/Behen, yeh free OSINT tool try karo! Phone, Aadhaar, Vehicle sab check hota hai.\n\nLink: ${link}\n\nMere referral code se join karo aur dono ko free credits milenge!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-400 flex items-center gap-3">
            <Gift className="w-7 h-7 sm:w-8 sm:h-8" />
            Refer & Earn
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Dosto ko refer karo aur free credits kamao!
          </p>
        </header>

        {userData ? (
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Total Referrals", value: userData.totalReferrals, icon: Users, color: "text-primary" },
                { label: "Credits Earned", value: userData.creditsEarned, icon: Star, color: "text-yellow-400" },
                { label: "Status", value: userData.isPremium ? (userData.premiumPlan || "Premium") : "Free", icon: Gift, color: userData.isPremium ? "text-yellow-400" : "text-muted-foreground" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground mb-1 uppercase">{label}</p>
                        <h3 className={`text-xl font-bold ${color}`}>{value}</h3>
                      </div>
                      <Icon className={`w-5 h-5 ${color} opacity-50 flex-shrink-0 mt-1`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="border-b border-border bg-black/30 px-4 py-4">
                <CardTitle className="text-base text-green-400">Your Referral Code</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Yeh code share karo — dono ko 5-10 free credits milenge!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-black/40 border border-green-500/20 rounded-lg">
                  <code className="flex-1 font-mono text-green-400 font-bold text-lg tracking-widest">
                    {userData.referralCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share on WhatsApp
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Copy Link
                  </button>
                </div>

                <div className="bg-black/20 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                  <p><span className="text-green-400 font-semibold">You earn:</span> 10 credits per referral</p>
                  <p><span className="text-primary font-semibold">Your friend earns:</span> 5 credits on join</p>
                  <p><span className="text-yellow-400 font-semibold">Premium bonus:</span> Pro = 2x, Elite = 3x credits</p>
                </div>
              </CardContent>
            </Card>

            {userData.recentReferrals && userData.recentReferrals.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader className="border-b border-border bg-black/30 px-4 py-3">
                  <CardTitle className="text-base font-mono">Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {userData.recentReferrals.map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">
                        {new Date(r.date).toLocaleDateString("en-IN")}
                      </span>
                      <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">
                        +{r.credits} credits
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </Layout>
  );
}
