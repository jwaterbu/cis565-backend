module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cart_product', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
};
