import { useState } from "react";
import { ApiSidebar } from "@/components/ApiSidebar";
import { ApiTestPanel } from "@/components/ApiTestPanel";
import { ApiHeader } from "@/components/ApiHeader";

// Real HachiAI API endpoints from the OpenAPI specification
const realEndpoints = [
  {
    id: "classify",
    name: "Analyze and Classify Invoice Pages",
    method: "POST" as const,
    path: "/v1/classify",
    description: "This API endpoint accepts a PDF document that may comprise multiple types of documents within a single file. Utilizing Azure Custom Classification model, it automatically analyzes the document to identify and categorize distinct document types present across its pages.",
    tag: "Document Classification",
    fullDescription: `The core function of this service is to detect the page ranges corresponding to each document type within the uploaded PDF, enabling users to effortlessly segment and organize complex multi-document files.

**How it works:**

- You upload a PDF file containing multiple documents (e.g., invoices, forms, receipts) in a single file.
- The Azure-powered classifier reviews the entire PDF, analyzes each page, and predicts the document type for contiguous page ranges.
- The API returns a structured result showing the document type, the specific page range it covers, and a confidence score indicating the model's certainty.

**Example Response:**
For a 7-page PDF containing 5 invoices:
- Two invoices span pages 1-2 and 3-4 respectively (each 2 pages long)
- Three single-page invoices on pages 5, 6, and 7

The response would include:
\`\`\`json
{
  "type": "invoice", "page_range": "1-2", "confidence": 0.95,
  "type": "invoice", "page_range": "3-4", "confidence": 0.90,
  "type": "invoice", "page_range": "5", "confidence": 0.85,
  "type": "invoice", "page_range": "6", "confidence": 0.80,
  "type": "invoice", "page_range": "7", "confidence": 0.75
}
\`\`\`

This categorization allows users to automate downstream workflows like targeted extraction, data validation, or filing processes for each document type within complex PDFs.`,
    parameters: [],
    requestBodyType: "multipart/form-data",
    fileUpload: {
      required: true,
      multiple: false,
      accept: ".pdf,.png,.jpg,.jpeg",
      name: "file",
      description: "A single invoice file (PNG, JPG, JPEG, or PDF) to classify pages."
    },
    codeExample: `import requests

url = "https://kong-uat-proxy.hachiai.com/quest/v1/classify"
headers = {
    "apiKey": "YOUR_API_KEY"
}

files = {
    'file': open('invoice.pdf', 'rb')
}

response = requests.post(url, headers=headers, files=files)
print(response.json())`,
    responseExamples: {
      "200": {
        description: "Classification result containing predicted invoice page ranges and related metadata.",
        example: `{
  "results": [
    {
      "type": "invoice",
      "page_range": "1-2",
      "confidence": 0.95
    },
    {
      "type": "invoice", 
      "page_range": "3-4",
      "confidence": 0.90
    },
    {
      "type": "invoice",
      "page_range": "5",
      "confidence": 0.85
    }
  ],
  "total_pages": 5,
  "processing_time": "1.2s",
  "model_version": "azure-classifier-v2.1"
}`
      },
      "422": {
        description: "Validation error due to incorrect input file or missing parameters.",
        example: `{
  "detail": [
    {
      "loc": ["body", "file"],
      "msg": "field required", 
      "type": "value_error.missing"
    }
  ]
}`
      }
    }
  },
  {
    id: "extract-async",
    name: "Document Extraction (Async)",
    method: "POST" as const,
    path: "/v1/extract/async",
    description: "This API runs the DocX Agent asynchronously to extract structured data, such as tables, fields, and entities, from one or more uploaded document files.",
    tag: "Extraction",
    fullDescription: `Supported file types include PDFs and image formats. Users provide extraction queries that specify what information should be retrieved from the documents. The asynchronous nature allows processing large or multiple documents without blocking the client, with status check features available separately.

**Key Features:**
- Asynchronous processing for large documents
- Multiple file upload support
- Custom extraction queries
- Returns trace ID for status monitoring
- Non-blocking operation

**How it works:**
1. Upload one or more document files
2. Provide extraction query specifying what data to extract
3. Receive immediate response with trace ID
4. Use trace ID to check processing status
5. Retrieve results when processing is complete

On success, the API acknowledges that extraction has been started, allowing users to fetch results or check status via trace IDs.`,
    parameters: [],
    requestBodyType: "multipart/form-data",
    fileUpload: {
      required: true,
      multiple: true,
      accept: ".pdf,.png,.jpg,.jpeg",
      name: "files",
      description: "List of files to be processed."
    },
    formFields: [
      {
        name: "query",
        type: "text",
        required: true,
        description: "Extraction query string specifying what data to extract from the documents."
      },
      {
        name: "tags",
        type: "text",
        required: false,
        description: "Optional tags for request filtering (JSON array format).",
        defaultValue: "[]"
      }
    ],
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
print(response.json())`,
    responseExamples: {
      "200": {
        description: "Extraction task started successfully, processing is underway.",
        example: `{
  "message": "Extraction task started successfully",
  "trace_id": "abc123def456789",
  "status": "processing",
  "estimated_completion": "2-5 minutes",
  "files_received": 2,
  "query": "Extract invoice number, total amount, and line items",
  "tags": ["invoice", "processing"]
}`
      },
      "422": {
        description: "Validation error due to missing files or malformed query.",
        example: `{
  "detail": [
    {
      "loc": ["body", "files"],
      "msg": "field required",
      "type": "value_error.missing"
    },
    {
      "loc": ["body", "query"], 
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}`
      }
    }
  },
  {
    id: "extract",
    name: "Document Extraction (Sync)",
    method: "POST" as const,
    path: "/v1/extract",
    description: "This synchronous API runs the DocX Agent on one or more uploaded documents to immediately extract structured data or text based on user-defined extraction queries.",
    tag: "Extraction", 
    fullDescription: `Users upload files such as PDFs or images and submit the extraction query specifying the data fields, tables, or entities to be extracted. The response contains the cleaned, structured data extracted directly from the documents without the need for asynchronous polling.

**Key Features:**
- Synchronous processing with immediate results
- Multiple file upload support
- Custom extraction queries
- Real-time data extraction
- Direct response with extracted data

**How it works:**
1. Upload one or more document files
2. Provide extraction query specifying what data to extract
3. Receive immediate response with extracted data
4. No need for status polling or trace ID monitoring

This endpoint is suitable for smaller documents or when immediate extraction results are required.`,
    parameters: [],
    requestBodyType: "multipart/form-data",
    fileUpload: {
      required: true,
      multiple: true,
      accept: ".pdf,.png,.jpg,.jpeg",
      name: "files",
      description: "Files to process (array)."
    },
    formFields: [
      {
        name: "query",
        type: "text",
        required: true,
        description: "Extraction query string (what to extract)."
      },
      {
        name: "tags",
        type: "text",
        required: false,
        description: "Optional tags (JSON array format).",
        defaultValue: "[]"
      }
    ],
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
print(response.json())`,
    responseExamples: {
      "200": {
        description: "Extraction results with data, tables, or text found in the documents.",
        example: `{
  "extracted_data": [
    {
      "field_name": "invoice_number",
      "value": "INV-2023-001",
      "confidence": 0.98
    },
    {
      "field_name": "total_amount", 
      "value": "$1500.00",
      "confidence": 0.95
    }
  ],
  "tables": [
    {
      "table_name": "line_items",
      "headers": ["Item", "Quantity", "Price", "Total"],
      "rows": [
        ["Product A", "2", "$500.00", "$1000.00"],
        ["Product B", "1", "$500.00", "$500.00"]
      ]
    }
  ],
  "text_content": "Invoice #INV-2023-001\\nDate: 2023-10-01\\nTotal: $1500.00",
  "processing_time": "3.2s"
}`
      },
      "422": {
        description: "Validation error due to missing files, invalid queries, or incorrect parameters.",
        example: `{
  "detail": [
    {
      "loc": ["body", "query"],
      "msg": "field required",
      "type": "value_error.missing"
    },
    {
      "loc": ["body", "files"],
      "msg": "ensure this value has at least 1 items",
      "type": "value_error.list.min_items"
    }
  ]
}`
      }
    }
  },
  {
    id: "trace",
    name: "Check Status by Trace ID",
    method: "GET" as const,
    path: "/v1/trace_id/{trace_id}",
    description: "This API retrieves the detailed processing status and associated metadata for a previously submitted document processing task, identified uniquely by its trace ID.",
    tag: "Trace",
    fullDescription: `When you submit an extraction or classification request via the Document Classification or Extraction APIs, the system returns a unique **trace_id** representing that specific processing task. You can use this trace ID with this endpoint to monitor the task's progress and outcome.

**How it works:**
- Provide the unique **trace_id** of the document processing task you want to track
- The API returns comprehensive status details including the current state of the task (such as pending, in-progress, completed, or failed), relevant timestamps, any results produced so far, and error information if applicable
- This endpoint enables clients to poll for updates or query the final outcome without re-submitting the document or query
- This functionality is especially useful in asynchronous workflows where processing may take extended time, allowing you to manage and monitor tasks effectively

**Usage example:**
After submitting an asynchronous extraction or classification task, you receive a **trace_id**. Use this API by passing that **trace_id** as a path parameter, then execute the request to get real-time updates or final results of that task.

**Example response:**
\`\`\`json
{
  "trace_id": "1234567890abcdef",
  "status": "completed",
  "result": {
    "extracted_data": [
      {
        "field_name": "invoice_number",
        "value": "INV-2023-001"
      },
      {
        "field_name": "total_amount",
        "value": "$1000.00"
      }
    ],
    "tables": [
      {
        "table_name": "line_items",
        "rows": [
          {"item": "Product A", "quantity": 2, "price": "$500.00"},
          {"item": "Product B", "quantity": 1, "price": "$500.00"}
        ]
      }
    ]
  },
  "timestamp": "2023-10-01T12:00:00Z"
}
\`\`\``,
    parameters: [
      {
        name: "trace_id",
        type: "string",
        required: true,
        description: "The unique trace ID corresponding to a specific document processing task",
        in: "path"
      }
    ],
    codeExample: `import requests

trace_id = "1234567890abcdef"
url = f"https://kong-uat-proxy.hachiai.com/quest/v1/trace_id/{trace_id}"
headers = {
    "apiKey": "YOUR_API_KEY"
}

response = requests.get(url, headers=headers)
print(response.json())`,
    responseExamples: {
      "200": {
        description: "Status response containing current state and related details of the processing task.",
        example: `{
  "trace_id": "1234567890abcdef",
  "status": "completed",
  "result": {
    "extracted_data": [
      {
        "field_name": "invoice_number",
        "value": "INV-2023-001"
      },
      {
        "field_name": "total_amount",
        "value": "$1000.00"
      }
    ],
    "tables": [
      {
        "table_name": "line_items",
        "rows": [
          {"item": "Product A", "quantity": 2, "price": "$500.00"},
          {"item": "Product B", "quantity": 1, "price": "$500.00"}
        ]
      }
    ]
  },
  "timestamp": "2023-10-01T12:00:00Z",
  "processing_time": "2.5s"
}`
      },
      "422": {
        description: "Validation error when the trace_id is missing or malformed.",
        example: `{
  "detail": [
    {
      "loc": ["path", "trace_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}`
      }
    }
  }
];

const Index = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState("classify");
  
  const currentEndpoint = realEndpoints.find(ep => ep.id === selectedEndpoint) || realEndpoints[0];

  return (
    <div className="min-h-screen bg-background">
      <ApiHeader />
      <div className="flex">
        <ApiSidebar
          endpoints={realEndpoints}
          selectedEndpoint={selectedEndpoint}
          onSelectEndpoint={setSelectedEndpoint}
        />
        <ApiTestPanel endpoint={currentEndpoint} />
      </div>
    </div>
  );
};

export default Index;