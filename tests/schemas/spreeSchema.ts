export enum StatusCode {
    Ok = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    UnprocessableEntity = 422
}

export enum ErrorMessage {
    InvalidCredentials = 'Invalid email or password.',
    Unauthorized = 'You need to sign in or sign up before continuing.',
    ProductNotFound = 'Product not found',
    InvalidQuantity = 'Invalid quantity'
}

export interface CartResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            number: string;
            item_total: string;
            total: string;
            ship_total: string;
            adjustment_total: string;
            created_at: string;
            updated_at: string;
            completed_at: string | null;
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
        };
        relationships: {
            line_items: {
                data: Array<{
                    id: string;
                    type: string;
                }>;
            };
        };
        included?: Array<{
            id: string;
            type: string;
            attributes: {
                name: string;
                quantity: number;
                price: string;
                currency: string;
                display_price: string;
                total: string;
                display_total: string;
                variant_id: number;
                options_text: string;
            };
        }>;
    };
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
    status: number;
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