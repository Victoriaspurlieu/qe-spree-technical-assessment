export enum StatusCode {
    Ok = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,
    Found = 302,
    SeeOther = 303,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    UnprocessableEntity = 422,
    InternalServerError = 500
}

export enum ErrorMessage {
    InvalidCredentials = 'Invalid email or password.',
    Unauthorized = 'You need to sign in or sign up before continuing.',
    ProductNotFound = 'Product not found',
    InvalidQuantity = 'Invalid quantity',
    InvalidClient = 'Invalid client credentials',
    InvalidGrant = 'Invalid grant type',
    UnsupportedGrantType = 'Unsupported grant type',
    InvalidScope = 'Invalid scope',
    CartNotFound = 'Cart not found'
}

export interface SpreeResponse<T = any> {
    data: {
        id: string;
        type: string;
        attributes: T;
        relationships?: Record<string, {
            data: { id: string; type: string; } | null;
        }>;
    };
    included?: Array<{
        id: string;
        type: string;
        attributes: Record<string, any>;
    }>;
}

export interface CartAttributes {
    number: string;
    item_total: string;
    total: string;
    ship_total: string;
    adjustment_total: string;
    created_at: string;
    updated_at: string;
    completed_at: null | string;
    included_tax_total: string;
    additional_tax_total: string;
    display_additional_tax_total: string;
    display_included_tax_total: string;
    tax_total: string;
    currency: string;
    state: string;
    token: string;
    email: string | null;
    display_item_total: string;
    display_ship_total: string;
    display_adjustment_total: string;
    display_tax_total: string;
    promo_total: string;
    display_promo_total: string;
    item_count: number;
    special_instructions: string | null;
    display_total: string;
    pre_tax_item_amount: string;
    display_pre_tax_item_amount: string;
    pre_tax_total: string;
    items: Array<CartItem>;
}

export interface CartItem {
    id: number;
    quantity: number;
    price: string;
    variant_id: number;
    product_id: string;
    total: string;
    display_price: string;
    display_total: string;
    name: string;
    options_text: string;
}

export interface ProductAttributes {
    name: string;
    description: string;
    price: string;
    currency: string;
    display_price: string;
    available_on: string;
    meta_description: string | null;
    meta_keywords: string | null;
    updated_at: string;
    purchasable: boolean;
    in_stock: boolean;
    backorderable: boolean;
    available: boolean;
    slug: string;
}

export interface UserResponse {
    status: number;
    data: {
        id: string;
        type: string;
        attributes: {
            email: string;
        };
    };
}

export interface TokenResponse {
    status?: number;
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    created_at: number;
    scope: string;
}

export interface OrderResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            number: string;
            state: string;
            total: string;
            createdAt: string;
            updatedAt: string;
        };
    }[];
}

export interface OAuthErrorResponse {
    error: string;
    error_description?: string;
}

export interface AdminErrorResponse {
    error: string;
    error_description?: string;
    status: number;
}

export type SpreeCartResponse = SpreeResponse<CartAttributes>;
export type SpreeProductResponse = SpreeResponse<ProductAttributes>; 