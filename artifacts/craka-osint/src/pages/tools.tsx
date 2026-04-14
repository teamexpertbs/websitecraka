import { useListApis } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, ExternalLink } from "lucide-react";
import { useNavigate } from "wouter";

const CATEGORY_COLORS: Record<string, string> = {
  Phone: "border-cyan-500/30 text-cyan-400",
  Identity: "border-purple-500/30 text-purple-400",
  Vehicle: "border-orange-500/30 text-orange-400",
  Banking: "border-yellow-500/30 text-yellow-400",
  Location: "border-green-500/30 text-green-400",
  Network: "border-blue-500/30 text-blue-400",
  Email: "border-pink-500/30 text-pink-400",
  Social: "border-indigo-500/30 text-indigo-400",
  Gaming: "border-red-500/30 text-red-400",
};

export default function Tools() {
  const { data: apis = [], isLoading } = useListApis();

  const grouped = apis.reduce<Record<string, typeof apis>>((acc, api) => {
    if (!acc[api.category]) acc[api.category] = [];
    acc[api.category].push(api);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-3">
            <Wrench className="w-7 h-7 sm:w-8 sm:h-8" />
            Tools Directory
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            All {apis.length} available OSINT vectors, grouped by category.
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          Object.entries(grouped).map(([category, categoryApis]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className={`text-sm font-bold uppercase tracking-widest font-mono ${(CATEGORY_COLORS[category] || "text-muted-foreground").split(" ").find(c => c.startsWith("text-"))}`}>
                  {category}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{categoryApis.length} tools</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryApis.map(api => (
                  <a key={api.id} href="/" onClick={(e) => { e.preventDefault(); window.location.href = "/"; }}>
                    <Card className="bg-card border-border hover:border-primary/40 transition-all duration-200 cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="font-bold text-sm text-foreground">{api.name}</div>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        </div>
                        <div className="font-mono text-xs text-primary/70 mb-3">{api.command}</div>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-4 py-0 ${CATEGORY_COLORS[category] || "border-border text-muted-foreground"}`}
                          >
                            {api.category}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Ex: {api.example}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
