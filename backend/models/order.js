// Deprecated: All database logic has been moved to Django backend. This file is intentionally left blank.
  customerId: { type: DataTypes.INTEGER, references: { model: Customer, key: 'id' } },
  shippingAddress: { type: DataTypes.STRING, allowNull: false },
});

Order.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = Order;
