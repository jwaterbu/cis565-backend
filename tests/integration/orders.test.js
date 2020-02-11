const { Order, OrderProduct, Product, User, Category, ShippingOption, CartProduct, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/orders', () => {
  afterEach(async () => {
    await Order.destroy({ where: {} });
    await OrderProduct.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await ShippingOption.destroy({ where: {} });
    await CartProduct.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let user, other_user, token, category, product, shipping_option,
    order_1, order_2, other_user_order;

    const response = async (jwt) => {
      return await request
        .get('/api/orders')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: 123456,
        admin: true
      });
      other_user = await User.create({
        username: 'tom',
        email: 'tom@example.com',
        password_digest: 123456,
        admin: false
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
      order_1 = await Order.create({
        userId: user.id, shippingOptionId: shipping_option.id
      });
      order_2 = await Order.create({
        userId: user.id, shippingOptionId: shipping_option.id
      });
      other_user_order = await Order.create({
        userId: other_user.id, shippingOptionId: shipping_option.id
      });

      await OrderProduct.bulkCreate([
        { orderId: order_1.id, productId: product.id, price: 9.99, quantity: 2 },
        { orderId: order_2.id, productId: product.id, price: 5.00, quantity: 1 },
        { orderId: other_user_order.id, productId: product.id, price: 7.00, quantity: 2 }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it(`should return all orders and associated order_items
        for current user only (stat code 200)`, async () => {
      const res = await response(token);

      expect(res.status).toBe(200);

      expect(res.body.some(o => o.id === order_1.id)).toBeTruthy();
      expect(res.body.some(o => o.id === order_2.id)).toBeTruthy();
      expect(res.body.some(o => o.id === other_user_order.id)).toBeFalsy();

      expect(res.body.some(o => o.userId === order_1.userId)).toBeTruthy();
      expect(res.body.some(o => o.userId === order_2.userId)).toBeTruthy();
      expect(res.body.some(o => o.userId === other_user_order.userId)).toBeFalsy();

      expect(res.body.some(o => o.shippingOptionId === order_1.shippingOptionId)).toBeTruthy();
      expect(res.body.some(o => o.shippingOptionId === order_2.shippingOptionId)).toBeTruthy();

      expect(res.body.some(o => o.order_products.length === 1)).toBeTruthy();
      expect(res.body.length).toBe(2);
    });
  });

  describe('POST /', () => {
    let user, other_user, token, order, order_object, shipping_option,
        new_shipping_option, product, cart_product_1, cart_product_2,
        other_cart_product, category;

    const response = async (object, jwt) => {
      return await request
        .post('/api/orders')
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: 123456,
        admin: true
      });
      other_user = await User.create({
        username: 'tom',
        email: 'tom@example.com',
        password_digest: 123456,
        admin: false
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
      new_shipping_option = await ShippingOption.create({
        title: 'one-day', description: "d2",  cost: 5.99
      })
      order_object = {
        userId: user.id,
        shippingOptionId: shipping_option.id
      }
      cart_product_1 = await CartProduct.create({
        quantity: 1,
        productId: product.id,
        userId: user.id
      });
      cart_product_2 = await CartProduct.create({
        quantity: 3,
        productId: product.id,
        userId: user.id
      });
      other_cart_product = await CartProduct.create({
        quantity: 2,
        productId: product.id,
        userId: other_user.id
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(order_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if order is invalid', async () => {
      order_object = {};
      const res = await response(order_object, token);

      expect(res.status).toBe(400);
    });

    it('should save order and order_products if they are valid', async () => {
      const res = await response(order_object, token);
      const found_o = await Order.findOne({ where: { userId: order_object.userId } });
      const op_1 = await OrderProduct.findOne({ where: { quantity: cart_product_1.quantity } });
      const op_2 = await OrderProduct.findOne({ where: { quantity: cart_product_2.quantity } });

      expect(found_o).toHaveProperty('id');
      expect(found_o).toHaveProperty('userId', order_object.userId);
      expect(found_o).toHaveProperty('shippingOptionId', order_object.shippingOptionId);

      expect(op_1).toHaveProperty('productId', cart_product_1.productId);
      expect(op_1).toHaveProperty('orderId', found_o.id);
      expect(op_1).toHaveProperty('quantity', cart_product_1.quantity);
      expect(op_1).toHaveProperty('price', product.price);

      expect(op_2).toHaveProperty('productId', cart_product_2.productId);
      expect(op_2).toHaveProperty('orderId', found_o.id);
      expect(op_2).toHaveProperty('quantity', cart_product_2.quantity);
      expect(op_1).toHaveProperty('price', product.price);
    });

    it('should empty cart if order is valid', async () => {
      const res = await response(order_object, token);
      const returned_order_products = await CartProduct.findAll({
        where: { userId: user.id }
      });

      expect(returned_order_products).toEqual([]);
    });

    it('should return order if order is valid', async () => {
      const res = await response(order_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('userId', order_object.userId);
      expect(res.body).toHaveProperty('shippingOptionId', order_object.shippingOptionId);
    });
  });

  describe('GET /ID', () => {
    let user, other_user, token, category, product, shipping_option, order,
    other_user_order;

    const response = async (o_id, jwt) => {
      return await request
        .get('/api/orders/' + o_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: 123456,
        admin: true
      });
      other_user = await User.create({
        username: 'tom',
        email: 'tom@example.com',
        password_digest: 123456,
        admin: false
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
        userId: user.id, shippingOptionId: shipping_option.id
      });
      other_user_order = await Order.create({
        userId: other_user.id, shippingOptionId: shipping_option.id
      });

      await OrderProduct.bulkCreate([
        { orderId: order.id, productId: product.id, price: 9.99, quantity: 2 },
        { orderId: order.id, productId: product.id, price: 5.00, quantity: 1 },
        { orderId: other_user_order.id, productId: product.id, price: 7.00, quantity: 2 }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(order.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user', async () => {
      const res = await response(other_user_order.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid order ID', async () => {
      const order_id = 'id';
      const res = await response(order_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if order ID valid but order ID not in DB', async () => {
      const order_id = '10000';
      const res = await response(order_id, token);

      expect(res.status).toBe(404);
    });

    it('should return order and all associated order_products (stat code 200)', async () => {
      const res = await response(order.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', order.id);
      expect(res.body).toHaveProperty('userId', user.id);
      expect(res.body).toHaveProperty('shippingOptionId', shipping_option.id);

      expect(res.body.order_products.length).toBe(2);
      expect(res.body.order_products.some(op => op.price === 9.99)).toBeTruthy();
      expect(res.body.order_products.some(op => op.price === 5.00)).toBeTruthy();
      expect(res.body.order_products.some(op => op.price === 7.00)).toBeFalsy();
    });
  });

  describe('PUT /ID', () => {
    let user, other_user, token, order, order_object, shipping_option,
        new_shipping_option, product;

    const response = async (object, o_id, jwt) => {
      return await request
        .put('/api/orders/' + o_id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: 123456,
        admin: true
      });
      other_user = await User.create({
        username: 'tom',
        email: 'tom@example.com',
        password_digest: 123456,
        admin: false
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
      new_shipping_option = await ShippingOption.create({
        title: 'one-day', description: "d2",  cost: 5.99
      })
      order = await Order.create({
        userId: user.id, shippingOptionId: shipping_option.id
      });
      order_object = {
        userId: other_user.id, shippingOptionId: new_shipping_option.id
      }
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(order_object, order.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(order_object, order.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid order ID', async () => {
      const order_id = 'id';
      const res = await response(order_object, order_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if order ID valid but order ID not in DB', async () => {
      const order_id = '10000';
      const res = await response(order_object, order_id, token);

      expect(res.status).toBe(404);
    });

    // it('should return 400 if order is invalid', async () => {
    //   order_object = {};
    //   const res = await response(order_object, order.id, token);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update order if input is valid', async () => {
      const res = await response(order_object, order.id, token);
      const result = await Order.findOne({ where: { id: order.id }});

      expect(result).toHaveProperty('id', order.id);
      expect(result).toHaveProperty('userId', other_user.id);
      expect(result).toHaveProperty('shippingOptionId', new_shipping_option.id);
    });

    it('should return updated order if it is valid', async () => {
      const res = await response(order_object, order.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', order.id);
      expect(res.body).toHaveProperty('userId', other_user.id);
      expect(res.body).toHaveProperty('shippingOptionId', new_shipping_option.id);
    });
  });

  describe('DELETE /ID', () => {
    let user, token, category, product, shipping_option, order;

    const response = async (o_id, jwt) => {
      return await request
        .delete('/api/orders/' + o_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: 123456,
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
        userId: user.id, shippingOptionId: shipping_option.id
      });
      await OrderProduct.bulkCreate([
        { orderId: order.id, productId: product.id, price: 9.99, quantity: 2 },
        { orderId: order.id, productId: product.id, price: 5.00, quantity: 1 }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(order.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(order.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid order ID', async () => {
      const order_id = 'id';
      const res = await response(order_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if order ID valid but order ID not in DB', async () => {
      const order_id = '10000';
      const res = await response(order_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete order and associated order_products if input is valid', async () => {
      const res = await response(order.id, token);
      const returned_order = await Order.findOne({ where: { id: order.id }});
      const returned_order_products = await OrderProduct.findAll({
        where: { orderId: order.id }
      });

      expect(returned_order).toBeNull();
      expect(returned_order_products).toEqual([]);
    });

    it('should return deleted order', async () => {
      const res = await response(order.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', order.id);
      expect(res.body).toHaveProperty('userId', user.id);
      expect(res.body).toHaveProperty('shippingOptionId', shipping_option.id);
    });
  });
});
