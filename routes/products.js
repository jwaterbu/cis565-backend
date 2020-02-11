const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findCategory } = require('../middleware/find');
const { Product, Review, Category } = require('../sequelize');

router.get('/', async (req, res) => {
  const products = await Product.findAll({
    include: [{
      model: Review,
      // where: { product_id: req.params.id },
      required: false
    }]
  });
  res.send(products);
});

router.post('/', [auth, admin, findCategory], async (req, res) => {
  try {
    const product = await Product.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      small_image_path: req.body.small_image_path,
      large_image_path: req.body.large_image_path,
      categoryId: req.category.id
    });
    res.send(product);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:id', async (req, res) => {
  let product;
  const id = req.params.id;

  product = await Product.findOne(
  { where: { id: req.params.id },
    include: {
      model: Review,
      where: { productId: id },
      required: false
    }
  });

  if (!product) {
    res.status(404).send('Product with submitted ID not found');
  } else {
    res.send(product);
  }
});

router.put('/:id', [auth, admin, findCategory], async (req, res) => {
  const product = await Product.findOne({ where: { id: req.params.id } });
  if (!product) return res.status(404).send('Product with submitted ID not found');

  try {
    const updated_product = await product.update({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      small_image_path: req.body.small_image_path,
      large_image_path: req.body.large_image_path,
      categoryId: req.body.categoryId
    });
    res.send(updated_product);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const product = await Product.findOne({ where: { id: req.params.id } });
  if (!product) return res.status(404).send('Product ID not found');

  await product.destroy(); // Auto-deletes questions
  res.send(product);
});

module.exports = router;
