import json
import logging
from typing import Optional, List, Dict

logging = logging.getLogger(__name__)


class OpenApiForAI:
    """Simplified structure optimized for AI to generate API call parameters"""

    def __init__(self, title: str, version: str, description: str = ""):
        self.title = title
        self.version = version
        self.description = description
        self.apis: List["ApiEndpoint"] = []

    def add_api(self, api: "ApiEndpoint"):
        self.apis.append(api)

    def to_dict(self):
        return {"title": self.title, "version": self.version, "description": self.description, "apis": [api.to_dict() for api in self.apis]}


class ApiEndpoint:
    """AI-friendly API endpoint representation"""

    def __init__(
        self,
        path: str,
        method: str,
        summary: str = "",
        description: str = "",
        tags: Optional[List[str]] = None,
        path_parameters: Optional[List[Dict]] = None,
        query_parameters: Optional[List[Dict]] = None,
        header_parameters: Optional[List[Dict]] = None,
        request_body_schema: Optional[Dict] = None,
        response_schema: Optional[Dict] = None,
        response_examples: Optional[Dict] = None,
        response_headers: Optional[List[Dict]] = None,
        operation_examples: Optional[Dict] = None,
    ):
        self.path = path
        self.method = method.upper()
        self.summary = summary
        self.description = description
        self.tags = tags or []
        self.path_parameters = path_parameters or []
        self.query_parameters = query_parameters or []
        self.header_parameters = header_parameters or []
        self.request_body_schema = request_body_schema
        self.response_schema = response_schema
        self.response_examples = response_examples
        self.response_headers = response_headers or []
        self.operation_examples = operation_examples or {}

    def to_dict(self):
        result = {
            "path": self.path,
            "method": self.method,
            "summary": self.summary,
            "description": self.description,
            "tags": self.tags,
        }

        # Only include non-empty parameters
        if self.path_parameters:
            result["path_parameters"] = self.path_parameters
        if self.query_parameters:
            result["query_parameters"] = self.query_parameters
        if self.header_parameters:
            result["header_parameters"] = self.header_parameters
        if self.request_body_schema:
            result["request_body_schema"] = self.request_body_schema
        if self.response_schema:
            result["response_schema"] = self.response_schema
        if self.response_examples:
            result["response_examples"] = self.response_examples
        if self.response_headers:
            result["response_headers"] = self.response_headers
        if self.operation_examples:
            result["operation_examples"] = self.operation_examples

        return result


def convert_openapi_for_ai(openapi_str: str) -> OpenApiForAI:
    def resolve_ref(ref_path: str, openapi_data: dict) -> dict:
        """Recursively resolve $ref references"""
        if not ref_path.startswith("#/"):
            return {}

        # Remove leading "#/" and split path by "/"
        path_parts = ref_path[2:].split("/")
        current = openapi_data

        # Traverse path to get referenced object
        for part in path_parts:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return {}

        # If referenced object still has $ref, resolve recursively
        if isinstance(current, dict):
            return resolve_schema_refs(current, openapi_data)
        return current

    def resolve_schema_refs(schema: dict, openapi_data: dict) -> dict:
        """Recursively resolve all $ref references in schema"""
        if not isinstance(schema, dict):
            return schema

        # If it's a $ref reference, resolve directly and return referenced content
        if "$ref" in schema:
            return resolve_ref(schema["$ref"], openapi_data)

        # Recursively process all fields
        resolved_schema = {}
        for key, value in schema.items():
            if isinstance(value, dict):
                resolved_schema[key] = resolve_schema_refs(value, openapi_data)
            elif isinstance(value, list):
                resolved_schema[key] = [resolve_schema_refs(item, openapi_data) if isinstance(item, dict) else item for item in value]
            else:
                resolved_schema[key] = value

        return resolved_schema

    def extract_schema_info(schema: dict) -> dict:
        """Extract key schema information, simplified for AI understanding"""
        if not schema:
            return {}

        info = {}

        # Basic type information
        if "type" in schema:
            info["type"] = schema["type"]
        if "format" in schema:
            info["format"] = schema["format"]
        if "description" in schema:
            info["description"] = schema["description"]
        if "example" in schema:
            info["example"] = schema["example"]
        if "enum" in schema:
            info["enum"] = schema["enum"]
        if "default" in schema:
            info["default"] = schema["default"]

        # Value constraints
        for constraint in ["minimum", "maximum", "minLength", "maxLength", "pattern"]:
            if constraint in schema:
                info[constraint] = schema[constraint]

        # Required fields
        if "required" in schema:
            info["required"] = schema["required"]

        # Handle array type
        if schema.get("type") == "array" and "items" in schema:
            info["items"] = extract_schema_info(schema["items"])

        # Handle object type
        if schema.get("type") == "object" and "properties" in schema:
            info["properties"] = {}
            for prop_name, prop_schema in schema["properties"].items():
                info["properties"][prop_name] = extract_schema_info(prop_schema)

        return info

    try:
        # Parse JSON string
        openapi_data = json.loads(openapi_str)

        # Get basic information
        info = openapi_data.get("info", {})
        title = info.get("title", "Unknown API")
        version = info.get("version", "1.0.0")
        description = info.get("description", "")

        # Create AI-friendly structure
        ai_info = OpenApiForAI(title=title, version=version, description=description)

        # Parse paths and operations
        paths = openapi_data.get("paths", {})

        for path, path_item in paths.items():
            # Iterate through each HTTP method under the path
            for method, operation in path_item.items():
                if method.lower() in ["get", "post", "put", "delete", "patch", "head", "options"]:
                    # Extract operation information
                    summary = operation.get("summary", "")
                    op_description = operation.get("description", "")
                    tags = operation.get("tags", [])

                    # Categorize parameters
                    path_parameters = []
                    query_parameters = []
                    header_parameters = []

                    # Parse parameters and resolve $ref references within them
                    if "parameters" in operation:
                        for param in operation["parameters"]:
                            # If parameter itself is a $ref, resolve it first
                            if "$ref" in param:
                                param = resolve_ref(param["$ref"], openapi_data)

                            # Resolve $ref references in parameter schema
                            resolved_schema = resolve_schema_refs(param.get("schema", {}), openapi_data)

                            param_info = {
                                "name": param.get("name", ""),
                                "description": param.get("description", ""),
                                "required": param.get("required", False),
                                "schema": extract_schema_info(resolved_schema),
                            }

                            if param.get("in") == "path":
                                path_parameters.append(param_info)
                            elif param.get("in") == "query":
                                query_parameters.append(param_info)
                            elif param.get("in") == "header":
                                header_parameters.append(param_info)

                    # Extract request body schema
                    request_body_schema = None
                    operation_examples = {}

                    if "requestBody" in operation:
                        req_body = operation["requestBody"]
                        # If request body itself is a $ref, resolve it first
                        if "$ref" in req_body:
                            req_body = resolve_ref(req_body["$ref"], openapi_data)

                        content = req_body.get("content", {})
                        # Prefer application/json
                        if "application/json" in content:
                            json_content = content["application/json"]
                            if "schema" in json_content:
                                resolved_schema = resolve_schema_refs(json_content["schema"], openapi_data)
                                request_body_schema = extract_schema_info(resolved_schema)
                            if "example" in json_content:
                                operation_examples["request_body"] = json_content["example"]
                        elif content:
                            # Use the first available content type
                            first_content = next(iter(content.values()))
                            if "schema" in first_content:
                                resolved_schema = resolve_schema_refs(first_content["schema"], openapi_data)
                                request_body_schema = extract_schema_info(resolved_schema)
                            if "example" in first_content:
                                operation_examples["request_body"] = first_content["example"]

                    # Extract response schema description, response examples and response headers
                    response_schema = None
                    response_examples = None
                    response_headers = []

                    if "responses" in operation:
                        # Prefer 200 response
                        success_response_key = (
                            "200" if "200" in operation["responses"] else "201" if "201" in operation["responses"] else None
                        )
                        if success_response_key:
                            response = operation["responses"][success_response_key]
                            # If response itself is a $ref, resolve it first
                            if "$ref" in response:
                                response = resolve_ref(response["$ref"], openapi_data)

                            # Extract response content
                            if "content" in response:
                                content = response["content"]
                                if "application/json" in content:
                                    json_content = content["application/json"]
                                    if "schema" in json_content:
                                        resolved_schema = resolve_schema_refs(json_content["schema"], openapi_data)
                                        response_schema = extract_schema_info(resolved_schema)
                                    if "example" in json_content:
                                        response_examples = json_content["example"]

                        # Extract header information from all responses
                        for status_code, response in operation["responses"].items():
                            # If response itself is a $ref, resolve it first
                            if "$ref" in response:
                                response = resolve_ref(response["$ref"], openapi_data)

                            if "headers" in response:
                                for header_name, header_info in response["headers"].items():
                                    resolved_header_info = resolve_schema_refs(header_info, openapi_data)
                                    header_detail = {
                                        "name": header_name,
                                        "description": resolved_header_info.get("description", ""),
                                        "schema": extract_schema_info(resolved_header_info.get("schema", {})),
                                        "status_code": status_code,
                                    }
                                    response_headers.append(header_detail)

                    # Create API endpoint
                    api_endpoint = ApiEndpoint(
                        path=path,
                        method=method,
                        summary=summary,
                        description=op_description,
                        tags=tags,
                        path_parameters=path_parameters if path_parameters else None,
                        query_parameters=query_parameters if query_parameters else None,
                        header_parameters=header_parameters if header_parameters else None,
                        request_body_schema=request_body_schema,
                        response_schema=response_schema,
                        response_examples=response_examples,
                        response_headers=response_headers if response_headers else None,
                        operation_examples=operation_examples if operation_examples else None,
                    )

                    ai_info.add_api(api_endpoint)

        return ai_info

    except json.JSONDecodeError as e:
        logging.error(f"JSON parsing error: {e}")
        raise ValueError(f"Invalid JSON format: {e}")
    except Exception as e:
        logging.error(f"Error converting to AI-friendly format: {e}")
        raise ValueError(f"Conversion failed: {e}")


if __name__ == "__main__":
    # Test case: Read openapi.json and generate AI-friendly structure
    import os

    # Get project root directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(current_dir, "..", "..", "..")
    openapi_path = os.path.join(project_root, "docs", "openapi.json")

    with open(openapi_path, "r", encoding="utf-8") as f:
        openapi_str = f.read()

    # Generate AI-friendly simplified structure
    ai_info = convert_openapi_for_ai(openapi_str)
    ai_output_path = os.path.join(project_root, "openapi_for_ai.json")
    with open(ai_output_path, "w", encoding="utf-8") as out_f:
        out_f.write(json.dumps(ai_info.to_dict(), indent=2, ensure_ascii=False))
    print("AI-friendly structure JSON has been output to openapi_for_ai.json")
