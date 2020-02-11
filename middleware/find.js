const { Category, Product, Review, Order} = require('../sequelize');

async function findCategory(req, res, next) {
  const category = await Category.findOne({ where: { id: req.body.categoryId }});
  if (!category) {
    return res.status(400).send('Invalid Category');
  }
  req.category = category;
  next();
}

async function findProduct(req, res, next) {
  const product_id = req.params.productId ? req.params.productId : req.body.productId;
  const product = await Product.findOne({
    where: { id: product_id },
    include: {
      model: Review,
      where: { productId: product_id },
      required: false
    }
  });
  if (!product) {
    return res.status(400).send('Invalid Product');
  }
  req.product = product;
  next();
}

async function findOrder(req, res, next) {
  const order = await Order.findOne({ where: { id: req.params.orderId }});
  if (!order) {
    return res.status(400).send('Invalid Order');
  }
  req.order = order;
  next();
}

module.exports = {
  findProduct,
  findCategory,
  findOrder
};
