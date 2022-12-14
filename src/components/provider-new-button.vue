<template>
  <div>
    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    />

    <utl-dialog
      :dialog-opened="dialogOpened"
      title="Register new provider"
      :ok-to-submit="!!okToSubmit && !progress"
      :ok-to-dismiss="!progress"
      @submit="submit"
      @dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-sm"
      >
        <q-btn-dropdown
          class="q-ml-xl"
          stack-label label="Select..."
          color="primary"
          dense no-caps
        >
          <q-list>
            <q-item
              v-for="(pp, index) in possibleProviders" :key="index"
              clickable v-close-popup
              @click="providerSelected(pp)"
            >
              <q-item-section>
                <q-item-label>{{ pp.providerId }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <div>
          Provider name:
          <q-input
            ref="providerName"
            dense hide-bottom-space
            no-error-icon
            :error="!providerId.length || !!providerNameInvalid"
            :error-message="providerNameInvalid"
            @input="providerNameInvalid = null"
            class="bg-light-blue-1"
            v-model.trim="providerId"
            type="text"
            autofocus
            style="width:28em"
          />
        </div>

        <div class="column">
          HTTP Endpoint:
          <div class="row items-center">
            <q-input
              dense hide-bottom-space
              no-error-icon
              :error="!httpEndpoint.length"
              class="bg-light-blue-1"
              v-model.trim="httpEndpoint"
              type="text"
              style="width:28em"
            />
            <q-btn
              v-if="pingOk"
              icon="check"
              dense round no-caps size="sm"
              class="text-green-5"
            />
            <q-btn
              v-else
              label="Test"
              :color="pingFailed ? 'red' : 'secondary'"
              dense round no-caps size="sm"
              @click="testConnectionToProvider"
            />
          </div>
        </div>

        <div>
          API Type:
          <api-type-select
            :value="apiType"
            @input="val => { apiType = val.value }"
          />
        </div>

        <div>
          <q-linear-progress
            v-if="progress" size="25px" :value="progress" color="accent"
          >
            <div class="absolute-full flex flex-center">
              <q-badge color="white" text-color="accent" :label="progressLabel" />
            </div>
          </q-linear-progress>
        </div>
      </div>
    </utl-dialog>
  </div>
</template>

<script>
  import providerPingGql from '../graphql/providerPing.gql'
  import providerInsertGql from '../graphql/providerInsert.gql'

  import apiTypeSelect from '../components/api-type-select'

  import get from 'lodash/get'
  import some from 'lodash/some'

  const debug = false

  export default {
    components: {
      apiTypeSelect,
    },

    data: () => ({
      dialogOpened: false,
      providerId: '',
      httpEndpoint: '',
      apiType: '',
      pingOk: false,
      pingFailed: false,

      providerNameInvalid: null,
      progress: null,
      progressLabel: null,
    }),

    computed: {
      // development convenience:
      possibleProviders() {
        return [
          {
            providerId: 'TethysDash@okeanids',
            httpEndpoint: 'https://okeanids.mbari.org/TethysDash/api/mxm',
            apiType: 'REST0',
          },
          {
            providerId: 'TethysDash@tethystest:8080',
            httpEndpoint: 'http://tethystest.shore.mbari.org:8080/TethysDash/api/mxm',
            apiType: 'REST0',
          },
          {
            providerId: 'TethysDash@tethystest',
            httpEndpoint: 'http://tethystest.shore.mbari.org/TethysDash/api/mxm',
            apiType: 'REST0',
          },
          {
            providerId: 'TethysDash@localhost:18080',
            httpEndpoint: 'http://localhost:18080/TethysDash/api/mxm',
            apiType: 'REST0',
          },
          {
            providerId: 'TFT@tsauv',
            httpEndpoint: 'http://tsauv.shore.mbari.org/tft-mxm',
            apiType: 'REST0',
          },
          {
            providerId: 'TFT@localhost',
            httpEndpoint: 'http://localhost:8040',
            apiType: 'REST0',
          },
        ]
      },

      okToSubmit() {
        return this.providerId && this.httpEndpoint && this.apiType && this.pingOk
      },
    },

    methods: {
      openDialog() {
        this.providerNameInvalid = null
        this.progress = null
        this.progressLabel = null

        this.apiType = ''
        this.providerId = ''
        this.httpEndpoint = ''

        this.dialogOpened = true
      },

      async testConnectionToProvider() {
        console.debug('testConnectionToProvider')
        this.pingOk = false
        this.pingFailed = false
        const mutation = providerPingGql
        const variables = {
          pl: {
            providerId: this.providerId,
            httpEndpoint: this.httpEndpoint,
            apiType: this.apiType,
          }
        }

        this.$q.loading.show({
          message: 'Pinging provider...'
        })

        try {
          const data = await this.$apollo.mutate({mutation, variables})
          if (debug) console.debug('mutation data=', data)
          const datetime = get(data, 'data.pingProvider.result.datetime')
          if (datetime) {
            this.pingOk = true
            setTimeout(() => {this.pingOk = false}, 5000)
          }
        }
        catch(error) {
          this.pingFailed = true
          console.debug(typeof error.message);
          console.warn(error.message);
          this.$q.notify({
            color: 'negative',
            message: error.message,
            textColor: 'white',
            timeout: 3000,
            closeBtn: 'Close',
          })
        }
        finally {
          this.$q.loading.hide()
        }
      },

      providerSelected(pp) {
        console.debug('providerSelected', pp)
        this.providerId = pp.providerId
        this.httpEndpoint = pp.httpEndpoint
        this.apiType = pp.apiType
      },

      async submit() {
        const mutation = providerInsertGql
        const variables = {
          pl: {
            providerId: this.providerId,
            httpEndpoint: this.httpEndpoint,
            apiType: this.apiType,
          }
        }

        this.$q.loading.show({
          message: 'Provider registration in progress...'
        })

        try {
          const data = await this.$apollo.mutate({mutation, variables})
          this.$q.loading.hide()
          if (debug) console.debug('mutation data=', data)
          const provider = get(data, 'data.createProvider')
          this.closeDialogAndNotify(provider)
        }
        catch(error) {
          this.$q.loading.hide()
          const graphQLErrors = get(error, 'graphQLErrors') || []
          const duplicateKey = some(graphQLErrors, e =>
            e.message && e.message.match(/.*duplicate key.*/)
          )
          if (duplicateKey) {
            this.providerNameInvalid = 'Provider name already registered'
            this.$refs.providerName.focus()
          }
          else {
            console.error('mutation error=', JSON.stringify(error))
            this.$q.notify({
              message: `Unexpected error. See dev console.`,
              timeout: 0,
              closeBtn: 'Close',
              color: 'warn'
            })
          }
        }
      },

      closeDialogAndNotify(provider) {
        this.progress = null
        this.progressLabel = null
        this.dialogOpened = false
        this.$q.notify({
          message: `Provider created: ${provider.providerId}`,
          timeout: 1000,
          position: 'top',
          color: 'info',
        })
        this.$emit('created', provider)
      },
    }
  }
</script>
