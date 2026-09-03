export const unwrapSnsNotification = (body) => {
  if (
    body &&
    typeof body === 'object' &&
    body.Type === 'Notification' &&
    typeof body.Message === 'string'
  ) {
    return JSON.parse(body.Message)
  }

  return body
}

export const parseMessageBody = (
  message,
  logger,
  discardMessage,
  transform = unwrapSnsNotification
) => {
  try {
    return transform(JSON.parse(message.Body))
  } catch (error) {
    logger.error(error, discardMessage)
    return null
  }
}
