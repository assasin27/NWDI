// Deprecated: All database logic has been moved to Django backend. This file is intentionally left blank.
  productId: { type: DataTypes.INTEGER, references: { model: Product, key: 'id' } },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
});

OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = OrderItem;
