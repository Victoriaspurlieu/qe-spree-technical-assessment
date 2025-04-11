# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Load Spree core seeds first
Spree::Core::Engine.load_seed if defined?(Spree::Core)

# Create a default store if it doesn't exist
store = Spree::Store.find_or_initialize_by(code: 'spree_store')
store.attributes = {
  name: 'Default Store',
  url: ENV.fetch('STORE_URL', 'localhost:3000'),
  mail_from_address: ENV.fetch('MAIL_FROM_ADDRESS', 'no-reply@example.com'),
  default_currency: 'USD',
  supported_currencies: 'USD',
  default_locale: 'en',
  supported_locales: 'en',
  seo_title: 'Default Store',
  meta_description: 'Default Store Description',
  facebook: '',
  twitter: '',
  instagram: '',
  default: true,
  customer_support_email: ENV.fetch('MAIL_FROM_ADDRESS', 'no-reply@example.com'),
  new_order_notifications_email: ENV.fetch('NEW_ORDER_NOTIFICATIONS_EMAIL', 'no-reply@example.com')
}

# Set store settings
store.settings = {
  address_requires_state: true,
  alternative_shipping_phone: false,
  show_variant_full_price: true,
  check_for_spree_alerts: false
}

# Save the store first to ensure it exists
store.save!

# Create admin user
admin = Spree::User.find_or_initialize_by(email: 'spree@example.com')
if admin.new_record?
  admin.password = 'spree123'
  admin.password_confirmation = 'spree123'
  admin.spree_roles << Spree::Role.find_or_create_by(name: 'admin')
  admin.save!
end

# Set store preferences after saving
store.preferences = {
  default_country_id: nil,
  allow_guest_checkout: true,
  digital_asset_authorized_clicks: 3,
  digital_asset_authorized_days: 2,
  checkout_zone_id: nil,
  default_tax_zone_id: nil,
  default_tax_zone: nil,
  default_country: nil,
  default_currency: 'USD',
  default_locale: 'en',
  supported_currencies: 'USD',
  supported_locales: 'en',
  default_mail_from_address: ENV.fetch('MAIL_FROM_ADDRESS', 'no-reply@example.com'),
  default_customer_support_email: ENV.fetch('MAIL_FROM_ADDRESS', 'no-reply@example.com'),
  default_new_order_notifications_email: ENV.fetch('NEW_ORDER_NOTIFICATIONS_EMAIL', 'no-reply@example.com')
}
store.save!

# Create a default shipping category
shipping_category = Spree::ShippingCategory.find_or_create_by!(name: 'Default')

# Create a default tax category
tax_category = Spree::TaxCategory.find_or_create_by!(name: 'Default', is_default: true)

# Create shipping zones
created_zones = {}
['North America', 'Europe', 'Asia'].each do |zone_name|
  zone = Spree::Zone.find_or_create_by!(name: zone_name)
  zone.kind = 'country'
  zone.save!
  created_zones[zone_name] = zone
end

# Add countries to zones
Spree::Country.where(iso: ['US', 'CA', 'MX']).each do |country|
  created_zones['North America'].zone_members.create!(zoneable: country)
end

# Create sample products
products = [
  {
    name: 'PRINTED PANTS',
    description: 'A stylish pair of printed pants',
    price: 49.99,
    available_on: Time.current,
    shipping_category: shipping_category,
    tax_category: tax_category,
    status: 'active'
  },
  {
    name: 'Sample Product 1',
    description: 'This is a sample product for testing',
    price: 19.99,
    available_on: Time.current,
    shipping_category: shipping_category,
    tax_category: tax_category,
    status: 'active'
  },
  {
    name: 'Sample Product 2',
    description: 'Another sample product for testing',
    price: 29.99,
    available_on: Time.current,
    shipping_category: shipping_category,
    tax_category: tax_category,
    status: 'active'
  }
]

products.each do |product_attrs|
  product = Spree::Product.find_or_initialize_by(name: product_attrs[:name])
  product.attributes = product_attrs.except(:price, :public_metadata, :private_metadata)
  product.public_metadata = {}
  product.private_metadata = {}
  product.stores << store unless product.stores.include?(store)
  
  if product.save
    variant = product.master
    variant.price = product_attrs[:price]
    variant.save
  end
end

# Create shipping methods using the already created zones
shipping_methods = [
  {
    name: 'Standard Shipping',
    display_on: 'both',
    code: 'STANDARD',
    calculator_type: 'Spree::Calculator::Shipping::FlatRate',
    shipping_categories: [shipping_category],
    zones: [created_zones['North America']],
    available_to_all: true
  },
  {
    name: 'Express Shipping',
    display_on: 'both',
    code: 'EXPRESS',
    calculator_type: 'Spree::Calculator::Shipping::FlatRate',
    shipping_categories: [shipping_category],
    zones: [created_zones['North America']],
    available_to_all: true
  }
]

shipping_methods.each do |method_attrs|
  method = Spree::ShippingMethod.find_or_initialize_by(name: method_attrs[:name])
  method.attributes = method_attrs.except(:shipping_categories, :zones)
  method.shipping_categories = method_attrs[:shipping_categories]
  method.zones = method_attrs[:zones]
  method.available_to_all = method_attrs[:available_to_all]
  method.save!

  # Create calculator for the shipping method
  calculator = method.calculator || method.build_calculator
  calculator.type = method_attrs[:calculator_type]
  calculator.preferences = { amount: method_attrs[:name] == 'Standard Shipping' ? 5.99 : 12.99 }
  calculator.save!
end

# Create a default payment method
payment_method = Spree::PaymentMethod::Check.find_or_create_by!(
  name: 'Check',
  description: 'Pay by check',
  active: true,
  display_on: 'both'
)
payment_method.stores << store unless payment_method.stores.include?(store)
payment_method.save!

puts "Setup completed successfully!"
