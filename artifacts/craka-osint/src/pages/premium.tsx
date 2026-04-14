import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Crown, Zap, Shield, Check, Users, Clock, Copy } from "lucide-react";
import { useLocation } from "wouter";
import { getOrCreateSession } from "@/lib/utils";

const WA_NUMBER = "917571083385";
const TELEGRAM = "DM_CRAKA_OWNER_BOT";
const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const WA_ICON = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TG_ICON = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const PLANS = [
  {
    name: "Basic",
    price: "99",
    period: "/month",
    badge: null,
    colorClass: "from-cyan-500/10 to-cyan-500/5",
    borderClass: "border-cyan-500/30",
    accentClass: "text-cyan-400",
    glowClass: "shadow-[0_0_20px_rgba(6,182,212,0.1)]",
    btnClass: "from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white",
    features: ["500 lookups / day", "All 19 OSINT tools", "30 min result caching", "Export as TXT", "WhatsApp sharing", "Hindi translation"],
  },
  {
    name: "Pro",
    price: "199",
    period: "/month",
    badge: "MOST POPULAR",
    colorClass: "from-yellow-400/15 to-yellow-400/5",
    borderClass: "border-yellow-400/50",
    accentClass: "text-yellow-400",
    glowClass: "shadow-[0_0_30px_rgba(250,204,21,0.2)]",
    btnClass: "from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]",
    features: ["2000 lookups / day", "All 19 OSINT tools", "Priority API (faster)", "Bulk search (up to 50)", "10 min cache refresh", "PDF export", "Refer & earn 2x credits", "WhatsApp bot access"],
  },
  {
    name: "Elite",
    price: "499",
    period: "/month",
    badge: "UNLIMITED",
    colorClass: "from-purple-500/15 to-purple-500/5",
    borderClass: "border-purple-500/50",
    accentClass: "text-purple-400",
    glowClass: "shadow-[0_0_30px_rgba(168,85,247,0.2)]",
    btnClass: "from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white",
    features: ["Unlimited lookups", "All tools + beta tools", "Dedicated API access", "Bulk search unlimited", "Instant cache", "All export formats", "Refer & earn 3x credits", "Private Telegram bot", "Priority support 24/7"],
  },
];

const FEATURES = [
  { icon: Zap, title: "Lightning Fast", desc: "Priority API access with no rate limiting" },
  { icon: Shield, title: "Secure & Private", desc: "Queries never stored after session ends" },
  { icon: Users, title: "Refer & Earn", desc: "Earn free credits by referring friends" },
  { icon: Clock, title: "Always Available", desc: "99.9% uptime with cached results" },
];

export default function Premium() {
  const [, navigate] = useLocation();
  const [userCode, setUserCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const initUser = useCallback(async () => {
    const sessionId = getOrCreateSession();
    try {
      const res = await fetch(`${API_BASE}/api/user/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.referralCode) setUserCode(data.referralCode);
    } catch {}
  }, []);

  useEffect(() => { initUser(); }, [initUser]);

  const buildMsg = (planName: string, price: string) => {
    const idLine = userCode ? `\nMera User ID: *${userCode}*` : "";
    return `Hi! CraKa OSINT *${planName} Plan (₹${price}/month)* lena chahta/chahti hoon.${idLine}\nPlease payment details batao.`;
  };

  const handleWhatsApp = (planName: string, price: string) => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildMsg(planName, price))}`, "_blank");
  };

  const handleTelegram = (planName: string, price: string) => {
    window.open(`https://t.me/${TELEGRAM}?text=${encodeURIComponent(buildMsg(planName, price))}`, "_blank");
  };

  const handleCopyId = () => {
    if (!userCode) return;
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
            <Crown className="w-3.5 h-3.5" />
            Premium Membership
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">
            Unlock the Full{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400">
              CraKa OSINT
            </span>{" "}
            Power
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Get unlimited lookups, priority access, and exclusive tools.
            Contact via <span className="text-green-400 font-semibold">WhatsApp</span> or{" "}
            <span className="text-[#229ED9] font-semibold">Telegram</span> — instant activation.
          </p>
        </div>

        {userCode && (
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 text-sm">
              <span className="text-muted-foreground">Your User ID:</span>
              <span className="font-mono font-bold text-primary">{userCode}</span>
              <button onClick={handleCopyId} className="text-muted-foreground hover:text-primary transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-gradient-to-b ${plan.colorClass} ${plan.borderClass} ${plan.glowClass} p-5 sm:p-6 flex flex-col transition-all duration-300 hover:scale-[1.02]`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-0.5 rounded-full border ${
                  plan.badge === "MOST POPULAR"
                    ? "bg-yellow-400 text-black border-yellow-300"
                    : "bg-purple-500 text-white border-purple-400"
                } uppercase tracking-widest whitespace-nowrap`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-5">
                <div className={`text-sm font-bold uppercase tracking-widest ${plan.accentClass} mb-1`}>{plan.name}</div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-foreground">₹{plan.price}</span>
                  <span className="text-sm text-muted-foreground mb-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.accentClass}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <button
                  onClick={() => handleWhatsApp(plan.name, plan.price)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 bg-gradient-to-r ${plan.btnClass}`}
                >
                  {WA_ICON}
                  WhatsApp
                </button>
                <button
                  onClick={() => handleTelegram(plan.name, plan.price)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 bg-[#229ED9]/20 border border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9]/30"
                >
                  {TG_ICON}
                  Telegram
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-4 text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="font-bold text-sm text-foreground">{title}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/refer")}
            className="text-sm text-primary hover:underline"
          >
            Refer friends and earn free Premium credits →
          </button>
        </div>
      </div>
    </Layout>
  );
}
