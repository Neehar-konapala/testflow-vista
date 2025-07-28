import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ApiEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
}

interface ApiSidebarProps {
  endpoints: ApiEndpoint[];
  selectedEndpoint: string;
  onSelectEndpoint: (endpointId: string) => void;
}

const methodColors = {
  GET: "bg-green-100 text-green-800 hover:bg-green-200",
  POST: "bg-blue-100 text-blue-800 hover:bg-blue-200", 
  PUT: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  PATCH: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  DELETE: "bg-red-100 text-red-800 hover:bg-red-200"
};

export const ApiSidebar = ({ endpoints, selectedEndpoint, onSelectEndpoint }: ApiSidebarProps) => {
  return (
    <div className="w-80 bg-sidebar-background border-r border-sidebar-border h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">API</span>
          </div>
          <span className="font-semibold text-lg">API Tester</span>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">API Reference</h2>
          {endpoints.map((endpoint) => (
            <button
              key={endpoint.id}
              onClick={() => onSelectEndpoint(endpoint.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors group",
                selectedEndpoint === endpoint.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{endpoint.name}</span>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs font-medium", methodColors[endpoint.method])}
                >
                  {endpoint.method}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{endpoint.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};