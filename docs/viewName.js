const ViewName = {
  template: `
    <div>
      <b-modal ref="viewname" v-model="show" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>View Name</template>

        <b-form-group label="Contract:" label-for="token-contract" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="token-contract" v-model.trim="contract" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button v-if="chainInfo[chainId]" size="sm" :href="chainInfo[chainId].explorerTokenPrefix + contract" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>

        <b-form-group label="Token Id:" label-for="token-tokenid" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <component size="sm" plaintext :is="tokenId && tokenId.length > 30 ? 'b-form-textarea' : 'b-form-input'" v-model="tokenId" rows="2" max-rows="3" class="px-2" />
            <b-input-group-append>
              <div>
                <b-button v-if="chainInfo[chainId]" size="sm" :href="chainInfo[chainId].nftTokenPrefix + contract + '/' + tokenId" variant="link" v-b-popover.hover="'View in NFT explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>

        <b-form-group label="Name:" label-for="token-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="token-name" :value="name" class="px-2 w-100"></b-form-input>
        </b-form-group>

        <b-form-group label="Description:" label-for="token-description" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <component size="sm" plaintext :is="description && description.length > 60 ? 'b-form-textarea' : 'b-form-input'" :value="description" rows="3" max-rows="10" class="px-2" />
        </b-form-group>

        <b-form-group label="Image:" label-for="token-image" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <!-- <b-avatar v-if="image" button rounded size="15rem" :src="image" class="m-2"> -->
            <!-- <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template> -->
          <!-- </b-avatar> -->

          <b-img v-if="image" button rounded fluid size="15rem" :src="image" class="m-2" style="width: 300px;">
            <!-- <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template> -->
          </b-img>


          <!-- <b-img v-if="data.item.image" button rounded fluid size="7rem" :src="data.item.image">
          </b-img> -->

        </b-form-group>
        <b-form-group label="Attributes:" label-for="token-image" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-row v-for="(attribute, i) in attributes"  v-bind:key="i" class="m-0 p-0">
            <b-col cols="3" class="m-0 px-2 text-right"><font size="-3">{{ attribute.trait_type }}</font></b-col>
            <b-col cols="9" class="m-0 px-2"><b><font size="-2">{{ ["Created", "Registration", "Expiry"].includes(attribute.trait_type) ? formatTimestamp(attribute.value) : attribute.value }}</font></b></b-col>
          </b-row>
        </b-form-group>

        <b-form-group label="" label-for="token-refreshtokenmetadata" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="refreshTokenMetadata();" variant="link" v-b-popover.hover.top="'Refresh Token Metadata'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.1" variant="primary"></b-icon-arrow-repeat></b-button>
        </b-form-group>

        <b-form-group v-if="false" label="" label-for="token-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(contract);" variant="link" v-b-popover.hover.top="'Delete address ' + contract.substring(0, 10) + '...' + contract.slice(-8) + '?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
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
    chainInfo() {
      return store.getters['config/chainInfo'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    contract() {
      return store.getters['viewName/contract'];
    },
    tokenId() {
      return store.getters['viewName/tokenId'];
    },
    tokens() {
      return store.getters['data/tokens'];
    },
    prices() {
      return store.getters['data/prices'];
    },
    metadata() {
      return this.contract && this.tokenId && this.prices[this.chainId] && this.prices[this.chainId][this.contract] && this.prices[this.chainId][this.contract][this.tokenId] || {};
    },
    name() {
      return this.metadata && this.metadata.name || null;
    },
    description() {
      return this.metadata && this.metadata.description || null;
    },
    image() {
      let result = null;
      if (this.metadata.image) {
        if (this.metadata.image.substring(0, 12) == "ipfs://ipfs/") {
          result = "https://ipfs.io/" + this.metadata.image.substring(7)
        } else if (this.metadata.image.substring(0, 7) == "ipfs://") {
          result = "https://ipfs.io/ipfs/" + this.metadata.image.substring(7);
        } else {
          result = this.metadata.image;
        }
      }
      return result;
    },
    attributes() {
      return this.metadata && this.metadata.attributes || [];
    },

    linkedTo() {
      return store.getters['viewName/linkedTo'];
    },
    type() {
      return store.getters['viewName/type'];
    },
    mine: {
      get: function () {
        return store.getters['viewName/mine'];
      },
      set: function (mine) {
        store.dispatch('data/setAddressField', { address: store.getters['viewName/address'], field: 'mine', value: mine });
        store.dispatch('viewName/setMine', mine);
      },
    },
    favourite: {
      get: function () {
        return store.getters['viewName/favourite'];
      },
      set: function (favourite) {
        store.dispatch('data/setAddressField', { address: store.getters['viewName/address'], field: 'favourite', value: favourite });
        store.dispatch('viewName/setFavourite', favourite);
      },
    },
    notes: {
      get: function () {
        return store.getters['viewName/notes'];
      },
      set: function (notes) {
        store.dispatch('data/setAddressField', { address: store.getters['viewName/address'], field: 'notes', value: notes });
        store.dispatch('viewName/setNotes', notes);
      },
    },
    source() {
      return store.getters['viewName/source'];
    },
    stealthTransfers() {
      return store.getters['viewName/stealthTransfers'];
    },
    show: {
      get: function () {
        return store.getters['viewName/show'];
      },
      set: function (show) {
        store.dispatch('viewName/setShow', show);
      },
    },
  },
  methods: {
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    formatETH(e, precision = 0) {
      try {
        if (precision == 0) {
          return e ? ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
        } else {
          return e ? parseFloat(parseFloat(ethers.utils.formatEther(e)).toFixed(precision)) : null;
        }
      } catch (err) {
      }
      return e.toFixed(precision);
    },
    formatTimestamp(ts) {
      if (ts != null) {
        if (ts > 1000000000000n) {
          ts = ts / 1000;
        }
        if (store.getters['config/settings'].reportingDateTime) {
          return moment.unix(ts).utc().format("YYYY-MM-DD HH:mm:ss");
        } else {
          return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        }
      }
      return null;
    },
    saveSettings() {
      logInfo("ViewName", "methods.saveSettings - onlyfensViewNameSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.onlyfensViewNameSettings = JSON.stringify(this.settings);
    },
    setShow(show) {
      store.dispatch('viewName/setShow', show);
    },

    async refreshTokenMetadata() {
      const imageUrlToBase64 = async url => {
        const response = await fetch(url /*, { mode: 'cors' }*/);
        const blob = await response.blob();
        return new Promise((onSuccess, onError) => {
          try {
            const reader = new FileReader() ;
            reader.onload = function(){ onSuccess(this.result) } ;
            reader.readAsDataURL(blob) ;
          } catch(e) {
            onError(e);
          }
        });
      };
      logInfo("ViewName", "refreshTokenMetadata(): " + this.contract + ":" + this.tokenId);

      const options = {
        method: 'POST',
        // mode: 'no-cors', // cors, no-cors, *cors, same-origin
        headers: { accept: '*/*', 'content-type': 'application/json', 'x-api-key': 'demo-api-key' },
        body: JSON.stringify({
          liquidityOnly: false,
          overrideCoolDown: false,
          tokens: [
            this.contract + ':' + this.tokenId,
          ],
        })
      };
      console.log("options: " + JSON.stringify(options, null, 2));

      fetch('https://api.reservoir.tools/tokens/refresh/v2', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
      // console.log("results: " + JSON.stringify(results));

      this.$bvToast.toast("Please retry after 5 minutes if required", {
        title: 'Metadata Refresh Requested',
        autoHideDelay: 5000,
        appendToast: true,
      });

      const t = this;
      setTimeout(function() {
        store.dispatch('data/refreshTokenMetadata', { contract: t.contract, tokenId: t.tokenId });
      }, 5000);

      // // alert("Request sent and will data will be auto-refreshed in 5 seconds. Manually refresh the locally cached token metadata if required")
    },

    async deleteAddress(account) {
      this.$bvModal.msgBoxConfirm('Are you sure?')
        .then(value => {
          if (value) {
            store.dispatch('data/deleteAddress', account);
            this.$refs['viewname'].hide();
          }
        })
        .catch(err => {
          // An error occurred
        })
    },
  },
  beforeDestroy() {
    logDebug("ViewName", "beforeDestroy()");
  },
  mounted() {
    logDebug("ViewName", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ('onlyfensViewNameSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.onlyfensViewNameSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
      }
    }
  },
};

const viewNameModule = {
  namespaced: true,
  state: {
    label: null,
    contract: null,
    tokenId: null,
    show: false,
  },
  getters: {
    label: state => state.label,
    contract: state => state.contract,
    tokenId: state => state.tokenId,
    show: state => state.show,
  },
  mutations: {
    viewName(state, info) {
      logInfo("viewNameModule", "mutations.viewName - info: " + JSON.stringify(info));
      state.label = info.label;
      state.contract = info.contract;
      state.tokenId = info.tokenId;
      state.show = true;
      logInfo("viewNameModule", "mutations.viewName - state: " + JSON.stringify(state));
    },
    // setMine(state, mine) {
    //   logInfo("viewNameModule", "mutations.setMine - mine: " + mine);
    //   state.mine = mine;
    // },
    // setFavourite(state, favourite) {
    //   logInfo("viewNameModule", "mutations.setFavourite - favourite: " + favourite);
    //   state.favourite = favourite;
    // },
    // setName(state, name) {
    //   logInfo("viewNameModule", "mutations.setName - name: " + name);
    //   state.name = name;
    // },
    // setNotes(state, notes) {
    //   logInfo("viewNameModule", "mutations.setNotes - notes: " + notes);
    //   state.notes = notes;
    // },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewName(context, info) {
      logInfo("viewNameModule", "actions.viewName - info: " + JSON.stringify(info));
      await context.commit('viewName', info);
      await context.dispatch('loadENSEvents', info);
      // await context.dispatch('loadTransfers', info);
    },
    async loadENSEvents(context, info) {
      logInfo("viewNameModule", "actions.loadENSEvents - info: " + JSON.stringify(info));

      // ENS: Old ETH Registrar Controller 1 @ 0xF0AD5cAd05e10572EfcEB849f6Ff0c68f9700455 deployed Apr-30-2019 03:54:13 AM +UTC
      // ENS: Old ETH Registrar Controller 2 @ 0xB22c1C159d12461EA124b0deb4b5b93020E6Ad16 deployed Nov-04-2019 12:43:55 AM +UTC
      // ENS: Old ETH Registrar Controller @ 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 deployed Jan-30-2020 12:56:38 AM +UTC
      // ENS: ETH Registrar Controller @ 0x253553366Da8546fC250F225fe3d25d0C782303b deployed Mar-28-2023 11:44:59 AM +UTC

      // 925.eth ERC-721 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:53835211818918528779359817553631021141919078878710948845228773628660104698081
      // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires) 0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f
      //   [ '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', namehash, null ],
      // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires) 0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae
      //   [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', namehash, null ],

      // ERC-1155 portraits.eth 27727362303445643037535452095569739813950020376856883309402147522300287323280
      // ERC-1155 yourmum.lovesyou.eth 57229065116737680790555199455465332171886850449809000367294662727325932836690
      // - ENS: Name Wrapper 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401 NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry) 0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340
      //   [ '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', namehash, null ],
      // NameUnwrapped (index_topic_1 bytes32 node, address owner) 0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const block = await provider.getBlock();
      const blockNumber = block && block.number || null;
      const erc721TokenId = ethers.utils.solidityKeccak256([ "string" ], [ info.label ]);
      const erc1155TokenId = ethers.utils.namehash(info.label + ".eth");
      const fromBlock = 0;
      const toBlock = blockNumber;
      try {
        const topics = [[
            '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', // NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
            '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
            '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', // NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
            // '0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4', // NameUnwrapped (index_topic_1 bytes32 node, address owner)
          ],
          [ erc721TokenId, erc1155TokenId ],
          null
        ];
        console.log("topics: " + JSON.stringify(topics, null, 2));
        const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
        // console.log("logs: " + JSON.stringify(logs, null, 2));
        // await processLogs(fromBlock, toBlock, logs);
        const results = processENSEventLogs(logs);
      } catch (e) {
        logInfo("viewNameModule", "actions.loadENSEvents.getLogs - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
      }

      // await context.commit('updateTransfers', info);
    },
    async loadTransfers(context, info) {
      logInfo("viewNameModule", "actions.loadTransfers - info: " + JSON.stringify(info));
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes, null ],
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, accountAs32Bytes ],

      // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, accountAs32Bytes, null ],
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, accountAs32Bytes ],

      // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, accountAs32Bytes, null ],
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, null, accountAs32Bytes ],

      // await context.commit('updateTransfers', info);
    },
    // async setMine(context, mine) {
    //   logInfo("viewNameModule", "actions.setMine - mine: " + mine);
    //   await context.commit('setMine', mine);
    // },
    // async setFavourite(context, favourite) {
    //   logInfo("viewNameModule", "actions.setFavourite - favourite: " + favourite);
    //   await context.commit('setFavourite', favourite);
    // },
    // async setName(context, name) {
    //   logInfo("viewNameModule", "actions.setName - name: " + name);
    //   await context.commit('setName', name);
    // },
    // async setNotes(context, notes) {
    //   logInfo("viewNameModule", "actions.setNotes - notes: " + notes);
    //   await context.commit('setNotes', notes);
    // },
    // async setSource(context, source) {
    //   logInfo("viewNameModule", "actions.setSource - source: " + source);
    //   await context.commit('setSource', source);
    // },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
