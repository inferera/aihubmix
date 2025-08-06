// src/tools/api-tools.ts
import fetch from 'node-fetch';
import { Tool } from '../types/index.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
}

export const apiTools: Record<string, Tool> = {
  http_request: {
    description: "Make HTTP requests to external APIs",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to make the request to"
        },
        method: {
          type: "string",
          description: "HTTP method",
          enum: ["GET", "POST", "PUT", "DELETE"],
          default: "GET"
        },
        headers: {
          type: "object",
          description: "HTTP headers"
        },
        body: {
          type: "object",
          description: "Request body for POST/PUT requests"
        }
      },
      required: ["url"]
    },
    async execute(args: {
      url: string;
      method?: string;
      headers?: Record<string, string>;
      body?: any;
    }): Promise<any> {
      try {
        const response = await fetch(args.url, {
          method: args.method || "GET",
          headers: args.headers,
          body: args.body ? JSON.stringify(args.body) : undefined
        });

        if (!response.ok) {
          throw new McpError(
            ErrorCode.InternalError,
            `HTTP request failed with status ${response.status}`
          );
        }

        const data = await response.json();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `HTTP request failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  },

  get_weather: {
    description: "Get weather information for a location",
    inputSchema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name"
        },
        apiKey: {
          type: "string",
          description: "OpenWeatherMap API key"
        }
      },
      required: ["city", "apiKey"]
    },
    async execute(args: {
      city: string;
      apiKey: string;
    }): Promise<any> {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(args.city)}&appid=${args.apiKey}&units=metric`
        );

        if (!response.ok) {
          throw new McpError(
            ErrorCode.InternalError,
            `Weather API request failed with status ${response.status}`
          );
        }

        const data = await response.json() as WeatherData;

        if (!data.name) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Invalid response from weather API"
          );
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                location: data.name,
                temperature: data.main.temp,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Weather API error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }
};
