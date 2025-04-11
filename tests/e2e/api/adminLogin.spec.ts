import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import testData from '../../config/testData';
import { StatusCode } from '../../schemas/spreeSchema';
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
        expect(dashboardResponse.status()).toBe(StatusCode.Ok);

        // Logout and clear cookies
        await authenticatedApiUtils.adminLogout();
    });

    test('should fail with invalid credentials', async () => {
        const response = await apiUtils.adminLogin('invalid@example.com', 'wrongpassword');
        expect(response.status()).toBe(StatusCode.UnprocessableEntity);
        
        const html = await response.text();
        expect(html).toContain('Invalid Email or password.');
        
        // Verify no admin session cookie is set
        const cookies = response.headers()['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies).not.toContain('spree_admin_session');
    });

    test('should fail with empty credentials', async () => {
        const response = await apiUtils.adminLogin('', '');
        expect(response.status()).toBe(StatusCode.UnprocessableEntity);
        
        const html = await response.text();
        expect(html).toContain('Invalid Email or password.');
        
        // Verify no admin session cookie is set
        const cookies = response.headers()['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies).not.toContain('spree_admin_session');
    });

    test('should not access admin resources without authentication', async () => {
        const response = await apiUtils.getAdminDashboard();
        expect(response.status()).toBe(StatusCode.Found);
        expect(response.headers()['location']).toContain('/users/sign_in');
    });

    test('should not access admin resources after logout', async () => {
        const loginResponse = await apiUtils.adminLogin('spree@example.com', 'spree123');
        expect(loginResponse.status()).toBe(StatusCode.SeeOther);
        
        await apiUtils.adminLogout();
        
        // Try to access admin resources
        const dashboardResponse = await apiUtils.getAdminDashboard();
        expect(dashboardResponse.status()).toBe(StatusCode.Found);
        expect(dashboardResponse.headers()['location']).toContain('/users/sign_in');
    });
}); 