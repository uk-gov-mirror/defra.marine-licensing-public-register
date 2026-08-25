import { createSqsPollerPlugin } from '#/common/helpers/sqs/create-poller-plugin.js'
import { receivePublicRegisterMessages } from '#/services/public-register-sqs-client.js'
import { processPublicRegisterMessage } from '#/services/public-register-worker-processor.js'

export const publicRegisterWorkerPlugin = createSqsPollerPlugin({
  name: 'public-register-worker',
  configKey: 'publicRegister',
  receiveMessages: receivePublicRegisterMessages,
  processMessage: processPublicRegisterMessage
})
