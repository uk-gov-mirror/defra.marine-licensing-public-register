import { vi } from 'vitest'
import { processPublicRegisterMessage } from './public-register-worker-processor.js'
import { deletePublicRegisterMessage } from './public-register-sqs-client.js'
import { upsertApplicationSubmission } from './application-submissions.js'

vi.mock('./public-register-sqs-client.js', () => ({
  deletePublicRegisterMessage: vi.fn()
}))

vi.mock('./application-submissions.js', () => ({
  upsertApplicationSubmission: vi.fn()
}))

const sqsQueueName = 'marine_licensing_public_register'

const payload = {
  applicationType: 'exemption',
  eventType: 'submitted',
  applicationId: '64f1abc',
  applicationReference: 'EXE/2026/00012'
}

const buildMessage = (body) => ({
  MessageId: 'msg-1',
  ReceiptHandle: 'receipt-1',
  Body: typeof body === 'string' ? body : JSON.stringify(body)
})

describe('processPublicRegisterMessage', () => {
  const buildServer = () => ({
    db: {},
    logger: { info: vi.fn(), error: vi.fn() }
  })

  it('upserts a well-formed message and deletes it from the queue', async () => {
    const server = buildServer()
    const message = buildMessage(payload)

    await processPublicRegisterMessage(server, message)

    expect(server.logger.info).toHaveBeenCalledWith(
      payload,
      'Received public register message for EXE/2026/00012'
    )
    expect(upsertApplicationSubmission).toHaveBeenCalledWith(server.db, payload)
    expect(deletePublicRegisterMessage).toHaveBeenCalledWith(
      sqsQueueName,
      'receipt-1'
    )
  })

  it('unwraps an SNS notification envelope before upserting', async () => {
    const server = buildServer()
    const message = buildMessage({
      Type: 'Notification',
      Message: JSON.stringify(payload)
    })

    await processPublicRegisterMessage(server, message)

    expect(upsertApplicationSubmission).toHaveBeenCalledWith(server.db, payload)
    expect(deletePublicRegisterMessage).toHaveBeenCalledWith(
      sqsQueueName,
      'receipt-1'
    )
  })

  it('logs and deletes a malformed message without upserting', async () => {
    const server = buildServer()

    await processPublicRegisterMessage(server, buildMessage('not json'))

    expect(server.logger.error).toHaveBeenCalled()
    expect(upsertApplicationSubmission).not.toHaveBeenCalled()
    expect(deletePublicRegisterMessage).toHaveBeenCalledWith(
      sqsQueueName,
      'receipt-1'
    )
  })

  it('does not delete the message when a required field is missing so SQS can dead-letter it', async () => {
    const server = buildServer()
    const withoutId = {
      applicationType: payload.applicationType,
      eventType: payload.eventType,
      applicationReference: payload.applicationReference
    }

    await expect(
      processPublicRegisterMessage(server, buildMessage(withoutId))
    ).rejects.toThrow(
      'Public register message is missing required field applicationId'
    )

    expect(upsertApplicationSubmission).not.toHaveBeenCalled()
    expect(deletePublicRegisterMessage).not.toHaveBeenCalled()
  })

  it('does not delete the message when upsert fails so SQS can retry then dead-letter it', async () => {
    const server = buildServer()
    vi.mocked(upsertApplicationSubmission).mockRejectedValueOnce(
      new Error('mongo unavailable')
    )

    await expect(
      processPublicRegisterMessage(server, buildMessage(payload))
    ).rejects.toThrow('mongo unavailable')

    expect(deletePublicRegisterMessage).not.toHaveBeenCalled()
  })
})
