const request = require("supertest");
const app = require("../app");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("app", () => {
  describe("server errors", () => {
    it("404: responds with a message 'Path not found' when sent a valid but non-existent path", () => {
      return request(app)
        .get("/not-an-existing-path")
        .expect(404)
        .then(({ body }) => {
          const serverResponseMessage = body.msg;
          expect(serverResponseMessage).toBe("Path not found");
        });
    });
  });

  describe("GET /api/topics", () => {
    it("200: responds with an array of all the topic objects containing the properties: slug and description", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;

          expect(topics).toHaveLength(3);

          topics.forEach((topic) => {
            expect(topic).toHaveProperty("description", expect.any(String));
            expect(topic).toHaveProperty("slug", expect.any(String));
          });
        });
    });
  });

  describe("GET  /api/users", () => {
    it("200: responds with an array of all the users objects containing the properties: username, name and avatar_url", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          const { users } = body;

          expect(users).toHaveLength(4);

          users.forEach((user) => {
            expect(user).toHaveProperty("username", expect.any(String));
            expect(user).toHaveProperty("name", expect.any(String));
            expect(user).toHaveProperty("avatar_url", expect.any(String));
          });

          expect(users[0]).toEqual({
            username: "butter_bridge",
            name: "jonny",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          });
        });
    });
  });

  describe("GET /api/articles", () => {
    describe("GET /api/articles", () => {
      it("200: responds with an array of all the article objects containing the properties: author, title, article_id, topic, created_at, votes, article_img_url, comment_count", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

            articles.forEach((article) => {
              expect(article).toHaveProperty("author", expect.any(String));
              expect(article).toHaveProperty("title", expect.any(String));
              expect(article).toHaveProperty("article_id", expect.any(Number));
              expect(article).toHaveProperty("topic", expect.any(String));
              expect(article).toHaveProperty("created_at", expect.any(String));
              expect(article).toHaveProperty("votes", expect.any(Number));
              expect(article).toHaveProperty(
                "article_img_url",
                expect.any(String)
              );
              expect(article).toHaveProperty(
                "comment_count",
                expect.any(Number)
              );
            });
          });
      });
      it("200: responds with an array of all the article objects which contains a comment_count property which is the total count of all the comments with this article_id ", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

            articles.forEach((article) => {
              expect(article).toHaveProperty(
                "comment_count",
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

    describe("GET /api/articles?topic=...", () => {
      it("200: accepts a topics query - responds with an array of article objects that have been filtered by the specified topics value", () => {
        return request(app)
          .get("/api/articles?topic=mitch")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(11);

            articles.forEach((article) => {
              expect(article.topic).toBe("mitch");
            });
          });
      });
      it("200: if no topic query provided - responds with an array of all the article objects", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

            articles.forEach((article) => {
              expect(article).toHaveProperty("author", expect.any(String));
              expect(article).toHaveProperty("title", expect.any(String));
              expect(article).toHaveProperty("article_id", expect.any(Number));
              expect(article).toHaveProperty("topic", expect.any(String));
              expect(article).toHaveProperty("created_at", expect.any(String));
              expect(article).toHaveProperty("votes", expect.any(Number));
              expect(article).toHaveProperty(
                "article_img_url",
                expect.any(String)
              );
              expect(article).toHaveProperty(
                "comment_count",
                expect.any(Number)
              );
            });
          });
        // it("400: if invalid topic query provided - responds with a message of 'Bad request'", () => {
        //   return request(app)
        //     .get("/api/articles")
        //     .expect(200)
        //     .then(({ body }) => {
        //       const { articles } = body;

        //       expect(articles).toHaveLength(12);

        //       const articlesCopy = [...articles];
        //       const dateOrderedArticles = articlesCopy.sort(
        //         (articleA, articleB) => {
        //           return articleB.created_at - articleA.created_at;
        //         }
        //       );
        //       expect(articles).toEqual(dateOrderedArticles);
        //     });
        // });
        // it("404: if valid but non-existent topic query provided - responds with a message of 'Bad request'", () => {
        //   return request(app)
        //     .get("/api/articles")
        //     .expect(200)
        //     .then(({ body }) => {
        //       const { articles } = body;

        //       expect(articles).toHaveLength(12);

        //       const articlesCopy = [...articles];
        //       const dateOrderedArticles = articlesCopy.sort(
        //         (articleA, articleB) => {
        //           return articleB.created_at - articleA.created_at;
        //         }
        //       );
        //       expect(articles).toEqual(dateOrderedArticles);
        //     });
        // });
      });
      it("400: if invalid topic query provided - responds with a message of 'Bad request'", () => {
        return request(app)
          .get("/api/articles?topic=42")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Bad request");
          });
      });
      it("404: if valid but non-existent topic query provided - responds with a message of 'Not found'", () => {
        return request(app)
          .get("/api/articles?topic=valid-but-non-existent")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Not found");
          });
      });
    });

    describe("GET /api/articles?sort_by=...", () => {
      it("200: accepts a sort_by query for author - responds with an array of article objects with a default sort order of descending (z-a)", () => {
        return request(app)
          .get("/api/articles?sort_by=author")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

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
      it("200: accepts a sort_by query for title - responds with an array of article objects with a default sort order of descending (z-a)", () => {
        return request(app)
          .get("/api/articles?sort_by=title")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

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
      it("200: accepts a sort_by query for article_id - responds with an array of article objects with a default sort order of descending (largest number first)", () => {
        return request(app)
          .get("/api/articles?sort_by=article_id")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

            const articlesCopy = [...articles];

            const articleIdOrderedArticles = articlesCopy.sort(
              (articleA, articleB) => {
                return articleB.article_id - articleA.article_id;
              }
            );
            expect(articles).toEqual(articleIdOrderedArticles);
          });
      });
      it("200: accepts a sort_by query for votes - responds with an array of article objects with a default sort order of descending (most amount of votes first)", () => {
        return request(app)
          .get("/api/articles?sort_by=votes")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

            const articlesCopy = [...articles];

            const votesOrderedArticles = articlesCopy.sort(
              (articleA, articleB) => {
                return articleB.votes - articleA.votes;
              }
            );
            expect(articles).toEqual(votesOrderedArticles);
          });
      });
      it("200: accepts a sort_by query for comment_count - responds with an array of article objects with a default sort order of descending (most amount of comments first)", () => {
        return request(app)
          .get("/api/articles?sort_by=comment_count")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

            const articlesCopy = [...articles];

            const commentCountOrderedArticles = articlesCopy.sort(
              (articleA, articleB) => {
                return articleB.comment_count - articleA.comment_count;
              }
            );
            expect(articles).toEqual(commentCountOrderedArticles);
          });
      });
      it("200: if no sort_by query provided - responds with an array of article objects which defaults to sorting by date (created_at) in descending order (most recent first)", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

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
          .get("/api/articles?sort_by=42")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Bad request");
          });
      });
      it("404: responds with 'Not able to sort' when sent a sort_by query with a valid but non-existent value", () => {
        return request(app)
          .get("/api/articles?sort_by=valid-but-non-existent")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Not able to sort");
          });
      });
    });

    describe("GET /api/articles?order=...", () => {
      it("200: accepts an order query of 'ascending' - responds with an array of article objects in date (default sort_by value) ascending order (oldest first)", () => {
        return request(app)
          .get("/api/articles?order=ascending")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

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
          .get("/api/articles?order=descending")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;

            expect(articles).toHaveLength(12);

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
          .get("/api/articles?order=42")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Bad request");
          });
      });
      it("404: responds with 'Not able order' when sent a order query with an valid but non-existent value", () => {
        return request(app)
          .get("/api/articles?order=valid-but-non-existent")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Not able to order");
          });
      });
    });

    describe("GET /api/articles/:article_id", () => {
      it("200: returns an article object with the properties: author, title, article_id, body, topic, created_at, votes and article_img_url", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(typeof articles).toBe("object");

            expect(articles).toHaveProperty("author", expect.any(String));
            expect(articles).toHaveProperty("title", expect.any(String));
            expect(articles).toHaveProperty("article_id", expect.any(Number));
            expect(articles).toHaveProperty("topic", expect.any(String));
            expect(articles).toHaveProperty("created_at", expect.any(String));
            expect(articles).toHaveProperty("votes", expect.any(Number));
            expect(articles).toHaveProperty(
              "article_img_url",
              expect.any(String)
            );

            expect(articles.author).toBe("butter_bridge");
            expect(articles.title).toBe("Living in the shadow of a great man");
            expect(articles.votes).toBe(100);
          });
      });
      it("400: responds with a message of 'Bad request' when sent an invalid article_id", () => {
        return request(app)
          .get("/api/articles/invalid-article-id")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Bad request");
          });
      });
      it("404: responds with a message of 'Article not found' when sent a query for a valid but non-existent article_id", () => {
        return request(app)
          .get("/api/articles/25")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Article not found");
          });
      });
    });

    describe("PATCH /api/articles/:article_id", () => {
      it("200: responds with the selected article's votes updated (increased) when passed an object with the key of inc_votes and a value that would increment the votes", () => {
        const votesIncremented = {
          inc_votes: 5,
        };

        return request(app)
          .patch("/api/articles/1")
          .send(votesIncremented)
          .expect(200)
          .then(({ body }) => {
            const { updatedArticle } = body;
            expect(updatedArticle.votes).toBe(105);
            expect(updatedArticle.article_id).toBe(1);
            expect(updatedArticle.author).toBe("butter_bridge");
            expect(updatedArticle.title).toBe(
              "Living in the shadow of a great man"
            );
            expect(updatedArticle.topic).toBe("mitch");
            expect(updatedArticle.article_img_url).toBe(
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
            );
            expect(updatedArticle).toHaveProperty(
              "created_at",
              expect.any(String)
            );
          });
      });
      it("200: responds with the selected article's votes updated (increased) when passed an object with the key of inc_votes and a value that would increment the votes", () => {
        const votesDecremented = {
          inc_votes: -5,
        };

        return request(app)
          .patch("/api/articles/1")
          .send(votesDecremented)
          .expect(200)
          .then(({ body }) => {
            const { updatedArticle } = body;
            expect(updatedArticle.votes).toBe(95);
            expect(updatedArticle.article_id).toBe(1);
            expect(updatedArticle.author).toBe("butter_bridge");
            expect(updatedArticle.title).toBe(
              "Living in the shadow of a great man"
            );
            expect(updatedArticle.topic).toBe("mitch");
            expect(updatedArticle.article_img_url).toBe(
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
            );
            expect(updatedArticle).toHaveProperty(
              "created_at",
              expect.any(String)
            );
          });
      });
      it("400: responds with a message of 'Bad request' when sent a patch request without a body", () => {
        return request(app)
          .patch("/api/articles/1")
          .expect(400)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe("Bad request");
          });
      });
      it("400: responds with a message of 'Bad request' when sent a patch request without an invalid vote_inc value", () => {
        const votesIncremented = {
          inc_votes: "invalid-vote-increase",
        };
        return request(app)
          .patch("/api/articles/1")
          .expect(400)
          .send(votesIncremented)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe("Bad request");
          });
      });
      it("400: responds with a message of 'Bad request' when sent a patch request for an invalid article_id", () => {
        const votesIncremented = {
          inc_votes: 5,
        };

        return request(app)
          .patch("/api/articles/invalid-article")
          .send(votesIncremented)
          .expect(400)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe("Bad request");
          });
      });
      it("404: responds with a message of 'Article_id not found' when sent a patch request for an article_id that is valid but non-existent - cannot update votes for a non-existent article", () => {
        const votesIncremented = {
          inc_votes: 5,
        };
        return request(app)
          .patch("/api/articles/25")
          .send(votesIncremented)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Article not found");
          });
      });
    });

    describe("GET /api/articles/:article_id/comments", () => {
      it("200: returns an array of comments for the given article_id - each comment should have the properties: comment_id, votes, created_at, author, body and article_id", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;

            expect(comments).toHaveLength(11);

            comments.forEach((comment) => {
              expect(comment).toHaveProperty("comment_id", expect.any(Number));
              expect(comment).toHaveProperty("votes", expect.any(Number));
              expect(comment).toHaveProperty("created_at", expect.any(String));
              expect(comment).toHaveProperty("author", expect.any(String));
              expect(comment).toHaveProperty("body", expect.any(String));
              expect(comment).toHaveProperty("article_id", expect.any(Number));
            });
          });
      });
      it("200: returns an empty array of comments when sent a query for an article_id that exists but has no comments", () => {
        return request(app)
          .get("/api/articles/2/comments")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).toHaveLength(0);
          });
      });
      it("400: responds with a message of 'Bad request' when sent a query for comments linked to an invalid article_id", () => {
        return request(app)
          .get("/api/articles/invalid-article-id/comments")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Bad request");
          });
      });
      it("404: responds with a message of 'article_id not found' when sent a query for comments linked to a valid but non-existent article_id", () => {
        return request(app)
          .get("/api/articles/25/comments")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Article not found");
          });
      });
    });

    describe("POST /api/articles/:article_id/comments", () => {
      it("201: responds with the posted comment when passed an object with the essential properties: author (username) and body", () => {
        const newComment = {
          author: "butter_bridge",
          body: "testBody",
        };
        return request(app)
          .post("/api/articles/1/comments")
          .send(newComment)
          .expect(201)
          .then(({ body }) => {
            const { comment } = body;
            expect(comment.author).toBe("butter_bridge");
            expect(comment.body).toBe("testBody");
            expect(comment.article_id).toBe(1);
          });
      });
      it("201: responds with the posted comment and ignores the non-essential properties in the object: created_at and votes", () => {
        const newComment = {
          author: "butter_bridge",
          body: "testBody",
          created_at: 1583025180000,
          votes: 5,
        };
        return request(app)
          .post("/api/articles/1/comments")
          .send(newComment)
          .expect(201)
          .then(({ body }) => {
            const { comment } = body;
            expect(comment.votes).toBe(0);

            expect(comment.author).toBe("butter_bridge");
            expect(comment.body).toBe("testBody");
            expect(comment.article_id).toBe(1);
          });
      });
      it("400: responds with a message of 'Bad request' when sent a post request without a body", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .expect(400)
          .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe("Bad request");
          });
      });
      it("400: responds with a message of 'Bad request' when sent a post request for an invalid article_id", () => {
        const newComment = {
          author: "butter_bridge",
          body: "testBody",
        };
        return request(app)
          .post("/api/articles/invalid-article/comments")
          .send(newComment)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Bad request");
          });
      });
      it("404: responds with a message of 'Article_id not found' when sent a post request for an article_id that is valid but non-existent - cannot attach comment to a non-existent article", () => {
        const newComment = {
          author: "butter_bridge",
          body: "testBody",
        };
        return request(app)
          .post("/api/articles/25/comments")
          .send(newComment)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Article_id not found");
          });
      });
      it("404: responds with a message of 'User not found' when sent a post request with a username that is not valid - user does not exist on users' table", () => {
        const newComment = {
          author: "non-existent-user",
          body: "testBody",
        };
        return request(app)
          .post("/api/articles/1/comments")
          .send(newComment)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("User not found");
          });
      });
    });
  });
});
