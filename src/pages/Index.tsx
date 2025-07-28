import { useState } from "react";
import { ApiSidebar } from "@/components/ApiSidebar";
import { ApiTestPanel } from "@/components/ApiTestPanel";
import { ApiHeader } from "@/components/ApiHeader";

// HachiAI API endpoints from OpenAPI specification
const mockEndpoints = [
  {
    id: "classify",
    name: "Analyze and Classify Invoice Pages",
    method: "POST" as const,
    path: "/v1/classify",
    description: "This API endpoint accepts a PDF document that may comprise multiple types of documents within a single file. Utilizing Azure Custom Classification model, it automatically analyzes the document to identify and categorize distinct document types present across its pages.",
    parameters: [],
    bodySchema: `{
  "file": "binary (PNG, JPG, JPEG, or PDF)"
}`,
    codeExample: `import requests

url = "https://kong-uat-proxy.hachiai.com/quest/v1/classify"
headers = {
    "apiKey": "YOUR_API_KEY"
}

files = {
    'file': open('invoice.pdf', 'rb')
}

response = requests.post(url, headers=headers, files=files)
print(response.json())`
  },
  {
    id: "extract-async",
    name: "Document Extraction (Async)",
    method: "POST" as const,
    path: "/v1/extract/async",
    description: "This API runs the DocX Agent asynchronously to extract structured data, such as tables, fields, and entities, from one or more uploaded document files. The asynchronous nature allows processing large or multiple documents without blocking the client.",
    parameters: [],
    bodySchema: `{
  "files": "array of binary files",
  "query": "string - extraction query",
  "tags": "string - optional tags (default: [])"
}`,
    codeExample: `import requests

url = "https://kong-uat-proxy.hachiai.com/quest/v1/extract/async"
headers = {
    "apiKey": "YOUR_API_KEY"
}

files = [
    ('files', open('document1.pdf', 'rb')),
    ('files', open('document2.pdf', 'rb'))
]

data = {
    'query': 'Extract invoice number, total amount, and line items',
    'tags': '["invoice", "processing"]'
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())`
  },
  {
    id: "extract",
    name: "Document Extraction (Sync)",
    method: "POST" as const,
    path: "/v1/extract",
    description: "This synchronous API runs the DocX Agent on one or more uploaded documents to immediately extract structured data or text based on user-defined extraction queries. The response contains the cleaned, structured data extracted directly from the documents.",
    parameters: [],
    bodySchema: `{
  "files": "array of binary files",
  "query": "string - extraction query",
  "tags": "string - optional tags (default: [])"
}`,
    codeExample: `import requests

url = "https://kong-uat-proxy.hachiai.com/quest/v1/extract"
headers = {
    "apiKey": "YOUR_API_KEY"
}

files = [
    ('files', open('document.pdf', 'rb'))
]

data = {
    'query': 'Extract all tables and text content',
    'tags': '[]'
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())`
  },
  {
    id: "trace",
    name: "Check Status by Trace ID",
    method: "GET" as const,
    path: "/v1/trace_id/{trace_id}",
    description: "This API retrieves the detailed processing status and associated metadata for a previously submitted document processing task, identified uniquely by its trace ID. Use this to monitor task progress and outcomes.",
    parameters: [
      {
        name: "trace_id",
        type: "string",
        required: true,
        description: "The unique trace ID corresponding to a specific document processing task"
      }
    ],
    codeExample: `import requests

trace_id = "1234567890abcdef"
url = f"https://kong-uat-proxy.hachiai.com/quest/v1/trace_id/{trace_id}"
headers = {
    "apiKey": "YOUR_API_KEY"
}

response = requests.get(url, headers=headers)
print(response.json())`
  }
];

const Index = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState("classify");
  
  const currentEndpoint = mockEndpoints.find(ep => ep.id === selectedEndpoint) || mockEndpoints[0];

  return (
    <div className="min-h-screen bg-background">
      <ApiHeader />
      <div className="flex">
        <ApiSidebar
          endpoints={mockEndpoints}
          selectedEndpoint={selectedEndpoint}
          onSelectEndpoint={setSelectedEndpoint}
        />
        <ApiTestPanel endpoint={currentEndpoint} />
      </div>
    </div>
  );
};

export default Index;
