import { useGetStats } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart2, Activity, CheckCircle2, Database, Cpu } from "lucide-react";

export default function Stats() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const successRate = stats?.totalLookups
    ? Math.round((stats.successfulLookups / stats.totalLookups) * 100)
    : 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-3">
            <BarChart2 className="w-7 h-7 sm:w-8 sm:h-8" />
            Statistics
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Portal usage and performance metrics.</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Lookups", value: stats?.totalLookups ?? 0, icon: Activity, color: "text-primary" },
            { label: "Successful", value: stats?.successfulLookups ?? 0, icon: CheckCircle2, color: "text-green-400" },
            { label: "Active APIs", value: stats?.activeApis ?? 0, icon: Cpu, color: "text-secondary" },
            { label: "Cached Results", value: stats?.cachedResults ?? 0, icon: Database, color: "text-yellow-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">{label}</p>
                    <h3 className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</h3>
                  </div>
                  <Icon className={`w-5 h-5 ${color} opacity-50 flex-shrink-0 mt-1`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border bg-black/30 px-4 py-3">
              <CardTitle className="text-base font-mono">Success Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-primary">{successRate}%</div>
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${successRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats?.successfulLookups ?? 0} / {stats?.totalLookups ?? 0} queries succeeded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border bg-black/30 px-4 py-3">
              <CardTitle className="text-base font-mono">Top APIs</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {stats?.topApis.slice(0, 5).map((api, i) => (
                <div key={api.apiName} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                  <span className="flex-1 text-sm text-foreground truncate">{api.apiName}</span>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary/80">{api.count}</Badge>
                </div>
              ))}
              {(!stats?.topApis || stats.topApis.length === 0) && (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {stats && stats.categoryBreakdown.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border bg-black/30 px-4 py-3">
              <CardTitle className="text-base font-mono">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {stats.categoryBreakdown
                  .filter(c => c.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map(cat => {
                    const max = Math.max(...stats.categoryBreakdown.map(c => c.count));
                    const pct = max > 0 ? Math.round((cat.count / max) * 100) : 0;
                    return (
                      <div key={cat.category} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20 truncate">{cat.category}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/70 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-8 text-right">{cat.count}</span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border bg-black/30 px-4 py-3">
              <CardTitle className="text-base font-mono">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {stats.recentActivity.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${entry.success ? "bg-green-400" : "bg-destructive"}`} />
                    <span className="text-sm text-foreground flex-1 truncate">{entry.apiName}</span>
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[100px]">{entry.queryVal}</span>
                    <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
                      {new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
