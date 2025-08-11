// Deprecated: All database logic has been moved to Django backend. This file is intentionally left blank.
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.STRING },
  inventory: { type: DataTypes.INTEGER, defaultValue: 0 },
  categoryId: { type: DataTypes.INTEGER, references: { model: Category, key: 'id' } },
});

Product.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = Product;
