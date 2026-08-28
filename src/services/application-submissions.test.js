import {
  APPLICATION_SUBMISSIONS_COLLECTION,
  upsertApplicationSubmission
} from './application-submissions.js'

describe('#upsertApplicationSubmission', () => {
  let server

  beforeAll(async () => {
    const { createServer } = await import('#/server.js')

    server = await createServer()
    await server.initialize()
  })

  beforeEach(async () => {
    await server.db
      .collection(APPLICATION_SUBMISSIONS_COLLECTION)
      .deleteMany({})
  })

  afterAll(async () => {
    await server.stop({ timeout: 1000 })
  })

  const record = {
    applicationType: 'exemption',
    eventType: 'submitted',
    exemptionId: '64f1abc',
    applicationReference: 'EXE/2026/00012'
  }

  test('Should insert a new application submission', async () => {
    await upsertApplicationSubmission(server.db, record)

    const stored = await server.db
      .collection(APPLICATION_SUBMISSIONS_COLLECTION)
      .find({ exemptionId: record.exemptionId }, { projection: { _id: 0 } })
      .toArray()

    expect(stored).toHaveLength(1)
    expect(stored[0]).toEqual(
      expect.objectContaining({
        applicationType: 'exemption',
        eventType: 'submitted',
        exemptionId: '64f1abc',
        applicationReference: 'EXE/2026/00012'
      })
    )
    expect(stored[0].createdAt).toBeInstanceOf(Date)
    expect(stored[0].updatedAt).toBeInstanceOf(Date)
  })

  test('Should upsert by exemptionId and not create a duplicate', async () => {
    await upsertApplicationSubmission(server.db, record)
    await upsertApplicationSubmission(server.db, {
      ...record,
      applicationReference: 'EXE/2026/00099'
    })

    const stored = await server.db
      .collection(APPLICATION_SUBMISSIONS_COLLECTION)
      .find({ exemptionId: record.exemptionId })
      .toArray()

    expect(stored).toHaveLength(1)
    expect(stored[0].applicationReference).toBe('EXE/2026/00099')
    expect(stored[0].createdAt).toEqual(stored[0].createdAt)
  })
})
