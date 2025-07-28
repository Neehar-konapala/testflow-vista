import { useState } from "react";
import { ApiSidebar } from "@/components/ApiSidebar";
import { ApiTestPanel } from "@/components/ApiTestPanel";
import { ApiHeader } from "@/components/ApiHeader";

// Mock data for demonstration
const mockEndpoints = [
  {
    id: "split",
    name: "Split",
    method: "POST" as const,
    path: "/split",
    description: "Split documents into smaller chunks",
    parameters: [
      {
        name: "document_url",
        type: "string",
        required: true,
        description: "The URL of the document to be processed"
      }
    ],
    bodySchema: `{
  "options": {
    "ocr_mode": "standard",
    "extraction_mode": "ocr",
    "chunking": {
      "chunk_mode": "variable"
    }
  }
}`,
    codeExample: `import requests

url = "https://platform.reducto.ai/split"

payload = {
    "options": {
        "ocr_mode": "standard",
        "extraction_mode": "ocr",
        "chunking": {
            "chunk_mode": "variable"
        }
    }
}

headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
  },
  {
    id: "parse",
    name: "Parse",
    method: "POST" as const,
    path: "/parse",
    description: "Parse document content into structured data",
    parameters: [
      {
        name: "document_url",
        type: "string", 
        required: true,
        description: "The URL of the document to parse"
      },
      {
        name: "format",
        type: "string",
        required: false,
        description: "Output format (json, xml, csv)"
      }
    ],
    bodySchema: `{
  "document_url": "https://example.com/document.pdf",
  "format": "json"
}`,
    codeExample: `import requests

url = "https://platform.reducto.ai/parse"

payload = {
    "document_url": "https://example.com/document.pdf",
    "format": "json"
}

headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
  },
  {
    id: "extract",
    name: "Extract",
    method: "POST" as const,
    path: "/extract",
    description: "Extract specific information from documents",
    parameters: [
      {
        name: "document_url",
        type: "string",
        required: true,
        description: "The URL of the document to extract from"
      },
      {
        name: "fields",
        type: "array",
        required: true,
        description: "Fields to extract from the document"
      }
    ],
    bodySchema: `{
  "document_url": "https://example.com/document.pdf",
  "fields": ["name", "email", "phone"]
}`,
    codeExample: `import requests

url = "https://platform.reducto.ai/extract"

payload = {
    "document_url": "https://example.com/document.pdf",
    "fields": ["name", "email", "phone"]
}

headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
  },
  {
    id: "status",
    name: "Get Status",
    method: "GET" as const,
    path: "/status/{job_id}",
    description: "Check the status of a processing job",
    parameters: [
      {
        name: "job_id",
        type: "string",
        required: true,
        description: "The ID of the job to check"
      }
    ],
    codeExample: `import requests

url = "https://platform.reducto.ai/status/{job_id}"

headers = {
    "Authorization": "Bearer <token>"
}

response = requests.get(url, headers=headers)
print(response.json())`
  }
];

const Index = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState("split");
  
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
