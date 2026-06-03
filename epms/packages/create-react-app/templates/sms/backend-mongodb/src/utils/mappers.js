export const mapProduct = (doc) => ({
  product_id: doc._id,
  product_name: doc.productName,
  category: doc.category,
  quantity: doc.quantity,
  price: doc.price,
  created_at: doc.createdAt,
});

export const mapCustomer = (doc) => ({
  customer_id: doc._id,
  full_name: doc.fullName,
  phone_number: doc.phoneNumber,
  email: doc.email || null,
  address: doc.address,
  registration_date: doc.registrationDate,
});

export const mapSale = (doc) => ({
  sale_id: doc._id,
  quantity: doc.quantity,
  unit_price: doc.unitPrice,
  total_price: doc.totalPrice,
  sale_date: doc.saleDate,
  customer_id: doc.customer?._id || doc.customer,
  customer_name: doc.customer?.fullName || "",
  product_id: doc.product?._id || doc.product,
  product_name: doc.product?.productName || "",
});
