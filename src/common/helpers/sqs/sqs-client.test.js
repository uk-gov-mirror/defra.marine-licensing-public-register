import { vi } from 'vitest'
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueUrlCommand
} from '@aws-sdk/client-sqs'
import {
  getSqsClient,
  resetSqsClient,
  receiveMessages,
  deleteMessage
} from './sqs-client.js'

const queueName = 'marine_licensing_public_register'
const queueUrl = `http://localhost:4566/000000000000/${queueName}`

const findCommand = (mockSend, CommandType) =>
  mockSend.mock.calls.map((c) => c[0]).find((c) => c instanceof CommandType)

describe('sqs-client', () => {
  let mockSend

  beforeEach(() => {
    resetSqsClient()
    mockSend = vi
      .spyOn(SQSClient.prototype, 'send')
      .mockImplementation((command) => {
        if (command instanceof GetQueueUrlCommand) {
          return Promise.resolve({ QueueUrl: queueUrl })
        }
        return Promise.resolve({ Messages: undefined })
      })
  })

  describe('getSqsClient', () => {
    it('returns the same instance on repeated calls', () => {
      const a = getSqsClient()
      const b = getSqsClient()
      expect(a).toBe(b)
    })
  })

  describe('resetSqsClient', () => {
    it('clears the singleton so a new client is created on next call', () => {
      const a = getSqsClient()
      resetSqsClient()
      const b = getSqsClient()
      expect(a).not.toBe(b)
    })

    it('clears the URL cache so the queue URL is re-fetched', async () => {
      await receiveMessages(queueName)
      const urlCallsAfterFirst = mockSend.mock.calls.filter(
        (c) => c[0] instanceof GetQueueUrlCommand
      ).length
      expect(urlCallsAfterFirst).toBe(1)

      resetSqsClient()
      await receiveMessages(queueName)

      const urlCallsAfterReset = mockSend.mock.calls.filter(
        (c) => c[0] instanceof GetQueueUrlCommand
      ).length
      expect(urlCallsAfterReset).toBe(2)
    })
  })

  describe('receiveMessages', () => {
    it('issues a ReceiveMessageCommand with the resolved URL and merged options', async () => {
      mockSend.mockResolvedValueOnce({ QueueUrl: queueUrl })
      mockSend.mockResolvedValueOnce({ Messages: [{ MessageId: '1' }] })

      const options = {
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
        MessageSystemAttributeNames: ['ApproximateReceiveCount']
      }
      const result = await receiveMessages(queueName, options)

      const cmd = findCommand(mockSend, ReceiveMessageCommand)
      expect(cmd.input).toEqual({ QueueUrl: queueUrl, ...options })
      expect(result).toEqual([{ MessageId: '1' }])
    })

    it('returns an empty array when Messages is undefined', async () => {
      const result = await receiveMessages(queueName)
      expect(result).toEqual([])
    })
  })

  describe('deleteMessage', () => {
    it('issues a DeleteMessageCommand with the resolved URL and receipt handle', async () => {
      await deleteMessage(queueName, 'receipt-abc')

      const cmd = findCommand(mockSend, DeleteMessageCommand)
      expect(cmd.input).toEqual({
        QueueUrl: queueUrl,
        ReceiptHandle: 'receipt-abc'
      })
    })
  })
})
