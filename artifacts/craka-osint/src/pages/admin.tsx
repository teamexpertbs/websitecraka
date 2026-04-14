import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuthStore } from "@/lib/auth";
import {
  Shield, Eye, EyeOff, ChevronLeft, ChevronRight, RefreshCw,
  Crown, Trash2, Plus, Settings, ToggleLeft, ToggleRight, Users, LogIn
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function useAdminFetch<T>(path: string, token: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = async (params?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api${path}${params || ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      setData(json);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetch_ };
}

async function adminPost(path: string, token: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error");
  return json;
}

async function adminPut(path: string, token: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error");
  return json;
}

async function adminDel(path: string, token: string) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error");
  return json;
}

interface ApiRow {
  id: number; slug: string; name: string; url: string; command: string;
  example: string; pattern?: string | null; category: string; credits: number;
  isActive: boolean; createdAt: string;
}

interface UserRow {
  referralCode: string; isPremium: boolean; premiumPlan?: string | null;
  totalReferrals: number; creditsEarned: number; createdAt: string;
}

interface StatsData {
  totalLookups: number; successfulLookups: number; failedLookups: number;
  activeApis: number; totalApis: number; cachedResults: number;
  totalUsers: number; premiumUsers: number;
}

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Invalid credentials");
      toast({ title: "Access Granted", description: "Welcome, Admin." });
      onLogin(data.token);
    } catch (e: unknown) {
      toast({ title: "Access Denied", description: e instanceof Error ? e.message : "Auth failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <Card className="border-primary/30 shadow-[0_0_30px_rgba(0,217,255,0.08)] bg-card">
        <CardHeader className="border-b border-border bg-black/40 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base text-primary">Admin Access</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Secure authentication required</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <Input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="bg-black/50 border-border focus-visible:ring-primary font-mono"
            autoComplete="username"
          />
          <div className="relative">
            <Input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="bg-black/50 border-border focus-visible:ring-primary pr-10 font-mono"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-widest"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2"><LogIn className="w-4 h-4" />AUTHENTICATE</span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const { token, setToken } = useAuthStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<"stats" | "apis" | "users" | "history">("stats");
  const [apisPage, setApisPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [histPage, setHistPage] = useState(1);

  const statsApi = useAdminFetch<StatsData>("/admin/stats", token);
  const apisApi = useAdminFetch<ApiRow[]>("/admin/apis", token);
  const usersApi = useAdminFetch<{ users: UserRow[]; total: number; page: number; limit: number }>("/admin/users", token);
  const histApi = useAdminFetch<{
    entries: Array<{ id: number; slug: string; apiName: string; queryVal: string; success: boolean; createdAt: string }>;
    total: number; page: number; limit: number;
  }>("/admin/history", token);

  const [showAddApi, setShowAddApi] = useState(false);
  const [newApi, setNewApi] = useState({ slug: "", name: "", url: "", command: "", example: "", pattern: "", category: "" });
  const [grantCode, setGrantCode] = useState("");
  const [grantPlan, setGrantPlan] = useState("Basic");
  const [revokeCode, setRevokeCode] = useState("");

  if (!token) {
    return (
      <Layout>
        <LoginForm onLogin={setToken} />
      </Layout>
    );
  }

  const loadTab = (t: typeof tab) => {
    setTab(t);
    if (t === "stats") statsApi.refetch();
    if (t === "apis") apisApi.refetch();
    if (t === "users") usersApi.refetch(`?page=${usersPage}&limit=20`);
    if (t === "history") histApi.refetch(`?page=${histPage}&limit=50`);
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/cache`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      toast({ title: "Cache Cleared", description: data.message });
      statsApi.refetch();
    } catch {
      toast({ title: "Error", description: "Failed to clear cache", variant: "destructive" });
    }
  };

  const handleToggleApi = async (slug: string, current: boolean) => {
    try {
      await adminPut(`/admin/apis/${slug}`, token, { isActive: !current });
      toast({ title: "Updated", description: `API ${!current ? "activated" : "deactivated"}` });
      apisApi.refetch();
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" });
    }
  };

  const handleDeleteApi = async (slug: string) => {
    try {
      await adminDel(`/admin/apis/${slug}`, token);
      toast({ title: "Deleted", description: `API ${slug} removed` });
      apisApi.refetch();
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" });
    }
  };

  const handleAddApi = async () => {
    try {
      await adminPost("/admin/apis", token, { ...newApi, pattern: newApi.pattern || null, credits: 1, isActive: true });
      toast({ title: "API Added" });
      setShowAddApi(false);
      setNewApi({ slug: "", name: "", url: "", command: "", example: "", pattern: "", category: "" });
      apisApi.refetch();
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" });
    }
  };

  const handleGrantPremium = async () => {
    try {
      await adminPost("/admin/grant-premium", token, { referralCode: grantCode, plan: grantPlan });
      toast({ title: "Premium Granted", description: `${grantPlan} granted to ${grantCode}` });
      setGrantCode("");
      usersApi.refetch(`?page=1&limit=20`);
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "User not found", variant: "destructive" });
    }
  };

  const handleRevokePremium = async () => {
    try {
      await adminPost("/admin/revoke-premium", token, { referralCode: revokeCode });
      toast({ title: "Premium Revoked", description: `Premium removed from ${revokeCode}` });
      setRevokeCode("");
      usersApi.refetch(`?page=1&limit=20`);
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "User not found", variant: "destructive" });
    }
  };

  const TABS: Array<{ key: typeof tab; label: string }> = [
    { key: "stats", label: "Stats" },
    { key: "apis", label: "APIs" },
    { key: "users", label: "Users" },
    { key: "history", label: "History" },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-5">
        <header className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-3">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
            Admin Panel
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setToken(null)}
            className="text-muted-foreground hover:text-destructive text-xs border border-border"
          >
            Logout
          </Button>
        </header>

        <div className="flex gap-2 flex-wrap border-b border-border pb-0 mb-5">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => loadTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "stats" && (
          <div className="space-y-4">
            {!statsApi.data && (
              <div className="flex justify-center py-8">
                <Button onClick={() => statsApi.refetch()} className="bg-primary text-primary-foreground">
                  Load Stats
                </Button>
              </div>
            )}
            {statsApi.loading && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {statsApi.data && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total Lookups", value: statsApi.data.totalLookups, color: "text-primary" },
                    { label: "Successful", value: statsApi.data.successfulLookups, color: "text-green-400" },
                    { label: "Total Users", value: statsApi.data.totalUsers, color: "text-secondary" },
                    { label: "Premium Users", value: statsApi.data.premiumUsers, color: "text-yellow-400" },
                    { label: "Active APIs", value: statsApi.data.activeApis, color: "text-cyan-400" },
                    { label: "Total APIs", value: statsApi.data.totalApis, color: "text-muted-foreground" },
                    { label: "Cached Results", value: statsApi.data.cachedResults, color: "text-blue-400" },
                    { label: "Failed", value: statsApi.data.failedLookups, color: "text-destructive" },
                  ].map(({ label, value, color }) => (
                    <Card key={label} className="bg-card border-border">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-[10px] sm:text-xs font-mono text-muted-foreground mb-1 uppercase truncate">{label}</div>
                        <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => statsApi.refetch()} variant="outline" size="sm" className="border-border">
                    <RefreshCw className="w-4 h-4 mr-2" />Refresh
                  </Button>
                  <Button onClick={handleClearCache} variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" />Clear Cache
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "apis" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => apisApi.refetch()} variant="outline" size="sm" className="border-border">
                <RefreshCw className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button onClick={() => setShowAddApi(!showAddApi)} size="sm" className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Add API</span>
              </Button>
            </div>

            {showAddApi && (
              <Card className="border-primary/30 bg-card">
                <CardHeader className="border-b border-border px-4 py-3">
                  <CardTitle className="text-sm text-primary">Add New API</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(["slug", "name", "url", "command", "example", "category"] as const).map(field => (
                      <Input
                        key={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={newApi[field]}
                        onChange={e => setNewApi(prev => ({ ...prev, [field]: e.target.value }))}
                        className="bg-black/50 border-border focus-visible:ring-primary text-sm"
                      />
                    ))}
                    <Input
                      placeholder="Pattern (regex, optional)"
                      value={newApi.pattern}
                      onChange={e => setNewApi(prev => ({ ...prev, pattern: e.target.value }))}
                      className="bg-black/50 border-border focus-visible:ring-primary text-sm sm:col-span-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddApi} size="sm" className="bg-primary text-primary-foreground">Add</Button>
                    <Button onClick={() => setShowAddApi(false)} variant="outline" size="sm" className="border-border">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {apisApi.loading && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!apisApi.data && !apisApi.loading && (
              <div className="text-center py-8">
                <Button onClick={() => apisApi.refetch()} className="bg-primary text-primary-foreground">Load APIs</Button>
              </div>
            )}

            {apisApi.data && (
              <div className="space-y-2">
                {apisApi.data.map(api => (
                  <div key={api.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-card border border-border rounded-md hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleApi(api.slug, api.isActive)}
                        className={`flex-shrink-0 ${api.isActive ? "text-green-400" : "text-muted-foreground"}`}
                        title={api.isActive ? "Deactivate" : "Activate"}
                      >
                        {api.isActive
                          ? <ToggleRight className="w-6 h-6" />
                          : <ToggleLeft className="w-6 h-6" />
                        }
                      </button>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">{api.name}</div>
                        <div className="text-xs text-muted-foreground font-mono truncate">{api.slug}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary/70 hidden sm:inline-flex">{api.category}</Badge>
                      {!api.isActive && (
                        <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive/70">Inactive</Badge>
                      )}
                      <button
                        onClick={() => handleDeleteApi(api.slug)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="px-4 py-3 border-b border-border bg-black/30">
                  <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                    <Crown className="w-4 h-4" />Grant Premium
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="User Referral Code (e.g. CRAKA-ABCD12)"
                    value={grantCode}
                    onChange={e => setGrantCode(e.target.value.toUpperCase())}
                    className="bg-black/50 border-border focus-visible:ring-primary font-mono text-sm"
                  />
                  <select
                    value={grantPlan}
                    onChange={e => setGrantPlan(e.target.value)}
                    className="w-full bg-black/50 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Basic">Basic (₹99)</option>
                    <option value="Pro">Pro (₹199)</option>
                    <option value="Elite">Elite (₹499)</option>
                  </select>
                  <Button onClick={handleGrantPremium} disabled={!grantCode} className="w-full bg-green-600 hover:bg-green-500 text-white text-sm">
                    <Crown className="w-4 h-4 mr-2" />Grant Premium
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="px-4 py-3 border-b border-border bg-black/30">
                  <CardTitle className="text-sm text-destructive flex items-center gap-2">
                    <Shield className="w-4 h-4" />Revoke Premium
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="User Referral Code"
                    value={revokeCode}
                    onChange={e => setRevokeCode(e.target.value.toUpperCase())}
                    className="bg-black/50 border-border focus-visible:ring-primary font-mono text-sm"
                  />
                  <Button onClick={handleRevokePremium} disabled={!revokeCode} className="w-full bg-destructive/80 hover:bg-destructive text-white text-sm">
                    <Trash2 className="w-4 h-4 mr-2" />Revoke Premium
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => { usersApi.refetch(`?page=${usersPage}&limit=20`); }}
                variant="outline" size="sm" className="border-border"
              >
                <Users className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Load Users</span>
              </Button>
            </div>

            {usersApi.loading && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {usersApi.data && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-mono">
                  {usersApi.data.total} users total
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 pr-4 text-xs text-muted-foreground font-mono uppercase">Referral Code</th>
                        <th className="pb-2 pr-4 text-xs text-muted-foreground font-mono uppercase">Status</th>
                        <th className="pb-2 pr-4 text-xs text-muted-foreground font-mono uppercase">Plan</th>
                        <th className="pb-2 pr-4 text-xs text-muted-foreground font-mono uppercase">Referrals</th>
                        <th className="pb-2 text-xs text-muted-foreground font-mono uppercase">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersApi.data.users.map(user => (
                        <tr key={user.referralCode} className="border-b border-border/30 hover:bg-muted/10">
                          <td className="py-2.5 pr-4 font-mono text-primary text-xs">{user.referralCode}</td>
                          <td className="py-2.5 pr-4">
                            {user.isPremium ? (
                              <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-400/10 text-[10px]">
                                <Crown className="w-2.5 h-2.5 mr-1" />Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">Free</Badge>
                            )}
                          </td>
                          <td className="py-2.5 pr-4 text-xs text-muted-foreground">{user.premiumPlan || "—"}</td>
                          <td className="py-2.5 pr-4 text-xs font-mono text-center">{user.totalReferrals}</td>
                          <td className="py-2.5 text-xs font-mono text-center text-yellow-400">{user.creditsEarned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {usersApi.data.total > 20 && (
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline" size="sm" disabled={usersPage <= 1} className="border-border"
                      onClick={() => { setUsersPage(p => p - 1); usersApi.refetch(`?page=${usersPage - 1}&limit=20`); }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground font-mono">{usersPage}</span>
                    <Button
                      variant="outline" size="sm" disabled={usersPage * 20 >= usersApi.data.total} className="border-border"
                      onClick={() => { setUsersPage(p => p + 1); usersApi.refetch(`?page=${usersPage + 1}&limit=20`); }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => histApi.refetch(`?page=${histPage}&limit=50`)} variant="outline" size="sm" className="border-border">
                <RefreshCw className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Load History</span>
              </Button>
            </div>

            {histApi.loading && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!histApi.data && !histApi.loading && (
              <div className="text-center py-8">
                <Button onClick={() => histApi.refetch(`?page=1&limit=50`)} className="bg-primary text-primary-foreground">
                  Load History
                </Button>
              </div>
            )}

            {histApi.data && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-mono">{histApi.data.total} entries total</div>
                <div className="divide-y divide-border border border-border rounded-md overflow-hidden">
                  {histApi.data.entries.map(entry => (
                    <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-2 hover:bg-muted/10 transition-colors">
                      <span className="text-[10px] font-mono text-muted-foreground/60 flex-shrink-0">
                        {new Date(entry.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      <span className="text-sm text-primary font-medium flex-shrink-0">{entry.apiName}</span>
                      <span className="font-mono text-xs text-foreground flex-1 truncate">{entry.queryVal}</span>
                      {entry.success ? (
                        <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10 text-[10px] flex-shrink-0">OK</Badge>
                      ) : (
                        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px] flex-shrink-0">FAIL</Badge>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline" size="sm" disabled={histPage <= 1} className="border-border"
                    onClick={() => { setHistPage(p => p - 1); histApi.refetch(`?page=${histPage - 1}&limit=50`); }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground font-mono">{histPage} / {Math.ceil(histApi.data.total / 50)}</span>
                  <Button
                    variant="outline" size="sm" disabled={histPage * 50 >= histApi.data.total} className="border-border"
                    onClick={() => { setHistPage(p => p + 1); histApi.refetch(`?page=${histPage + 1}&limit=50`); }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
