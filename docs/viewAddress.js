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

        <b-form-group label="Favourite:" label-for="address-favourite" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="address-favourite" :pressed.sync="favourite" variant="transparent"><b-icon :icon="favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
        </b-form-group>

        <b-form-group label="Name:" label-for="address-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-75">
            <b-form-input size="sm" type="text" id="address-name" v-model.trim="name" debounce="600" placeholder="optional"></b-form-input>
            <!--
            <b-input-group-append>
              <div>
                <b-button size="sm" :pressed.sync="mine" variant="transparent" v-b-popover.hover="addressTypeInfo[type || 'address'].name" class="m-0 ml-5 p-0"><b-icon :icon="mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="addressTypeInfo[type || 'address'].variant"></b-icon></b-button>
                <b-button size="sm" :pressed.sync="favourite" variant="transparent" v-b-popover.hover="'Favourite?'" class="m-0 ml-1 p-0"><b-icon :icon="favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
              </div>
            </b-input-group-append>
            -->
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
      stealthPrivateKey: null,
      addressTypeInfo: {
        "address": { variant: "warning", name: "My Address" },
        "stealthAddress": { variant: "dark", name: "My Stealth Address" },
        "stealthMetaAddress": { variant: "success", name: "My Stealth Meta-Address" },
      },
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
    checkOptions() {
      return store.getters['data/checkOptions'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    address() {
      return store.getters['viewAddress/address'];
    },
    linkedTo() {
      return store.getters['viewAddress/linkedTo'];
    },
    type() {
      return store.getters['viewAddress/type'];
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
    favourite: {
      get: function () {
        return store.getters['viewAddress/favourite'];
      },
      set: function (favourite) {
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'favourite', value: favourite });
        store.dispatch('viewAddress/setFavourite', favourite);
      },
    },
    check: {
      get: function () {
        return store.getters['viewAddress/check'];
      },
      set: function (check) {
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'check', value: check });
        store.dispatch('viewAddress/setCheck', check);
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
    notes: {
      get: function () {
        return store.getters['viewAddress/notes'];
      },
      set: function (notes) {
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'notes', value: notes });
        store.dispatch('viewAddress/setNotes', notes);
      },
    },
    source() {
      return store.getters['viewAddress/source'];
    },
    stealthTransfers() {
      return store.getters['viewAddress/stealthTransfers'];
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
    // if ('onlyfensTransfersSettings' in localStorage) {
    //   const tempSettings = JSON.parse(localStorage.onlyfensTransfersSettings);
    //   if ('version' in tempSettings && tempSettings.version == 0) {
    //     this.settings = tempSettings;
    //   }
    // }
  },
};

const viewAddressModule = {
  namespaced: true,
  state: {
    address: null,
    mine: null,
    favourite: null,
    name: null,
    show: false,
  },
  getters: {
    address: state => state.address,
    mine: state => state.mine,
    favourite: state => state.favourite,
    name: state => state.name,
    show: state => state.show,
  },
  mutations: {
    viewAddress(state, address) {
      logInfo("viewAddressModule", "mutations.viewAddress - address: " + address);
      const data = store.getters['data/addresses'][address] || {};
      state.address = address;
      state.mine = data.mine;
      state.favourite = data.favourite;
      state.name = data.name;
      state.show = true;
    },
    setMine(state, mine) {
      logInfo("viewAddressModule", "mutations.setMine - mine: " + mine);
      state.mine = mine;
    },
    setFavourite(state, favourite) {
      logInfo("viewAddressModule", "mutations.setFavourite - favourite: " + favourite);
      state.favourite = favourite;
    },
    setName(state, name) {
      logInfo("viewAddressModule", "mutations.setName - name: " + name);
      state.name = name;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewAddress(context, address) {
      logInfo("viewAddressModule", "actions.viewAddress - address: " + address);
      await context.commit('viewAddress', address);
    },
    async setMine(context, mine) {
      logInfo("viewAddressModule", "actions.setMine - mine: " + mine);
      await context.commit('setMine', mine);
    },
    async setFavourite(context, favourite) {
      logInfo("viewAddressModule", "actions.setFavourite - favourite: " + favourite);
      await context.commit('setFavourite', favourite);
    },
    async setName(context, name) {
      logInfo("viewAddressModule", "actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
