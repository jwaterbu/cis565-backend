const express = require('express');
const app = express();
const config = require('config');
require('express-async-errors');
const helmet = require('helmet');
const compression = require('compression')
const cors = require('cors');

const users = require('./routes/users');
const reviews = require('./routes/reviews');
const products = require('./routes/products');
const categories = require('./routes/categories');
const shipping_options = require('./routes/shipping_options');
const cart_products = require('./routes/cart_products');
const orders = require('./routes/orders');
const order_products = require('./routes/order_products');
const login = require('./routes/login');

const error = require('./middleware/error');

app.use(helmet());
app.use(compression());
app.use(cors());
app.get('/api', (req, res) => {
  const url = "https://github.com/";
  res.send(`See README for API use instructions: ${url}`);
});
app.use(express.json());
app.use('/api/users', users);
app.use('/api/products', products);
  app.use('/api/products', reviews); // Nested routes
app.use('/api/categories', categories);
app.use('/api/shipping-options', shipping_options);
app.use('/api/cart-products', cart_products);
app.use('/api/orders', orders);
  app.use('/api/orders', order_products); // Nested routes
app.use('/api/login', login);
app.use(express.static('public'));

app.use(error);

if (!config.get('jwt_private_key'))
  throw new Error('FATAL ERROR: jwt_private_key is not defined.');

if (!config.get('bcrypt_salt'))
  throw new Error('FATAL ERROR: bcrypt_salt is not defined.');

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || config.get('port');
  const server = app.listen(port, () => console.log(`Listening on port ${port}...`));
}
module.exports = app;
