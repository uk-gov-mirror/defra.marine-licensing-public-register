import { vi } from 'vitest'
import {
  receivePublicRegisterMessages,
  deletePublicRegisterMessage,
  PUBLIC_REGISTER_RECEIVE_OPTIONS
} from './public-register-sqs-client.js'

vi.mock('#/common/helpers/sqs/sqs-client.js', () => ({
  receiveMessages: vi.fn().mockResolvedValue([]),
  deleteMessage: vi.fn().mockResolvedValue({})
}))

import {
  receiveMessages,
  deleteMessage
} from '#/common/helpers/sqs/sqs-client.js'

const sqsQueueName = 'marine_licensing_public_register'

describe('public-register-sqs-client', () => {
  it('receivePublicRegisterMessages calls receiveMessages with the queue and options', async () => {
    await receivePublicRegisterMessages()

    expect(receiveMessages).toHaveBeenCalledWith(
      sqsQueueName,
      PUBLIC_REGISTER_RECEIVE_OPTIONS
    )
  })

  it('deletePublicRegisterMessage calls deleteMessage with the queue name and receipt handle', async () => {
    await deletePublicRegisterMessage(sqsQueueName, 'receipt-1')

    expect(deleteMessage).toHaveBeenCalledWith(sqsQueueName, 'receipt-1')
  })
})
