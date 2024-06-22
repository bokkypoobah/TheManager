const SyncOptions = {
  template: `
    <div>
      <b-modal ref="syncoptions" v-model="show" hide-footer body-bg-variant="light" size="sm">
        <template #modal-title>Sync Data</template>

        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.transfers" @input="saveSettings" v-b-popover.hover="'ENS ERC-721 and ERC-1155 Transfer events'" class="ml-2 mt-1">ENS Transfer Events</b-form-checkbox>

        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.ensEvents" @input="saveSettings" v-b-popover.hover="'ENS ERC-721 NameRegistered and NameRenewed events'" class="ml-2 mt-1">ENS Events</b-form-checkbox>

        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.wrappedENSEvents" @input="saveSettings" v-b-popover.hover="'Wrapped ENS ERC-1155 NameWrapped events'" class="ml-2 mt-1">Wrapped ENS Events</b-form-checkbox>

        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.prices" @input="saveSettings" v-b-popover.hover="'Listing and offer prices from the Reservoir API'" class="ml-2 mt-1">Prices</b-form-checkbox>

        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.timestamps" @input="saveSettings" v-b-popover.hover="'Timestamps, optional'" class="ml-2 mt-1">Timestamps</b-form-checkbox>

        <b-form-checkbox size="sm" switch v-model="settings.devThing" @input="saveSettings" v-b-popover.hover="'Do Some Dev Thing'" class="ml-2 mt-1">Dev Thing</b-form-checkbox>

        <b-form-group label="" label-for="sync-go" label-size="sm" label-cols-sm="5" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="sync-go" @click="syncNow()" variant="primary">Do It!</b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      settings: {
        transfers: true,
        ensEvents: true,
        wrappedENSEvents: true,
        prices: true,
        timestamps: true,
        devThing: false,
        version: 2,
      },
    }
  },
  computed: {
    chainId() {
      return store.getters['connection/chainId'];
    },
    show: {
      get: function () {
        return store.getters['syncOptions/show'];
      },
      set: function (show) {
        store.dispatch('syncOptions/setShow', show);
      },
    },
  },
  methods: {
    saveSettings() {
      // logInfo("SyncOptions", "methods.saveSettings - onlyfensSyncOptionsSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.onlyfensSyncOptionsSettings = JSON.stringify(this.settings);
    },
    syncNow() {
      store.dispatch('data/syncIt', {
        transfers: this.settings.transfers,
        ensEvents: this.settings.ensEvents,
        wrappedENSEvents: this.settings.wrappedENSEvents,
        prices: this.settings.prices,
        timestamps: this.settings.timestamps,
        devThing: this.settings.devThing,
      });
      store.dispatch('syncOptions/setShow', false);
    },
  },
  mounted() {
    logDebug("SyncOptions", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ('onlyfensSyncOptionsSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.onlyfensSyncOptionsSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
  },
};

const syncOptionsModule = {
  namespaced: true,
  state: {
    show: false,
  },
  getters: {
    show: state => state.show,
  },
  mutations: {
    viewSyncOptions(state) {
      logInfo("syncOptionsModule", "mutations.viewSyncOptions");
      state.show = true;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewSyncOptions(context, blah) {
      logInfo("syncOptionsModule", "actions.viewSyncOptions");
      await context.commit('viewSyncOptions');
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
