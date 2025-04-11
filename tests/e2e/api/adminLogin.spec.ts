import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import testData from '../../config/testData';
import { authenticateAdmin } from '../../utils/authUtils';

test.describe('Admin Login API', () => {
    let apiUtils: ApiUtils;

    test.beforeEach(async ({ request }) => {
        apiUtils = new ApiUtils(request, testData.api.baseUrl);
    });

    test('should successfully authenticate with valid credentials', async ({ request }) => {
        const authenticatedApiUtils = await authenticateAdmin(request);
        
        // Verify admin dashboard access
        const dashboardResponse = await authenticatedApiUtils.getAdminDashboard();
        expect(dashboardResponse.status()).toBe(testData.api.statusCodes.ok);

        // Logout and clear cookies
        await authenticatedApiUtils.adminLogout();
    });

    test('should fail with invalid credentials', async () => {
        const response = await apiUtils.adminLogin('invalid@example.com', 'wrongpassword');
        expect(response.status()).toBe(testData.api.statusCodes.unprocessableEntity);
        
        const html = await response.text();
        expect(html).toContain(testData.api.errorMessages.invalidCredentials);
        
        // Verify no admin session cookie is set
        const cookies = response.headers()['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies).not.toContain(testData.api.cookies.adminSession);
    });

    test('should fail with empty credentials', async () => {
        const response = await apiUtils.adminLogin('', '');
        expect(response.status()).toBe(testData.api.statusCodes.unprocessableEntity);
        
        const html = await response.text();
        expect(html).toContain(testData.api.errorMessages.invalidCredentials);
        
        // Verify no admin session cookie is set
        const cookies = response.headers()['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies).not.toContain(testData.api.cookies.adminSession);
    });

    test('should not access admin resources without authentication', async () => {
        const response = await apiUtils.getAdminDashboard();
        expect(response.status()).toBe(testData.api.statusCodes.found);
        expect(response.headers()['location']).toContain('/users/sign_in');
    });

    test('should not access admin resources after logout', async () => {
        const loginResponse = await apiUtils.adminLogin('spree@example.com', 'spree123');
        expect(loginResponse.status()).toBe(testData.api.statusCodes.seeOther);
        
        await apiUtils.adminLogout();
        
        // Try to access admin resources
        const dashboardResponse = await apiUtils.getAdminDashboard();
        expect(dashboardResponse.status()).toBe(testData.api.statusCodes.found);
        expect(dashboardResponse.headers()['location']).toContain('/users/sign_in');
    });
}); 