<template>
  <q-page class="q-pa-md">
    <!--<pre v-if="debug">provider={{provider}}</pre>-->

    <div v-if="provider">

      <q-card class="q-mb-md q-mt-lg">
        <q-card-section class="row q-gutter-md items-center">
          <span>Provider:</span>
          <span class="text-bold">{{provider.providerId}}</span>
        </q-card-section>

        <q-separator/>
        <q-card-section>
          <div>
            <mxm-markdown
              expandable init-expanded expandable-title="Description:"
              :text="provider.description"
              :start-markdown="provider.descriptionFormat === 'markdown'"
            />
          </div>
          <q-separator/>

          <div class="column q-mb-md q-gutter-md">
            <div class="row q-gutter-md">
              <q-btn
                :label="`Mission Templates (${numMissionTemplates})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.providerId, 'mt'])"
              />

              <q-btn
                :label="`Asset Classes (${numAssetClasses})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.providerId, 'ac'])"
              />

              <q-btn
                :label="`Assets (${numAssets})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.providerId, 'a'])"
              />

              <q-btn
                v-if="provider.usesUnits"
                :label="`Units (${numUnits})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.providerId, 'u'])"
              />
            </div>

            <div class="row q-gutter-md">
              <q-btn
                :label="`Missions (${numMissions})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.providerId, 'm'])"
              />
            </div>
          </div>

          <q-separator/>
          <table class="q-mt-sm">
            <tbody>
            <tr>
              <td>Endpoint:</td>
              <td>
                <span class="text-bold">
                  {{provider.httpEndpoint}}
                </span>
              </td>
            </tr>
            <tr>
              <td>API Type:</td>
              <td>
                <span class="text-bold">
                  {{provider.apiType}}
                </span>
              </td>
            </tr>
            <tr>
              <td>Units of measure:</td>
              <td class="text-bold">
                {{ provider.usesUnits ? 'Yes' : 'No '}}
              </td>
            </tr>
            <tr>
              <td>Scheduling:</td>
              <td class="text-bold">
                {{ provider.usesSched ? 'Yes' : 'No '}}
              </td>
            </tr>
            <tr>
              <td>Can validate mission:</td>
              <td class="text-bold">
                {{ provider.canValidate ? 'Yes' : 'No '}}
              </td>
            </tr>
            <tr>
              <td>Can report mission status:</td>
              <td class="text-bold">
                {{ provider.canReportMissionStatus ? 'Yes' : 'No '}}
              </td>
            </tr>
            <tr v-if="provider.descriptionFormat">
              <td>Description format:</td>
              <td class="text-bold">
                {{ provider.descriptionFormat }}
              </td>
            </tr>
            </tbody>
          </table>

        </q-card-section>
      </q-card>

    </div>

    <div v-else-if="!loading">
      Provider not found: {{params.providerId}}
    </div>

<!--    <pre>{{provider}}</pre>-->

  </q-page>
</template>

<script>
import providerGql from '../graphql/provider.gql'
import providerUpdatedByIdGql from '../graphql/providerUpdatedById.gql'

import reduce from 'lodash/reduce'
import size from 'lodash/size'

const debug = window.location.search.match(/.*debug=.*provider.*/)

  export default {
    data: () => ({
      debug,
      loading: false,
    }),

    computed: {
      params() {
        return this.$route.params
      },

      numMissionTemplates() {
        if (this.provider && size(this.provider.missionTemplates)) {
          const all = this.provider.missionTemplates
          const actualTemplates = all.filter(mt => !mt.missionTplId.endsWith('/'))
          return actualTemplates.length
        }
        else return 0
      },

      numAssetClasses() {
        if (this.provider) {
          return size(this.provider.assetClasses)
        }
        else return 0
      },

      numAssets() {
        if (this.provider) {
          return reduce(this.provider.assetClasses,
                  (result, assetClass) => result + size(assetClass.assets),
                  0
          )
        }
        else return 0
      },

      numUnits() {
        if (this.provider) {
          return size(this.provider.units)
        }
        else return 0
      },

      numMissions() {
        if (this.provider) {
          return reduce(this.provider.missionTemplates,
                  (result, missionTemplate) => result + size(missionTemplate.missions),
                  0
          )
        }
        else return 0
      },
    },

    apollo: {
      provider: {
        query: providerGql,
        variables() {
          return {
            providerId: this.params.providerId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.provider || null
        },
      },

/*
      $subscribe: {
        providerUpdatedById: {
          query: providerUpdatedByIdGql,
          variables() {
            return {
              providerId: this.params.providerId
            }
          },
          result ({ data }) {
            console.warn('providerUpdatedById: data=', data)
            this.$q.notify({
              color: 'positive',
              position: 'bottom-right',
              textColor: 'white',
              message: 'Provider updated: ' + data.providerUpdatedById.providerId
            })
          },
        },
      },
*/
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId],
          ],
          refresh: this.reloadProvider
        })
      },

      async reloadProvider() {
        this.provider = null
        this.$q.loading.show({
          message: `Reloading ${this.params.providerId} ...`,
          messageColor: 'black',
          customClass: 'text-bold',
        })
        try {
          // TODO actual reload against provider.

          await this.refreshProvider()
        }
        finally {
          this.$q.loading.hide()
        }
      },

      async refreshProvider() {
        if (this.$apollo.queries.provider) {
          await this.$apollo.queries.provider.refetch()
        }
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn('WATCH params=', val)
          this.setBreadcrumbs()
          this.refreshProvider()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>
