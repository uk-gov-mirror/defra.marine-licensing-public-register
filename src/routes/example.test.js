describe('#example', () => {
  let server

  beforeAll(async () => {
    const { createServer } = await import('#/server.js')

    server = await createServer()
    await server.initialize()
  })

  beforeEach(async () => {
    await server.db.collection('example-data').deleteMany({})
  })

  test('Should return an empty list when no example records exist', async () => {
    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: '/example'
    })

    expect(statusCode).toBe(200)
    expect(result).toEqual([])
  })

  test('Should return 404 when the example record is missing', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/example/missing-id'
    })

    expect(statusCode).toBe(404)
  })

  test('Should return an example record by id', async () => {
    const record = { exampleId: 'abc-123', name: 'Sample' }
    await server.db.collection('example-data').insertOne(record)

    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: '/example/abc-123'
    })

    expect(statusCode).toBe(200)
    expect(result).toEqual({ exampleId: 'abc-123', name: 'Sample' })
  })
})
