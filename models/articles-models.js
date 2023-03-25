const db = require('../db/connection.js');

fetchArticles = (topic, sort_by, order = 'DESC', validTopics) => {
  if (topic && !validTopics.includes(topic)) {
    return Promise.reject({
      status: 404,
      msg: 'Bad request',
    });
  }

  const validSortByOptions = [
    'author',
    'title',
    'article_id',
    'votes',
    'comment_count',
  ];

  if (sort_by && !validSortByOptions.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request',
    });
  }

  const validOrderByOptions = ['ASC', 'DESC'];
  if (order && !validOrderByOptions.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request',
    });
  }

  let queryString = `
  SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comments.article_id) AS int) AS comment_count
  FROM articles
  LEFT JOIN comments
  ON comments.article_id = articles.article_id
  `;

  let queryParams = [];
  if (topic) {
    queryString += `
  WHERE articles.topic = $1
  `;
    queryParams.push(topic);
  }

  queryString += `
  GROUP BY articles.article_id
  `;

  if (sort_by) {
    queryString += `ORDER BY ${sort_by} ${order}`;
  } else {
    queryString += `ORDER BY created_at ${order}`;
  }

  return db.query(queryString, queryParams).then((result) => {
    const articles = result.rows;
    return articles;
  });
};

fetchArticleById = (article_id) => {
  return db
    .query(
      `
      SELECT articles.author, articles.title, articles.body, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comments.article_id) AS int) AS comment_count
      FROM articles
      LEFT JOIN comments
      ON comments.article_id = articles.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id
     `,
      [article_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
      }
      return result.rows[0];
    });
};

updateArticleVotes = (article_id, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request',
    });
  }

  return db
    .query(
      `
      UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *
    `,
      [inc_votes, article_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
      }
      return result.rows[0];
    });
};

addArticle = (newArticle, validTopics) => {
  const { author, title, topic, body } = newArticle;

  if (!author || !body || !topic || !title) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request',
    });
  }

  if (topic && !validTopics.includes(topic)) {
    return Promise.reject({
      status: 404,
      msg: 'Topic not found',
    });
  }

  let queryString = `
    INSERT INTO articles
      (author, title, topic, body)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *
  `;

  return db
    .query(queryString, [author, title, topic, body])
    .then(({ rows }) => {
      return rows[0];
    });
};

removeArticle = (article_id) => {
  return db
    .query(
      `
    DELETE FROM articles
    WHERE article_id = $1
    RETURNING *
    `,
      [article_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
      }
      return result.rows;
    });
};

module.exports = {
  fetchArticles,
  fetchArticleById,
  updateArticleVotes,
  addArticle,
  removeArticle,
};
