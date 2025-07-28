import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Copy, Info } from "lucide-react";
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
          </div>

          {/* Description Box */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {endpoint.description}
                </p>
                
                {/* Additional details based on endpoint type */}
                {endpoint.id === "classify" && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-foreground">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Accepts PDF documents with multiple document types</li>
                      <li>Utilizes Azure Custom Classification model</li>
                      <li>Automatically identifies and categorizes distinct document types</li>
                      <li>Processes multiple pages within a single file</li>
                      <li>Supports PNG, JPG, JPEG, and PDF file formats</li>
                    </ul>
                  </div>
                )}
                
                {endpoint.id === "extract-async" && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-foreground">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Runs DocX Agent asynchronously for non-blocking processing</li>
                      <li>Extracts structured data including tables, fields, and entities</li>
                      <li>Handles multiple document files simultaneously</li>
                      <li>Supports custom extraction queries</li>
                      <li>Ideal for large document processing workflows</li>
                      <li>Returns immediately with a trace ID for status tracking</li>
                    </ul>
                  </div>
                )}
                
                {endpoint.id === "extract" && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-foreground">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Synchronous processing with immediate results</li>
                      <li>Extracts structured data and text content</li>
                      <li>User-defined extraction queries for precise data retrieval</li>
                      <li>Returns cleaned, structured data directly</li>
                      <li>Best for real-time document processing needs</li>
                      <li>Supports multiple file uploads in a single request</li>
                    </ul>
                  </div>
                )}
                
                {endpoint.id === "trace" && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-foreground">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Retrieves detailed processing status by trace ID</li>
                      <li>Provides associated metadata for document tasks</li>
                      <li>Monitors task progress and outcomes</li>
                      <li>Essential for tracking asynchronous operations</li>
                      <li>Returns comprehensive status information</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
                      <p className="text-xs text-muted-foreground mt-1">
                        {param.description}
                      </p>
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
                <CardTitle className="text-lg">Request Body</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {endpoint.method === "POST" && endpoint.id !== "trace" ? "multipart/form-data" : "application/json"}
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder="Enter request body..."
                  className="min-h-32 font-mono text-sm"
                />
                {endpoint.bodySchema && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-2">Expected format:</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {endpoint.bodySchema}
                    </pre>
                  </div>
                )}
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
                    <Badge className="bg-green-100 text-green-800">200 OK</Badge>
                    <Badge variant="outline">application/json</Badge>
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
  "https://kong-uat-proxy.hachiai.com/quest${endpoint.path}" \\
  -H "Authorization: Bearer <token>" \\
  ${endpoint.method !== "GET" ? '-H "Content-Type: application/json" \\' : ''}
  ${endpoint.method !== "GET" ? '-d \'<request_body>\'' : ''}`}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};