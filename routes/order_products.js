const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findOrder, findProduct } = require('../middleware/find');
const { OrderProduct, Order, Question } = require('../sequelize');
const prefix = '/:orderId/order-products';

router.put(`${prefix}/:id`, [auth, admin, findOrder, findProduct], async (req, res) => {
  const order_product = await OrderProduct.findOne({ where: { id: req.params.id } });
  if (!order_product) {
    return res.status(404).send('Order product with submitted ID not found');
  }

  try {
    const updated_order_product = await order_product.update({
      orderId: req.order.id,
      productId: req.product.id,
      price: req.body.price,
      quantity: req.body.quantity
    });
    res.send(updated_order_product);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete(`${prefix}/:id`, [auth, admin, findOrder], async (req, res) => {
  const order_product = await OrderProduct.findOne({ where: { id: req.params.id }});
  if (!order_product) {
    return res.status(404).send('Order product with submitted ID not found');
  }
  await order_product.destroy();
  res.send(order_product);
});

module.exports = router;
