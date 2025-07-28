import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ApiEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  parameters: Parameter[];
  bodySchema?: string;
  codeExample: string;
}

interface ApiTestPanelProps {
  endpoint: ApiEndpoint;
}

const methodColors = {
  GET: "bg-green-100 text-green-800",
  POST: "bg-blue-100 text-blue-800", 
  PUT: "bg-orange-100 text-orange-800",
  PATCH: "bg-yellow-100 text-yellow-800",
  DELETE: "bg-red-100 text-red-800"
};

export const ApiTestPanel = ({ endpoint }: ApiTestPanelProps) => {
  const [authToken, setAuthToken] = useState("");
  const [requestBody, setRequestBody] = useState(endpoint.bodySchema || "");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTryIt = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResponse(`{
  "status": "success",
  "data": {
    "message": "API call completed successfully",
    "timestamp": "${new Date().toISOString()}"
  }
}`);
      setIsLoading(false);
      toast({
        title: "Request sent",
        description: "API call completed successfully",
      });
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  return (
    <div className="flex-1 flex">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Badge className={methodColors[endpoint.method]}>
                  {endpoint.method}
                </Badge>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {endpoint.path}
                </code>
              </div>
              <Button 
                onClick={handleTryIt}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Try it
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">{endpoint.name}</h1>
            <p className="text-muted-foreground">{endpoint.description}</p>
          </div>

          {/* Authorization */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Authorization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="auth-token">
                    Authorization <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="auth-token"
                    placeholder="enter your API key"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Bearer authentication header of the form Bearer &lt;token&gt;, where &lt;token&gt; is your auth token.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parameters */}
          {endpoint.parameters.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoint.parameters.map((param) => (
                    <div key={param.name}>
                      <Label htmlFor={param.name}>
                        {param.name} {param.required && <span className="text-red-500">*</span>}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {param.type}
                        </Badge>
                      </Label>
                      <Input
                        id={param.name}
                        placeholder={param.description}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Request Body */}
          {endpoint.method !== "GET" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Body</CardTitle>
                <div className="text-sm text-muted-foreground">application/json</div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder="Enter JSON request body..."
                  className="min-h-32 font-mono text-sm"
                />
              </CardContent>
            </Card>
          )}


          {/* Response */}
          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-2">
                    <Badge className="bg-green-100 text-green-800">200</Badge>
                    <Badge className="bg-green-100 text-green-800">422</Badge>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  {response}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Code Examples Sidebar */}
      <div className="w-96 border-l border-border bg-muted/30 p-4 overflow-y-auto">
        <div className="sticky top-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{endpoint.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(endpoint.codeExample)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="python" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            <TabsContent value="python" className="mt-4">
              <pre className="text-xs bg-card p-3 rounded-lg overflow-x-auto">
                <code>{endpoint.codeExample}</code>
              </pre>
            </TabsContent>
            <TabsContent value="curl" className="mt-4">
              <pre className="text-xs bg-card p-3 rounded-lg overflow-x-auto">
                <code>{`curl -X ${endpoint.method} \\
  "${endpoint.path}" \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json"`}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};