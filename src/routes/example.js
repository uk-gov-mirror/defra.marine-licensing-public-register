import Boom from '@hapi/boom'
import Joi from 'joi'

import { findAllExampleData, findExampleData } from '#/services/ExampleFind.js'

const exampleRecordSchema = Joi.object({
  exampleId: Joi.string()
    .required()
    .example('7f3c9b12-4d8e-4a6f-b512-9a6d3f8c1e25')
})
  .unknown(true)
  .label('ExampleRecord')

const notFoundSchema = Joi.object({
  statusCode: Joi.number().example(404),
  error: Joi.string().example('Not Found'),
  message: Joi.string().example('Not Found')
}).label('NotFound')

export const example = [
  {
    method: 'GET',
    path: '/example',
    options: {
      tags: ['api', 'example'],
      description: 'List example records',
      notes:
        'Retrieves all example records. This is a dummy endpoint included with the backend template and can be removed as needed.',
      response: {
        status: {
          200: Joi.array().items(exampleRecordSchema).label('ExampleRecordList')
        }
      }
    },
    handler: async (request, h) => {
      const entities = await findAllExampleData(request.db)
      return h.response(entities)
    }
  },
  {
    method: 'GET',
    path: '/example/{exampleId}',
    options: {
      tags: ['api', 'example'],
      description: 'Get an example record',
      notes:
        'Retrieves a single example record by ID. The exampleId is the unique identifier of the record.',
      validate: {
        params: Joi.object({
          exampleId: Joi.string()
            .required()
            .example('7f3c9b12-4d8e-4a6f-b512-9a6d3f8c1e25')
        })
      },
      response: {
        status: {
          200: exampleRecordSchema,
          404: notFoundSchema
        }
      }
    },
    handler: async (request, h) => {
      const entity = await findExampleData(request.db, request.params.exampleId)

      if (!entity) {
        return Boom.notFound()
      }

      return h.response(entity)
    }
  }
]
