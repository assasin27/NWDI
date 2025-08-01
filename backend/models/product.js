const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const Category = require('./category');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.STRING },
  inventory: { type: DataTypes.INTEGER, defaultValue: 0 },
  categoryId: { type: DataTypes.INTEGER, references: { model: Category, key: 'id' } },
});

Product.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = Product;
