import { config } from '#/config.js'
import { parseMessageBody } from '#/common/helpers/sqs/parse-message-body.js'
import { deletePublicRegisterMessage } from '#/services/public-register-sqs-client.js'
import { upsertApplicationSubmission } from '#/services/application-submissions.js'

const discardMalformedMessage = 'Discarding malformed public register message'

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0

const requiredFields = [
  'applicationType',
  'eventType',
  'exemptionId',
  'applicationReference'
]

export const processPublicRegisterMessage = async (server, message) => {
  const { db, logger } = server
  const { sqsQueueName } = config.get('publicRegister')

  const body = parseMessageBody(message, logger, discardMalformedMessage)

  if (!body) {
    await deletePublicRegisterMessage(sqsQueueName, message.ReceiptHandle)
    return
  }

  const missingField = requiredFields.find(
    (field) => !isNonEmptyString(body[field])
  )

  if (missingField) {
    throw new Error(
      `Public register message is missing required field ${missingField}`
    )
  }

  const record = {
    applicationType: body.applicationType,
    eventType: body.eventType,
    exemptionId: body.exemptionId,
    applicationReference: body.applicationReference
  }

  logger.info(
    record,
    `Received public register message for ${record.applicationReference}`
  )

  await upsertApplicationSubmission(db, record)
  await deletePublicRegisterMessage(sqsQueueName, message.ReceiptHandle)
}
