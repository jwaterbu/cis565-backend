const { CartProduct, Product, User, Category, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/cart-products', () => {
  afterEach(async () => {
    await CartProduct.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Category.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let user, other_user, token, product_1, product_2,
    cart_product_1, cart_product_2, other_cart_product;

    const response = async (jwt) => {
      return await request
        .get('/api/cart-products')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      category = await Category.create({ name: 'Soda' });
      user = await User.create({
        username: "bob",
        email: "bob@example.com",
        password_digest: "123456"
      });
      token = createJWT(user);
      other_user = await User.create({
        username: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });

      product_1 = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      product_2 = await Product.create({
        title: 'Sprite',
        description: 'Sprite Soda',
        price: 2.49,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });

      cart_product_1 = await CartProduct.create({
        quantity: 1,
        productId: product_1.id,
        userId: user.id
      });
      cart_product_2 = await CartProduct.create({
        quantity: 3,
        productId: product_1.id,
        userId: user.id
      });
      other_cart_product = await CartProduct.create({
        quantity: 2,
        productId: product_1.id,
        userId: other_user.id
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it(`should return all cart_products for current user only (stat code 200)`, async () => {
      const res = await response(token);

      expect(res.status).toBe(200);

      expect(res.body.length).toBe(2);
      expect(res.body.some(uq => uq.id === cart_product_1.id)).toBeTruthy();
      expect(res.body.some(uq => uq.id === cart_product_2.id)).toBeTruthy();
      expect(res.body.some(uq => uq.id === other_cart_product.id)).toBeFalsy();

      expect(res.body.some(uq => uq.quantity === cart_product_1.quantity)).toBeTruthy();
      expect(res.body.some(uq => uq.quantity === cart_product_2.quantity)).toBeTruthy();
      expect(res.body.some(uq => uq.quantity === other_cart_product.quantity)).toBeFalsy();

      expect(res.body.some(uq => uq.productId === cart_product_1.productId)).toBeTruthy();
      expect(res.body.some(uq => uq.productId === cart_product_2.productId)).toBeTruthy();

      expect(res.body.some(uq => uq.userId === cart_product_1.userId)).toBeTruthy();
      expect(res.body.some(uq => uq.userId === cart_product_2.userId)).toBeTruthy();
      expect(res.body.some(uq => uq.userId === other_cart_product.userId)).toBeFalsy();
    });
  });

  describe('POST /', () => {
    let user, token, cart_product_object, product, category;

    const response = async (object, jwt) => {
      return await request
        .post('/api/cart-products')
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      category = await Category.create({ name: 'Soda' });
      user = await User.create({
        username: "bob",
        email: "bob@example.com",
        password_digest: "123456"
      });
      token = createJWT(user);
      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      cart_product_object = {
        quantity: 1,
        productId: product.id,
        userId: user.id
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(cart_product_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if invalid product ID', async () => {
      cart_product_object.productId = 'id';
      const res = await response(cart_product_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if product ID valid but product ID not in DB', async () => {
      cart_product_object.productId = '10000';
      const res = await response(cart_product_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if cart_product is invalid', async () => {
      cart_product_object = {
        productId: product.id,
        userId: user.id,
      };
      const res = await response(cart_product_object, token);

      expect(res.status).toBe(400);
    });

    it('should save cart_product if cart_product is valid', async () => {
      const res = await response(cart_product_object, token);
      const cart_product = await CartProduct.findOne({ where: { quantity: 1 } });

      expect(cart_product).toHaveProperty('id');
      expect(cart_product).toHaveProperty('quantity', 1);
      expect(cart_product).toHaveProperty('productId', product.id);
      expect(cart_product).toHaveProperty('userId', user.id);
    });

    it('should return cart_product if cart_product is valid', async () => {
      const res = await response(cart_product_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('quantity', 1);
      expect(res.body).toHaveProperty('productId', product.id);
      expect(res.body).toHaveProperty('userId', user.id);
    });
  });

  describe('PUT /ID', () => {
    let user, other_user, token, product, cart_product_object,
    cart_product, other_cart_product;

    const response = async (object, cp_id, jwt) => {
      return await request
        .put('/api/cart-products/' + cp_id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      category = await Category.create({ name: 'Soda' });
      user = await User.create({
        username: "bob",
        email: "bob@example.com",
        password_digest: "123456"
      });
      token = createJWT(user);
      other_user = await User.create({
        username: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });

      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });

      cart_product = await CartProduct.create({
        quantity: 1,
        productId: product.id,
        userId: user.id
      });
      other_cart_product = await CartProduct.create({
        quantity: 2,
        productId: product.id,
        userId: other_user.id
      });
      cart_product_object = {
        quantity: 100,
        productId: product.id,
        userId: user.id
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(cart_product_object, cart_product.id, token);

      expect(res.status).toBe(401);
    });

     it('should return 403 if user is not current user', async () => {
      const res = await response(cart_product_object, other_cart_product.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid product ID', async () => {
      cart_product_object.productId = 'id';
      const res = await response(cart_product_object, cart_product.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if product ID valid but product ID not in DB', async () => {
      cart_product_object.productId = '10000';
      const res = await response(cart_product_object, cart_product.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid cart_product ID', async () => {
      const cart_product_id = 'id';
      const res = await response(cart_product_object, cart_product_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if cart_product ID valid but cart_product ID not in DB', async () => {
      const cart_product_id = '10000';
      const res = await response(cart_product_object, cart_product_id, token);

      expect(res.status).toBe(404);
    });

    // it('should return 400 if cart_product is invalid', async () => {
    //   cart_product_object = { productId: product.id };
    //   const res = await response(cart_product_object, cart_product.id, token);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update cart_product if input is valid', async () => {
      const res = await response(cart_product_object, cart_product.id, token);
      const result = await CartProduct.findOne({ where: { id: cart_product.id }});

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('quantity', 100);
      expect(result).toHaveProperty('productId', product.id);
      expect(result).toHaveProperty('userId', user.id);
    });

    it('should return updated cart_product if it is valid', async () => {
      const res = await response(cart_product_object, cart_product.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('quantity', 100);
      expect(res.body).toHaveProperty('productId', product.id);
      expect(res.body).toHaveProperty('userId', user.id);
    });
  });

  describe('DELETE /ID', () => {
    let user, other_user, token, category, product,
    cart_product, other_cart_product;

    const response = async (uq_id, jwt) => {
      return await request
        .delete('/api/cart-products/' + uq_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      category = await Category.create({ name: 'Soda' });
      user = await User.create({
        username: "bob",
        email: "bob@example.com",
        password_digest: "123456"
      });
      token = createJWT(user);
      other_user = await User.create({
        username: "binky",
        email: "bad@bunny.com",
        password_digest: "123456"
      });

      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });

      cart_product = await CartProduct.create({
        quantity: 1,
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
      const res = await response(cart_product.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user', async () => {
     const res = await response(other_cart_product.id, token);

     expect(res.status).toBe(403);
   });

    it('should return 404 if invalid cart_product ID', async () => {
      const cart_product_id = 'id';
      const res = await response(cart_product_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if cart_product ID valid but cart_product ID not in DB', async () => {
      const cart_product_id = '10000';
      const res = await response(cart_product_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete cart_product and if input is valid', async () => {
      const res = await response(cart_product.id, token);
      const returned_cart_product = await CartProduct.findOne({ where: { id: cart_product.id }});

      expect(returned_cart_product).toBeNull();
    });

    it('should return deleted cart_product', async () => {
      const res = await response(cart_product.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', cart_product.id);
      expect(res.body).toHaveProperty('quantity', 1);
      expect(res.body).toHaveProperty('productId', product.id);
      expect(res.body).toHaveProperty('userId', user.id);
    });
  });
});
