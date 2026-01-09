# Daemon API Documentation

The Daemon API provides programmatic access to personal information, projects, and frameworks through the Model Context Protocol (MCP).

## Base URL

```
https://YOUR_DOMAIN_HERE
```

*Update this after deploying to Cloudflare Workers*

## Protocol

The API uses JSON-RPC 2.0 over HTTPS.

## Authentication

Currently, the API is publicly accessible. Future versions may include authentication.

## Available Methods

### List Available Tools

Get a list of all available endpoints:

```bash
curl -X POST https://YOUR_DOMAIN_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

### Call a Tool

Execute a specific tool to retrieve data:

```bash
curl -X POST https://YOUR_DOMAIN_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_telos",
      "arguments": {}
    },
    "id": 2
  }'
```

## Available Endpoints

| Endpoint | Description | Response Type |
|----------|-------------|---------------|
| `get_about` | Basic information | Text |
| `get_mission` | Current mission statement | Text |
| `get_telos` | Complete TELOS framework | Structured Text |
| `get_what_im_building` | Current projects and focus areas | Text |
| `get_favorite_books` | Recommended reading list | List |
| `get_favorite_movies` | Film recommendations | List |
| `get_current_location` | Current timezone/location | Text |
| `get_preferences` | Work style and preferences | Text |
| `get_predictions` | Predictions about the future | List |
| `get_philosophy` | Core philosophy | Text |
| `get_all` | All available data | JSON |
| `get_section` | Specific section by name | Text |

## Response Format

All responses follow the JSON-RPC 2.0 specification:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Response content here..."
      }
    ]
  },
  "id": 2
}
```

## Error Handling

Errors are returned with appropriate error codes:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32601,
    "message": "Method not found"
  },
  "id": 1
}
```

## Rate Limiting

The API has reasonable rate limits:
- 1000 requests per hour per IP
- Burst of up to 10 requests per second

## MCP Integration

To use Daemon with MCP-compatible tools like Claude Code:

1. Add to your MCP configuration:

```json
{
  "mcpServers": {
    "daemon": {
      "url": "https://YOUR_DOMAIN_HERE"
    }
  }
}
```

2. The daemon tools will be available in your MCP client.

## Examples

### Python

```python
import requests
import json

url = "https://YOUR_DOMAIN_HERE"
headers = {"Content-Type": "application/json"}

# Get TELOS framework
payload = {
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
        "name": "get_telos",
        "arguments": {}
    },
    "id": 1
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
data = response.json()
print(data["result"]["content"][0]["text"])
```

### JavaScript

```javascript
async function getDaemonData(tool) {
  const response = await fetch('https://YOUR_DOMAIN_HERE', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: tool,
        arguments: {}
      },
      id: 1
    })
  });

  const data = await response.json();
  return data.result.content[0].text;
}

// Usage
const telos = await getDaemonData('get_telos');
console.log(telos);
```

## Updates

The Daemon API is continuously updated with new information. Check the `last_updated` field in responses for freshness.

## Connect

- Blog: [0xsalt.github.io](https://0xsalt.github.io)

---

*The Daemon API is part of a vision where everyone has a personal API — a structured, queryable interface to who they are and what they're about.*
