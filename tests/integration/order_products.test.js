const { Order, OrderProduct, Product, User, Category, ShippingOption, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/:orderId/order-products', () => {
  afterEach(async () => {
    await Order.destroy({ where: {} });
    await OrderProduct.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await ShippingOption.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('PUT /ID', () => {
    let user, token, product, category, shipping_option, order, order_product, updated_order_product;

    const response = async (object, jwt, orderId, id) => {
      return await request
        .put(`/api/orders/${orderId}/order-products/${id}`)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        admin: true
      });
      token = createJWT(user);
      category = await Category.create({ name: 'Soda' });
      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      shipping_option = await ShippingOption.create({
        title: 'standard', description: "d1", cost: 0.00
      });
      order = await Order.create({
        userId: user.id,
        shippingOptionId: shipping_option.id
      });
      order_product = await OrderProduct.create({
        orderId: order.id,
        productId: product.id,
        price: 9.99,
        quantity: 2
      });

      updated_order_product = {
        orderId: order.id,
        productId: product.id,
        price: 0.00,
        quantity: 100
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(updated_order_product, token, order.id, order_product.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(updated_order_product, token, order.id, order_product.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid order_product ID', async () => {
      const order_product_id = 'id';
      const res = await response(updated_order_product, token, order.id, order_product_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if order_product ID valid but order_product ID not in DB', async () => {
      const order_product_id = '10000';
      const res = await response(updated_order_product, token, order.id, order_product_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid order ID ', async () => {
      const order_id = 'id';
      const res = await response(updated_order_product, token, order_id, order_product.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if order ID valid but order ID not in DB', async () => {
      const order_id = '10000';
      const res = await response(updated_order_product, token, order_id, order_product.id);

      expect(res.status).toBe(400);
    });

    // it('should return 400 if order_product is invalid', async () => {
    //   updated_order_product = {};
    //   const res = await response(updated_order_product, token, order.id, order_product.id);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update order_product if input is valid', async () => {
      const res = await response(updated_order_product, token, order.id, order_product.id);
      const result = await OrderProduct.findOne({ where: { id: order_product.id }});

      expect(result).toHaveProperty('id', order_product.id);
      expect(result).toHaveProperty('price', 0.00);
      expect(result).toHaveProperty('quantity', 100);
      expect(result).toHaveProperty('orderId', order.id);
      expect(result).toHaveProperty('productId', product.id);
    });

    it('should return updated order product if it is valid', async () => {
      const res = await response(updated_order_product, token, order.id, order_product.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', order_product.id);
      expect(res.body).toHaveProperty('price', 0.00);
      expect(res.body).toHaveProperty('quantity', 100);
      expect(res.body).toHaveProperty('orderId', order.id);
      expect(res.body).toHaveProperty('productId', product.id);
    });
  });

  describe('DELETE /ID', () => {
    let user, token, catgory, product, shipping_option, order, order_product;

    const response = async (orderId, id, jwt) => {
      return await request
        .delete(`/api/orders/${orderId}/order-products/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        admin: true
      });
      token = createJWT(user);
      category = await Category.create({ name: 'Soda' });
      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      shipping_option = await ShippingOption.create({
        title: 'standard', description: "d1", cost: 0.00
      });
      order = await Order.create({
        userId: user.id,
        shippingOptionId: shipping_option.id
      });

      order_product = await OrderProduct.create({
        orderId: order.id,
        productId: product.id,
        price: 9.99,
        quantity: 2
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(order.id, order_product.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(order.id, order_product.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid order ID ', async () => {
      const order_id = 'id';
      const res = await response(order_id, order_product.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if order ID valid but order ID not in DB', async () => {
      const order_id = '10000';
      const res = await response(order_id, order_product.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid order_product ID', async () => {
      const order_product_id = 'id';
      const res = await response(order.id, order_product_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if order_product ID valid but order_product ID not in DB', async () => {
      const order_product_id = '10000';
      const res = await response(order.id, order_product_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete order_product if input is valid', async () => {
      const res = await response(order.id, order_product.id, token);
      const result = await OrderProduct.findOne({ where: { id: order_product.id }});

      expect(result).toBeNull();
    });

    it('should return deleted order_product', async () => {
      const res = await response(order.id, order_product.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', order_product.id);
      expect(res.body).toHaveProperty('price', 9.99);
      expect(res.body).toHaveProperty('quantity', 2);
      expect(res.body).toHaveProperty('orderId', order.id);
      expect(res.body).toHaveProperty('productId', product.id);
    });
  });
});
