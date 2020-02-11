module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      len: [3, 30]
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    small_image_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    large_image_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {});
};
