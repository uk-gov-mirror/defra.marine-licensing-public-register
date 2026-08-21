import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import HapiSwagger from 'hapi-swagger'

const serviceName = 'Marine Licensing Public Register'
const docsTitle = `${serviceName} API Documentation`

const swaggerOptions = {
  info: {
    title: docsTitle,
    version: '1.0.0',
    description: `API documentation for the ${serviceName}`
  },
  documentationPage: false,
  swaggerUI: false
}

const documentationPage = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${docsTitle} (1.0.0)</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url="/swagger.json"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>
`

export const swagger = {
  plugin: {
    name: 'swagger',
    register: async (server) => {
      await server.register([
        Inert,
        Vision,
        {
          plugin: HapiSwagger,
          options: swaggerOptions
        }
      ])

      server.route({
        method: 'GET',
        path: '/documentation',
        options: {
          auth: false,
          description: 'Redoc API documentation'
        },
        handler: (_request, h) =>
          h.response(documentationPage).type('text/html')
      })
    }
  }
}
