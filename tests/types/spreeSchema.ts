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

export const StatusCodes = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    SERVER_ERROR: 500
} as const;

export const ErrorMessages = {
    CART_NOT_FOUND: 'Cart not found',
    PRODUCT_NOT_FOUND: 'Product not found',
    INVALID_QUANTITY: 'Invalid quantity',
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_CREDENTIALS: 'Invalid credentials'
} as const;

export type SpreeCartResponse = SpreeResponse<CartAttributes>;
export type SpreeProductResponse = SpreeResponse<ProductAttributes>; 