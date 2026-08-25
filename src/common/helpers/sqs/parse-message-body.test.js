import {
  parseMessageBody,
  unwrapSnsNotification
} from './parse-message-body.js'

describe('parseMessageBody', () => {
  const buildLogger = () => ({ error: vi.fn() })
  const discardMessage = 'Discarding malformed message'

  it('should return the parsed body when the JSON is valid', () => {
    const logger = buildLogger()
    const payload = {
      applicationType: 'exemption',
      eventType: 'submitted',
      exemptionId: '64f1',
      applicationReference: 'EXE/2026/00012'
    }
    const message = { Body: JSON.stringify(payload) }

    const result = parseMessageBody(message, logger, discardMessage)

    expect(result).toEqual(payload)
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('should unwrap an SNS notification envelope', () => {
    const logger = buildLogger()
    const payload = {
      applicationType: 'exemption',
      eventType: 'submitted',
      exemptionId: '64f1',
      applicationReference: 'EXE/2026/00012'
    }
    const message = {
      Body: JSON.stringify({
        Type: 'Notification',
        Message: JSON.stringify(payload)
      })
    }

    const result = parseMessageBody(message, logger, discardMessage)

    expect(result).toEqual(payload)
  })

  it('should log and return null when the JSON is malformed', () => {
    const logger = buildLogger()
    const message = { Body: 'not json' }

    const result = parseMessageBody(message, logger, discardMessage)

    expect(result).toBeNull()
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error), discardMessage)
  })

  it('should return the transformed value when a transform is supplied', () => {
    const logger = buildLogger()
    const message = { Body: JSON.stringify({ foo: 'bar' }) }
    const transform = (body) => ({ transformed: body.foo })

    const result = parseMessageBody(message, logger, discardMessage, transform)

    expect(result).toEqual({ transformed: 'bar' })
  })
})

describe('unwrapSnsNotification', () => {
  it('should return the body unchanged when it is not an SNS envelope', () => {
    const body = { exemptionId: '64f1' }
    expect(unwrapSnsNotification(body)).toEqual(body)
  })
})
