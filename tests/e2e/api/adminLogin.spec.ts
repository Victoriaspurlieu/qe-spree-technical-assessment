import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import testData from '../../config/testData';
import { StatusCode, ErrorMessage, TokenResponse } from '../../schemas/spreeSchema';

test.describe('Admin Login API', () => {
    let apiUtils: ApiUtils;

    test.beforeEach(async ({ request }) => {
        apiUtils = new ApiUtils(request, testData.api.baseUrl);
    });

    test('should successfully login as admin', async () => {
        const response = await apiUtils.adminLogin(testData.api.admin.email, testData.api.admin.password);
        expect(response.status()).toBe(StatusCode.Ok);
        const responseData = await response.json() as TokenResponse;
        expect(responseData.access_token).toBeDefined();
        expect(responseData.token_type).toBe('Bearer');
        expect(responseData.scope).toBe('admin');

        // Verify we can access admin resources
        const userResponse = await apiUtils.getCurrentUser();
        expect(userResponse.status()).toBe(StatusCode.Ok);
        const userData = await userResponse.json();
        expect(userData.data.attributes.email).toBe(testData.api.admin.email);
    });

    test('should handle invalid admin credentials', async () => {
        try {
            await apiUtils.adminLogin('invalid@example.com', 'wrongpassword');
            throw new Error('Should have failed with invalid credentials');
        } catch (error: any) {
            expect(error.status).toBe(StatusCode.Unauthorized);
            expect(error.error).toBe(ErrorMessage.InvalidCredentials);
        }
    });

    test('should not access admin resources without login', async () => {
        try {
            await apiUtils.getAdminOrders('');
            throw new Error('Should have failed with unauthorized access');
        } catch (error: any) {
            expect(error.status).toBe(StatusCode.Unauthorized);
            expect(error.error).toBe(ErrorMessage.Unauthorized);
        }
    });

    test('should not access admin resources after logout', async () => {
        // Login first
        const response = await apiUtils.adminLogin(testData.api.admin.email, testData.api.admin.password);
        const responseData = await response.json() as TokenResponse;
        
        // Logout
        await apiUtils.adminLogout();
        
        // Try to access admin resources
        try {
            await apiUtils.getAdminOrders(responseData.access_token);
            throw new Error('Should have failed with unauthorized access');
        } catch (error: any) {
            expect(error.status).toBe(StatusCode.Unauthorized);
            expect(error.error).toBe(ErrorMessage.Unauthorized);
        }
    });
}); 