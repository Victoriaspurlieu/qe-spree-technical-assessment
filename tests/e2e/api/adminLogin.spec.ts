import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import testData from '../../config/testData';
import { StatusCode, ErrorMessage, TokenResponse, OAuthErrorResponse, AdminErrorResponse } from '../../schemas/spreeSchema';

test.describe('Admin Login API', () => {
    let apiUtils: ApiUtils;

    test.beforeEach(async ({ request }) => {
        apiUtils = new ApiUtils(request, testData.api.baseUrl);
    });

    test('should successfully authenticate with client credentials', async () => {
        console.log('Initializing test with base URL:', testData.api.baseUrl);
        console.log('Starting successful authentication test...');
        
        const email = testData.api.admin.email;
        const password = testData.api.admin.password;
        console.log('Using admin credentials:', { email, password });

        try {
            const response = await apiUtils.adminLogin(email, password);
            console.log('Login response status:', response.status());
            
            expect(response.status()).toBe(StatusCode.Ok);
            
            const responseData = await response.json();
            expect(responseData.access_token).toBeDefined();
            expect(responseData.token_type).toBe('Bearer');
            
            apiUtils.setAuthToken(responseData.access_token);
            
            const userResponse = await apiUtils.getCurrentUser();
            console.log('User response status:', userResponse.status());
            
            expect(userResponse.status()).toBe(StatusCode.Ok);
            const userData = await userResponse.json();
            expect(userData.data.attributes.email).toBe(email);
        } catch (error) {
            console.error('Test failed with error:', error);
            throw error;
        }
    });

    test('should fail with invalid credentials', async () => {
        console.log('Starting invalid credentials test...');
        
        try {
            const response = await apiUtils.adminLogin('wrong@example.com', 'wrongpassword');
            console.log('Invalid login response status:', response.status());
            
            expect(response.status()).toBe(StatusCode.Unauthorized);
            const responseData = await response.json();
            expect(responseData.error).toBeDefined();
        } catch (error) {
            console.error('Test failed with error:', error);
            throw error;
        }
    });

    test('should fail with missing credentials', async () => {
        console.log('Starting missing credentials test...');
        
        try {
            const response = await apiUtils.adminLogin('', '');
            console.log('Missing credentials response status:', response.status());
            
            expect(response.status()).toBe(StatusCode.BadRequest);
            const responseData = await response.json();
            expect(responseData.error).toBeDefined();
        } catch (error) {
            console.error('Test failed with error:', error);
            throw error;
        }
    });

    test('should handle invalid client credentials', async () => {
        console.log('Starting invalid credentials test...');
        const invalidEmail = 'invalid@example.com';
        const invalidPassword = 'wrongpassword';
        console.log('Using invalid credentials:', { invalidEmail, invalidPassword });

        const response = await apiUtils.adminLogin(invalidEmail, invalidPassword);
        const responseText = await response.text();
        console.log('Error response:', responseText);
        
        expect(response.status()).toBe(StatusCode.Unauthorized);
        const errorData = JSON.parse(responseText) as OAuthErrorResponse;
        console.log('Parsed error response:', errorData);
        expect(errorData.error).toBe('invalid_client');
        expect(errorData.error_description).toBeDefined();
    });

    test('should handle invalid grant type', async () => {
        console.log('Starting invalid grant type test...');
        const response = await apiUtils.adminLogin(testData.api.admin.email, testData.api.admin.password);
        const responseText = await response.text();
        console.log('Error response:', responseText);
        
        expect(response.status()).toBe(StatusCode.BadRequest);
        const errorData = JSON.parse(responseText) as OAuthErrorResponse;
        console.log('Parsed error response:', errorData);
        expect(errorData.error).toBe('unsupported_grant_type');
        expect(errorData.error_description).toBeDefined();
    });

    test('should not access admin resources without authentication', async () => {
        console.log('Starting unauthenticated access test...');
        const response = await apiUtils.getAdminOrders('');
        const responseText = await response.text();
        console.log('Error response:', responseText);
        
        expect(response.status()).toBe(StatusCode.Unauthorized);
        const errorData = JSON.parse(responseText) as AdminErrorResponse;
        console.log('Parsed error response:', errorData);
        expect(errorData.error).toBe('unauthorized');
        expect(errorData.status).toBe(StatusCode.Unauthorized);
    });

    test('should not access admin resources after logout', async () => {
        console.log('Starting post-logout access test...');
        // Login first
        console.log('Logging in with valid credentials...');
        const loginResponse = await apiUtils.adminLogin(testData.api.admin.email, testData.api.admin.password);
        const loginText = await loginResponse.text();
        console.log('Login response:', loginText);
        
        const tokenData = JSON.parse(loginText) as TokenResponse;
        apiUtils.setAuthToken(tokenData.access_token);
        console.log('Access token set successfully');
        
        // Logout
        console.log('Logging out...');
        await apiUtils.adminLogout();
        
        // Try to access admin resources
        console.log('Attempting to access admin resources after logout...');
        const ordersResponse = await apiUtils.getAdminOrders('');
        const ordersText = await ordersResponse.text();
        console.log('Orders error response:', ordersText);
        
        expect(ordersResponse.status()).toBe(StatusCode.Unauthorized);
        const errorData = JSON.parse(ordersText) as AdminErrorResponse;
        console.log('Parsed error response:', errorData);
        expect(errorData.error).toBe('unauthorized');
        expect(errorData.status).toBe(StatusCode.Unauthorized);
    });
}); 