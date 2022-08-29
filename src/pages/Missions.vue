<template>
  <q-page class="q-pa-md">
    <q-table
      :data="missionsForProvider"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="rowsPerPage"
      :pagination.sync="pagination"
      :filter="filter"
      separator="cell"
      no-data-label="No missions defined or exposed by this provider"
    >
      <div slot="top-left" slot-scope="props" class="row items-center">
        <div class="col-auto text-h5">
          Missions
        </div>

        <div class="q-ml-md row">
          <q-input
            v-if="missionsForProvider.length"
            class="col"
            color="secondary"
            v-model="filter"
            placeholder="Filter"
            clearable
          />
        </div>
      </div>

      <div slot="top-right" slot-scope="props" class="fit">
        <mission-new-button
          :provider-id="params.providerId"
          @created="missionCreated"
        />
      </div>

      <q-td slot="body-cell-updatedDate" slot-scope="props" :props="props"
            style="width:10em"
      >
        {{props.value}}
      </q-td>

      <q-td slot="body-cell-missionStatus" slot-scope="props" :props="props"
            style="width:5px"
      >
        <q-chip dense size="sm">{{props.value}}</q-chip>
      </q-td>

      <q-td slot="body-cell-providerMissionId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <div v-if="props.value">
          {{props.value}}
          <q-tooltip>Provider mission ID</q-tooltip>
        </div>
      </q-td>

      <q-td slot="body-cell-missionTplId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link
          style="text-decoration:none"
          :to="$utl.routeLoc([params.providerId, 'mt', props.row.missionTplId, 'm', props.row.missionId])"
        >
          {{props.value}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-missionId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link
          style="text-decoration:none"
          :to="$utl.routeLoc([params.providerId, 'mt', props.row.missionTplId, 'm', props.row.missionId])"
        >
          {{props.value}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-assetId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link
          style="text-decoration:none"
          :to="$utl.routeLoc([params.providerId, 'a', props.value])"
        >
          {{props.value}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-description" slot-scope="props" :props="props"
      >
        <mxm-markdown
          expandable :expandable-subtitle-limit="50"
          simple hide-empty :text="props.value"
          :start-markdown="props.row.provider.descriptionFormat === 'markdown'"
        />
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
  import allMissionsListGql from '../graphql/missions.gql'

  import MissionNewButton from 'components/mission-new-button'

  const debug = false

  export default {
    components: {
      MissionNewButton,
    },

    data() {
      return {
        missionsForProvider: [],
        columns: [
          {
            field: 'updatedDate',
            name: 'updatedDate',
            label: 'Updated',
            align: 'left',
            sortable: true
          },
          {
            field: 'missionStatus',
            name: 'missionStatus',
            label: 'Status',
            align: 'left',
            sortable: true
          },
          {
            field: 'missionTplId',
            name: 'missionTplId',
            label: 'Mission',
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
          {
            field: 'assetId',
            name: 'assetId',
            label: 'Asset',
            align: 'left',
            sortable: true
          },
          {
            field: 'missionId',
            name: 'missionId',
            label: 'ID',
            align: 'left',
            sortable: true
          },
          {
            field: 'providerMissionId',
            name: 'providerMissionId',
            label: 'PMID',
            align: 'left',
            sortable: true
          },
        ],
        rowsPerPage: [0],
        pagination: {
          sortBy: 'updatedDate',
          descending: true,
          rowsPerPage: 0
        },
        filter: '',
      }
    },

    computed: {
      params() {
        return this.$route.params
      },
    },

    apollo: {
      missionsForProvider: {
        query: allMissionsListGql,
        variables() {
          return {
            providerId: this.params.providerId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.missionsForProvider || []
        },
      },
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['Missions'],
          ],
          refresh: this.refreshMissions
        })
      },

      refreshMissions() {
        if (this.$apollo.queries.missionsForProvider) {
          this.$apollo.queries.missionsForProvider.refetch()
        }
      },

      missionCreated(data) {
        this.refreshMissions()
      },
    },

    watch: {
      'params.providerId': {
        handler(val, old) {
          console.warn(`WATCH params.providerId val=`, val, 'old=', old)
          this.setBreadcrumbs()
          this.refreshMissions()
        },
        immediate: true,
      },
    }
  }
</script>
