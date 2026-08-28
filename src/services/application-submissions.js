export const APPLICATION_SUBMISSIONS_COLLECTION = 'application-submissions'

export async function upsertApplicationSubmission(db, record) {
  const now = new Date()

  await db.collection(APPLICATION_SUBMISSIONS_COLLECTION).updateOne(
    { applicationId: record.applicationId },
    {
      $set: {
        applicationId: record.applicationId,
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
