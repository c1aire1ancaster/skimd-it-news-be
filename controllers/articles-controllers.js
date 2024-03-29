const {
  fetchArticles,
  countArticles,
  fetchArticleById,
  updateArticleVotes,
  addArticle,
  removeArticle,
} = require('../models/articles-models');
const { removeCommentsByArticleId } = require('../models/comments-models');
const { fetchTopics, fetchTopic } = require('../models/topics-models');

sendArticles = (request, response, next) => {
  const { topic, sort_by, order, limit, p } = request.query;
  const promises = [];

  const countArticlesPromise = countArticles(topic);
  const fetchArticlesPromise = fetchArticles(topic, sort_by, order, limit, p);
  promises.push(countArticlesPromise);
  promises.push(fetchArticlesPromise);

  if (topic) {
    const checkTopicPromise = fetchTopic(topic);
    promises.push(checkTopicPromise);
  }

  return Promise.all(promises)
    .then(([total_count, articles]) => {
      response.status(200).send({ total_count, articles });
    })
    .catch((error) => {
      next(error);
    });
};

sendArticleById = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticleById(article_id)
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch((error) => {
      next(error);
    });
};

patchArticleVotes = (request, response, next) => {
  const { article_id } = request.params;
  const { inc_votes } = request.body;

  updateArticleVotes(article_id, inc_votes)
    .then((updatedArticle) => {
      response.status(200).send({ updatedArticle });
    })
    .catch((error) => {
      next(error);
    });
};

postArticle = (request, response, next) => {
  const newArticle = request.body;

  fetchTopics()
    .then((topics) => {
      const validTopics = topics.map((topic) => topic.slug);
      return validTopics;
    })
    .then((validTopics) => {
      return addArticle(newArticle, validTopics);
    })
    .then((article) => {
      return fetchArticleById(article.article_id);
    })
    .then((article) => {
      response.status(201).send({ article });
    })
    .catch((error) => {
      next(error);
    });
};

deleteArticle = (request, response, next) => {
  const { article_id } = request.params;

  Promise.all([
    removeCommentsByArticleId(article_id),
    removeArticle(article_id),
  ])
    .then(() => {
      response.status(204).send();
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  sendArticles,
  sendArticleById,
  patchArticleVotes,
  postArticle,
  deleteArticle,
};
