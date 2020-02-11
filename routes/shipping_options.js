const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { ShippingOption } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const shipping_options = await ShippingOption.findAll();
  res.send(shipping_options);
});

router.get('/:id', auth, async (req, res) => {
  const shpping_option = await ShippingOption.findOne({ where: { id: req.params.id }});
  if (!shpping_option) {
    return res.status(404).send('Shipping option with submitted ID not found');
  }
  res.send(shpping_option);
});

router.post('/', [auth, admin], async (req, res) => {
  try {
    const shipping_option = await ShippingOption.create({
      title: req.body.title,
      description: req.body.description,
      cost: req.body.cost
    });
    res.send(shipping_option);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  const shipping_option = await ShippingOption.findOne({ where: { id: req.params.id }});
  if (!shipping_option) {
    return res.status(404).send('Shipping option with submitted ID not found');
  }
  try {
    const updated_shipping_option = await shipping_option.update({
      title: req.body.title,
      description: req.body.description,
      cost: req.body.cost
    });
    res.send(updated_shipping_option);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const shipping_option = await ShippingOption.findOne({ where: { id: req.params.id }});
  if (!shipping_option) {
    return res.status(404).send('Shipping option with submitted ID not found');
  }
  await shipping_option.destroy();
  res.send(shipping_option);
});

module.exports = router;
