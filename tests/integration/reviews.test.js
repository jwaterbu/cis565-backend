const { Product, Review, User, Category, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/products/:productId/reviews', () => {
  afterEach(async () => {
    await Product.destroy({ where: {} });
    await Review.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Category.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let user, token, quiz;

    const response = async (productId, jwt) => {
      return await request
        .get(`/api/products/${productId}/reviews`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob' ,
        email: 'bob@example.com',
        password_digest: 123456
      });
      token = createJWT(user);
      const category = await Category.create({ name: 'Soda' });
      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      await Review.bulkCreate([
        { productId: product.id, userId: user.id, title: 'Great', body: "b1", rating: 5 },
        { productId: product.id, userId: user.id, title: 'Bad', body: "b2", rating: 1 }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(product.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if invalid product ID ', async () => {
      const product_id = 'id';
      const res = await response(product_id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if product ID valid but product ID not in DB', async () => {
      const product_id = '10000';
      const res = await response(product_id, token);

      expect(res.status).toBe(400);
    });

    it('should return all reviews (stat code 200)', async () => {
      const res = await response(product.id, token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.title === 'Great')).toBeTruthy();
      expect(res.body.some(m => m.body === 'b1')).toBeTruthy();
      expect(res.body.some(m => m.rating === 5)).toBeTruthy();

      expect(res.body.some(m => m.title === 'Bad')).toBeTruthy();
      expect(res.body.some(m => m.body === 'b2')).toBeTruthy();
      expect(res.body.some(m => m.rating === 1)).toBeTruthy();
    });
  });

  describe('POST /', () => {
    let user, token, product, review_object;

    const response = async (object, productId, jwt) => {
      return await request
        .post(`/api/products/${productId}/reviews`)
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({ username: 'bob' , email: 'bob@example.com', password_digest: 123456 });
      token = createJWT(user);
      const category = await Category.create({ name: 'Soda' });
      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      review_object = {
        productId: product.id,
        userId: user.id,
        title: 'Great',
        body: "b1",
        rating: 5
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(review_object, product.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if invalid product ID ', async () => {
      const product_id = 'id';
      const res = await response(review_object, product_id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if product ID valid but product ID not in DB', async () => {
      const product_id = '10000';
      const res = await response(review_object, product_id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if review is invalid', async () => {
      review_object = {};
      const res = await response(review_object, product.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 403 if user already left review on current product', async () => {
      await Review.create({
        productId: product.id,
        userId: user.id,
        title: 'Amazing',
        body: "b0",
        rating: 5
      });
      const res = await response(review_object, product.id, token);

      expect(res.status).toBe(403);
    });

    it('should save review if review is valid', async () => {
      const res = await response(review_object, product.id, token);
      const review = await Review.findOne({
        where: { title: 'Great' }
      });

      expect(review).toHaveProperty('id');
      expect(review).toHaveProperty('productId', product.id);
      expect(review).toHaveProperty('userId', user.id);
      expect(review).toHaveProperty('title', 'Great');
      expect(review).toHaveProperty('body', 'b1');
      expect(review).toHaveProperty('rating', 5);
    });

    it('should return review if review is valid', async () => {
      const res = await response(review_object, product.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', 'Great');
      expect(res.body).toHaveProperty('body', 'b1');
      expect(res.body).toHaveProperty('rating', 5);
    });
  });

  describe('GET /ID', () => {
    let user, token, product, review;

    const response = async (productId, id, jwt) => {
      return await request
        .get(`/api/products/${productId}/reviews/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({ username: 'bob' , email: 'bob@example.com', password_digest: 123456 });
      token = createJWT(user);
      const category = await Category.create({ name: 'Soda' });
      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      review = await Review.create({
        productId: product.id,
        userId: user.id,
        title: 'Great',
        body: "b1",
        rating: 5
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(product.id, review.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if invalid product ID ', async () => {
      const product_id = 'id';
      const res = await response(product_id, review.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if product ID valid but product ID not in DB', async () => {
      const product_id = '10000';
      const res = await response(product_id, review.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid review ID', async () => {
      const review_id = 'id';
      const res = await response(product.id, review_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if review ID valid but review ID not in DB', async () => {
      const review_id = '10000';
      const res = await response(product.id, review_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific review if valid product and review ID', async () => {
      const res = await response(product.id, review.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', 'Great');
      expect(res.body).toHaveProperty('body', 'b1');
      expect(res.body).toHaveProperty('rating', 5);
    });
  });

  describe('PUT /ID', () => {
    let user, token, product, review_object, review;

    const response = async (object, jwt, productId, id) => {
      return await request
        .put(`/api/products/${productId}/reviews/${id}`)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob' ,
        email: 'bob@example.com',
        password_digest: 123456
      });
      token = createJWT(user);
      other_user = await User.create({
        username: 'other' ,
        email: 'other@example.com',
        password_digest: 123456
      });
      const category = await Category.create({ name: 'Soda' });
      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      review = await Review.create({
        productId: product.id,
        userId: user.id,
        title: 'Great',
        body: "b1",
        rating: 5
      });
      other_user_review = await Review.create({
        productId: product.id,
        userId: other_user.id,
        title: 'Meh',
        body: "b2",
        rating: 53
      });
      review_object = {
        productId: product.id,
        userId: user.id,
        title: 'Terrible',
        body: "b3",
        rating: 1
      }
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(review_object, token, product.id, review.id);

      expect(res.status).toBe(401);
    });

    it('should return 400 if invalid product ID ', async () => {
      const product_id = 'id';
      const res = await response(review_object, token, product_id, review.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if product ID valid but product ID not in DB', async () => {
      const product_id = '10000';
      const res = await response(review_object, token, product_id, review.id);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid review ID ', async () => {
      const review_id = 'id';
      const res = await response(review_object, token, product.id, review_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if review ID valid but review ID not in DB', async () => {
      const review_id = '10000';
      const res = await response(review_object, token, product.id, review_id);

      expect(res.status).toBe(404);
    });

    it('should return 403 if user is not admin and review is not theirs', async () => {

      const res = await response(review_object, token, product.id, other_user_review.id);

      expect(res.status).toBe(403);
    });

    // it('should return 400 if review is invalid', async () => {
    //   review_object = {};
    //   const res = await response(review_object, token, product.id, review.id);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update review if input is valid', async () => {
      const res = await response(review_object, token, product.id, review.id);
      const result = await Review.findOne({ where: { id: review.id } });

      expect(result).toHaveProperty('title', 'Terrible');
      expect(result).toHaveProperty('body', 'b3');
      expect(result).toHaveProperty('rating', 1);
    });

    it('should return updated review if it is valid', async () => {
      const res = await response(review_object, token, product.id, review.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', review.id);
      expect(res.body).toHaveProperty('userId', user.id);
      expect(res.body).toHaveProperty('productId', String(product.id));
      expect(res.body).toHaveProperty('title', 'Terrible');
      expect(res.body).toHaveProperty('body', 'b3');
      expect(res.body).toHaveProperty('rating', 1);
    });
  });

  describe('DELETE /ID', () => {
    let user, token, product, review;

    const response = async (productId, id, jwt) => {
      return await request
        .delete(`/api/products/${productId}/reviews/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach( async () => {
      user = await User.create({
        username: 'bob' ,
        email: 'bob@example.com',
        password_digest: 123456,
        admin: false
      });
      admin = await User.create({
        username: 'admin' ,
        email: 'admin@example.com',
        password_digest: 123456,
        admin: true
      });

      admin_token = createJWT(admin);
      user_token = createJWT(user);
      const category = await Category.create({ name: 'Soda' });
      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      user_review = await Review.create({
        productId: product.id,
        userId: user.id,
        title: 'Great',
        body: "b1",
        rating: 5
      });
      admin_review = await Review.create({
        productId: product.id,
        userId: admin.id,
        title: 'Meh',
        body: "b2",
        rating: 3
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(product.id, user_review.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if invalid product ID ', async () => {
      const product_id = 'id';
      const res = await response(product_id, user_review.id, user_token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if product ID valid but product ID not in DB', async () => {
      const product_id = '10000';
      const res = await response(product_id, user_review.id, user_token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid review ID', async () => {
      const review_id = 'id';
      const res = await response(product.id, review_id, user_token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if review ID valid but review ID not in DB', async () => {
      const review_id = '100000';
      const res = await response(product.id, review_id, user_token);

      expect(res.status).toBe(404);
    });

    it('should return 403 if user is not admin and review is not theirs', async () => {
      const res = await response(product.id, admin_review.id, user_token);

      expect(res.status).toBe(403);
    });

    it('should delete review if input is valid and review belongs to user', async () => {
      const res = await response(product.id, user_review.id, user_token);
      const result = await Review.findOne({ where: { id: user_review.id } });

      expect(result).toBeNull();
    });

    it('should delete review if input is valid, review does not belong to user but user is an admin', async () => {
      const res = await response(product.id, user_review.id, admin_token);
      const result = await Review.findOne({ where: { id: user_review.id } });

      expect(result).toBeNull();
    });

    it('should return deleted review', async () => {
      const res = await response(product.id, user_review.id, user_token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user_review.id);
      expect(res.body).toHaveProperty('title', 'Great');
      expect(res.body).toHaveProperty('body', 'b1');
      expect(res.body).toHaveProperty('rating', 5);
    });
  });
});
