export const EXEMPTION_SUBMISSIONS_COLLECTION = 'exemption-submissions'

export async function upsertExemptionSubmission(db, record) {
  const now = new Date()

  await db.collection(EXEMPTION_SUBMISSIONS_COLLECTION).updateOne(
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
