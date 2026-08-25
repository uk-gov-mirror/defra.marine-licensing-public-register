import { config } from '#/config.js'
import {
  receiveMessages,
  deleteMessage
} from '#/common/helpers/sqs/sqs-client.js'

export { resetSqsClient } from '#/common/helpers/sqs/sqs-client.js'

export const PUBLIC_REGISTER_RECEIVE_OPTIONS = {
  MaxNumberOfMessages: 10,
  WaitTimeSeconds: 20,
  MessageSystemAttributeNames: ['ApproximateReceiveCount'],
  MessageAttributeNames: ['All']
}

export const receivePublicRegisterMessages = async () =>
  receiveMessages(
    config.get('publicRegister').sqsQueueName,
    PUBLIC_REGISTER_RECEIVE_OPTIONS
  )

export const deletePublicRegisterMessage = async (queueName, receiptHandle) =>
  deleteMessage(queueName, receiptHandle)
