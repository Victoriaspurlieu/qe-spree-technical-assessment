import { APIRequestContext, APIResponse } from '@playwright/test';
import { SpreeEndpoints } from '../../config/endpoints/spreeEndpoints';

export abstract class BaseApiClient {
  protected baseUrl: string;
  protected request: APIRequestContext;
  protected headers: Record<string, string>;
  protected endpoints: SpreeEndpoints;

  constructor(baseUrl: string, request: APIRequestContext) {
    this.baseUrl = baseUrl;
    this.request = request;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    this.endpoints = SpreeEndpoints.getInstance(baseUrl);
  }

  protected async handleResponse<T>(response: APIResponse): Promise<T> {
    const status = response.status();
    const rawBody = await response.text();
    
    try {
      const jsonBody = JSON.parse(rawBody);
      if (!response.ok()) {
        console.error(`API Error [${status}]:`, {
          status,
          headers: response.headers(),
          body: jsonBody
        });
        throw new Error(`API request failed with status ${status}: ${jsonBody.error_description || jsonBody.error || 'Unknown error'}`);
      }
      return jsonBody;
    } catch (e) {
      console.error(`Failed to parse response body:`, {
        status,
        rawBody,
        error: e
      });
      throw new Error(`API request failed with status ${status}: Invalid JSON response`);
    }
  }

  protected async get<T>(endpoint: string): Promise<T> {
    const response = await this.request.get(`${this.baseUrl}${endpoint}`, {
      headers: this.headers
    });
    return this.handleResponse<T>(response);
  }

  protected async post<T>(endpoint: string, data: any): Promise<T> {
    console.log('Making POST request to:', `${this.baseUrl}${endpoint}`);
    console.log('Request data:', JSON.stringify(data, null, 2));
    console.log('Request headers:', this.headers);
    const response = await this.request.post(endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`, {
      headers: this.headers,
      data
    });
    console.log('Response status:', response.status());
    console.log('Response headers:', response.headers());
    return this.handleResponse<T>(response);
  }

  protected async postRaw(endpoint: string, data: any, headers: Record<string, string> = {}): Promise<APIResponse> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    return await this.request.post(url, {
      data,
      headers: {
        ...this.headers,
        ...headers
      }
    });
  }

  protected async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request.patch(`${this.baseUrl}${endpoint}`, {
      headers: this.headers,
      data
    });
    return this.handleResponse<T>(response);
  }

  protected async delete<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request.delete(`${this.baseUrl}${endpoint}`, {
      headers: this.headers,
      data
    });
    return this.handleResponse<T>(response);
  }

  protected async getRaw(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    const requestHeaders = {
      ...this.headers,
      ...headers
    };
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    return await this.request.get(url, {
      headers: requestHeaders
    });
  }

  protected async putRaw(endpoint: string, data: any): Promise<APIResponse> {
    return await this.request.put(endpoint, {
      headers: this.headers,
      data
    });
  }

  protected async patchRaw(endpoint: string, data: any): Promise<APIResponse> {
    return await this.request.patch(endpoint, {
      headers: this.headers,
      data
    });
  }

  protected async deleteRaw(endpoint: string): Promise<APIResponse> {
    return await this.request.delete(endpoint, {
      headers: this.headers
    });
  }
}
