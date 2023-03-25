function handle404NonExistantPaths(request, response, next) {
  response.status(404).send({ msg: 'Path not found' });
}

function handlePSQL400s(error, request, response, next) {
  if (error.code === '22P02') {
    response.status(400).send({ msg: 'Bad request' });
  } else if (error.code === '42703') {
    response.status(400).send({ msg: 'Invalid article limit' });
  } else if (error.code === '23503' && error.detail.includes('article')) {
    response.status(404).send({ msg: 'Article_id not found' });
  } else if (error.code === '23503' && error.detail.includes('author')) {
    response.status(404).send({ msg: 'User not found' });
  } else {
    next(error);
  }
}

function handleCustomErrors(error, request, response, next) {
  if (error.msg && error.status) {
    response.status(error.status).send({ msg: error.msg });
  } else {
    next(error);
  }
}

function handleServerErrors(error, request, response, next) {
  console.log(error);
  response.status(500).send({ msg: 'Server error' });
}

module.exports = {
  handle404NonExistantPaths,
  handlePSQL400s,
  handleCustomErrors,
  handleServerErrors,
};
