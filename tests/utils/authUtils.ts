import { test, expect, APIRequestContext, APIResponse } from '@playwright/test';
import { ApiUtils } from './apiUtils';
import testData from '../config/testData';

export async function authenticateAdmin(request: APIRequestContext): Promise<ApiUtils> {
    const apiUtils = new ApiUtils(request, testData.api.baseUrl);
    const response = await apiUtils.adminLogin('spree@example.com', 'spree123');
    expect(response.status()).toBe(303); // Expect redirect after successful login
    
    // Get the session cookie from the response
    const cookies = response.headers()['set-cookie'];
    if (cookies) {
        apiUtils.setHeaders({
            'Cookie': cookies
        });
    }
    
    return apiUtils;
}

export async function authenticateUser(request: APIRequestContext): Promise<ApiUtils> {
    const apiUtils = new ApiUtils(request, testData.api.baseUrl);
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';
    
    // Create account
    const accountResponse = await apiUtils.createAccount(email, password);
    expect(accountResponse.ok()).toBeTruthy();
    
    return apiUtils;
} 