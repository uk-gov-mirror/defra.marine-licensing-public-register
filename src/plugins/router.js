import { health } from '#/routes/health.js'
import { example } from '#/routes/example.js'
import { applicationSubmissions } from '#/routes/application-submissions.js'

export const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route([health].concat(example, applicationSubmissions))
    }
  }
}
