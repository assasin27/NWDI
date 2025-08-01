const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const Customer = require('./customer');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  status: { type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
  total: { type: DataTypes.FLOAT, allowNull: false },
  customerId: { type: DataTypes.INTEGER, references: { model: Customer, key: 'id' } },
  shippingAddress: { type: DataTypes.STRING, allowNull: false },
});

Order.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = Order;
