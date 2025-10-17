export const errorHandler = (error, request, reply) => {
  request.log.error(
    {
      err: error,
      url: request.url,
      method: request.method,
    },
    'Request error',
  );

  const statusCode = error.statusCode || error.status || 500;

  const errorName = error.name || 'Error';

  const response = {
    status: statusCode,
    message: errorName,
    data: statusCode === 500 ? 'Something went wrong' : error.message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  reply.code(statusCode).send(response);
};
