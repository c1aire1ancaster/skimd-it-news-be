const db = require('../db/connection.js');

fetchCommentsByArticleId = (article_id, limit = 10, p = 1) => {
  let queryString = `SELECT * FROM comments
  WHERE article_id = $1`;

  queryString += `
  LIMIT ${limit} 
  `;

  if (p) {
    p = Number(p);
  }

  if (isNaN(p) === true && p !== undefined) {
    return Promise.reject({
      status: 404,
      msg: 'Bad page request',
    });
  } else if (p > 1) {
    let offsetArticles = limit * p - limit;
    queryString += `
    OFFSET ${offsetArticles} 
    `;
  }

  return db.query(queryString, [article_id]).then((result) => {
    return result.rows;
  });
};

addComment = (newComment, article_id) => {
  const { author, body } = newComment;

  if (!author || !body) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request',
    });
  }

  return db
    .query(
      `
    INSERT INTO comments
      (author, body, article_id)
    VALUES
      ($1, $2, $3)
    RETURNING *
    `,
      [author, body, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

removeComment = (comment_id) => {
  return db
    .query(
      `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *
    `,
      [comment_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: 'Comment not found' });
      }
      return result.rows;
    });
};

updateCommentVotes = (comment_id, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request',
    });
  }

  return db
    .query(
      `
      UPDATE comments
      SET votes = votes + $1
      WHERE comment_id = $2
      RETURNING *
    `,
      [inc_votes, comment_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: 'Comment not found' });
      }
      return result.rows[0];
    });
};

removeCommentsByArticleId = (article_id) => {
  return db
    .query(
      `
  DELETE FROM comments
  WHERE article_id = $1
  RETURNING *
  `,
      [article_id]
    )
    .then((result) => {
      // if (result.rowCount === 0) {
      //   return Promise.reject({ status: 404, msg: 'Comment not found' });
      // }
      return result.rows;
    });
};

module.exports = {
  fetchCommentsByArticleId,
  addComment,
  removeComment,
  updateCommentVotes,
  removeCommentsByArticleId,
};
