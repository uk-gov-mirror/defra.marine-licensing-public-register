export const APPLICATION_SUBMISSIONS_COLLECTION = 'application-submissions'

export async function upsertApplicationSubmission(db, record) {
  const now = new Date()

  await db.collection(APPLICATION_SUBMISSIONS_COLLECTION).updateOne(
    { exemptionId: record.exemptionId },
    {
      $set: {
        exemptionId: record.exemptionId,
        applicationType: record.applicationType,
        eventType: record.eventType,
        applicationReference: record.applicationReference,
        updatedAt: now
      },
      $setOnInsert: { createdAt: now }
    },
    { upsert: true }
  )
}
