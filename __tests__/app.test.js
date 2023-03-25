const request = require('supertest');
const app = require('../app');
const seed = require('../db/seeds/seed');
const db = require('../db/connection');
const testData = require('../db/data/test-data/index');
const testForEndpoints = require('../endpoints.json');

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe('app', () => {
  describe('Server errors', () => {
    it("404: responds with a message 'Path not found' when sent a valid but non-existent path", () => {
      return request(app)
        .get('/not-an-existing-path')
        .expect(404)
        .then(({ body }) => {
          const serverResponseMessage = body.msg;
          expect(serverResponseMessage).toBe('Path not found');
        });
    });
  });

  describe('GET /api', () => {
    it('responds with all the available endpoints on the API', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
          const { endpoints } = body;

          expect(endpoints).toEqual(testForEndpoints);
          expect(Object.keys(endpoints).length).toBe(14);
        });
    });
  });

  describe('Endpoint: /api/topics', () => {
    describe('GET /api/topics', () => {
      it('200: responds with an array of all the topic objects containing the properties: slug and description', () => {
        return request(app)
          .get('/api/topics')
          .expect(200)
          .then(({ body }) => {
            const { topics } = body;

            expect(topics).toHaveLength(3);

            topics.forEach((topic) => {
              expect(topic).toHaveProperty('description', expect.any(String));
              expect(topic).toHaveProperty('slug', expect.any(String));
            });
          });
      });
    });
    describe('POST /api/topics', () => {
      it('201: responds with the posted topic when passed an object with the essential properties: slug and description', () => {
        const newTopic = {
          slug: 'test topic name',
          description: 'test description',
        };
        return request(app)
          .post('/api/topics')
          .send(newTopic)
          .expect(201)
          .then(({ body }) => {
            const { topic } = body;
            expect(topic.slug).toBe('test topic name');
            expect(topic.description).toBe('test description');
          });
      });
      it("400: responds with a message of 'Bad request' when sent a post request when passed an object without the essential properties", () => {
        const newTopic = {};

        return request(app)
          .post('/api/topics')
          .send(newTopic)
          .expect(400)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad request');
          });
      });
    });
  });

  describe('Endpoint: /api/users', () => {
    describe('GET  /api/users', () => {
      it('200: responds with an array of all the users objects containing the properties: username, name and avatar_url', () => {
        return request(app)
          .get('/api/users')
          .expect(200)
          .then(({ body }) => {
            const { users } = body;

            expect(users).toHaveLength(4);

            users.forEach((user) => {
              expect(user).toHaveProperty('username', expect.any(String));
              expect(user).toHaveProperty('name', expect.any(String));
              expect(user).toHaveProperty('avatar_url', expect.any(String));
            });

            expect(users[0]).toEqual({
              username: 'butter_bridge',
              name: 'jonny',
              avatar_url:
                'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
            });
          });
      });
    });
    describe('GET api/users/:username', () => {
      it('200: responds with the requested user object containing the properties: username, name and avatar_url', () => {
        return request(app)
          .get('/api/users/butter_bridge')
          .expect(200)
          .then(({ body }) => {
            const { users } = body;

            expect(typeof users).toBe('object');

            expect(users).toEqual({
              username: 'butter_bridge',
              name: 'jonny',
              avatar_url:
                'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
            });
          });
      });
      it("400: responds with a message of 'User not found' when sent a query for a valid but non-existent username", () => {
        return request(app)
          .get('/api/users/c1aire')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('User not found');
          });
      });
    });
  });

  describe('Endpoint: /api/articles', () => {
    describe('GET /api/articles', () => {
      it('200: responds with an array of all the article objects containing the properties: author, title, article_id, topic, created_at, votes, article_img_url, comment_count', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            articles.forEach((article) => {
              expect(article).toHaveProperty('author', expect.any(String));
              expect(article).toHaveProperty('title', expect.any(String));
              expect(article).toHaveProperty('article_id', expect.any(Number));
              expect(article).toHaveProperty('topic', expect.any(String));
              expect(article).toHaveProperty('created_at', expect.any(String));
              expect(article).toHaveProperty('votes', expect.any(Number));
              expect(article).toHaveProperty(
                'article_img_url',
                expect.any(String)
              );
              expect(article).toHaveProperty(
                'comment_count',
                expect.any(Number)
              );
            });
          });
      });
      it('200: responds with an array of all the article objects which contains a comment_count property which is the total count of all the comments with this article_id ', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            articles.forEach((article) => {
              expect(article).toHaveProperty(
                'comment_count',
                expect.any(Number)
              );
            });

            const mostCommentedArticle = articles.find(
              (article) => article.article_id === 1
            );
            expect(mostCommentedArticle.comment_count).toBe(11);
          });
      });
    });

    describe('GET /api/articles?topic=...', () => {
      it('200: accepts a topic query - responds with an array of article objects that have been filtered by the specified topics value', () => {
        return request(app)
          .get('/api/articles?topic=mitch')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(11);
            expect(articles).toHaveLength(10);

            articles.forEach((article) => {
              expect(article.topic).toBe('mitch');
            });
          });
      });
      it('200: if no topic query provided - responds with an array of all the article objects', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            articles.forEach((article) => {
              expect(article).toHaveProperty('author', expect.any(String));
              expect(article).toHaveProperty('title', expect.any(String));
              expect(article).toHaveProperty('article_id', expect.any(Number));
              expect(article).toHaveProperty('topic', expect.any(String));
              expect(article).toHaveProperty('created_at', expect.any(String));
              expect(article).toHaveProperty('votes', expect.any(Number));
              expect(article).toHaveProperty(
                'article_img_url',
                expect.any(String)
              );
              expect(article).toHaveProperty(
                'comment_count',
                expect.any(Number)
              );
            });
          });
      });
      it("404: if invalid topic query provided - responds with a message of 'Bad request'", () => {
        return request(app)
          .get('/api/articles?topic=invalid')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Topic doesn't exist");
          });
      });
    });

    describe('GET /api/articles?sort_by=...', () => {
      it('200: accepts a sort_by query for author - responds with an array of article objects with a default sort order of descending (z-a)', () => {
        return request(app)
          .get('/api/articles?sort_by=author')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            const articlesCopy = [...articles];

            const authorOrderedArticles = articlesCopy.sort(
              (articleA, articleB) => {
                if (articleA.author > articleB.author) {
                  return -1;
                }
                if (articleA.author < articleB.author) {
                  return 1;
                }
                return 0;
              }
            );
            expect(articles).toEqual(authorOrderedArticles);
          });
      });
      it('200: accepts a sort_by query for title - responds with an array of article objects with a default sort order of descending (z-a)', () => {
        return request(app)
          .get('/api/articles?sort_by=title')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            const articlesCopy = [...articles];

            const titleOrderedArticles = articlesCopy.sort(
              (articleA, articleB) => {
                if (articleA.title > articleB.title) {
                  return -1;
                }
                if (articleA.title < articleB.title) {
                  return 1;
                }
                return 0;
              }
            );
            expect(articles).toEqual(titleOrderedArticles);
          });
      });
      it('200: accepts a sort_by query for article_id - responds with an array of article objects with a default sort order of descending (largest number first)', () => {
        return request(app)
          .get('/api/articles?sort_by=article_id')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            const articlesCopy = [...articles];

            const articleIdOrderedArticles = articlesCopy.sort(
              (articleA, articleB) => {
                return articleB.article_id - articleA.article_id;
              }
            );
            expect(articles).toEqual(articleIdOrderedArticles);
          });
      });
      it('200: accepts a sort_by query for votes - responds with an array of article objects with a default sort order of descending (most amount of votes first)', () => {
        return request(app)
          .get('/api/articles?sort_by=votes')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            const articlesCopy = [...articles];

            const votesOrderedArticles = articlesCopy.sort(
              (articleA, articleB) => {
                return articleB.votes - articleA.votes;
              }
            );
            expect(articles).toEqual(votesOrderedArticles);
          });
      });
      it('200: accepts a sort_by query for comment_count - responds with an array of article objects with a default sort order of descending (most amount of comments first)', () => {
        return request(app)
          .get('/api/articles?sort_by=comment_count')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            const articlesCopy = [...articles];

            const commentCountOrderedArticles = articlesCopy.sort(
              (articleA, articleB) => {
                return articleB.comment_count - articleA.comment_count;
              }
            );
            expect(articles).toEqual(commentCountOrderedArticles);
          });
      });
      it('200: if no sort_by query provided - responds with an array of article objects which defaults to sorting by date (created_at) in descending order (most recent first)', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            const articlesCopy = [...articles];
            const dateOrderedArticles = articlesCopy.sort(
              (articleA, articleB) => {
                return articleB.created_at - articleA.created_at;
              }
            );
            expect(articles).toEqual(dateOrderedArticles);
          });
      });
      it("400: responds with 'Bad request' when sent a sort_by query with an invalid value", () => {
        return request(app)
          .get('/api/articles?sort_by=invalid')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request');
          });
      });
    });

    describe('GET /api/articles?order=...', () => {
      it("200: accepts an order query of 'ascending' - responds with an array of article objects in date (default sort_by value) ascending order (oldest first)", () => {
        return request(app)
          .get('/api/articles?order=ASC')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            const articlesCopy = [...articles];
            const dateAscendingArticles = articlesCopy.sort(
              (articleA, articleB) => {
                return articleA.created_at - articleB.created_at;
              }
            );
            expect(articles).toEqual(dateAscendingArticles);
          });
      });
      it("200: accepts an order query of 'descending' - responds with an array of article objects in date (default sort_by value) ascending order (most recent first)", () => {
        return request(app)
          .get('/api/articles?order=DESC')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            const articlesCopy = [...articles];
            const dateDescendingArticles = articlesCopy.sort(
              (articleA, articleB) => {
                return articleB.created_at - articleA.created_at;
              }
            );
            expect(articles).toEqual(dateDescendingArticles);
          });
      });
      it("400: responds with 'Bad request' when sent a order query with an invalid value", () => {
        return request(app)
          .get('/api/articles?order=invalid')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request');
          });
      });
    });

    describe('GET /api/articles?limit=...', () => {
      it('200: accepts a limit query - responds with an array of article objects - the number of article objects is determined by the specified limit', () => {
        return request(app)
          .get('/api/articles?limit=9')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(9);

            articles.forEach((article) => {
              expect(article).toHaveProperty('author', expect.any(String));
              expect(article).toHaveProperty('title', expect.any(String));
              expect(article).toHaveProperty('article_id', expect.any(Number));
              expect(article).toHaveProperty('topic', expect.any(String));
              expect(article).toHaveProperty('created_at', expect.any(String));
              expect(article).toHaveProperty('votes', expect.any(Number));
              expect(article).toHaveProperty(
                'article_img_url',
                expect.any(String)
              );
              expect(article).toHaveProperty(
                'comment_count',
                expect.any(Number)
              );
            });
          });
      });
      it('200: if no limit query provided - responds with the default number (10) of article objects in the array', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            articles.forEach((article) => {
              expect(article).toHaveProperty('author', expect.any(String));
              expect(article).toHaveProperty('title', expect.any(String));
              expect(article).toHaveProperty('article_id', expect.any(Number));
              expect(article).toHaveProperty('topic', expect.any(String));
              expect(article).toHaveProperty('created_at', expect.any(String));
              expect(article).toHaveProperty('votes', expect.any(Number));
              expect(article).toHaveProperty(
                'article_img_url',
                expect.any(String)
              );
              expect(article).toHaveProperty(
                'comment_count',
                expect.any(Number)
              );
            });
          });
      });
      it("400: responds with 'Bad request' when sent a limit query with an invalid value", () => {
        return request(app)
          .get('/api/articles?limit=invalid')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Invalid article limit');
          });
      });
    });

    describe('GET /api/articles?p=...', () => {
      it('200: accepts a page (p) query - responds with an array of article objects from that page using the default article limit of 10', () => {
        return request(app)
          .get('/api/articles?p=2')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(2);

            articles.forEach((article) => {
              expect(article).toHaveProperty('author', expect.any(String));
              expect(article).toHaveProperty('title', expect.any(String));
              expect(article).toHaveProperty('article_id', expect.any(Number));
              expect(article).toHaveProperty('topic', expect.any(String));
              expect(article).toHaveProperty('created_at', expect.any(String));
              expect(article).toHaveProperty('votes', expect.any(Number));
              expect(article).toHaveProperty(
                'article_img_url',
                expect.any(String)
              );
              expect(article).toHaveProperty(
                'comment_count',
                expect.any(Number)
              );
            });
          });
      });
      it('200: accepts a page (p) query - responds with an array of article objects from that page using the default article limit of 10', () => {
        return request(app)
          .get('/api/articles?limit=5&p=3')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(2);

            articles.forEach((article) => {
              expect(article).toHaveProperty('author', expect.any(String));
              expect(article).toHaveProperty('title', expect.any(String));
              expect(article).toHaveProperty('article_id', expect.any(Number));
              expect(article).toHaveProperty('topic', expect.any(String));
              expect(article).toHaveProperty('created_at', expect.any(String));
              expect(article).toHaveProperty('votes', expect.any(Number));
              expect(article).toHaveProperty(
                'article_img_url',
                expect.any(String)
              );
              expect(article).toHaveProperty(
                'comment_count',
                expect.any(Number)
              );
            });
          });
      });
      it('200: if no page (p) query provided - responds with the default number (10) of article objects in the array', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            const { total_count, articles } = body;

            expect(total_count).toBe(12);
            expect(articles).toHaveLength(10);

            articles.forEach((article) => {
              expect(article).toHaveProperty('author', expect.any(String));
              expect(article).toHaveProperty('title', expect.any(String));
              expect(article).toHaveProperty('article_id', expect.any(Number));
              expect(article).toHaveProperty('topic', expect.any(String));
              expect(article).toHaveProperty('created_at', expect.any(String));
              expect(article).toHaveProperty('votes', expect.any(Number));
              expect(article).toHaveProperty(
                'article_img_url',
                expect.any(String)
              );
              expect(article).toHaveProperty(
                'comment_count',
                expect.any(Number)
              );
            });
          });
      });
      it("404: responds with 'Bad page request' when sent a page (p) query with an invalid value", () => {
        return request(app)
          .get('/api/articles?p=invalid')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad page request');
          });
      });
    });

    describe('POST /api/articles', () => {
      it('201: responds with the posted article when passed an object with the essential properties: author, title, body, topic', () => {
        const newArticle = {
          author: 'butter_bridge',
          title: 'testTitle',
          body: 'testBody',
          topic: 'mitch',
        };

        return request(app)
          .post('/api/articles')
          .send(newArticle)
          .expect(201)
          .then(({ body }) => {
            const { article } = body;
            expect(article.author).toBe('butter_bridge');
            expect(article.title).toBe('testTitle');
            expect(article.body).toBe('testBody');
            expect(article.topic).toBe('mitch');
            expect(article.article_img_url).toBe(
              'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'
            );
            expect(article.votes).toBe(0);
            expect(article).toHaveProperty('created_at', expect.any(String));
            expect(article).toHaveProperty('article_id', expect.any(Number));
            expect(article).toHaveProperty('comment_count', expect.any(Number));
          });
      });
      it('201: responds with the posted article and ignores the non-essential properties in the object: created_at and votes', () => {
        const newArticle = {
          author: 'butter_bridge',
          title: 'testTitle',
          body: 'testBody',
          topic: 'mitch',
          article_img_url:
            'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700',
          comment_count: 5,
          created_at: 15830256183400,
          votes: 1,
          article_id: 24,
        };

        return request(app)
          .post('/api/articles')
          .send(newArticle)
          .expect(201)
          .then(({ body }) => {
            const { article } = body;
            expect(article.author).toBe('butter_bridge');
            expect(article.body).toBe('testBody');
            expect(article.body).toBe('testBody');
            expect(article.topic).toBe('mitch');
            expect(article.article_img_url).toBe(
              'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'
            );
            expect(article.created_at).not.toBe('15830256183400');
            expect(article.votes).toBe(0);
            expect(article.article_id).toBe(13);
            expect(article).toHaveProperty('comment_count', expect.any(Number));
          });
      });
      it("400: responds with a message of 'Bad request' when sent a post request when passed an object without the essential properties", () => {
        const newArticle = {};

        return request(app)
          .post('/api/articles')
          .send(newArticle)
          .expect(400)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad request');
          });
      });
      it("404: responds with a message of 'Topic not found' when sent a post request with a topic that is not valid - topic does not exist on topics' table", () => {
        const newArticle = {
          author: 'butter_bridge',
          title: 'testTitle',
          body: 'testBody',
          topic: 'yellow',
        };
        return request(app)
          .post('/api/articles')
          .send(newArticle)
          .expect(404)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Topic not found');
          });
      });
      it("404: responds with a message of 'User not found' when sent a post request with a username that is not valid - user does not exist on users' table", () => {
        const newArticle = {
          author: 'not_a_user',
          title: 'testTitle',
          body: 'testBody',
          topic: 'mitch',
        };
        return request(app)
          .post('/api/articles')
          .send(newArticle)
          .expect(404)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('User not found');
          });
      });
    });

    describe('GET /api/articles/:article_id', () => {
      it('200: returns an article object with the properties: author, title, article_id, body, topic, created_at, votes, comment_count and article_img_url', () => {
        return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(typeof articles).toBe('object');
            expect(articles.author).toBe('butter_bridge');
            expect(articles.title).toBe('Living in the shadow of a great man');
            expect(articles.votes).toBe(100);
            expect(articles.article_id).toBe(1);
            expect(articles.comment_count).toBe(11);
            expect(articles.topic).toBe('mitch');
            expect(articles).toHaveProperty('created_at', expect.any(String));
            expect(articles).toHaveProperty(
              'article_img_url',
              expect.any(String)
            );
            expect(articles.body).toBe('I find this existence challenging');
          });
      });
      it("400: responds with a message of 'Bad request' when sent an invalid article_id", () => {
        return request(app)
          .get('/api/articles/invalid-article-id')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request');
          });
      });
      it("404: responds with a message of 'Article not found' when sent a query for a valid but non-existent article_id", () => {
        return request(app)
          .get('/api/articles/25')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('Article not found');
          });
      });
    });

    describe('PATCH /api/articles/:article_id', () => {
      it("200: responds with the selected article's votes updated (increased) when passed an object with the key of inc_votes and a value that would increment the votes", () => {
        const votesIncremented = {
          inc_votes: 5,
        };

        return request(app)
          .patch('/api/articles/1')
          .send(votesIncremented)
          .expect(200)
          .then(({ body }) => {
            const { updatedArticle } = body;
            expect(updatedArticle.votes).toBe(105);
            expect(updatedArticle.article_id).toBe(1);
            expect(updatedArticle.author).toBe('butter_bridge');
            expect(updatedArticle.title).toBe(
              'Living in the shadow of a great man'
            );
            expect(updatedArticle.topic).toBe('mitch');
            expect(updatedArticle.article_img_url).toBe(
              'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
            );
            expect(updatedArticle).toHaveProperty(
              'created_at',
              expect.any(String)
            );
          });
      });
      it("200: responds with the selected article's votes updated (decreased) when passed an object with the key of inc_votes and a value that would decrement the votes", () => {
        const votesDecremented = {
          inc_votes: -5,
        };

        return request(app)
          .patch('/api/articles/1')
          .send(votesDecremented)
          .expect(200)
          .then(({ body }) => {
            const { updatedArticle } = body;
            expect(updatedArticle.votes).toBe(95);
            expect(updatedArticle.article_id).toBe(1);
            expect(updatedArticle.author).toBe('butter_bridge');
            expect(updatedArticle.title).toBe(
              'Living in the shadow of a great man'
            );
            expect(updatedArticle.topic).toBe('mitch');
            expect(updatedArticle.article_img_url).toBe(
              'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
            );
            expect(updatedArticle).toHaveProperty(
              'created_at',
              expect.any(String)
            );
          });
      });
      it("400: responds with a message of 'Bad request' when sent a patch request without a body", () => {
        return request(app)
          .patch('/api/articles/1')
          .expect(400)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad request');
          });
      });
      it("400: responds with a message of 'Bad request' when sent a patch request without an valid vote_inc value", () => {
        const votesIncremented = {
          inc_votes: 'invalid-vote-increase',
        };
        return request(app)
          .patch('/api/articles/1')
          .expect(400)
          .send(votesIncremented)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad request');
          });
      });
      it("400: responds with a message of 'Bad request' when sent a patch request for an invalid article_id", () => {
        const votesIncremented = {
          inc_votes: 5,
        };

        return request(app)
          .patch('/api/articles/invalid-article')
          .send(votesIncremented)
          .expect(400)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad request');
          });
      });
      it("404: responds with a message of 'Article_id not found' when sent a patch request for an article_id that is valid but non-existent - cannot update votes for a non-existent article", () => {
        const votesIncremented = {
          inc_votes: 5,
        };
        return request(app)
          .patch('/api/articles/25')
          .send(votesIncremented)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('Article not found');
          });
      });
    });

    describe('DELETE /api/articles/:article_id', () => {
      it('204: responds with no content when sent a request to delete an article with a specific article_id', () => {
        return request(app).delete('/api/articles/1').expect(204);
      });
      it("404: responds with a message of 'Article not found' when sent a delete request for an article_id that is valid but non-existent - cannot delete a non-existent article", () => {
        return request(app)
          .delete('/api/articles/1001')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('Article not found');
          });
      });
      it("400: responds with a message of 'Bad request' when sent a delete request for an invalid article_id", () => {
        return request(app)
          .delete('/api/comments/invalid-comment_id')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request');
          });
      });
    });

    describe('GET /api/articles/:article_id/comments', () => {
      it('200: returns an array of comments for the given article_id - each comment should have the properties: comment_id, votes, created_at, author, body,article_id and comment_count', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;

            expect(comments).toHaveLength(11);

            comments.forEach((comment) => {
              expect(comment).toHaveProperty('comment_id', expect.any(Number));
              expect(comment).toHaveProperty('votes', expect.any(Number));
              expect(comment).toHaveProperty('created_at', expect.any(String));
              expect(comment).toHaveProperty('author', expect.any(String));
              expect(comment).toHaveProperty('body', expect.any(String));
              expect(comment).toHaveProperty('article_id', expect.any(Number));
            });
          });
      });
      it('200: returns an empty array of comments when sent a query for an article_id that exists but has no comments', () => {
        return request(app)
          .get('/api/articles/2/comments')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).toHaveLength(0);
          });
      });
      it("400: responds with a message of 'Bad request' when sent a query for comments linked to an invalid article_id", () => {
        return request(app)
          .get('/api/articles/invalid-article-id/comments')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request');
          });
      });
      it("404: responds with a message of 'article_id not found' when sent a query for comments linked to a valid but non-existent article_id", () => {
        return request(app)
          .get('/api/articles/25/comments')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('Article not found');
          });
      });
    });

    describe('POST /api/articles/:article_id/comments', () => {
      it('201: responds with the posted comment when passed an object with the essential properties: author (username) and body', () => {
        const newComment = {
          author: 'butter_bridge',
          body: 'testBody',
        };
        return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(201)
          .then(({ body }) => {
            const { comment } = body;
            expect(comment.author).toBe('butter_bridge');
            expect(comment.body).toBe('testBody');
            expect(comment.article_id).toBe(1);
          });
      });
      it('201: responds with the posted comment and ignores the non-essential properties in the object: created_at and votes', () => {
        const newComment = {
          author: 'butter_bridge',
          body: 'testBody',
          created_at: 1583025180000,
          votes: 5,
        };
        return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(201)
          .then(({ body }) => {
            const { comment } = body;
            expect(comment.votes).toBe(0);

            expect(comment.author).toBe('butter_bridge');
            expect(comment.body).toBe('testBody');
            expect(comment.article_id).toBe(1);
          });
      });
      it("400: responds with a message of 'Bad request' when sent a post request when passed an object without the essential properties", () => {
        const newComment = {};
        return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(400)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad request');
          });
      });
      it("400: responds with a message of 'Bad request' when sent a post request for an invalid article_id", () => {
        const newComment = {
          author: 'butter_bridge',
          body: 'testBody',
        };
        return request(app)
          .post('/api/articles/invalid-article/comments')
          .send(newComment)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request');
          });
      });
      it("404: responds with a message of 'Article_id not found' when sent a post request for an article_id that is valid but non-existent - cannot attach comment to a non-existent article", () => {
        const newComment = {
          author: 'butter_bridge',
          body: 'testBody',
        };
        return request(app)
          .post('/api/articles/25/comments')
          .send(newComment)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('Article_id not found');
          });
      });
      it("404: responds with a message of 'User not found' when sent a post request with a username that is not valid - user does not exist on users' table", () => {
        const newComment = {
          author: 'non-existent-user',
          body: 'testBody',
        };
        return request(app)
          .post('/api/articles/1/comments')
          .send(newComment)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('User not found');
          });
      });
    });
  });

  describe('Endpoint: /api/comments', () => {
    describe('DELETE /api/comments/:comment_id', () => {
      it('204: responds with no content when sent a request to delete a comment with a specific comment_id', () => {
        return request(app).delete('/api/comments/1').expect(204);
      });
      it("404: responds with a message of 'Comment not found' when sent a delete request for an comment_id that is valid but non-existent - cannot delete a a non-existent comment", () => {
        return request(app)
          .delete('/api/comments/100')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('Comment not found');
          });
      });
      it("400: responds with a message of 'Bad request' when sent a delete request for an invalid comment_id", () => {
        return request(app)
          .delete('/api/comments/invalid-comment_id')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request');
          });
      });
    });
    describe('PATCH /api/comments/:comment_id', () => {
      it("200: responds with the selected comments's votes updated (increased) when passed an object with the key of inc_votes and a value that would increment the votes", () => {
        const votesIncremented = {
          inc_votes: 1,
        };

        return request(app)
          .patch('/api/comments/1')
          .send(votesIncremented)
          .expect(200)
          .then(({ body }) => {
            const { updatedComment } = body;

            expect(updatedComment.comment_id).toBe(1);
            expect(updatedComment.votes).toBe(17);
            expect(updatedComment.author).toBe('butter_bridge');
            expect(updatedComment.body).toBe(
              "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
            );
            expect(updatedComment.article_id).toBe(9);
            expect(updatedComment).toHaveProperty;
          });
      });
      it("200: responds with the selected comments's votes updated (decreased) when passed an object with the key of inc_votes and a value that would decrement the votes", () => {
        const votesDecremented = {
          inc_votes: -1,
        };

        return request(app)
          .patch('/api/comments/1')
          .send(votesDecremented)
          .expect(200)
          .then(({ body }) => {
            const { updatedComment } = body;

            expect(updatedComment.comment_id).toBe(1);
            expect(updatedComment.votes).toBe(15);
            expect(updatedComment.author).toBe('butter_bridge');
            expect(updatedComment.body).toBe(
              "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
            );
            expect(updatedComment.article_id).toBe(9);
            expect(updatedComment).toHaveProperty;
          });
      });
      it("400: responds with a message of 'Bad request' when sent a patch request without a body", () => {
        return request(app)
          .patch('/api/comments/1')
          .expect(400)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad request');
          });
      });
      it("400: responds with a message of 'Bad request' when sent a patch request without an valid vote_inc value", () => {
        const votesIncremented = {
          inc_votes: 'invalid-vote-increase',
        };
        return request(app)
          .patch('/api/comments/1')
          .expect(400)
          .send(votesIncremented)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad request');
          });
      });
      it("400: responds with a message of 'Bad request' when sent a patch request for an invalid comment_id", () => {
        const votesIncremented = {
          inc_votes: 1,
        };

        return request(app)
          .patch('/api/comments/invalid-comment')
          .send(votesIncremented)
          .expect(400)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad request');
          });
      });
      it("404: responds with a message of 'Comment_id not found' when sent a patch request for an comment_id that is valid but non-existent - cannot update votes for a non-existent comment", () => {
        const votesIncremented = {
          inc_votes: 1,
        };
        return request(app)
          .patch('/api/comments/1065')
          .send(votesIncremented)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('Comment not found');
          });
      });
    });
  });
});
