const ViewAddress = {
  template: `
    <div>
      <b-modal ref="viewaddress" v-model="show" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>Address</template>
        <b-form-group label="Address:" label-for="address-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="address-address" v-model.trim="address" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :href="'https://etherscan.io/address/' + address" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>

        <b-form-group label="Mine:" label-for="address-mine" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="address-mine" :pressed.sync="mine" variant="transparent"><b-icon :icon="mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="mine ? 'warning' : 'secondary'"></b-icon></b-button>
        </b-form-group>

        <b-form-group label="Process:" label-for="address-process" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="address-process" :pressed.sync="process" variant="transparent"><b-icon :icon="process ? 'check-square' : 'square'" shift-v="+1" font-scale="0.95" variant="primary"></b-icon></b-button>
        </b-form-group>

        <b-form-group label="Name:" label-for="address-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-75">
            <b-form-input size="sm" type="text" id="address-name" v-model.trim="name" debounce="600" placeholder="optional"></b-form-input>
          </b-input-group>
        </b-form-group>
        <b-form-group v-if="address" label="" label-for="address-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(address);" variant="link" v-b-popover.hover.top="'Delete address ' + address.substring(0, 10) + '...' + address.slice(-8) + '?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
    }
  },
  computed: {
    address() {
      return store.getters['viewAddress/address'];
    },
    mine: {
      get: function () {
        return store.getters['viewAddress/mine'];
      },
      set: function (mine) {
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'mine', value: mine });
        store.dispatch('viewAddress/setMine', mine);
      },
    },
    process: {
      get: function () {
        return store.getters['viewAddress/process'];
      },
      set: function (process) {
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'process', value: process });
        store.dispatch('viewAddress/setProcess', process);
      },
    },
    name: {
      get: function () {
        return store.getters['viewAddress/name'];
      },
      set: function (name) {
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'name', value: name });
        store.dispatch('viewAddress/setName', name);
      },
    },
    show: {
      get: function () {
        return store.getters['viewAddress/show'];
      },
      set: function (show) {
        store.dispatch('viewAddress/setShow', show);
      },
    },
  },
  methods: {
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    setShow(show) {
      store.dispatch('viewAddress/setShow', show);
    },
    async deleteAddress(account) {
      this.$bvModal.msgBoxConfirm('Are you sure?')
        .then(value => {
          if (value) {
            store.dispatch('data/deleteAddress', account);
            this.$refs['viewaddress'].hide();
          }
        })
        .catch(err => {
          // An error occurred
        })
    },
  },
  beforeDestroy() {
    logDebug("ViewAddress", "beforeDestroy()");
  },
  mounted() {
    logDebug("ViewAddress", "mounted() $route: " + JSON.stringify(this.$route.params));
  },
};

const viewAddressModule = {
  namespaced: true,
  state: {
    address: null,
    mine: null,
    process: null,
    name: null,
    show: false,
  },
  getters: {
    address: state => state.address,
    mine: state => state.mine,
    process: state => state.process,
    name: state => state.name,
    show: state => state.show,
  },
  mutations: {
    viewAddress(state, address) {
      // logInfo("viewAddressModule", "mutations.viewAddress - address: " + address);
      const data = store.getters['data/addresses'][address] || {};
      state.address = address;
      state.mine = data.mine;
      state.process = data.process;
      state.name = data.name;
      state.show = true;
    },
    setMine(state, mine) {
      // logInfo("viewAddressModule", "mutations.setMine - mine: " + mine);
      state.mine = mine;
    },
    setProcess(state, process) {
      // logInfo("viewAddressModule", "mutations.setProcess - process: " + process);
      state.process = process;
    },
    setName(state, name) {
      // logInfo("viewAddressModule", "mutations.setName - name: " + name);
      state.name = name;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewAddress(context, address) {
      // logInfo("viewAddressModule", "actions.viewAddress - address: " + address);
      await context.commit('viewAddress', address);
    },
    async setMine(context, mine) {
      // logInfo("viewAddressModule", "actions.setMine - mine: " + mine);
      await context.commit('setMine', mine);
    },
    async setProcess(context, process) {
      // logInfo("viewAddressModule", "actions.setProcess - process: " + process);
      await context.commit('setProcess', process);
    },
    async setName(context, name) {
      // logInfo("viewAddressModule", "actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
