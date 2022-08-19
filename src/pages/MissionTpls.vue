<template>
  <div>
    <pre v-if="true">missionTplBasic={{missionTplBasic}}</pre>

    <div class="row items-center q-mb-sm">
      <div class="col-auto text-h5">
        Mission templates
      </div>

      <div class="q-ml-md row">
        <q-input
          :disable="!listMissionTplsDirectory || !listMissionTplsDirectory.length"
          class="col"
          color="secondary"
          v-model="filter"
          placeholder="Filter"
          clearable
        />
      </div>
    </div>

    <div>
      <q-table
        :data="sortedAllMissionTplsList || []"
        :columns="missionTplColumns"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
        separator="cell"
        :no-data-label="updating ? 'Updating ...' : 'No mission templates defined'"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="row q-mb-sm items-center">
            <q-icon
              name="far fa-folder"
              size="16px"
              class="q-mr-xs"
            />
            <div style="font-size:large">{{ directory }}</div>
            <div
              v-if="missionTplBasic && missionTplBasic.retrievedAt"
              class="q-ml-lg text-grey" style="font-size:smaller"
            >
              {{ missionTplBasic.retrievedAt }}
              <q-tooltip>Time when this template listing was last retrieved from the provider</q-tooltip>
            </div>
          </div>


        </div>

        <q-td slot="body-cell-missionTplId" slot-scope="props" :props="props"
              style="width:5px;vertical-align:top"
        >
          <q-icon
            v-if="props.row.missionTplId.endsWith('/')"
            name="far fa-folder"
            size="12px"
            class="q-mr-xs"
          />
          <router-link
            style="text-decoration:none"
            :to="$utl.routeLoc([params.providerId, 'mt', props.row.missionTplId])"
          >
            {{props.row.missionTplId}}
          </router-link>
        </q-td>

        <q-td slot="body-cell-description" slot-scope="props" :props="props"
              style="vertical-align:top"
        >
          <mxm-markdown
            expandable :expandable-subtitle-limit="80"
            simple hide-empty
            :text="props.value"
            :start-markdown="props.row.provider.descriptionFormat === 'markdown'"
          />
        </q-td>

      </q-table>
    </div>

    <div v-if="updating">
      Updating ...
    </div>
    <div v-else-if="!listMissionTplsDirectory">
      Not found: {{params.missionTplId}}
    </div>

  </div>
</template>

<script>
  import missionTplBasicGql from '../graphql/missionTplBasic.gql'
  import missionTplUpdateGql from '../graphql/missionTplUpdate.gql'
  import missionTplsDirectoryGql from '../graphql/missionTplsDirectory.gql'

  import orderBy from "lodash/orderBy"

  const debug = true

  export default {
    data() {
      return {
        debug,
        updating: false,
        missionTplBasic: null,
        listMissionTplsDirectory: null,

        missionTplColumns: [
          {
            field: 'missionTplId',
            name: 'missionTplId',
            label: 'ID',
            align: 'left',
            sortable: true
          },
          {
            field: 'description',
            name: 'description',
            label: 'Description',
            align: 'left',
            sortable: true
          },
        ],
        rowsPerPage: [0],
        pagination: {
          rowsPerPage: 0
        },
        filter: '',
      }
    },

    computed: {
      params() {
        return this.$route.params
      },

      directory() {
        const directory = this.params.missionTplId || '/'
        console.assert(directory.endsWith('/'))
        return directory
      },

      sortedAllMissionTplsList() {
        return this.listMissionTplsDirectory &&
          orderBy(this.listMissionTplsDirectory, mt => mt.missionTplId.endsWith('/') ? 1 : 0)
      },

      skipMissionTplsListQuery() {
        if (!this.missionTplBasic) {
          return true
        }
        else if (this.missionTplBasic.retrievedAt) {
          return false
        }
        else {
          return true
        }
      },

      allMissionTplsListVariables() {
        return {
          providerId: this.params.providerId,
          directory: this.directory,
        }
      },
    },

    apollo: {
      missionTplBasic: {
        query: missionTplBasicGql,
        variables() {
          return {
            providerId: this.params.providerId,
            missionTplId: this.directory,
          }
        },
        update(data) {
          /*if (debug)*/ console.debug('missionTplBasicGql update: data=', data)
          return data.missionTemplate || {}
        },
      },

      listMissionTplsDirectory: {
        skip () {
          return this.skipMissionTplsListQuery
        },
        query: missionTplsDirectoryGql,
        variables() {
          return this.allMissionTplsListVariables
        },
        update(data) {
          /*if (debug)*/ console.debug('listMissionTplsDirectory update: data=', data)
          return data.listMissionTplsDirectory
        },
        error(error) {
          /*if (debug)*/ console.debug('listMissionTplsDirectory error=', error)
        },
      },
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['MissionTemplates', [this.params.providerId, 'mt']],
            [this.directory],
          ],
          refresh: this.reloadMissionTpls
        })
      },

      async refreshMissionTpls() {
        console.debug('refreshMissionTpls')

        // conditional refetch calls needed to avoid 'TypeError: Cannot read property 'refetch' of undefined'
        // apparently upon very first request from the "immediate" watch below.
        // See https://github.com/vuejs/vue-apollo/issues/880

        const doIt = async () => {
          if (this.$apollo.queries.missionTplBasic && this.$apollo.queries.listMissionTplsDirectory) {
            console.debug('refreshMissionTpls: missionTplBasic')
            this.$apollo.queries.missionTplBasic.refetch()

            console.debug('refreshMissionTpls: directory=', this.directory)
            this.$apollo.queries.listMissionTplsDirectory.refetch()
          }
          else {
            console.warn('refreshMissionTpls: waiting for queries to be defined')
            setTimeout(doIt, 500)
          }
        }

        await doIt()
      },

      async reloadMissionTpls() {
        this.$q.loading.show({
          message: `Reloading template directory ${this.directory} ...`,
          messageColor: 'black',
          customClass: 'text-bold',
        })
        try {
          // TODO get updated info from the mutation itself
          await this.updateMissionTplBasic()
          await this.refreshMissionTpls()
        }
        finally {
          this.$q.loading.hide()
        }
      },

      async updateMissionTplBasic() {
        if (debug) console.debug('updateMissionTplBasic')
        const mutation = missionTplUpdateGql
        const variables = {
          pl: {
            providerId: this.params.providerId,
            missionTplId: this.directory
          }
        }
        try {
          const data = await this.$apollo.mutate({mutation, variables})
          if (debug) console.debug('updateMissionTpl: mutation data=', data)
          this.$q.notify({
            message: `Mission template directory updated`,
            timeout: 1000,
            position: 'top',
            color: 'info',
          })
        }
        catch(error) {
          console.error('updateMissionTplBasic: mutation error=', error)
        }
      },

      routePathChanged(path) {
        console.warn(`routePathChanged=`, path)
        this.setBreadcrumbs()
        this.listMissionTplsDirectory = null
        if (!this.updating) {
          this.updating = true
          setTimeout( async () => {
            try {
              if (this.missionTplBasic && !this.missionTplBasic.retrievedAt) {
                await this.reloadMissionTpls()
              }
              else {
                await this.refreshMissionTpls()
              }
            }
            finally {
              this.updating = false
            }
          }, 777)
        }
      },
    },

    watch: {
      '$route.path': {
        handler(path) {
          this.routePathChanged(path)
        },
        immediate: true,
      },
    },
  }
</script>
