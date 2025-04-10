import { APIRequestContext, APIResponse } from '@playwright/test';
import { SpreeEndpoints } from '../../endpoints/spreeEndpoints';

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
    if (!response.ok()) {
      let errorMessage = `API request failed with status ${response.status()}`;
      try {
        const errorBody = await response.json();
        if (errorBody.error) {
          errorMessage += `: ${errorBody.error}`;
        }
        if (errorBody.errors) {
          errorMessage += `\nErrors: ${JSON.stringify(errorBody.errors, null, 2)}`;
        }
      } catch (e) {
        // If we can't parse the error body, try to get the text
        try {
          const text = await response.text();
          errorMessage += `\nResponse body: ${text}`;
        } catch (e) {
          errorMessage += ` (Could not parse error body)`;
        }
      }
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    try {
      return await response.json() as Promise<T>;
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Failed to parse response as JSON');
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
    const response = await this.request.post(`${this.baseUrl}${endpoint}`, {
      headers: this.headers,
      data
    });
    console.log('Response status:', response.status());
    console.log('Response headers:', response.headers());
    return this.handleResponse<T>(response);
  }

  protected async postRaw(endpoint: string, data: any, headers?: Record<string, string>, isForm: boolean = false): Promise<APIResponse> {
    const requestHeaders = {
      ...this.headers,
      ...headers,
      'Content-Type': isForm ? 'application/x-www-form-urlencoded' : 'application/json',
      'Accept': 'application/json'
    };
    console.log('Making POST request to:', `${this.baseUrl}${endpoint}`);
    console.log('Request data:', data);
    console.log('Request headers:', requestHeaders);
    const response = await this.request.post(`${this.baseUrl}${endpoint}`, {
      headers: requestHeaders,
      [isForm ? 'form' : 'data']: data
    });
    console.log('Response status:', response.status());
    console.log('Response headers:', response.headers());
    return response;
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

  protected async getRaw(endpoint: string): Promise<APIResponse> {
    return await this.request.get(endpoint, {
      headers: this.headers
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
