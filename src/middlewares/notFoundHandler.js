export const notFoundHandler = (request, reply) => {
  reply.code(404).send({
    statusCode: 404,
    error: 'Not Found',
    message: 'Route not found',
  });
};
