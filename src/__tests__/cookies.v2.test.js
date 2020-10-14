// Testing Next.js API routes is a little tricky, because there's
// not an easy way to provide mock request and response objects.
// https://nextjs.org/docs/api-routes/introduction
// The request object is a modified version of an IncomingMessage
// instance:
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
// The response object is a modified version of a ServerResponse
// instance:
// https://nodejs.org/api/http.html#http_class_http_serverresponse
// One approach we've used elsewhere is to provide mock `req` and
// `res` objects, which works for simpler API logic but falls short
// when there's more complex interaction (e.g., things like cookie
// middleware) because the mocks might not reflect production
// behavior.
// Ideally, Next would provide a guide or helpers to enable simpler
// testing. Here are a few related discussions:
// https://github.com/vercel/next.js/discussions/15166
// https://github.com/vercel/next.js/discussions/17528
// Meanwhile, here's a project that helps out:
// https://github.com/Xunnamius/next-test-api-route-handler
import { testApiHandler } from 'next-test-api-route-handler'
import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/getMockConfig'
import { encodeBase64 } from 'src/encoding'

jest.mock('src/config')

beforeEach(() => {
  const mockConfig = getMockConfig()
  setConfig({
    ...mockConfig,
    cookies: {
      ...mockConfig.cookies,
      cookieName: 'myNeatApp',
    },
  })
})

describe('cookies.js: getCookie', () => {
  it('returns the expected cookie value', async () => {
    expect.assertions(1)
    await testApiHandler({
      handler: async (req, res) => {
        const { getCookie } = require('src/cookies')
        const MOCK_COOKIE_NAME = 'myStuff'
        const cookieVal = getCookie(MOCK_COOKIE_NAME, { req, res })
        expect(JSON.parse(cookieVal)).toEqual({
          my: ['data', 'here'],
        })
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            foo: 'blah',
            cookie: `myStuff="${encodeBase64(
              JSON.stringify({
                my: ['data', 'here'],
              })
            )}";`,
          },
        })
      },
    })
  })
})
