const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findProduct } = require('../middleware/find');
const { CartProduct, Product, sequelize } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const user_id = req.user.id;
  const cart_products = await CartProduct.findAll({
    where: { userId: user_id }
  });
  res.send(cart_products);
});

router.post('/', [auth, findProduct], async (req, res) => {
  try {
    const cart_product = await CartProduct.create({
      userId: req.user.id,
      productId: req.product.id,
      quantity: req.body.quantity
    });
    res.send(cart_product);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:id', [auth, findProduct], async (req, res) => {
  const cart_product = await CartProduct.findOne({ where: { id: req.params.id }});
  if (!cart_product) {
    return res.status(404).send('Cart product with submitted ID not found');
  } else if (req.user.id !== cart_product.userId) {
    return res.status(403).send('Forbidden');
  }

  try {
    const updated_cart_product = await cart_product.update({
      userId: req.user.id,
      productId: req.product.id,
      quantity: req.body.quantity
    });
    res.send(updated_cart_product);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', auth, async (req, res) => {
  const cart_product = await CartProduct.findOne({ where: { id: req.params.id } });
  if (!cart_product) {
    res.status(404).send('CartProduct ID not found');
  } else if (req.user.id !== cart_product.userId) {
    return res.status(403).send('Forbidden');
  } else {
    await cart_product.destroy();
    res.send(cart_product);
  }
});

module.exports = router;
