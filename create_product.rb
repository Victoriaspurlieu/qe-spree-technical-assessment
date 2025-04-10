product = Spree::Product.create!(
  name: 'Printed Pants',
  description: 'Beautiful printed pants',
  price: 29.99,
  shipping_category: Spree::ShippingCategory.first,
  available_on: Time.current
)

# Create a variant with size option
option_type = Spree::OptionType.find_or_create_by!(name: 'size', presentation: 'Size')
option_value = Spree::OptionValue.find_or_create_by!(name: 'xs', presentation: 'XS', option_type: option_type)

variant = product.variants.create!(
  sku: 'PP-XS',
  price: 29.99,
  option_values: [option_value]
)

# Set stock
stock_location = Spree::StockLocation.first
stock_item = variant.stock_items.find_or_create_by!(stock_location: stock_location)
stock_item.set_count_on_hand(10)

puts 'Product created successfully!' 