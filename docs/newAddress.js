const NewAddress = {
  template: `
    <div>
      <b-modal ref="newaddress" v-model="show" id="modal-newaddress" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>New Address</template>
        <b-form-group label="Address:" label-for="addnewaddress-address" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!address || addNewAddressFeedback == null" :invalid-feedback="addNewAddressFeedback" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="addnewaddress-address" v-model.trim="address" debounce="600" placeholder="0x1234...6789" class="w-75"></b-form-input>
        </b-form-group>
        <b-form-group label="Mine:" label-for="addnewaddress-mine" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="addnewaddress-mine" :pressed.sync="mine" variant="transparent"><b-icon :icon="mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="mine ? 'warning' : 'secondary'"></b-icon></b-button>
        </b-form-group>
        <b-form-group label="Process:" label-for="addnewaddress-process" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="addnewaddress-process" :pressed.sync="process" variant="transparent"><b-icon :icon="process ? 'check-square' : 'square'" shift-v="+1" font-scale="0.95" variant="primary"></b-icon></b-button>
        </b-form-group>
        <b-form-group label="Name:" label-for="addnewaddress-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="addnewaddress-name" v-model.trim="name" debounce="600" placeholder="optional" class="w-50"></b-form-input>
        </b-form-group>
        <b-form-group label="" label-for="addnewaddress-submit" label-size="sm" label-cols-sm="3" label-align-sm="right" :description="addNewAddressFeedback" class="mx-0 my-1 p-0">
          <!-- <b-button size="sm" :disabled="!!addNewAddressFeedback" id="addnewaddress-submit" @click="addNewAddress" variant="primary">Add/Update</b-button> -->
          <b-button size="sm" :disabled="!!addNewAddressFeedback" id="addnewaddress-submit" @click="addNewAddress" variant="primary">Add/Update</b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
    }
  },
  computed: {
    powerOn() {
      return store.getters['connection/powerOn'];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    chainId() {
      return store.getters['connection/chainId'];
    },
    address: {
      get: function () {
        return store.getters['newAddress/address'];
      },
      set: function (address) {
        store.dispatch('newAddress/setAddress', address);
      },
    },
    mine: {
      get: function () {
        return store.getters['newAddress/mine'];
      },
      set: function (mine) {
        store.dispatch('newAddress/setMine', mine);
      },
    },
    process: {
      get: function () {
        return store.getters['newAddress/process'];
      },
      set: function (process) {
        store.dispatch('newAddress/setProcess', process);
      },
    },
    name: {
      get: function () {
        return store.getters['newAddress/name'];
      },
      set: function (name) {
        store.dispatch('newAddress/setName', name);
      },
    },
    show: {
      get: function () {
        return store.getters['newAddress/show'];
      },
      set: function (show) {
        store.dispatch('newAddress/setShow', show);
      },
    },
    addNewAddressFeedback() {
      if (!this.address) {
        return "Enter Address";
      }
      if (!this.address.match(/^0x[0-9a-fA-F]{40}$/)) {
        return "Invalid Address";
      }
      return null;
    },
  },
  methods: {
    setShow(show) {
      store.dispatch('newAddress/setShow', show);
    },
    async addNewAddress() {
      logInfo("NewAddress", "methods.addNewAddress BEGIN");
      store.dispatch('data/addNewAddress', {
        address: this.address,
        mine: this.mine,
        process: this.process,
        name: this.name,
      });
      this.$refs['newaddress'].hide();
    },
  },
  beforeDestroy() {
    logDebug("NewAddress", "beforeDestroy()");
  },
  mounted() {
    logDebug("NewAddress", "mounted() $route: " + JSON.stringify(this.$route.params));
  },
};

const newAddressModule = {
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
    newAddress(state) {
      logInfo("newAddressModule", "mutations.newAddress");
      state.address = null;
      state.mine = true;
      state.process = true;
      state.name = null;
      state.show = true;
    },
    setAddress(state, address) {
      logInfo("newAddressModule", "mutations.setAddress - address: " + address);
      state.address = address;
    },
    setMine(state, mine) {
      logInfo("newAddressModule", "mutations.setMine - mine: " + mine);
      state.mine = mine;
    },
    setProcess(state, process) {
      logInfo("newAddressModule", "mutations.setProcess - process: " + process);
      state.process = process;
    },
    setName(state, name) {
      logInfo("newAddressModule", "mutations.setName - name: " + name);
      state.name = name;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async newAddress(context) {
      logInfo("newAddressModule", "actions.newAddress");
      await context.commit('newAddress');
    },
    async setAddress(context, address) {
      logInfo("newAddressModule", "actions.setAddress - address: " + address);
      await context.commit('setAddress', address);
    },
    async setMine(context, mine) {
      logInfo("newAddressModule", "actions.setMine - mine: " + mine);
      await context.commit('setMine', mine);
    },
    async setProcess(context, process) {
      logInfo("newAddressModule", "actions.setProcess - process: " + process);
      await context.commit('setProcess', process);
    },
    async setName(context, name) {
      logInfo("newAddressModule", "actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
