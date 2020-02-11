const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Order, OrderProduct, CartProduct, Product, sequelize } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id},
    include: [{
      model: OrderProduct,
      required: false
    }]
  });
  res.send(orders);
});

router.post('/', auth, async (req, res) => {
  const cart_products = await CartProduct.findAll({
    where: { userId: req.user.id }
  });

  if (!cart_products.length) {
    res.status(404).send('Cart Empty');
  }

  let order_products = [];
  cart_products.forEach(async cp => {
    let product = await Product.findOne({ where: { id: cp.productId }});
    order_products.push({
      price: product.price,
      quantity: cp.quantity,
      productId: cp.productId
    });
  });

  try {
    let order = await Order.create({
      userId: req.user.id,
      shippingOptionId: req.body.shippingOptionId
    });
    for(let op of order_products) { op.orderId = order.id;}
    // Note: tried to use a transaction here. Didn't work
    await OrderProduct.bulkCreate(order_products);
    await CartProduct.destroy({ where: { userId: req.user.id }});
    res.send(order);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.get('/:id', auth, async (req, res) => {
  const order = await Order.findOne({
    where: { id: req.params.id },
    include: {
      model: OrderProduct,
      where: { orderId: req.params.id },
      required: false
    }
  });

  if (!order) {
    res.status(404).send('Order with submitted ID not found');
  } else { // Check for current user
    if (req.user.id !== order.userId) {
      res.status(403).send('Forbidden');
    } else {
      res.send(order);
    }
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  let order = await Order.findOne({ where: { id: req.params.id } });
  if (!order) {
    return res.status(404).send('Order with submitted ID not found');
  }

  try {
    const updated_order = await order.update({
      userId: req.body.userId,
      shippingOptionId: req.body.shippingOptionId,
    });
    res.send(updated_order);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const order = await Order.findOne({ where: { id: req.params.id } });
  if (!order) {
    res.status(404).send('Order ID not found');
  } else {
    await order.destroy(); // Auto-deletes order_products
    res.send(order);
  }
});

module.exports = router;
