<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar
        color="primary"
        class="glossy row justify-between q-pb-sm"
      >
        <div class="row">
          <img src="statics/new_mbari_logo.png" width="36px" height="10px" class="q-mr-lg">

          <q-toolbar-title style="font-size:1.1em">
            <router-link style="color:white;text-decoration:none" to="/">
              MXM - Mission Execution Mediation Service
            </router-link>
          </q-toolbar-title>
        </div>

        <div v-if="$mxmConfig" class="column">
          <div class="row justify-between">
            <div class="row q-gutter-x-md">
              <div>Prototype UI {{ $version.mxmUI }} / Server {{ $mxmConfig.mxmVersion }}</div>
              <a v-if="$mxmConfig.learnMoreUrl"
                 style="font-size:small"
                 class="text-white"
                 :href="$mxmConfig.learnMoreUrl"
                 target="mxm_learnmore" rel="noopener"
              >
                Learn more
              </a>
            </div>
            <a href="https://github.com/mbari-org/mxm"
               target="_blank" rel="noopener"
               style="text-decoration:none"
               class="text-white q-ml-md"
            >
              <q-icon name="fab fa-github"/>
            </a>
          </div>
          <div class="row q-gutter-x-md items-center" style="font-size:smaller">
            <div class="row q-gutter-x-xs items-center">
              GraphQL:
              <div>
                Endpoint
                <q-tooltip>{{ $mxmConfig.graphqlUri }}</q-tooltip>
              </div>
              <a v-if="$mxmConfig.graphqlSchema"
                 class="text-white"
                 :href="$mxmConfig.graphqlSchema"
                 target="mxm_graphqlSchema" rel="noopener"
              >
                Schema
              </a>
              <a v-if="$mxmConfig.graphqlUi"
                 style="font-size:small"
                 class="text-white"
                 :href="$mxmConfig.graphqlUi"
                 target="mxm_graphqlUI" rel="noopener"
              >
                UI
              </a>
            </div>
            <span class="row q-gutter-x-xs items-center">
              OpenAPI:
              <span>
                endpoint
                <q-tooltip>{{ $mxmConfig.openapi }}</q-tooltip>
              </span>
              <a v-if="$mxmConfig.openapiSchema"
                 class="text-white"
                 :href="$mxmConfig.openapiSchema"
                 target="mxm_graphqlSchema" rel="noopener"
              >
                Schema
              </a>
              <a v-if="$mxmConfig.swaggerUi"
                 style="font-size:small"
                 class="text-white"
                 :href="$mxmConfig.swaggerUi"
                 target="mxm_swaggerUI" rel="noopener"
              >
                UI
              </a>
            </span>
          </div>
        </div>
      </q-toolbar>

      <utl-breadcrumbs/>

    </q-header>

    <q-page-container>
      <router-view/>
      <pre
        v-if="debug"
        class="bg-blue-1 absolute-bottom">$mxmConfig={{ $mxmConfig }}</pre>
    </q-page-container>
  </q-layout>
</template>

<script>
const debug = window.location.search.match(/.*debug=.*\bconfig\b.*/)

export default {
  name: 'MainLayout',
  data() {
    return {
      debug,
    }
  },
}
</script>
