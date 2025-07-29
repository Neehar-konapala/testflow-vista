import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Copy, Info, Upload, X, File, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  in?: string;
}

interface FormField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

interface FileUpload {
  required: boolean;
  multiple: boolean;
  accept: string;
  name: string;
  description: string;
}

interface ApiEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  fullDescription?: string;
  tag?: string;
  parameters?: Parameter[];
  formFields?: FormField[];
  fileUpload?: FileUpload;
  requestBodyType?: string;
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
  const [apiKey, setApiKey] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize form data with default values
  useState(() => {
    const initialFormData: Record<string, string> = {};
    endpoint.formFields?.forEach(field => {
      initialFormData[field.name] = field.defaultValue || "";
    });
    setFormData(initialFormData);
  }, [endpoint]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (endpoint.fileUpload?.multiple) {
      setSelectedFiles(prev => [...prev, ...files]);
    } else {
      setSelectedFiles(files.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormDataChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePathParamChange = (name: string, value: string) => {
    setPathParams(prev => ({ ...prev, [name]: value }));
  };

  const buildApiUrl = () => {
    let url = `https://kong-uat-proxy.hachiai.com/quest${endpoint.path}`;
    
    // Replace path parameters
    endpoint.parameters?.forEach(param => {
      if (param.in === "path" && pathParams[param.name]) {
        url = url.replace(`{${param.name}}`, pathParams[param.name]);
      }
    });
    
    return url;
  };

  const handleApiCall = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your API key",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    const missingFields: string[] = [];
    
    // Check file upload requirements
    if (endpoint.fileUpload?.required && selectedFiles.length === 0) {
      missingFields.push("file(s)");
    }
    
    // Check form field requirements
    endpoint.formFields?.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        missingFields.push(field.name);
      }
    });
    
    // Check path parameter requirements
    endpoint.parameters?.forEach(param => {
      if (param.required && param.in === "path" && !pathParams[param.name]?.trim()) {
        missingFields.push(param.name);
      }
    });

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please provide: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse("");
    setResponseStatus(null);

    try {
      const url = buildApiUrl();
      const headers: Record<string, string> = {
        "apiKey": apiKey
      };

      let body: FormData | undefined;

      if (endpoint.method !== "GET") {
        if (endpoint.requestBodyType === "multipart/form-data") {
          body = new FormData();
          
          // Add files
          if (endpoint.fileUpload) {
            selectedFiles.forEach(file => {
              body!.append(endpoint.fileUpload!.name, file);
            });
          }
          
          // Add form fields
          endpoint.formFields?.forEach(field => {
            const value = formData[field.name];
            if (value !== undefined) {
              body!.append(field.name, value);
            }
          });
        }
      }

      const fetchOptions: RequestInit = {
        method: endpoint.method,
        headers,
        ...(body && { body })
      };

      const apiResponse = await fetch(url, fetchOptions);
      const responseText = await apiResponse.text();
      
      setResponseStatus(apiResponse.status);
      
      try {
        const jsonResponse = JSON.parse(responseText);
        setResponse(JSON.stringify(jsonResponse, null, 2));
      } catch {
        setResponse(responseText);
      }

      if (!apiResponse.ok) {
        setError(`HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
        toast({
          title: "API Error",
          description: `Request failed with status ${apiResponse.status}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "API request completed successfully"
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setResponse(`Error: ${errorMessage}`);
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard"
    });
  };

  const generateCurlCommand = () => {
    const url = buildApiUrl();
    let curlCommand = `curl -X ${endpoint.method} "${url}" \\\n  -H "apiKey: YOUR_API_KEY"`;
    
    if (endpoint.method !== "GET" && endpoint.requestBodyType === "multipart/form-data") {
      // Add file uploads
      if (endpoint.fileUpload && selectedFiles.length > 0) {
        selectedFiles.forEach((file, index) => {
          curlCommand += ` \\\n  -F "${endpoint.fileUpload!.name}=@${file.name}"`;
        });
      }
      
      // Add form fields
      endpoint.formFields?.forEach(field => {
        const value = formData[field.name] || field.defaultValue || "";
        if (value) {
          curlCommand += ` \\\n  -F "${field.name}=${value}"`;
        }
      });
    }
    
    return curlCommand;
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
                {endpoint.tag && (
                  <Badge variant="outline" className="text-xs">
                    {endpoint.tag}
                  </Badge>
                )}
              </div>
              <Button 
                onClick={handleApiCall}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isLoading ? "Processing..." : "Try it"}
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
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {endpoint.fullDescription || endpoint.description}
                </div>
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
                  <Label htmlFor="api-key">
                    API Key <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Your API key will be sent in the apiKey header.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Path Parameters */}
          {endpoint.parameters && endpoint.parameters.some(p => p.in === "path") && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Path Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoint.parameters
                    .filter(param => param.in === "path")
                    .map((param) => (
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
                        value={pathParams[param.name] || ""}
                        onChange={(e) => handlePathParamChange(param.name, e.target.value)}
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

          {/* File Upload */}
          {endpoint.fileUpload && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  File Upload {endpoint.fileUpload.required && <span className="text-red-500">*</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-dashed"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6" />
                        <span>
                          Choose {endpoint.fileUpload.multiple ? "files" : "file"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {endpoint.fileUpload.accept.replace(/\./g, "").toUpperCase()}
                        </span>
                      </div>
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple={endpoint.fileUpload.multiple}
                      accept={endpoint.fileUpload.accept}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <p className="text-sm text-muted-foreground mt-2">
                      {endpoint.fileUpload.description}
                    </p>
                  </div>
                  
                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files:</Label>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <File className="w-4 h-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Fields */}
          {endpoint.formFields && endpoint.formFields.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Request Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoint.formFields.map((field) => (
                    <div key={field.name}>
                      <Label htmlFor={field.name}>
                        {field.name} {field.required && <span className="text-red-500">*</span>}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {field.type}
                        </Badge>
                      </Label>
                      {field.type === "text" && field.name === "query" ? (
                        <Textarea
                          id={field.name}
                          placeholder={field.description}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleFormDataChange(field.name, e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={field.name}
                          placeholder={field.description}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleFormDataChange(field.name, e.target.value)}
                          className="mt-1"
                        />
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {field.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response */}
          {(response || error) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Response
                  {responseStatus && (
                    <Badge className={responseStatus >= 200 && responseStatus < 300 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {responseStatus}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96 overflow-y-auto">
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
                <code>{generateCurlCommand()}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};