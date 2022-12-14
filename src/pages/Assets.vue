<template>
  <q-page class="q-pa-md">
    <q-table
      :data="assetsForProvider"
      :columns="columns"
      row-key="assetId"
      :rows-per-page-options="rowsPerPage"
      :pagination.sync="pagination"
      :filter="filter"
      separator="cell"
      no-data-label="No assets defined"
    >
      <div slot="top-left" slot-scope="props" class="row items-center">
        <div class="col-auto text-h5">
          Assets
        </div>

        <div class="q-ml-md row">
          <q-input
            v-if="assetsForProvider.length"
            class="col"
            color="secondary"
            v-model="filter"
            placeholder="Filter"
            clearable
          />
        </div>
      </div>

      <q-td slot="body-cell-assetId" slot-scope="props" :props="props"
            style="width:5px; vertical-align:top"
      >
        <router-link
          style="text-decoration:none"
          :to="$utl.routeLoc([params.providerId, 'a', props.row.assetId])"
        >
          {{props.row.assetId}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-className" slot-scope="props" :props="props"
            style="width:5px; vertical-align:top"
      >
        <router-link
          style="text-decoration:none"
          :to="$utl.routeLoc([params.providerId, 'ac', props.row.className])"
        >
          {{props.row.className}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-description" slot-scope="props" :props="props"
            style="vertical-align:top"
      >
        <mxm-markdown
          simple hide-empty :text="props.value"
          :start-markdown="props.row.provider.descriptionFormat === 'markdown'"
        />
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
  import allAssetsListGql from '../graphql/assets.gql'

  const debug = false

  export default {
    data() {
      return {
        assetsForProvider: [],
        columns: [
          {
            field: 'assetId',
            name: 'assetId',
            label: 'Name',
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
            field: 'className',
            name: 'className',
            label: 'Class',
            align: 'left',
            sortable: true
          }
        ],
        rowsPerPage: [0],
        pagination: {
          sortBy: 'assetId',
          descending: false,
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
      assetsForProvider: {
        query: allAssetsListGql,
        variables() {
          return {
            providerId: this.params.providerId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.assetsForProvider || []
        },
      },
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['Assets'],
          ],
          refresh: this.refreshAssets
        })
      },

      refreshAssets() {
        if (this.$apollo.queries.assetsForProvider) {
          this.$apollo.queries.assetsForProvider.refetch()
        }
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn('WATCH params=', val)
          this.setBreadcrumbs()
          this.refreshAssets()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>
