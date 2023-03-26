const {
  fetchCommentsByArticleId,
  addComment,
  removeComment,
  updateCommentVotes,
} = require('../models/comments-models');
const { fetchArticleById } = require('../models/articles-models');

sendCommentsByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  const { limit, p } = request.query;

  const articleCheck = fetchArticleById(article_id);
  const fetchComments = fetchCommentsByArticleId(article_id, limit, p);

  Promise.all([fetchComments, articleCheck])
    .then((result) => {
      const comments = result[0];
      response.status(200).send({ comments });
    })
    .catch((error) => {
      next(error);
    });
};

postComment = (request, response, next) => {
  const newComment = request.body;
  const { article_id } = request.params;

  addComment(newComment, article_id)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch((error) => {
      next(error);
    });
};

deleteComment = (request, response, next) => {
  const { comment_id } = request.params;

  removeComment(comment_id)
    .then(() => {
      response.status(204).send();
    })
    .catch((error) => {
      next(error);
    });
};

patchCommentVotes = (request, response, next) => {
  const { comment_id } = request.params;
  const { inc_votes } = request.body;

  updateCommentVotes(comment_id, inc_votes)
    .then((updatedComment) => {
      response.status(200).send({ updatedComment });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  sendCommentsByArticleId,
  postComment,
  deleteComment,
  patchCommentVotes,
};
