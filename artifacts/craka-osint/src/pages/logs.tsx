import { useState } from "react";
import { useGetHistory } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, ChevronLeft, ChevronRight } from "lucide-react";

export default function Logs() {
  const [page, setPage] = useState(1);
  const limit = 30;
  const { data, isLoading } = useGetHistory({ limit, page });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-3">
            <History className="w-7 h-7 sm:w-8 sm:h-8" />
            Execution Logs
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Recent query history. Total: {data?.total ?? 0} entries.
          </p>
        </header>

        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="bg-black/40 border-b border-border px-4 py-3">
            <CardTitle className="text-base font-mono">Query History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data?.entries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No queries yet. Start a lookup from the Terminal.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data?.entries.map((entry) => (
                  <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:px-4 hover:bg-muted/20 transition-colors">
                    <div className="text-[11px] font-mono text-muted-foreground flex-shrink-0">
                      {new Date(entry.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-medium text-sm text-primary truncate">{entry.apiName}</span>
                      <span className="text-muted-foreground/60 text-xs hidden sm:inline">›</span>
                      <span className="font-mono text-sm text-foreground truncate">{entry.queryVal}</span>
                    </div>
                    <div className="flex-shrink-0">
                      {entry.success ? (
                        <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10 text-[10px]">OK</Badge>
                      ) : (
                        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px]">FAIL</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground font-mono">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="border-border"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
