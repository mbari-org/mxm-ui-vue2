import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
import { loadConfig } from 'boot/mxmConfig'

/*
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
*/

let apolloClient = null;

function getApolloClient() {
  return new Promise((resolve, reject) => {
    let id = setTimeout(check, 700)
    let count = 1
    function check() {
      console.log('check', count++)
      clearTimeout(id)
      if (apolloClient)
        resolve(apolloClient)
      else
        id = setTimeout(check, 300)
    }
  })
}

export { getApolloClient }

export default async ({ store, app, Vue }) => {
  return new Promise((resolve, reject) => {
    loadConfig
      .then(config => {
        resolve(initApollo(config))
      })
      .catch(reject)

    function initApollo({graphqlUri}) {
      console.log('initApollo: graphqlUri=', graphqlUri)
      const httpLink = new HttpLink({
        uri: graphqlUri,
      })

      const link = httpLink
      /*
            const wsUri = graphqlUri.replace(/^http/, 'ws')
            const wsLink = new WebSocketLink({
              uri: wsUri,
              options: {
                reconnect: true,
              },
            })

            const link = split(
              // split based on operation type
              ({ query }) => {
                const definition = getMainDefinition(query)
                return definition.kind === 'OperationDefinition' &&
                  definition.operation === 'subscription'
              },
              wsLink,
              httpLink
            )
      */

      const cache = new InMemoryCache({
        // NOTE: the following not available in the used vue2 setup, but available in vue3.
        // This seems to explain why the subscribeToMore doesn't work due to the missing `providerId` key field?
        typePolicies: {
          Provider: {
            // https://www.apollographql.com/docs/react/caching/cache-configuration/#customizing-cache-ids
            keyFields: ['providerId'],
          },
          // any merging strategy?
          // https://www.apollographql.com/docs/react/caching/cache-field-behavior/#merging-non-normalized-objects
        }
      })

      // Create the apollo client
      apolloClient = new ApolloClient({
        // TODO revisit the cache/fetch settings.
        // For now, it seems taht we need 'no-cache' in general
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'no-cache',
          },
          query: {
            fetchPolicy: 'no-cache',
          },
        },
        link,
        cache,
        connectToDevTools: true,
      })

      // Install the vue plugin
      Vue.use(VueApollo)

      // Create apollo provider
      const apolloProvider = new VueApollo({
        defaultClient: apolloClient,
      })

      // Set apollo provider instance on app
      app.apolloProvider = apolloProvider // https://github.com/vuejs/vue-apollo/issues/408#issuecomment-426995379
    }
  })
}
