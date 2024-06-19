const Data = {
  template: `
  <div>
    <b-button v-b-toggle.data-module size="sm" block variant="outline-info">Data</b-button>
    <b-collapse id="data-module" visible class="my-2">
      <b-card no-body class="border-0">
        <b-row>
          <b-col cols="5" class="small px-1 text-right">Addresses:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ Object.keys(addresses).length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">ERC-20 Contracts:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ totalERC20Contracts }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">ERC-721 Tokens:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ totalERC721Tokens }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">Registry:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ Object.keys(registry[chainId] || {}).length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">Stealth Transfers:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ totalStealthTransfers }}</b-col>
        </b-row>
        <!-- <b-row>
          <b-col cols="5" class="small px-1">ENS Map</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ Object.keys(ens).length }}</b-col>
        </b-row> -->
      </b-card>
    </b-collapse>
  </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
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
    addresses() {
      return store.getters['data/addresses'];
    },
    registry() {
      return store.getters['data/registry'];
    },
    stealthTransfers() {
      return store.getters['data/stealthTransfers'];
    },
    tokenContracts() {
      return store.getters['data/tokenContracts'];
    },
    totalStealthTransfers() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [blockNumber, logIndexes] of Object.entries(this.stealthTransfers[this.chainId] || {})) {
        for (const [logIndex, item] of Object.entries(logIndexes)) {
          result++;
        }
      }
      return result;
    },
    totalERC20Contracts() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [address, data] of Object.entries(this.tokenContracts[this.chainId] || {})) {
        if (data.type == "erc20") {
          result++;
        }
      }
      return result;
    },
    totalERC721Tokens() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [address, data] of Object.entries(this.tokenContracts[this.chainId] || {})) {
        if (data.type == "erc721") {
          result += Object.keys(data.tokenIds).length;
        }
      }
      return result;
    },
    // mappings() {
    //   return store.getters['data/mappings'];
    // },
    // txs() {
    //   return store.getters['data/txs'];
    // },
    // assets() {
    //   return store.getters['data/assets'];
    // },
    // ens() {
    //   return store.getters['data/ens'];
    // },
  },
  methods: {
    async timeoutCallback() {
      logDebug("Data", "timeoutCallback() count: " + this.count);
      this.count++;
      var t = this;
      if (this.reschedule) {
        setTimeout(function() {
          t.timeoutCallback();
        }, 15000);
      }
    },
  },
  beforeDestroy() {
    logDebug("Data", "beforeDestroy()");
  },
  mounted() {
    logDebug("Data", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('config/restoreState');
    this.reschedule = true;
    logDebug("Data", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const dataModule = {
  namespaced: true,
  state: {
    DB_PROCESSING_BATCH_SIZE: 123,
    addresses: {}, // Address => Info

    collection: {}, // chainId -> contract => { id, symbol, name, image, slug, creator, tokenCount }
    tokens: {}, // chainId -> contract -> tokenId => owner or balances
    metadata: {}, // chainId -> contract -> tokenId => owner or balances
    contractMetadata: {}, // chainId -> contract => metadata
    prices: {}, // chainId -> contract -> tokenId => metadata
    tokenInfo: {}, // chainId -> contract -> tokenId => info
    timestamps: {}, // chainId -> blockNumber => timestamp
    txs: {}, // txHash => tx & txReceipt

    registry: {}, // Address => StealthMetaAddress
    stealthTransfers: {}, // ChainId, blockNumber, logIndex => data
    tokenContracts: {}, // ChainId, tokenContractAddress, tokenId => data
    ens: {},
    exchangeRates: {},
    forceRefresh: 0,
    sync: {
      section: null,
      total: null,
      completed: null,
      halt: false,
    },
    db: {
      name: "themanagerdata080c",
      version: 1,
      schemaDefinition: {
        // announcements: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations,stealthAddress',
        // registrations: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations',
        // transfers: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations',
        events: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations,[type+blockNumber]',
        // transfers: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,[eventType+confirmations]',
        cache: '&objectName',
      },
      updated: null,
    },
    checkOptions: [
      { value: 'ethers', text: 'Ethers' },
      { value: 'tokens', text: 'ERC-20, ERC-721 and ERC-1155 Tokens' },
    ],
  },
  getters: {
    addresses: state => state.addresses,

    collection: state => state.collection,
    tokens: state => state.tokens,
    metadata: state => state.metadata,
    contractMetadata: state => state.contractMetadata,
    prices: state => state.prices,
    tokenInfo: state => state.tokenInfo,
    timestamps: state => state.timestamps,
    txs: state => state.txs,

    registry: state => state.registry,
    stealthTransfers: state => state.stealthTransfers,
    tokenContracts: state => state.tokenContracts,
    ens: state => state.ens,
    exchangeRates: state => state.exchangeRates,
    forceRefresh: state => state.forceRefresh,
    sync: state => state.sync,
    db: state => state.db,
    checkOptions: state => state.checkOptions,
  },
  mutations: {
    setState(state, info) {
      // logInfo("dataModule", "mutations.setState - info: " + JSON.stringify(info, null, 2));
      Vue.set(state, info.name, info.data);
    },
    updateTokens(state, tokens) {
      // logInfo("dataModule", "mutations.updateTokens - tokens: " + JSON.stringify(tokens, null, 2));
      const chainId = store.getters['connection/chainId'];
      // TODO: Incremental Syncing tokens to state.tokens
      Vue.set(state.tokens, chainId, tokens);
    },
    toggleAddressField(state, info) {
      Vue.set(state.addresses[info.address], info.field, !state.addresses[info.address][info.field]);
      logInfo("dataModule", "mutations.toggleAddressField - addresses[" + info.address + "]." + info.field + " = " + state.addresses[info.address][info.field]);
    },
    setAddressField(state, info) {
      Vue.set(state.addresses[info.address], info.field, info.value);
      logInfo("dataModule", "mutations.setAddressField - addresses[" + info.address + "]." + info.field + " = " + state.addresses[info.address][info.field]);
    },
    toggleTokenContractFavourite(state, tokenContract) {
      const chainId = store.getters['connection/chainId'];
      Vue.set(state.tokenContracts[chainId][tokenContract.address], 'favourite', !state.tokenContracts[chainId][tokenContract.address].favourite);
      logInfo("dataModule", "mutations.toggleTokenContractFavourite - tokenContract: " + JSON.stringify(state.tokenContracts[chainId][tokenContract.address]));
    },
    toggleTokenJunk(state, token) {
      const chainId = store.getters['connection/chainId'];
      logInfo("dataModule", "mutations.toggleTokenJunk - token: " + JSON.stringify(token, null, 2));
      if (!(chainId in state.tokenInfo)) {
        Vue.set(state.tokenInfo, chainId, {});
      }
      const contract = ethers.utils.getAddress(token.contract);
      if (!(contract in state.tokenInfo[chainId])) {
        Vue.set(state.tokenInfo[chainId], contract, {});
      }
      if (!(token.tokenId in state.tokenInfo[chainId][contract])) {
        Vue.set(state.tokenInfo[chainId][contract], token.tokenId, {
          junk: false,
          tags: [],
        });
      }
      Vue.set(state.tokenInfo[chainId][contract][token.tokenId], 'junk', !state.tokenInfo[chainId][contract][token.tokenId].junk);
      logInfo("dataModule", "mutations.toggleTokenJunk - state.tokenInfo: " + JSON.stringify(state.tokenInfo, null, 2));
    },

    addNewAddress(state, newAccount) {
      logInfo("dataModule", "mutations.addNewAddress(" + JSON.stringify(newAccount, null, 2) + ")");
      let address = null;
      // let linkedToAddress = null;
      let type = null;
      let mine = false;
      // let source = null;
      // if (newAccount.action == "addCoinbase") {
      //   address = store.getters['connection/coinbase'];
      //   type = "address";
      //   mine = true;
      //   source = "attached";
      // } else if (newAccount.action == "addAddress") {
        address = ethers.utils.getAddress(newAccount.address);
        // type = "address";
        mine = newAccount.mine;
        // source = "manual";
      // } else if (newAccount.action == "addStealthMetaAddress") {
      //   address = newAccount.address;
      //   linkedToAddress = newAccount.linkedToAddress;
      //   type = "stealthMetaAddress";
      //   mine = newAccount.mine;
      //   source = "manual";
      // } else {
      //   address = newAccount.address;
      //   linkedToAddress = newAccount.linkedToAddress;
      //   type = "stealthMetaAddress";
      //   mine = true;
      //   source = "attached";
      // }
      console.log("address: " + address);
      // console.log("linkedToAddress: " + linkedToAddress);
      // console.log("type: " + type);
      if (address in state.addresses) {
        // Vue.set(state.addresses[address], 'type', type);
        // if (type == "stealthMetaAddress") {
        //   Vue.set(state.addresses[address], 'linkedToAddress', linkedToAddress);
        //   Vue.set(state.addresses[address], 'phrase', newAccount.action == "generateStealthMetaAddress" ? newAccount.phrase : undefined);
        //   Vue.set(state.addresses[address], 'viewingPrivateKey', newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPrivateKey : undefined);
        //   Vue.set(state.addresses[address], 'spendingPublicKey', newAccount.action == "generateStealthMetaAddress" ? newAccount.spendingPublicKey : undefined);
        //   Vue.set(state.addresses[address], 'viewingPublicKey', newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPublicKey : undefined);
        // }
        Vue.set(state.addresses[address], 'mine', mine);
        Vue.set(state.addresses[address], 'favourite', newAccount.favourite);
        // Vue.set(state.addresses[address], 'check', newAccount.check);
        Vue.set(state.addresses[address], 'name', newAccount.name);
      } else {
        // if (type == "address") {
          Vue.set(state.addresses, address, {
            // type,
            // source,
            mine,
            // junk: false,
            favourite: newAccount.favourite,
            // check: newAccount.check,
            name: newAccount.name,
            // notes: null,
          });
        // } else {
        //   Vue.set(state.addresses, address, {
        //     type,
        //     linkedToAddress,
        //     phrase: newAccount.action == "generateStealthMetaAddress" ? newAccount.phrase : undefined,
        //     viewingPrivateKey: newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPrivateKey : undefined,
        //     spendingPublicKey: newAccount.action == "generateStealthMetaAddress" ? newAccount.spendingPublicKey : undefined,
        //     viewingPublicKey: newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPublicKey : undefined,
        //     source,
        //     mine,
        //     junk: false,
        //     favourite: newAccount.favourite,
        //     check: newAccount.check,
        //     name: newAccount.name,
        //     notes: null,
        //   });
        // }
      }
      logInfo("dataModule", "mutations.addNewAddress AFTER - state.accounts: " + JSON.stringify(state.accounts, null, 2));
    },
    addNewStealthAddress(state, info) {
      logInfo("dataModule", "mutations.addNewStealthAddress: " + JSON.stringify(info, null, 2));
      Vue.set(state.addresses, info.stealthAddress, {
        type: info.type,
        linkedTo: info.linkedTo,
        source: info.source,
        mine: info.mine,
        junk: info.junk,
        favourite: info.favourite,
        name: info.name,
        notes: info.notes,
      });
    },
    updateToStealthAddress(state, info) {
      // logInfo("dataModule", "mutations.updateToStealthAddress: " + JSON.stringify(info, null, 2));
      Vue.set(state.addresses[info.stealthAddress], 'type', info.type);
      Vue.set(state.addresses[info.stealthAddress], 'linkedTo', info.linkedTo);
      Vue.set(state.addresses[info.stealthAddress], 'mine', info.mine);
    },
    deleteAddress(state, address) {
      Vue.delete(state.addresses, address);
    },
    addTokenContractMetadata(state, info) {
      logInfo("dataModule", "mutations.addTokenContractMetadata info: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.contractMetadata)) {
        Vue.set(state.contractMetadata, info.chainId, {});
      }
      if (!(info.contract in state.contractMetadata[info.chainId])) {
        Vue.set(state.contractMetadata[info.chainId], info.contract, {
          type: info.type,
          symbol: info.symbol,
          name: info.name,
          decimals: info.decimals,
          totalSupply: info.totalSupply,
        });
      }
    },
    addTokenMetadata(state, tokenData) {
      logInfo("dataModule", "mutations.addTokenMetadata tokenData: " + JSON.stringify(tokenData, null, 2));
      // const token = info.token;
      // const market = info.market;
      if (!(tokenData.chainId in state.prices)) {
        Vue.set(state.prices, tokenData.chainId, {});
      }
      const contract = ethers.utils.getAddress(tokenData.contract);
      if (!(contract in state.prices[tokenData.chainId])) {
        Vue.set(state.prices[tokenData.chainId], contract, {});
      }
      // if (!(token.tokenId in state.prices[token.chainId][contract])) {
        // const createdRecord = token.attributes.filter(e => e.key == "Created Date");
        // const created = createdRecord.length == 1 && createdRecord[0].value || null;
        // let registration;
        // if (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS) {
        //   const registrationRecord = token.attributes.filter(e => e.key == "Registration Date");
        //   registration = registrationRecord.length == 1 && registrationRecord[0].value || null;
        // } else {
        //   registration = created;
        // }
        // let expiry;
        // if (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS) {
        //   const expiryRecord = token.attributes.filter(e => e.key == "Expiration Date");
        //   expiry = expiryRecord.length == 1 && expiryRecord[0].value || null;
        // } else {
        //   const expiryRecord = token.attributes.filter(e => e.key == "Namewrapper Expiry Date");
        //   expiry = expiryRecord.length == 1 && expiryRecord[0].value || null;
        // }
        // const characterSetRecord = token.attributes.filter(e => e.key == "Character Set");
        // const characterSet = characterSetRecord.length == 1 && characterSetRecord[0].value || null;
        // const lengthRecord = token.attributes.filter(e => e.key == "Length");
        // const length = lengthRecord.length == 1 && lengthRecord[0].value && parseInt(lengthRecord[0].value) || null;
        // const segmentLengthRecord = token.attributes.filter(e => e.key == "Segment Length");
        // const segmentLength = segmentLengthRecord.length == 1 && segmentLengthRecord[0].value && parseInt(segmentLengthRecord[0].value) || null;
        //
        // const lastSaleTimestamp = token.lastSale && token.lastSale.timestamp || null;
        // const lastSaleCurrency = token.lastSale && token.lastSale.price && token.lastSale.price.currency && token.lastSale.price.currency.symbol || null;
        // const lastSaleAmount = token.lastSale && token.lastSale.price && token.lastSale.price.amount && token.lastSale.price.amount.native || null;
        // const lastSaleAmountUSD = token.lastSale && token.lastSale.price && token.lastSale.price.amount && token.lastSale.price.amount.usd || null;
        //
        // const priceExpiry = market.floorAsk && market.floorAsk.validUntil && parseInt(market.floorAsk.validUntil) || null;
        // const priceSource = market.floorAsk && market.floorAsk.source && market.floorAsk.source.domain || null;
        // const priceCurrency = market.floorAsk && market.floorAsk.price && market.floorAsk.price.currency && market.floorAsk.price.currency.symbol || null;
        // const priceAmount = market.floorAsk && market.floorAsk.price && market.floorAsk.price.amount && market.floorAsk.price.amount.native || null;
        // const priceAmountUSD = market.floorAsk && market.floorAsk.price && market.floorAsk.price.amount && market.floorAsk.price.amount.usd || null;
        //
        // const topBidCurrency = market.topBid.price && market.topBid.price.currency && market.topBid.price.currency.symbol || null;
        // const topBidAmount = market.topBid.price && market.topBid.price.amount && market.topBid.price.amount.native || null;
        // const topBidAmountUSD = market.topBid.price && market.topBid.price.amount && market.topBid.price.amount.usd || null;
        // const topBidNetAmount = market.topBid.price && market.topBid.price.netAmount && market.topBid.price.netAmount.native || null;
        // const topBidNetAmountUSD = market.topBid.price && market.topBid.price.netAmount && market.topBid.price.netAmount.usd || null;

        Vue.set(state.prices[tokenData.chainId][tokenData.contract], tokenData.tokenId, {
          name: tokenData.name,
          description: tokenData.description,
          image: tokenData.image,
          created: tokenData.created,
          registration: tokenData.registration,
          expiry: tokenData.expiry,
          lastSale: tokenData.lastSale,
          price: tokenData.price,
          topBid: tokenData.topBid,
        //   lastSale: {
        //     timestamp: lastSaleTimestamp,
        //     currency: lastSaleCurrency,
        //     amount: lastSaleAmount,
        //     amountUSD: lastSaleAmountUSD,
        //   },
        //   price: {
        //     source: priceSource,
        //     expiry: priceExpiry,
        //     currency: priceCurrency,
        //     amount: priceAmount,
        //     amountUSD: priceAmountUSD,
        //   },
        //   topBid: {
        //     currency: topBidCurrency,
        //     amount: topBidAmount,
        //     amountUSD: topBidAmountUSD,
        //     netAmount: topBidNetAmount,
        //     netAmountUSD: topBidNetAmountUSD,
        //   },
          attributes: [
            { trait_type: "Character Set", value: tokenData.characterSet },
            { trait_type: "Length", value: tokenData.length },
            { trait_type: "Segment Length", value: tokenData.segmentLength },
            { trait_type: "Created", value: tokenData.created },
            { trait_type: "Registration", value: tokenData.registration },
            { trait_type: "Expiry", value: tokenData.expiry },
          ],
        });
      // }
      console.log("state.prices[chainId][contract][tokenId]: " + JSON.stringify(state.prices[tokenData.chainId][tokenData.contract][tokenData.tokenId], null, 2));
    },
    addStealthTransfer(state, info) {
      // logInfo("dataModule", "mutations.addStealthTransfer: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.stealthTransfers)) {
        Vue.set(state.stealthTransfers, info.chainId, {});
      }
      if (!(info.blockNumber in state.stealthTransfers[info.chainId])) {
        Vue.set(state.stealthTransfers[info.chainId], info.blockNumber, {});
      }
      if (!(info.logIndex in state.stealthTransfers[info.chainId][info.blockNumber])) {
        Vue.set(state.stealthTransfers[info.chainId][info.blockNumber], info.logIndex, info);
      }
    },
    addTimestamp(state, info) {
      logInfo("dataModule", "mutations.addTimestamp info: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.timestamps)) {
        Vue.set(state.timestamps, info.chainId, {});
      }
      if (!(info.blockNumber in state.timestamps[info.chainId])) {
        Vue.set(state.timestamps[info.chainId], info.blockNumber, info.timestamp);
      }
    },
    addTx(state, tx) {
      logInfo("dataModule", "mutations.addTx tx: " + JSON.stringify(tx, null, 2));
      if (!(tx.chainId in state.txs)) {
        Vue.set(state.txs, tx.chainId, {});
      }
      if (!(tx.txHash in state.txs[tx.chainId])) {
        Vue.set(state.txs[tx.chainId], tx.txHash, tx);
      }
    },

    setExchangeRates(state, exchangeRates) {
      // const dates = Object.keys(exchangeRates);
      // dates.sort();
      // for (let date of dates) {
      //   console.log(date + "\t" + exchangeRates[date]);
      // }
      Vue.set(state, 'exchangeRates', exchangeRates);
    },
    forceRefresh(state) {
      Vue.set(state, 'forceRefresh', parseInt(state.forceRefresh) + 1);
      logInfo("dataModule", "mutations.forceRefresh: " + state.forceRefresh);
    },
    saveTxTags(state, info) {
      if (!(info.txHash in state.txsInfo)) {
        Vue.set(state.txsInfo, info.txHash, {
          tags: info.tags,
        });
      } else {
        Vue.set(state.txsInfo[info.txHash], 'tags', info.tags);
      }
    },
    addTagToTxs(state, info) {
      for (const txHash of Object.keys(info.txHashes)) {
        if (!(txHash in state.txsInfo)) {
          Vue.set(state.txsInfo, txHash, {
            tags: [info.tag],
          });
        } else {
          const currentTags = state.txsInfo[txHash].tags || [];
          if (!currentTags.includes(info.tag)) {
            currentTags.push(info.tag);
            Vue.set(state.txsInfo[txHash], 'tags', currentTags);
          }
        }
      }
    },
    removeTagFromTxs(state, info) {
      for (const txHash of Object.keys(info.txHashes)) {
        if (txHash in state.txsInfo) {
          const currentTags = state.txsInfo[txHash].tags || [];
          if (currentTags.includes(info.tag)) {
            const newTags = currentTags.filter(e => e != info.tag);
            if (newTags.length == 0 && Object.keys(state.txsInfo[txHash]).length == 1) {
              Vue.delete(state.txsInfo, txHash);
            } else {
              Vue.set(state.txsInfo[txHash], 'tags', newTags);
            }
          }
        }
      }
    },
    setSyncSection(state, info) {
      logInfo("dataModule", "mutations.setSyncSection info: " + JSON.stringify(info));
      state.sync.section = info.section;
      state.sync.total = info.total;
    },
    setSyncCompleted(state, completed) {
      logInfo("dataModule", "mutations.setSyncCompleted completed: " + completed + (state.sync.total ? ("/" + state.sync.total) : "") + " " + state.sync.section);
      state.sync.completed = completed;
    },
    setSyncHalt(state, halt) {
      state.sync.halt = halt;
    },
  },
  actions: {
    async restoreState(context) {
      logInfo("dataModule", "actions.restoreState");
      if (Object.keys(context.state.addresses).length == 0) {
        const db0 = new Dexie(context.state.db.name);
        db0.version(context.state.db.version).stores(context.state.db.schemaDefinition);
        for (let type of ['addresses', 'timestamps', 'prices', 'tokenInfo', 'metadata', 'tokens']) {
          const data = await db0.cache.where("objectName").equals(type).toArray();
          if (data.length == 1) {
            // logInfo("dataModule", "actions.restoreState " + type + " => " + JSON.stringify(data[0].object));
            context.commit('setState', { name: type, data: data[0].object });
          }
        }
      }
    },
    async saveData(context, types) {
      logInfo("dataModule", "actions.saveData - types: " + JSON.stringify(types));
      const db0 = new Dexie(context.state.db.name);
      db0.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      for (let type of types) {
        await db0.cache.put({ objectName: type, object: context.state[type] }).then(function() {
        }).catch(function(error) {
          console.log("error: " + error);
        });
      }
      db0.close();
    },

    async toggleAddressField(context, info) {
      // logInfo("dataModule", "actions.toggleAddressField - info: " + JSON.stringify(info));
      await context.commit('toggleAddressField', info);
      await context.dispatch('saveData', ['addresses']);
    },
    async setAddressField(context, info) {
      // logInfo("dataModule", "actions.setAddressField - info: " + JSON.stringify(info));
      await context.commit('setAddressField', info);
      await context.dispatch('saveData', ['addresses']);
    },
    async toggleTokenContractFavourite(context, tokenContract) {
      // logInfo("dataModule", "actions.toggleTokenContractFavourite - info: " + JSON.stringify(info));
      await context.commit('toggleTokenContractFavourite', tokenContract);
      await context.dispatch('saveData', ['tokenContracts']);
    },
    async toggleTokenJunk(context, token) {
      logInfo("dataModule", "actions.toggleTokenJunk - token: " + JSON.stringify(token));
      await context.commit('toggleTokenJunk', token);
      await context.dispatch('saveData', ['tokenInfo']);
    },
    async addTokenMetadata(context, info) {
      logInfo("dataModule", "actions.addTokenMetadata - info: " + JSON.stringify(info, null, 2));
      context.commit('addTokenMetadata', info);
      await context.dispatch('saveData', ['prices']);
    },

    async deleteAddress(context, account) {
      await context.commit('deleteAddress', account);
      await context.dispatch('saveData', ['addresses']);
    },
    async saveTxTags(context, info) {
      await context.commit('saveTxTags', info);
      await context.dispatch('saveData', ['txsInfo']);
    },
    async addTagToTxs(context, info) {
      await context.commit('addTagToTxs', info);
      await context.dispatch('saveData', ['txsInfo']);
    },
    async removeTagFromTxs(context, info) {
      await context.commit('removeTagFromTxs', info);
      await context.dispatch('saveData', ['txsInfo']);
    },
    async refreshTokenMetadata(context, token) {
      console.log("actions.refreshTokenMetadata - token: " + JSON.stringify(token));
      let url = "https://api.reservoir.tools/tokens/v7?tokens=" + token.contract + ":" + token.tokenId;
      url = url + "&limit=100&includeAttributes=true&includeLastSale=true&includeTopBid=true";
      console.log(url);
      const data = await fetch(url).then(response => response.json());
      if (data.tokens) {
        for (let token of data.tokens) {
          const tokenData = parseReservoirTokenData(token);
          console.log("tokenData: " + JSON.stringify(tokenData, null, 2));
          context.commit('addTokenMetadata', tokenData);
        }
      }
      await context.dispatch('saveData', ['prices']);
    },
    async setSyncHalt(context, halt) {
      context.commit('setSyncHalt', halt);
    },
    async resetTokens(context) {
      await context.commit('resetTokens');
      await context.dispatch('saveData', ['accounts']);
    },
    async resetData(context) {
      logInfo("dataModule", "actions.resetData");
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      // await db.announcements.clear();
      await db.cache.clear();
      // await db.registrations.clear();
      await db.events.clear();
      db.close();
    },
    async addNewAddress(context, newAddress) {
      logInfo("dataModule", "actions.addNewAddress - newAddress: " + JSON.stringify(newAddress, null, 2) + ")");
      context.commit('addNewAddress', newAddress);
      await context.dispatch('saveData', ['addresses']);
    },
    // async restoreAccount(context, addressData) {
    //   logInfo("dataModule", "actions.restoreAccount - addressData: " + JSON.stringify(addressData));
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
    //   const accountInfo = await getAccountInfo(addressData.account, provider)
    //   if (accountInfo.account) {
    //     context.commit('addNewAddress', accountInfo);
    //     context.commit('addNewAccountInfo', addressData);
    //   }
    //   const names = await ensReverseRecordsContract.getNames([addressData.account]);
    //   const name = names.length == 1 ? names[0] : addressData.account;
    //   if (!(addressData.account in context.state.ensMap)) {
    //     context.commit('addENSName', { account: addressData.account, name });
    //   }
    // },
    // async restoreIntermediateData(context, info) {
    //   if (info.blocks && info.txs) {
    //     await context.commit('setState', { name: 'blocks', data: info.blocks });
    //     await context.commit('setState', { name: 'txs', data: info.txs });
    //   }
    // },

    async syncIt(context, options) {
      logInfo("dataModule", "actions.syncIt - options: " + JSON.stringify(options, null, 2));
      // const db = new Dexie(context.state.db.name);
      // db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const block = await provider.getBlock();
      const confirmations = store.getters['config/settings'].confirmations && parseInt(store.getters['config/settings'].confirmations) || 10;
      const blockNumber = block && block.number || null;
      const cryptoCompareAPIKey = store.getters['config/settings'].cryptoCompareAPIKey && store.getters['config/settings'].cryptoCompareAPIKey.length > 0 && store.getters['config/settings'].cryptoCompareAPIKey || null;
      const processFilters = store.getters['config/processFilters'];

      const accountsToSync = [];
      // for (const [account, addressData] of Object.entries(context.state.accounts)) {
      //   const accountsInfo = context.state.accountsInfo[account] || {};
      //   if ((info.parameters.length == 0 && accountsInfo.sync) || info.parameters.includes(account)) {
      //       accountsToSync.push(account);
      //   }
      // }
      const chainId = store.getters['connection/chainId'];
      const coinbase = store.getters['connection/coinbase'];
      if (!(coinbase in context.state.addresses) && Object.keys(context.state.addresses).length == 0) {
        context.commit('addNewAddress', { action: "addCoinbase", check: ["ethers", "tokens"] });
      }

      const parameter = { chainId, coinbase, blockNumber, confirmations, cryptoCompareAPIKey, ...options };

      if (options.transfers && !options.devThing) {
        await context.dispatch('syncTransfers', parameter);
      }
      if (options.transfers && !options.devThing) {
        await context.dispatch('collateTokens', parameter);
      }
      if (options.timestamps && !options.devThing) {
        await context.dispatch('syncTokenEventTimestamps', parameter);
      }
      if (options.ensEvents && !options.devThing) {
        await context.dispatch('syncENSEvents', parameter);
      }
      if (options.wrappedENSEvents && !options.devThing) {
        await context.dispatch('syncWrappedENSEvents', parameter);
      }
      if ((options.ensEvents || options.wrappedENSEvents) && !options.devThing) {
        await context.dispatch('collateMetadata', parameter);
      }
      if (options.prices && !options.devThing) {
        await context.dispatch('syncPrices', parameter);
      }

      // if (options.ens || options.devThing) {
      //   await context.dispatch('syncENS', parameter);
      // }
      // if (options.devThing) {
      //   console.log("Dev Thing");
      // }

      context.dispatch('saveData', ['addresses'/*, 'registry' , 'blocks', 'txs', 'ensMap'*/]);
      context.commit('setSyncSection', { section: null, total: null });
      context.commit('setSyncHalt', false);
      context.commit('forceRefresh');
    },

    async syncTransfers(context, parameter) {
      logInfo("dataModule", "actions.syncTransfers: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);

      // ERC-20 & ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes, null ],
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, accountAs32Bytes ],

      // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, accountAs32Bytes, null ],
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, accountAs32Bytes ],

      // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, accountAs32Bytes, null ],
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, null, accountAs32Bytes ],

      // ENS:ETH Registrar Controller NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
      // [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', [tokenIds] ],

      // WETH Deposit (index_topic_1 address dst, uint256 wad)
      // 0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c
      // WETH Withdrawal (index_topic_1 address src, uint256 wad)
      // 0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65

      // // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
      // // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
      // // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
      // // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
      // // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
      // // 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31
      let total = 0;
      let t = this;
      async function processLogs(fromBlock, toBlock, section, logs) {
        total = parseInt(total) + logs.length;
        context.commit('setSyncCompleted', total);
        logInfo("dataModule", "actions.syncTransfers.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", section: " + section + ", logs.length: " + logs.length + ", total: " + total);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            const contract = log.address;
            let eventRecord = null;
            if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
              let from = null;
              let to = null;
              let tokensOrTokenId = null;
              let tokens = null;
              let tokenId = null;
              if (log.topics.length == 4) {
                from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokensOrTokenId = ethers.BigNumber.from(log.topics[3]).toString();
              } else if (log.topics.length == 3) {
                from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokensOrTokenId = ethers.BigNumber.from(log.data).toString();
              // TODO: Handle 2
              } else if (log.topics.length == 1) {
                from = ethers.utils.getAddress('0x' + log.data.substring(26, 66));
                to = ethers.utils.getAddress('0x' + log.data.substring(90, 130));
                tokensOrTokenId = ethers.BigNumber.from('0x' + log.data.substring(130, 193)).toString();
              }
              if (from) {
                if (log.topics.length == 4) {
                  eventRecord = { type: "Transfer", from, to, tokenId: tokensOrTokenId, eventType: "erc721" };
                } else {
                  eventRecord = { type: "Transfer", from, to, tokens: tokensOrTokenId, eventType: "erc20" };
                }
              }
            } else if (log.topics[0] == "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
              const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              tokens = ethers.BigNumber.from(log.data).toString();
              eventRecord = { type: "Transfer", from: ADDRESS0, to, tokens, eventType: "erc20" };
            } else if (log.topics[0] == "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
              const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              tokens = ethers.BigNumber.from(log.data).toString();
              eventRecord = { type: "Transfer", from, to: ADDRESS0, tokens, eventType: "erc20" };
            } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
              if (log.topics.length == 4) {
                const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const approved = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                eventRecord = { type: "Approval", owner, approved, tokenId, eventType: "erc721" };
              } else {
                const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const spender = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokens = ethers.BigNumber.from(log.data).toString();
                eventRecord = { type: "Approval", owner, spender, tokens, eventType: "erc20" };
              }
            } else if (log.topics[0] == "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31") {
              const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              const operator = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
              approved = ethers.BigNumber.from(log.data).toString();
              eventRecord = { type: "ApprovalForAll", owner, operator, approved, eventType: "erc721" };
            } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
              // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
              const logData = erc1155Interface.parseLog(log);
              const [operator, from, to, id, value] = logData.args;
              tokenId = ethers.BigNumber.from(id).toString();
              eventRecord = { type: "TransferSingle", operator, from, to, tokenId, value: value.toString(), eventType: "erc1155" };
            } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
              // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
              const logData = erc1155Interface.parseLog(log);
              const [operator, from, to, ids, values] = logData.args;
              const tokenIds = ids.map(e => ethers.BigNumber.from(e).toString());
              eventRecord = { type: "TransferBatch", operator, from, to, tokenIds, values: values.map(e => e.toString()), eventType: "erc1155" };
            } else {
              console.log("NOT HANDLED: " + JSON.stringify(log));
            }
            // TODO: Testing if (eventRecord && contract == "0x7439E9Bb6D8a84dd3A23fe621A30F95403F87fB9") {
            // if (eventRecord &&
            //     ((parameter.erc20 && eventRecord.eventType == "erc20") ||
            //      (parameter.erc721 && eventRecord.eventType == "erc721") ||
            //      (parameter.erc1155 && eventRecord.eventType == "erc1155"))) {
            // const testAddresses = parameter.devThing ? new Set(["0xB32979486938AA9694BFC898f35DBED459F44424","0x286E531F363768Fed5E18b468f5B76a9FFc33af5"]) : null;
            // if (eventRecord && (!testAddresses || testAddresses.has(contract)) && eventRecord.eventType == "erc1155") {
            // if (eventRecord && contract == "0xB32979486938AA9694BFC898f35DBED459F44424") {
            // if (eventRecord && (contract == "0xB32979486938AA9694BFC898f35DBED459F44424" || contract == "0x286E531F363768Fed5E18b468f5B76a9FFc33af5")) {

            if (eventRecord && (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || contract == ENS_NAMEWRAPPER_ADDRESS)) {
              records.push( {
                chainId: parameter.chainId,
                blockNumber: parseInt(log.blockNumber),
                logIndex: parseInt(log.logIndex),
                txIndex: parseInt(log.transactionIndex),
                txHash: log.transactionHash,
                contract,
                ...eventRecord,
                confirmations: parameter.blockNumber - log.blockNumber,
              });
            }
          }
        }
        if (records.length) {
          await db.events.bulkAdd(records).then(function(lastKey) {
            console.log("syncTransfers.bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log("syncTransfers.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
        }
      }
      async function getLogs(fromBlock, toBlock, section, selectedAddresses, processLogs) {
        logInfo("dataModule", "actions.syncTransfers.getLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", section: " + section);
        try {
          let topics = null;
          if (section == 0) {
            topics = [[
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
                '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
                '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
                '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',
              ],
              selectedAddresses,
              null
            ];
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 1) {
            topics = [[
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
              ],
              null,
              selectedAddresses
            ];
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 2) {
            topics = [[
                '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
                '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
              ],
              null,
              selectedAddresses
            ];
            logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 3) {
            topics = [ [
                '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
                '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
              ],
              null,
              null,
              selectedAddresses
            ];
            logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          }
        } catch (e) {
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getLogs(fromBlock, mid, section, selectedAddresses, processLogs);
          await getLogs(parseInt(mid) + 1, toBlock, section, selectedAddresses, processLogs);
        }
      }

      logInfo("dataModule", "actions.syncTransfers BEGIN");
      context.commit('setSyncSection', { section: 'Transfer Events', total: null });
      const selectedAddresses = [];
      for (const [address, addressData] of Object.entries(context.state.addresses)) {
        if (address.substring(0, 2) == "0x") {
          selectedAddresses.push('0x000000000000000000000000' + address.substring(2, 42).toLowerCase());
        }
      }
      console.log("selectedAddresses: " + JSON.stringify(selectedAddresses));
      if (selectedAddresses.length > 0) {
        const deleteCall = await db.events.where("confirmations").below(parameter.confirmations).delete();
        const latest = await db.events.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).last();
        // const startBlock = (parameter.incrementalSync && latest) ? parseInt(latest.blockNumber) + 1: 0;
        const startBlock = 0;
        for (let section = 0; section < 4; section++) {
          await getLogs(startBlock, parameter.blockNumber, section, selectedAddresses, processLogs);
        }
      }
      logInfo("dataModule", "actions.syncTransfers END");
    },

    async collateTokens(context, parameter) {
      logInfo("dataModule", "actions.collateTokens: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      logInfo("dataModule", "actions.collateTokens BEGIN");
      const selectedAddressesMap = {};
      for (const [address, addressData] of Object.entries(context.state.addresses)) {
        if (address.substring(0, 2) == "0x") {
          selectedAddressesMap[address] = true;
        }
      }
      console.log("selectedAddressesMap: " + Object.keys(selectedAddressesMap));
      let rows = 0;
      let done = false;
      const tokens = {};
      do {
        let data = await db.events.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateTokens - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (["Transfer", "TransferSingle", "TransferBatch"].includes(item.type) && !(item.contract in tokens)) {
            if (item.eventType == "erc20") {
              tokens[item.contract] = {
                type: item.eventType,
                balances: {},
              };
            } else {
              tokens[item.contract] = {
                type: item.eventType,
                tokenIds: {},
              };
            }
          }
          if (item.eventType == "erc20" && item.type == "Transfer") {
            const balances = tokens[item.contract].balances || {};
            if (item.from in selectedAddressesMap) {
              if (!(item.from in balances)) {
                balances[item.from] = "0";
              }
              balances[item.from] = ethers.BigNumber.from(balances[item.from]).sub(item.tokens).toString();
            }
            if (item.to in selectedAddressesMap) {
              if (!(item.to in balances)) {
                balances[item.to] = "0";
              }
              balances[item.to] = ethers.BigNumber.from(balances[item.to]).add(item.tokens).toString();
            }
            tokens[item.contract].balances = balances;
          } else if (item.eventType == "erc721" && item.type == "Transfer") {
            if (item.from in selectedAddressesMap || item.to in selectedAddressesMap) {
              tokens[item.contract].tokenIds[item.tokenId] = item.to;
            }
          } else if (item.eventType == "erc1155" && item.type == "TransferSingle") {
            if (item.from in selectedAddressesMap) {
              if (!(item.tokenId in tokens[item.contract].tokenIds)) {
                tokens[item.contract].tokenIds[item.tokenId] = {};
              }
              if (item.from in tokens[item.contract].tokenIds[item.tokenId]) {
                tokens[item.contract].tokenIds[item.tokenId][item.from] = ethers.BigNumber.from(tokens[item.contract].tokenIds[item.tokenId][item.from]).sub(item.value).toString();
                if (tokens[item.contract].tokenIds[item.tokenId][item.from] == "0") {
                  delete tokens[item.contract].tokenIds[item.tokenId][item.from];
                }
              }
            }
            if (item.to in selectedAddressesMap) {
              if (!(item.tokenId in tokens[item.contract].tokenIds)) {
                tokens[item.contract].tokenIds[item.tokenId] = {};
              }
              if (!(item.to in tokens[item.contract].tokenIds[item.tokenId])) {
                tokens[item.contract].tokenIds[item.tokenId][item.to] = "0";
              }
              tokens[item.contract].tokenIds[item.tokenId][item.to] = ethers.BigNumber.from(tokens[item.contract].tokenIds[item.tokenId][item.to]).add(item.value).toString();
            }
          } else if (item.eventType == "erc1155" && item.type == "TransferBatch") {
            for (const [index, tokenId] of item.tokenIds.entries()) {
              if (item.from in selectedAddressesMap) {
                if (!(tokenId in tokens[item.contract].tokenIds)) {
                  tokens[item.contract].tokenIds[tokenId] = {};
                }
                if (item.from in tokens[item.contract].tokenIds[tokenId]) {
                  tokens[item.contract].tokenIds[tokenId][item.from] = ethers.BigNumber.from(tokens[item.contract].tokenIds[tokenId][item.from]).sub(item.values[index]).toString();
                  if (tokens[item.contract].tokenIds[tokenId][item.from] == "0") {
                    delete tokens[item.contract].tokenIds[tokenId][item.from];
                  }
                }
              }
              if (item.to in selectedAddressesMap) {
                if (!(tokenId in tokens[item.contract].tokenIds)) {
                  tokens[item.contract].tokenIds[tokenId] = {};
                }
                if (!(item.to in tokens[item.contract].tokenIds[tokenId])) {
                  tokens[item.contract].tokenIds[tokenId][item.to] = "0";
                }
                tokens[item.contract].tokenIds[tokenId][item.to] = ethers.BigNumber.from(tokens[item.contract].tokenIds[tokenId][item.to]).add(item.values[index]).toString();
              }
            }
          }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      console.log("tokens: " + JSON.stringify(tokens, null, 2));
      context.commit('updateTokens', tokens);
      await context.dispatch('saveData', ['tokens']);
      logInfo("dataModule", "actions.collateTokens END");
    },

    async syncTokenEventTimestamps(context, parameter) {
      logInfo("dataModule", "actions.syncTokenEventTimestamps: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let rows = 0;
      let done = false;
      const existingTimestamps = context.state.timestamps[parameter.chainId] || {};
      const newBlocks = {};
      do {
        let data = await db.events.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncTokenEventTimestamps - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (!(item.blockNumber in existingTimestamps) && !(item.blockNumber in newBlocks)) {
            newBlocks[item.blockNumber] = true;
          }
        }
        rows += data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      const total = Object.keys(newBlocks).length;
      logInfo("dataModule", "actions.syncTokenEventTimestamps - total: " + total);
      context.commit('setSyncSection', { section: 'Token Event Timestamps', total });
      let completed = 0;
      for (let blockNumber of Object.keys(newBlocks)) {
        const block = await provider.getBlock(parseInt(blockNumber));
        context.commit('addTimestamp', {
          chainId: parameter.chainId,
          blockNumber,
          timestamp: block.timestamp,
        });
        completed++;
        context.commit('setSyncCompleted', completed);
        if (context.state.sync.halt) {
          break;
        }
      }
      // console.log("context.state.timestamps: " + JSON.stringify(context.state.timestamps, null, 2));
      await context.dispatch('saveData', ['timestamps']);
      logInfo("dataModule", "actions.syncTokenEventTimestamps END");
    },

    // async syncTokenEventTxData(context, parameter) {
    //   logInfo("dataModule", "actions.syncTokenEventTxData: " + JSON.stringify(parameter));
    //   const db = new Dexie(context.state.db.name);
    //   db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   let rows = 0;
    //   let done = false;
    //   const existingTxs = context.state.txs[parameter.chainId] || {};
    //   const newTxs = {};
    //   do {
    //     let data = await db.events.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
    //     logInfo("dataModule", "actions.syncTokenEventTxData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
    //     for (const item of data) {
    //       if (!(item.txHash in existingTxs) && !(item.txHash in newTxs)) {
    //         newTxs[item.txHash] = true;
    //       }
    //     }
    //     rows += data.length;
    //     done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
    //   } while (!done);
    //   const total = Object.keys(newTxs).length;
    //   logInfo("dataModule", "actions.syncTokenEventTxData - total: " + total);
    //   context.commit('setSyncSection', { section: 'Token Event Transaction Data', total });
    //   let completed = 0;
    //   for (let txHash of Object.keys(newTxs)) {
    //     const tx = await provider.getTransaction(txHash);
    //     const txReceipt = await provider.getTransactionReceipt(txHash);
    //     context.commit('addTx', {
    //       chainId: parameter.chainId,
    //       txHash,
    //       type: tx.type,
    //       blockHash: tx.blockHash,
    //       from: tx.from,
    //       gasPrice: ethers.BigNumber.from(tx.gasPrice).toString(),
    //       gasLimit: ethers.BigNumber.from(tx.gasLimit).toString(),
    //       to: tx.to,
    //       value: ethers.BigNumber.from(tx.value).toString(),
    //       nonce: tx.nonce,
    //       data: tx.to && tx.data || null, // Remove contract creation data to reduce memory footprint
    //       contractAddress: txReceipt.contractAddress,
    //       transactionIndex: txReceipt.transactionIndex,
    //       gasUsed: ethers.BigNumber.from(txReceipt.gasUsed).toString(),
    //       blockHash: txReceipt.blockHash,
    //       logs: txReceipt.logs,
    //       cumulativeGasUsed: ethers.BigNumber.from(txReceipt.cumulativeGasUsed).toString(),
    //       effectiveGasPrice: ethers.BigNumber.from(txReceipt.effectiveGasPrice).toString(),
    //       status: txReceipt.status,
    //       type: txReceipt.type,
    //     });
    //     completed++;
    //     context.commit('setSyncCompleted', completed);
    //     if (context.state.sync.halt) {
    //       break;
    //     }
    //   }
    //   // console.log("context.state.txs: " + JSON.stringify(context.state.txs, null, 2));
    //   await context.dispatch('saveData', ['txs']);
    //   logInfo("dataModule", "actions.syncTokenEventTxData END");
    // },

    async syncENSEvents(context, parameter) {
      logInfo("dataModule", "actions.syncENSEvents: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);
      const oldETHRegistarControllerInterface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER_ABI);
      const ethRegistarControllerInterface = new ethers.utils.Interface(ENS_ETHREGISTRARCONTROLLER_ABI);

      // 925.eth ERC-721 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:53835211818918528779359817553631021141919078878710948845228773628660104698081

      // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires) 0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f
      //   [ '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', namehash, null ],
      // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires) 0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae
      //   [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', namehash, null ],


      // Need `node` - ENS: Public Resolver 2 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41 AddressChanged (index_topic_1 bytes32 node, uint256 coinType, bytes newAddress) 0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752
      //   [ '0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752', namehash, null ],
      // Need `node` - ENS: Public Resolver 2 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41 AddrChanged (index_topic_1 bytes32 node, address a) 0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2
      //   [ '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2', namehash, null ],



      // - ENS: ETH Registrar Controller 0x253553366Da8546fC250F225fe3d25d0C782303b NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 baseCost, uint256 premium, uint256 expires) 0x69e37f151eb98a09618ddaa80c8cfaf1ce5996867c489f45b555b412271ebf27
      //   [ '0x69e37f151eb98a09618ddaa80c8cfaf1ce5996867c489f45b555b412271ebf27', namehash, null ],

      // - ENS Base Registrar Implementation 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85 NameRenewed (index_topic_1 uint256 id, uint256 expires) Topic 0x9b87a00e30f1ac65d898f070f8a3488fe60517182d0a2098e1b4b93a54aa9bd6
      //   [ '0x9b87a00e30f1ac65d898f070f8a3488fe60517182d0a2098e1b4b93a54aa9bd6', namehash, null ],
      // - ETH Registrar Controller 0x253553366Da8546fC250F225fe3d25d0C782303b NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires) 0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae
      //   [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', name, namehash, null ],
      // x - ENS Base Registrar Implementation 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85 NameRegistered (index_topic_1 uint256 id, index_topic_2 address owner, uint256 expires) 0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9
      // x   [ '0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9', namehash, null ],

      // ERC-20 & ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes, null ],
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, accountAs32Bytes ],

      // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, accountAs32Bytes, null ],
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, accountAs32Bytes ],

      // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, accountAs32Bytes, null ],
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, null, accountAs32Bytes ],

      // ENS:ETH Registrar Controller NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
      // [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', [tokenIds] ],

      // WETH Deposit (index_topic_1 address dst, uint256 wad)
      // 0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c
      // WETH Withdrawal (index_topic_1 address src, uint256 wad)
      // 0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65

      // // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
      // // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
      // // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
      // // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
      // // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
      // // 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31
      let total = 0;
      let t = this;
      async function processLogs(fromBlock, toBlock, section, logs) {
        total = parseInt(total) + logs.length;
        context.commit('setSyncCompleted', total);
        logInfo("dataModule", "actions.syncENSEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", section: " + section + ", logs.length: " + logs.length + ", total: " + total);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            const contract = log.address;
            let eventRecord = null;
            if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f" && contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
              // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              const [name, label, owner, cost, expires] = logData.args;
              eventRecord = { type: "NameRegistered", name, label, owner, cost: cost.toString(), expires: parseInt(expires)/*, expiryString: moment.unix(expires).format("MMM DD YYYY")*/ };
              console.log(JSON.stringify(eventRecord, null, 2));

            } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
              // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              // console.log(JSON.stringify(logData, null, 2));
              const [name, label, cost, expires] = logData.args;
              eventRecord = { type: "NameRenewed", name, label, cost: cost.toString(), expires: parseInt(expires)/*, expiryString: moment.unix(expires).format("MMM DD YYYY")*/ };
              console.log(JSON.stringify(eventRecord, null, 2));

            } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_ETHREGISTRARCONTROLLER_ADDRESS) {
              // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              const logData = ethRegistarControllerInterface.parseLog(log);
              // console.log(JSON.stringify(logData, null, 2));
              const [name, label, cost, expires] = logData.args;
              eventRecord = { type: "NameRenewed", name, label, cost: cost.toString(), expires: parseInt(expires)/*, expiryString: moment.unix(expires).format("MMM DD YYYY")*/ };
              console.log(JSON.stringify(eventRecord, null, 2));

            } else {
              console.log("NOT HANDLED: " + JSON.stringify(log));
            }
            // TODO: Testing if (eventRecord && contract == "0x7439E9Bb6D8a84dd3A23fe621A30F95403F87fB9") {
            // if (eventRecord &&
            //     ((parameter.erc20 && eventRecord.eventType == "erc20") ||
            //      (parameter.erc721 && eventRecord.eventType == "erc721") ||
            //      (parameter.erc1155 && eventRecord.eventType == "erc1155"))) {
            // const testAddresses = parameter.devThing ? new Set(["0xB32979486938AA9694BFC898f35DBED459F44424","0x286E531F363768Fed5E18b468f5B76a9FFc33af5"]) : null;
            // if (eventRecord && (!testAddresses || testAddresses.has(contract)) && eventRecord.eventType == "erc1155") {
            // if (eventRecord && contract == "0xB32979486938AA9694BFC898f35DBED459F44424") {
            // if (eventRecord && (contract == "0xB32979486938AA9694BFC898f35DBED459F44424" || contract == "0x286E531F363768Fed5E18b468f5B76a9FFc33af5")) {

            if (eventRecord) {
              records.push( {
                chainId: parameter.chainId,
                blockNumber: parseInt(log.blockNumber),
                logIndex: parseInt(log.logIndex),
                txIndex: parseInt(log.transactionIndex),
                txHash: log.transactionHash,
                contract,
                ...eventRecord,
                confirmations: parameter.blockNumber - log.blockNumber,
              });
            }
          }
        }
        if (records.length) {
          logInfo("dataModule", "actions.syncENSEvents.bulkAdd - records: " + JSON.stringify(records));
          await db.events.bulkAdd(records).then(function(lastKey) {
            console.log("syncENSEvents.bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log("syncENSEvents.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
        }
      }
      async function getLogs(fromBlock, toBlock, section, selectedRecords, processLogs) {
        logInfo("dataModule", "actions.syncENSEvents.getLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", section: " + section + ", selectedRecords: " + JSON.stringify(selectedRecords));
        const hashes = selectedRecords.map(a => "0x" + ethers.BigNumber.from(a.tokenId).toHexString().slice(2).padStart(64, '0'));
        // const hashes = selectedRecords.map(a => a.tokenId);
        // console.log("hashes: " + JSON.stringify(hashes, null, 2));

        try {
          let topics = null;
          if (section == 0) {
            topics = [[
                '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f',
                '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae',
                // Need `node` '0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752',
                // Need `node` '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2',
              ],
              hashes,
              null,
            ];
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            console.log("logs: " + JSON.stringify(logs, null, 2));
            // return;
            await processLogs(fromBlock, toBlock, section, logs);

          } else if (section == 1) {
            topics = [[
                '0x9b87a00e30f1ac65d898f070f8a3488fe60517182d0a2098e1b4b93a54aa9bd6',
              ],
              hashes,
              null,
            ];
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            console.log("logs: " + JSON.stringify(logs, null, 2));
            return;

            // await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 2) {
            topics = [
              '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae',
              hashes,
              // null,
            ];
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            console.log("logs: " + JSON.stringify(logs, null, 2));
            return;

            // await processLogs(fromBlock, toBlock, section, logs);
          // } else if (section == 2) {
          //   topics = [[
          //       '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
          //       '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
          //     ],
          //     null,
          //     selectedAddresses
          //   ];
          //   logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
          //   await processLogs(fromBlock, toBlock, section, logs);
          // } else if (section == 3) {
          //   topics = [ [
          //       '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
          //       '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
          //     ],
          //     null,
          //     null,
          //     selectedAddresses
          //   ];
          //   logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
          //   await processLogs(fromBlock, toBlock, section, logs);
          }
        } catch (e) {
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getLogs(fromBlock, mid, section, selectedRecords, processLogs);
          await getLogs(parseInt(mid) + 1, toBlock, section, selectedRecords, processLogs);
        }
      }

      logInfo("dataModule", "actions.syncENSEvents BEGIN");

      const tokensToProcess = {};
      for (const [contract, contractData] of Object.entries(context.state.tokens[parameter.chainId] || {})) {
        if (contractData.type == "erc721" || contractData.type == "erc1155") {
          for (const [tokenId, tokenData] of Object.entries(contractData.tokenIds)) {
            // if (!context.state.prices[parameter.chainId] || !context.state.prices[parameter.chainId][contract] || !context.state.prices[parameter.chainId][contract][tokenId]) {
              if (!(contract in tokensToProcess)) {
                tokensToProcess[contract] = {};
              }
              tokensToProcess[contract][tokenId] = tokenData;
            // }
          }
        }
      }
      // console.log("tokensToProcess: " + JSON.stringify(tokensToProcess, null, 2));
      let processList = [];
      for (const [contract, contractData] of Object.entries(tokensToProcess)) {
        const contractType = context.state.tokens[parameter.chainId][contract].type;
        for (const [tokenId, tokenData] of Object.entries(contractData)) {
          if (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS) {
            processList.push({ contract, tokenId });
          }
        }
      }
      // processList = processList.slice(0, 3); // TODO
      // ERC-721 925.eth renewal 0x684d272ec79f907011b451daf5bb6d90b54ac56cac2e20c669c617bee778fd3d and ERC-1155 portraits.eth 0xfcf5eb4b2e7f0debe905fa7f573ce220fb9f123a1dfa1e13186f34aec2a4df00
      // processList = processList.filter(e => ['53835211818918528779359817553631021141919078878710948845228773628660104698081', '27727362303445643037535452095569739813950020376856883309402147522300287323280'].includes(e.tokenId));
      // processList = processList.filter(e => ['53835211818918528779359817553631021141919078878710948845228773628660104698081'].includes(e.tokenId));
      // processList = processList.filter(e => e.contract === "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85");

      // ERC-1155 portraits.eth 0xfcf5eb4b2e7f0debe905fa7f573ce220fb9f123a1dfa1e13186f34aec2a4df00
      // processList = processList.filter(e => ['27727362303445643037535452095569739813950020376856883309402147522300287323280'].includes(e.tokenId));
      // processList = processList.filter(e => e.contract === "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401");

      // const ZEROES = "0x0000000000000000000000000000000000000000000000000000000000000000";
      // const ethPart = ethers.utils.solidityKeccak256(["string"], ["eth"]);
      // console.log("ethPart: " + ethPart); // 0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0
      // const firstPart = ethers.utils.solidityKeccak256(["bytes"], [ZEROES + ethPart.substring(2,)]);
      // console.log("firstPart: " + firstPart); // 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae
      // const ensPart = ethers.utils.solidityKeccak256(["string"], ["ens"]);
      // console.log("ensPart: " + ensPart); // 0x5cee339e13375638553bdf5a6e36ba80fb9f6a4f0783680884d92b558aa471da
      // const secondPart = ethers.utils.solidityKeccak256(["bytes"], [firstPart + ensPart.substring(2,)]);
      // console.log("secondPart: " + secondPart); // 0x4e34d3a81dc3a20f71bbdf2160492ddaa17ee7e5523757d47153379c13cb46df
      // // const thirdPart = ethers.utils.solidityKeccak256(["bytes"], [secondPart + firstPart.substring(2,)]);
      // const namehash = ethers.utils.namehash('ens.eth');
      // console.log("namehash: " + namehash); // 0x4e34d3a81dc3a20f71bbdf2160492ddaa17ee7e5523757d47153379c13cb46df
      // const decimalNameHash = ethers.BigNumber.from(namehash);
      // console.log("decimalNameHash: " + decimalNameHash); // 35373739037748002394990259860942348737703776167876918520233297406984196933343

      // https://docs.ethers.org/v4/api-utils.html#namehash
      // https://docs.ens.domains/resolution/names

      // ERC-721 portraits.eth 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:44751912813930912337796007339729037742242848274525268603577754244108589799563
      // const namehash = ethers.utils.solidityKeccak256(["string"], ["portraits"]);

      // ERC-1155 portraits.eth 0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401:27727362303445643037535452095569739813950020376856883309402147522300287323280
      // const namehash = ethers.utils.namehash('portraits.eth');
      // console.log("namehash: " + namehash); // 0x3d4d2183fb9835727050b65cba7fdffe10545fb323378f31e991b6b2c63b0c90
      // const decimalNameHash = ethers.BigNumber.from(namehash);
      // console.log("decimalNameHash: " + decimalNameHash); // 27727362303445643037535452095569739813950020376856883309402147522300287323280

      // ERC-721 925.eth 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:53835211818918528779359817553631021141919078878710948845228773628660104698081
      // ERC-1155 925.eth 0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401:90617972706753856606077416428092812770327579333964424572858812298074332597719
      // const labelhash = ethers.utils.solidityKeccak256(["string"], ["925"]);
      // console.log("labelhash: " + labelhash); // 0x7705a66c05de96d79dddf8024a7669ad29d5b174f4aa496e3ca7c392f0ca18e1
      // const decimalLabelhash = ethers.BigNumber.from(labelhash);
      // console.log("decimalLabelhash: " + decimalLabelhash); // 53835211818918528779359817553631021141919078878710948845228773628660104698081
      // const namehash = ethers.utils.namehash('925.eth');
      // console.log("namehash: " + namehash); // 0xc857f4794464c8a531d378463f789ad3caea99e27510bd74cafe33b776fc0dd7
      // const decimalNameHash = ethers.BigNumber.from(namehash);
      // console.log("decimalNameHash: " + decimalNameHash); // 90617972706753856606077416428092812770327579333964424572858812298074332597719

      // ERC-721 $mother.eth 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:55031006666192158848045017008080447197965693849755532004656313918635033768881
      // ERC-1155 $mother.eth 0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401:37778769934711969306858083174867277506392124373311900965949141233376830547093
      // const labelhash = ethers.utils.solidityKeccak256(["string"], ["$mother"]);
      // console.log("labelhash: " + labelhash); // 0x79aa722c0c2fcde541f3a9a8057afe4e86133ea0dd0d28f1d337f3fd505033b1
      // const decimalLabelhash = ethers.BigNumber.from(labelhash);
      // console.log("decimalLabelhash: " + decimalLabelhash); // 55031006666192158848045017008080447197965693849755532004656313918635033768881
      // const namehash = ethers.utils.namehash('$mother.eth');
      // console.log("namehash: " + namehash); // 0x538606aa1287ef33e2454861d54dd58271c4f9f5e05f724ca6982fecdb3de495
      // const decimalNameHash = ethers.BigNumber.from(namehash);
      // console.log("decimalNameHash: " + decimalNameHash); // 37778769934711969306858083174867277506392124373311900965949141233376830547093
      // return;

      console.log("processList: " + JSON.stringify(processList, null, 2));

      const BATCHSIZE = 100;
      context.commit('setSyncSection', { section: 'ENS Events', total: null });
      context.commit('setSyncCompleted', 0);
      for (let i = 0; i < processList.length && !context.state.sync.halt; i += BATCHSIZE) {
        const batch = processList.slice(i, parseInt(i) + BATCHSIZE);
        // console.log("batch: " + JSON.stringify(batch, null, 2));
        const startBlock = 0;
        await getLogs(startBlock, parameter.blockNumber, 0, batch, processLogs);
        // await getLogs(startBlock, parameter.blockNumber, 1, batch, processLogs);
        // await getLogs(startBlock, parameter.blockNumber, 2, batch, processLogs);
      }
      return;

      // const selectedAddresses = [];
      // for (const [address, addressData] of Object.entries(context.state.addresses)) {
      //   if (address.substring(0, 2) == "0x") {
      //     selectedAddresses.push('0x000000000000000000000000' + address.substring(2, 42).toLowerCase());
      //   }
      // }
      // console.log("selectedAddresses: " + JSON.stringify(selectedAddresses));
      // if (selectedAddresses.length > 0) {
      //   const deleteCall = await db.events.where("confirmations").below(parameter.confirmations).delete();
      //   const latest = await db.events.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).last();
      //   // const startBlock = (parameter.incrementalSync && latest) ? parseInt(latest.blockNumber) + 1: 0;
      //   const startBlock = 0;
      //   for (let section = 0; section < 4; section++) {
      //     await getLogs(startBlock, parameter.blockNumber, section, selectedAddresses, processLogs);
      //   }
      // }
      logInfo("dataModule", "actions.syncENSEvents END");
    },

    async syncWrappedENSEvents(context, parameter) {
      logInfo("dataModule", "actions.syncWrappedENSEvents: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);
      const nameWrapperInterface = new ethers.utils.Interface(ENS_NAMEWRAPPER_ABI);
      const oldETHRegistarControllerInterface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER_ABI);
      const ethRegistarControllerInterface = new ethers.utils.Interface(ENS_ETHREGISTRARCONTROLLER_ABI);

      // ERC-1155 portraits.eth 27727362303445643037535452095569739813950020376856883309402147522300287323280
      // ERC-1155 yourmum.lovesyou.eth 57229065116737680790555199455465332171886850449809000367294662727325932836690
      // - ENS: Name Wrapper 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401 NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry) 0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340
      //   [ '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', namehash, null ],

      // 925.eth ERC-721 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:53835211818918528779359817553631021141919078878710948845228773628660104698081

      // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires) 0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f
      //   [ '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', namehash, null ],
      // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires) 0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae
      //   [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', namehash, null ],


      // Need `node` - ENS: Public Resolver 2 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41 AddressChanged (index_topic_1 bytes32 node, uint256 coinType, bytes newAddress) 0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752
      //   [ '0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752', namehash, null ],
      // Need `node` - ENS: Public Resolver 2 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41 AddrChanged (index_topic_1 bytes32 node, address a) 0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2
      //   [ '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2', namehash, null ],



      // - ENS: ETH Registrar Controller 0x253553366Da8546fC250F225fe3d25d0C782303b NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 baseCost, uint256 premium, uint256 expires) 0x69e37f151eb98a09618ddaa80c8cfaf1ce5996867c489f45b555b412271ebf27
      //   [ '0x69e37f151eb98a09618ddaa80c8cfaf1ce5996867c489f45b555b412271ebf27', namehash, null ],

      // - ENS Base Registrar Implementation 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85 NameRenewed (index_topic_1 uint256 id, uint256 expires) Topic 0x9b87a00e30f1ac65d898f070f8a3488fe60517182d0a2098e1b4b93a54aa9bd6
      //   [ '0x9b87a00e30f1ac65d898f070f8a3488fe60517182d0a2098e1b4b93a54aa9bd6', namehash, null ],
      // - ETH Registrar Controller 0x253553366Da8546fC250F225fe3d25d0C782303b NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires) 0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae
      //   [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', name, namehash, null ],
      // x - ENS Base Registrar Implementation 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85 NameRegistered (index_topic_1 uint256 id, index_topic_2 address owner, uint256 expires) 0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9
      // x   [ '0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9', namehash, null ],

      // ERC-20 & ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes, null ],
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, accountAs32Bytes ],

      // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, accountAs32Bytes, null ],
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, accountAs32Bytes ],

      // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, accountAs32Bytes, null ],
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, null, accountAs32Bytes ],

      // ENS:ETH Registrar Controller NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
      // [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', [tokenIds] ],

      // WETH Deposit (index_topic_1 address dst, uint256 wad)
      // 0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c
      // WETH Withdrawal (index_topic_1 address src, uint256 wad)
      // 0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65

      // // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
      // // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
      // // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
      // // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
      // // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
      // // 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31
      let total = 0;
      let t = this;
      async function processLogs(fromBlock, toBlock, section, logs) {
        total = parseInt(total) + logs.length;
        context.commit('setSyncCompleted', total);
        logInfo("dataModule", "actions.syncWrappedENSEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", section: " + section + ", logs.length: " + logs.length + ", total: " + total);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            const contract = log.address;
            let eventRecord = null;
            if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
              let from = null;
              let to = null;
              let tokensOrTokenId = null;
              let tokens = null;
              let tokenId = null;
              if (log.topics.length == 4) {
                from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokensOrTokenId = ethers.BigNumber.from(log.topics[3]).toString();
              } else if (log.topics.length == 3) {
                from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokensOrTokenId = ethers.BigNumber.from(log.data).toString();
              // TODO: Handle 2
              } else if (log.topics.length == 1) {
                from = ethers.utils.getAddress('0x' + log.data.substring(26, 66));
                to = ethers.utils.getAddress('0x' + log.data.substring(90, 130));
                tokensOrTokenId = ethers.BigNumber.from('0x' + log.data.substring(130, 193)).toString();
              }
              if (from) {
                if (log.topics.length == 4) {
                  eventRecord = { type: "Transfer", from, to, tokenId: tokensOrTokenId, eventType: "erc721" };
                } else {
                  eventRecord = { type: "Transfer", from, to, tokens: tokensOrTokenId, eventType: "erc20" };
                }
              }
            } else if (log.topics[0] == "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
              const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              tokens = ethers.BigNumber.from(log.data).toString();
              eventRecord = { type: "Transfer", from: ADDRESS0, to, tokens, eventType: "erc20" };
            } else if (log.topics[0] == "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
              const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              tokens = ethers.BigNumber.from(log.data).toString();
              eventRecord = { type: "Transfer", from, to: ADDRESS0, tokens, eventType: "erc20" };
            } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
              if (log.topics.length == 4) {
                const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const approved = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                eventRecord = { type: "Approval", owner, approved, tokenId, eventType: "erc721" };
              } else {
                const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const spender = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokens = ethers.BigNumber.from(log.data).toString();
                eventRecord = { type: "Approval", owner, spender, tokens, eventType: "erc20" };
              }
            } else if (log.topics[0] == "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31") {
              const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              const operator = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
              approved = ethers.BigNumber.from(log.data).toString();
              eventRecord = { type: "ApprovalForAll", owner, operator, approved, eventType: "erc721" };
            } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
              // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
              const logData = erc1155Interface.parseLog(log);
              const [operator, from, to, id, value] = logData.args;
              tokenId = ethers.BigNumber.from(id).toString();
              eventRecord = { type: "TransferSingle", operator, from, to, tokenId, value: value.toString(), eventType: "erc1155" };
            } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
              // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
              const logData = erc1155Interface.parseLog(log);
              const [operator, from, to, ids, values] = logData.args;
              const tokenIds = ids.map(e => ethers.BigNumber.from(e).toString());
              eventRecord = { type: "TransferBatch", operator, from, to, tokenIds, values: values.map(e => e.toString()), eventType: "erc1155" };

            } else if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f" && contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
              // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              const [name, label, owner, cost, expires] = logData.args;
              eventRecord = { type: "NameRegistered", name, label, owner, cost: cost.toString(), expires: parseInt(expires)/*, expiryString: moment.unix(expires).format("MMM DD YYYY")*/ };
              console.log(JSON.stringify(eventRecord, null, 2));

            } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
              // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              // console.log(JSON.stringify(logData, null, 2));
              const [name, label, cost, expires] = logData.args;
              eventRecord = { type: "NameRenewed", name, label, cost: cost.toString(), expires: parseInt(expires)/*, expiryString: moment.unix(expires).format("MMM DD YYYY")*/ };
              console.log(JSON.stringify(eventRecord, null, 2));

            } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_ETHREGISTRARCONTROLLER_ADDRESS) {
              // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              const logData = ethRegistarControllerInterface.parseLog(log);
              // console.log(JSON.stringify(logData, null, 2));
              const [name, label, cost, expires] = logData.args;
              eventRecord = { type: "NameRenewed", name, label, cost: cost.toString(), expires: parseInt(expires)/*, expiryString: moment.unix(expires).format("MMM DD YYYY")*/ };
              console.log(JSON.stringify(eventRecord, null, 2));

            } else if (log.topics[0] == "0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340" && contract == ENS_NAMEWRAPPER_ADDRESS) {
              // NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
              const logData = nameWrapperInterface.parseLog(log);
              // console.log(JSON.stringify(logData, null, 2));
              const [node, name, owner, fuses, expiry] = logData.args;
              let parts = decodeNameWrapperBytes(name);
              // console.log("parts: " + parts);
              let nameString = parts.join(".");
              // nameString = nameString.replace("\u0003", '.').replace(/\u0000/, '').replace(/\u0006/, '').replace(/\u0007/, '').replace(/\u000b/, '').replace(/\t/, '').replace(/\n/, '').replace(/\r/, '').replace("\b", '.');
              // // console.log("nameString: " + nameString);
              // const parts = nameString.split(".");
              // // console.log("parts: " + JSON.stringify(parts));
              let label = null;
              let labelhash = null;
              let labelhashDecimals = null;
              if (parts.length >= 2 && parts[parts.length - 1] == "eth") {
                label = parts[parts.length - 2];
                // console.log("label: " + label);
                labelhash = ethers.utils.solidityKeccak256(["string"], [label]);
                // console.log("labelhash: " + labelhash);
                labelhashDecimals = ethers.BigNumber.from(labelhash).toString();
                // console.log("labelhashDecimals: " + labelhashDecimals);
              }
              const namehashDecimals = ethers.BigNumber.from(node).toString();
              const subdomain = parts.length >= 3 && parts[parts.length - 3] || null;

              // const namehash = ethers.utils.namehash(nameString);
              // console.log("namehash: " + namehash);
              // const decimalNameHash = ethers.BigNumber.from(namehash);
              // console.log("decimalNameHash: " + decimalNameHash);

              eventRecord = { type: "NameWrapped", namehash: node, /*namehashDecimals,*/ name: nameString, /*nameBytes: name,*/ label, labelhash, /* labelhashDecimals,*/ subdomain, owner, fuses, expiry: parseInt(expiry) /*, expiryString: moment.unix(expiry).format("MMM DD YYYY")*/ };
              console.log(JSON.stringify(eventRecord, null, 2));

            } else {
              console.log("NOT HANDLED: " + JSON.stringify(log));
            }
            // TODO: Testing if (eventRecord && contract == "0x7439E9Bb6D8a84dd3A23fe621A30F95403F87fB9") {
            // if (eventRecord &&
            //     ((parameter.erc20 && eventRecord.eventType == "erc20") ||
            //      (parameter.erc721 && eventRecord.eventType == "erc721") ||
            //      (parameter.erc1155 && eventRecord.eventType == "erc1155"))) {
            // const testAddresses = parameter.devThing ? new Set(["0xB32979486938AA9694BFC898f35DBED459F44424","0x286E531F363768Fed5E18b468f5B76a9FFc33af5"]) : null;
            // if (eventRecord && (!testAddresses || testAddresses.has(contract)) && eventRecord.eventType == "erc1155") {
            // if (eventRecord && contract == "0xB32979486938AA9694BFC898f35DBED459F44424") {
            // if (eventRecord && (contract == "0xB32979486938AA9694BFC898f35DBED459F44424" || contract == "0x286E531F363768Fed5E18b468f5B76a9FFc33af5")) {

            if (eventRecord) {
              records.push( {
                chainId: parameter.chainId,
                blockNumber: parseInt(log.blockNumber),
                logIndex: parseInt(log.logIndex),
                txIndex: parseInt(log.transactionIndex),
                txHash: log.transactionHash,
                contract,
                ...eventRecord,
                confirmations: parameter.blockNumber - log.blockNumber,
              });
            }
          }
        }
        if (records.length) {
          logInfo("dataModule", "actions.syncWrappedENSEvents.bulkAdd - records: " + JSON.stringify(records));
          await db.events.bulkAdd(records).then(function(lastKey) {
            console.log("syncWrappedENSEvents.bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log("syncWrappedENSEvents.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
        }
      }
      async function getLogs(fromBlock, toBlock, section, selectedRecords, processLogs) {
        logInfo("dataModule", "actions.syncWrappedENSEvents.getLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", section: " + section + ", selectedRecords: " + JSON.stringify(selectedRecords));
        const hashes = selectedRecords.map(a => "0x" + ethers.BigNumber.from(a.tokenId).toHexString().slice(2).padStart(64, '0'));
        // const hashes = selectedRecords.map(a => a.tokenId);
        // console.log("hashes: " + JSON.stringify(hashes, null, 2));

        try {
          let topics = null;
          if (section == 0) {
            topics = [[
                '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340',
                // '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f',
                // '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae',
                // Need `node` '0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752',
                // Need `node` '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2',
              ],
              hashes,
              null,
            ];
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            // console.log("logs: " + JSON.stringify(logs, null, 2));
            // return;
            await processLogs(fromBlock, toBlock, section, logs);

          } else if (section == 1) {
            topics = [[
                '0x9b87a00e30f1ac65d898f070f8a3488fe60517182d0a2098e1b4b93a54aa9bd6',
              ],
              hashes,
              null,
            ];
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            console.log("logs: " + JSON.stringify(logs, null, 2));
            return;

            // await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 2) {
            topics = [
              '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae',
              hashes,
              // null,
            ];
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            console.log("logs: " + JSON.stringify(logs, null, 2));
            return;

            // await processLogs(fromBlock, toBlock, section, logs);
          // } else if (section == 2) {
          //   topics = [[
          //       '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
          //       '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
          //     ],
          //     null,
          //     selectedAddresses
          //   ];
          //   logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
          //   await processLogs(fromBlock, toBlock, section, logs);
          // } else if (section == 3) {
          //   topics = [ [
          //       '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
          //       '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
          //     ],
          //     null,
          //     null,
          //     selectedAddresses
          //   ];
          //   logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
          //   await processLogs(fromBlock, toBlock, section, logs);
          }
        } catch (e) {
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getLogs(fromBlock, mid, section, selectedRecords, processLogs);
          await getLogs(parseInt(mid) + 1, toBlock, section, selectedRecords, processLogs);
        }
      }

      logInfo("dataModule", "actions.syncWrappedENSEvents BEGIN");

      const tokensToProcess = {};
      for (const [contract, contractData] of Object.entries(context.state.tokens[parameter.chainId] || {})) {
        if (contractData.type == "erc721" || contractData.type == "erc1155") {
          for (const [tokenId, tokenData] of Object.entries(contractData.tokenIds)) {
            // if (!context.state.prices[parameter.chainId] || !context.state.prices[parameter.chainId][contract] || !context.state.prices[parameter.chainId][contract][tokenId]) {
              if (!(contract in tokensToProcess)) {
                tokensToProcess[contract] = {};
              }
              tokensToProcess[contract][tokenId] = tokenData;
            // }
          }
        }
      }
      // console.log("tokensToProcess: " + JSON.stringify(tokensToProcess, null, 2));
      let processList = [];
      for (const [contract, contractData] of Object.entries(tokensToProcess)) {
        const contractType = context.state.tokens[parameter.chainId][contract].type;
        for (const [tokenId, tokenData] of Object.entries(contractData)) {
          if (contract == ENS_NAMEWRAPPER_ADDRESS) {
            processList.push({ contract, tokenId });
          }
        }
      }
      // processList = processList.slice(0, 3); // TODO
      // ERC-721 925.eth renewal 0x684d272ec79f907011b451daf5bb6d90b54ac56cac2e20c669c617bee778fd3d and ERC-1155 portraits.eth 0xfcf5eb4b2e7f0debe905fa7f573ce220fb9f123a1dfa1e13186f34aec2a4df00
      // processList = processList.filter(e => ['53835211818918528779359817553631021141919078878710948845228773628660104698081', '27727362303445643037535452095569739813950020376856883309402147522300287323280'].includes(e.tokenId));

      // ERC-1155 portraits.eth 27727362303445643037535452095569739813950020376856883309402147522300287323280
      // ERC-1155 yourmum.lovesyou.eth 57229065116737680790555199455465332171886850449809000367294662727325932836690
      // processList = processList.filter(e => ['27727362303445643037535452095569739813950020376856883309402147522300287323280', '57229065116737680790555199455465332171886850449809000367294662727325932836690'].includes(e.tokenId));

      // processList = processList.filter(e => e.contract === "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85");

      // ERC-1155 portraits.eth 0xfcf5eb4b2e7f0debe905fa7f573ce220fb9f123a1dfa1e13186f34aec2a4df00
      // processList = processList.filter(e => ['27727362303445643037535452095569739813950020376856883309402147522300287323280'].includes(e.tokenId));
      // processList = processList.filter(e => e.contract === "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401");

      // const ZEROES = "0x0000000000000000000000000000000000000000000000000000000000000000";
      // const ethPart = ethers.utils.solidityKeccak256(["string"], ["eth"]);
      // console.log("ethPart: " + ethPart); // 0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0
      // const firstPart = ethers.utils.solidityKeccak256(["bytes"], [ZEROES + ethPart.substring(2,)]);
      // console.log("firstPart: " + firstPart); // 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae
      // const ensPart = ethers.utils.solidityKeccak256(["string"], ["ens"]);
      // console.log("ensPart: " + ensPart); // 0x5cee339e13375638553bdf5a6e36ba80fb9f6a4f0783680884d92b558aa471da
      // const secondPart = ethers.utils.solidityKeccak256(["bytes"], [firstPart + ensPart.substring(2,)]);
      // console.log("secondPart: " + secondPart); // 0x4e34d3a81dc3a20f71bbdf2160492ddaa17ee7e5523757d47153379c13cb46df
      // // const thirdPart = ethers.utils.solidityKeccak256(["bytes"], [secondPart + firstPart.substring(2,)]);
      // const namehash = ethers.utils.namehash('ens.eth');
      // console.log("namehash: " + namehash); // 0x4e34d3a81dc3a20f71bbdf2160492ddaa17ee7e5523757d47153379c13cb46df
      // const decimalNameHash = ethers.BigNumber.from(namehash);
      // console.log("decimalNameHash: " + decimalNameHash); // 35373739037748002394990259860942348737703776167876918520233297406984196933343

      // https://docs.ethers.org/v4/api-utils.html#namehash
      // https://docs.ens.domains/resolution/names

      // ERC-721 portraits.eth 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:44751912813930912337796007339729037742242848274525268603577754244108589799563
      // const namehash = ethers.utils.solidityKeccak256(["string"], ["portraits"]);

      // ERC-1155 portraits.eth 0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401:27727362303445643037535452095569739813950020376856883309402147522300287323280
      // const namehash = ethers.utils.namehash('portraits.eth');
      // console.log("namehash: " + namehash); // 0x3d4d2183fb9835727050b65cba7fdffe10545fb323378f31e991b6b2c63b0c90
      // const decimalNameHash = ethers.BigNumber.from(namehash);
      // console.log("decimalNameHash: " + decimalNameHash); // 27727362303445643037535452095569739813950020376856883309402147522300287323280

      // ERC-721 925.eth 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:53835211818918528779359817553631021141919078878710948845228773628660104698081
      // ERC-1155 925.eth 0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401:90617972706753856606077416428092812770327579333964424572858812298074332597719
      // const labelhash = ethers.utils.solidityKeccak256(["string"], ["925"]);
      // console.log("labelhash: " + labelhash); // 0x7705a66c05de96d79dddf8024a7669ad29d5b174f4aa496e3ca7c392f0ca18e1
      // const decimalLabelhash = ethers.BigNumber.from(labelhash);
      // console.log("decimalLabelhash: " + decimalLabelhash); // 53835211818918528779359817553631021141919078878710948845228773628660104698081
      // const namehash = ethers.utils.namehash('925.eth');
      // console.log("namehash: " + namehash); // 0xc857f4794464c8a531d378463f789ad3caea99e27510bd74cafe33b776fc0dd7
      // const decimalNameHash = ethers.BigNumber.from(namehash);
      // console.log("decimalNameHash: " + decimalNameHash); // 90617972706753856606077416428092812770327579333964424572858812298074332597719

      // ERC-721 $mother.eth 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:55031006666192158848045017008080447197965693849755532004656313918635033768881
      // ERC-1155 $mother.eth 0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401:37778769934711969306858083174867277506392124373311900965949141233376830547093
      // const labelhash = ethers.utils.solidityKeccak256(["string"], ["$mother"]);
      // console.log("labelhash: " + labelhash); // 0x79aa722c0c2fcde541f3a9a8057afe4e86133ea0dd0d28f1d337f3fd505033b1
      // const decimalLabelhash = ethers.BigNumber.from(labelhash);
      // console.log("decimalLabelhash: " + decimalLabelhash); // 55031006666192158848045017008080447197965693849755532004656313918635033768881
      // const namehash = ethers.utils.namehash('$mother.eth');
      // console.log("namehash: " + namehash); // 0x538606aa1287ef33e2454861d54dd58271c4f9f5e05f724ca6982fecdb3de495
      // const decimalNameHash = ethers.BigNumber.from(namehash);
      // console.log("decimalNameHash: " + decimalNameHash); // 37778769934711969306858083174867277506392124373311900965949141233376830547093

      // const labelhash = ethers.utils.solidityKeccak256(["string"], ["best"]);
      // console.log("labelhash: " + labelhash); // 0x79aa722c0c2fcde541f3a9a8057afe4e86133ea0dd0d28f1d337f3fd505033b1
      // const namehash = ethers.utils.namehash('collections.eth');
      // console.log("namehash: " + namehash); // 0x538606aa1287ef33e2454861d54dd58271c4f9f5e05f724ca6982fecdb3de495
      // return;

      console.log("processList: " + JSON.stringify(processList, null, 2));

      const BATCHSIZE = 100;
      context.commit('setSyncSection', { section: 'Wrapped ENS Events', total: null });
      context.commit('setSyncCompleted', 0);
      for (let i = 0; i < processList.length && !context.state.sync.halt; i += BATCHSIZE) {
        const batch = processList.slice(i, parseInt(i) + BATCHSIZE);
        // console.log("batch: " + JSON.stringify(batch, null, 2));
        const startBlock = 0;
        await getLogs(startBlock, parameter.blockNumber, 0, batch, processLogs);
        // await getLogs(startBlock, parameter.blockNumber, 1, batch, processLogs);
        // await getLogs(startBlock, parameter.blockNumber, 2, batch, processLogs);
      }
      return;

      // const selectedAddresses = [];
      // for (const [address, addressData] of Object.entries(context.state.addresses)) {
      //   if (address.substring(0, 2) == "0x") {
      //     selectedAddresses.push('0x000000000000000000000000' + address.substring(2, 42).toLowerCase());
      //   }
      // }
      // console.log("selectedAddresses: " + JSON.stringify(selectedAddresses));
      // if (selectedAddresses.length > 0) {
      //   const deleteCall = await db.events.where("confirmations").below(parameter.confirmations).delete();
      //   const latest = await db.events.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).last();
      //   // const startBlock = (parameter.incrementalSync && latest) ? parseInt(latest.blockNumber) + 1: 0;
      //   const startBlock = 0;
      //   for (let section = 0; section < 4; section++) {
      //     await getLogs(startBlock, parameter.blockNumber, section, selectedAddresses, processLogs);
      //   }
      // }
      logInfo("dataModule", "actions.syncWrappedENSEvents END");
    },

    async collateMetadata(context, parameter) {
      logInfo("dataModule", "actions.collateMetadata: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      logInfo("dataModule", "actions.collateMetadata BEGIN");

      const selectedAddressesMap = {};
      for (const [address, addressData] of Object.entries(context.state.addresses)) {
        if (address.substring(0, 2) == "0x") {
          selectedAddressesMap[address] = true;
        }
      }
      console.log("selectedAddressesMap: " + Object.keys(selectedAddressesMap));
      let rows = 0;
      let done = false;
      const metadata = {};
      do {
        let data = await db.events.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateMetadata - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {

          // youresocool.eth registration txHash 0x81c71d2a0521abfb8c0c1f8f706fb3f18de028b0f47dd5619aec9ce4b6b3ba59
          // if (item.txHash == "0x81c71d2a0521abfb8c0c1f8f706fb3f18de028b0f47dd5619aec9ce4b6b3ba59") {
          //   console.log("---> " + JSON.stringify(item, null, 2));
          // }

          if (item.type == "NameRegistered" && item.contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
            // console.log(item.contract + " " + item.name + " " + item.txHash);
            const contract = ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS;
            if (!(item.chainId in metadata)) {
              metadata[item.chainId] = {};
            }
            if (!(contract in metadata[item.chainId])) {
              metadata[item.chainId][contract] = {};
            }
            // console.log("NameRegistered: " + JSON.stringify(item, null, 2));
            const labelhash = ethers.utils.solidityKeccak256(["string"], [item.name]);
            const tokenId = ethers.BigNumber.from(labelhash);
            if (!(tokenId in metadata[item.chainId][contract])) {
              metadata[item.chainId][contract][tokenId] = {
                name: item.name + ".eth",
                created: item.blockNumber,
                registered: item.blockNumber,
                expiry: item.expires,
                events: [],
              };
              // console.log("NameRegistered: " + item.name + " => " + contract + "/" + tokenId);
            } else {
              metadata[item.chainId][contract][tokenId].registered = item.blockNumber;
              metadata[item.chainId][contract][tokenId].expiry = item.expires;
            }
            metadata[item.chainId][contract][tokenId].events.push(item);

          } else if (item.type == "NameWrapped" && item.contract == ENS_NAMEWRAPPER_ADDRESS) {
            // console.log("NameWrapped: " + JSON.stringify(item, null, 2));
            // console.log("NameWrapped: " + item.name);
            if (!(item.chainId in metadata)) {
              metadata[item.chainId] = {};
            }
            if (!(item.contract in metadata[item.chainId])) {
              metadata[item.chainId][item.contract] = {};
            }
            if (!(ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS in metadata[item.chainId])) {
              metadata[item.chainId][ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS] = {};
            }
            const wrappedTokenId = ethers.BigNumber.from(item.namehash).toString();
            if (!(wrappedTokenId in metadata[item.chainId][item.contract])) {
              metadata[item.chainId][item.contract][wrappedTokenId] = {
                name: item.name,
                created: item.blockNumber,
                registered: item.blockNumber,
                expiry: item.expiry,
                events: [],
              };
            } else {
              metadata[item.chainId][item.contract][wrappedTokenId].registered = item.blockNumber;
              metadata[item.chainId][item.contract][wrappedTokenId].expiry = item.expiry;
            }
            metadata[item.chainId][item.contract][wrappedTokenId].events.push(item);

            if (item.subdomain == null) {
              const tokenId = ethers.BigNumber.from(item.labelhash).toString();
              if (!(wrappedTokenId in metadata[item.chainId][ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS])) {
                metadata[item.chainId][ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS][tokenId] = {
                  name: item.name,
                  created: item.blockNumber,
                  registered: item.blockNumber,
                  expiry: item.expiry,
                  events: [],
                };
              } else {
                metadata[item.chainId][ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS][tokenId].registered = item.blockNumber;
                metadata[item.chainId][ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS][tokenId].expiry = item.expiry;
              }
              metadata[item.chainId][ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS][tokenId].events.push(item);
            }

            // console.log(item.contract + " " + item.type + " " + item.name + " " + item.txHash);
            // console.log("  https://opensea.io/assets/ethereum/0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401/" + item.namehashDecimals);
            //
          } else if (item.type == "NameRenewed" && (item.contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS || item.contract == ENS_ETHREGISTRARCONTROLLER_ADDRESS)) {
            // TODO
            // console.log("NameRenewed: " + JSON.stringify(item, null, 2));
            // const contract = item.contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS ? ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS : item.contract;
            const contract = ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS;
            const tokenId = ethers.BigNumber.from(item.label);

            // const labelhash = ethers.utils.solidityKeccak256(["string"], ["925"]);
            // console.log("labelhash: " + labelhash); // 0x7705a66c05de96d79dddf8024a7669ad29d5b174f4aa496e3ca7c392f0ca18e1
            // const decimalLabelhash = ethers.BigNumber.from(labelhash);
            // console.log("decimalLabelhash: " + decimalLabelhash); // 53835211818918528779359817553631021141919078878710948845228773628660104698081

            if (metadata[item.chainId] && metadata[item.chainId][contract] && (tokenId in metadata[item.chainId][contract])) {
              // console.log("Found NameRenewed: " + JSON.stringify(item, null, 2));
              // console.log("  https://opensea.io/assets/ethereum/" + ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS + "/" + tokenId);

              metadata[item.chainId][contract][tokenId].registered = item.blockNumber;
              metadata[item.chainId][contract][tokenId].expiry = item.expires;
              metadata[item.chainId][contract][tokenId].events.push(item);

            } else {
              console.log("NOT Found NameRenewed: " + JSON.stringify(item, null, 2));
              if (!(item.chainId in metadata)) {
                metadata[item.chainId] = {};
              }
              if (!(contract in metadata[item.chainId])) {
                metadata[item.chainId][contract] = {};
              }
              metadata[item.chainId][contract][tokenId] = {
                name: item.name + ".eth",
                created: null,
                registered: null,
                expiry: item.expires,
                events: [],
              };
              metadata[item.chainId][contract][tokenId].events.push(item);
              console.log("NOT Found NameRenewed - after: " + JSON.stringify(metadata[item.chainId][contract][tokenId], null, 2));
            }
          } else if (["Transfer", "TransferSingle", "TransferBatch"].includes(item.type)) {
            //
          } else if (["ApprovalForAll"].includes(item.type)) {
            //
          } else {
            console.log("Unhandled: " + item.type + " " + JSON.stringify(item, null,  2));
          }



          // if (!(["Transfer", "TransferSingle", "TransferBatch"].includes(item.type))) {
          // }
          // if (["Transfer", "TransferSingle", "TransferBatch"].includes(item.type) && !(item.contract in tokens)) {
          //   if (item.eventType == "erc20") {
          //     tokens[item.contract] = {
          //       type: item.eventType,
          //       balances: {},
          //     };
          //   } else {
          //     tokens[item.contract] = {
          //       type: item.eventType,
          //       tokenIds: {},
          //     };
          //   }
          // }
          // if (item.eventType == "erc20" && item.type == "Transfer") {
          //   const balances = tokens[item.contract].balances || {};
          //   if (item.from in selectedAddressesMap) {
          //     if (!(item.from in balances)) {
          //       balances[item.from] = "0";
          //     }
          //     balances[item.from] = ethers.BigNumber.from(balances[item.from]).sub(item.tokens).toString();
          //   }
          //   if (item.to in selectedAddressesMap) {
          //     if (!(item.to in balances)) {
          //       balances[item.to] = "0";
          //     }
          //     balances[item.to] = ethers.BigNumber.from(balances[item.to]).add(item.tokens).toString();
          //   }
          //   tokens[item.contract].balances = balances;
          // } else if (item.eventType == "erc721" && item.type == "Transfer") {
          //   if (item.from in selectedAddressesMap || item.to in selectedAddressesMap) {
          //     tokens[item.contract].tokenIds[item.tokenId] = item.to;
          //   }
          // } else if (item.eventType == "erc1155" && item.type == "TransferSingle") {
          //   if (item.from in selectedAddressesMap) {
          //     if (!(item.tokenId in tokens[item.contract].tokenIds)) {
          //       tokens[item.contract].tokenIds[item.tokenId] = {};
          //     }
          //     if (item.from in tokens[item.contract].tokenIds[item.tokenId]) {
          //       tokens[item.contract].tokenIds[item.tokenId][item.from] = ethers.BigNumber.from(tokens[item.contract].tokenIds[item.tokenId][item.from]).sub(item.value).toString();
          //       if (tokens[item.contract].tokenIds[item.tokenId][item.from] == "0") {
          //         delete tokens[item.contract].tokenIds[item.tokenId][item.from];
          //       }
          //     }
          //   }
          //   if (item.to in selectedAddressesMap) {
          //     if (!(item.tokenId in tokens[item.contract].tokenIds)) {
          //       tokens[item.contract].tokenIds[item.tokenId] = {};
          //     }
          //     if (!(item.to in tokens[item.contract].tokenIds[item.tokenId])) {
          //       tokens[item.contract].tokenIds[item.tokenId][item.to] = "0";
          //     }
          //     tokens[item.contract].tokenIds[item.tokenId][item.to] = ethers.BigNumber.from(tokens[item.contract].tokenIds[item.tokenId][item.to]).add(item.value).toString();
          //   }
          // } else if (item.eventType == "erc1155" && item.type == "TransferBatch") {
          //   for (const [index, tokenId] of item.tokenIds.entries()) {
          //     if (item.from in selectedAddressesMap) {
          //       if (!(tokenId in tokens[item.contract].tokenIds)) {
          //         tokens[item.contract].tokenIds[tokenId] = {};
          //       }
          //       if (item.from in tokens[item.contract].tokenIds[tokenId]) {
          //         tokens[item.contract].tokenIds[tokenId][item.from] = ethers.BigNumber.from(tokens[item.contract].tokenIds[tokenId][item.from]).sub(item.values[index]).toString();
          //         if (tokens[item.contract].tokenIds[tokenId][item.from] == "0") {
          //           delete tokens[item.contract].tokenIds[tokenId][item.from];
          //         }
          //       }
          //     }
          //     if (item.to in selectedAddressesMap) {
          //       if (!(tokenId in tokens[item.contract].tokenIds)) {
          //         tokens[item.contract].tokenIds[tokenId] = {};
          //       }
          //       if (!(item.to in tokens[item.contract].tokenIds[tokenId])) {
          //         tokens[item.contract].tokenIds[tokenId][item.to] = "0";
          //       }
          //       tokens[item.contract].tokenIds[tokenId][item.to] = ethers.BigNumber.from(tokens[item.contract].tokenIds[tokenId][item.to]).add(item.values[index]).toString();
          //     }
          //   }
          // }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      console.log("metadata: " + JSON.stringify(metadata, null, 2));
      context.commit('setState', { name: "metadata", data: metadata });
      await context.dispatch('saveData', ['metadata']);
      logInfo("dataModule", "actions.collateMetadata END");
    },

    async syncPrices(context, parameter) {
      logInfo("dataModule", "actions.syncPrices: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokensToProcess = {};
      for (const [contract, contractData] of Object.entries(context.state.tokens[parameter.chainId] || {})) {
        if (contractData.type == "erc721" || contractData.type == "erc1155") {
          for (const [tokenId, tokenData] of Object.entries(contractData.tokenIds)) {
            // if (!context.state.prices[parameter.chainId] || !context.state.prices[parameter.chainId][contract] || !context.state.prices[parameter.chainId][contract][tokenId]) {
              if (!(contract in tokensToProcess)) {
                tokensToProcess[contract] = {};
              }
              tokensToProcess[contract][tokenId] = tokenData;
            // }
          }
        }
      }
      // console.log("tokensToProcess: " + JSON.stringify(tokensToProcess, null, 2));
      let processList = [];
      for (const [contract, contractData] of Object.entries(tokensToProcess)) {
        const contractType = context.state.tokens[parameter.chainId][contract].type;
        for (const [tokenId, tokenData] of Object.entries(contractData)) {
          processList.push({ contract, tokenId });
        }
      }
      // processList = processList.slice(1, 3); // TODO
      console.log("processList: " + JSON.stringify(processList, null, 2));
      const BATCHSIZE = 50;
      const DELAYINMILLIS = 2000;
      let completed = 0;
      context.commit('setSyncSection', { section: 'Token Metadata', total: processList.length });
      context.commit('setSyncCompleted', completed);
      for (let i = 0; i < processList.length && !context.state.sync.halt; i += BATCHSIZE) {
        const batch = processList.slice(i, parseInt(i) + BATCHSIZE);
        // console.log("batch: " + JSON.stringify(batch, null, 2));
        let continuation = null;
        do {
          let url = "https://api.reservoir.tools/tokens/v7?";
          let separator = "";
          for (let j = 0; j < batch.length; j++) {
            url = url + separator + "tokens=" + batch[j].contract + "%3A" + batch[j].tokenId;
            separator = "&";
          }
          url = url + (continuation != null ? "&continuation=" + continuation : '');
          url = url + "&limit=100&includeAttributes=true&includeLastSale=true&includeTopBid=true";
          console.log(url);
          const data = await fetch(url).then(response => response.json());
          continuation = data.continuation;
          // console.log(JSON.stringify(data, null, 2));
          for (token of data.tokens) {
            // console.log(JSON.stringify(token, null, 2));
            const tokenData = parseReservoirTokenData(token);
            if (/*tokenData.created == null ||*/ tokenData.expiry == null && false) {
              const url = "https://metadata.ens.domains/mainnet/" + tokenData.contract + "/" + tokenData.tokenId;
              const metadataFileContent = await fetch(url, {mode: 'cors'}).then(response => response.json());
              const createdRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Created Date");
              console.log("createdRecord: " + JSON.stringify(createdRecord));
              if (createdRecord.length == 1 && createdRecord[0].value) {
                tokenData.created = parseInt(createdRecord[0].value) / 1000;
              }
              const registrationRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Registration Date");
              console.log("registrationRecord: " + JSON.stringify(registrationRecord));
              if (registrationRecord.length == 1 && registrationRecord[0].value) {
                tokenData.registration = parseInt(registrationRecord[0].value) / 1000;
              }
              const expiryRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Expiration Date");
              console.log("expiryRecord: " + JSON.stringify(expiryRecord));
              if (expiryRecord.length == 1 && expiryRecord[0].value) {
                tokenData.expiry = parseInt(expiryRecord[0].value) / 1000;
              }
            }
            console.log("tokenData: " + JSON.stringify(tokenData, null, 2));
            context.commit('addTokenMetadata', tokenData);
            completed++;
          }
          context.commit('setSyncCompleted', completed);
          await context.dispatch('saveData', ['prices']);
          await delay(DELAYINMILLIS);
        } while (continuation != null /*&& !state.halt && !state.sync.error */);
      }

    },

    async syncTokenMetadataOld(context, parameter) {
      logInfo("dataModule", "actions.syncTokenMetadataOld: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      logInfo("dataModule", "actions.syncTokenMetadataOld BEGIN");
      const contractsToProcess = {};
      const tokensToProcess = {};
      let totalContractsToProcess = 0;
      let totalTokensToProcess = 0;
      for (const [contract, contractData] of Object.entries(context.state.tokens[parameter.chainId] || {})) {
        if (!context.state.contractMetadata[parameter.chainId] || !context.state.contractMetadata[parameter.chainId][contract]) {
          contractsToProcess[contract] = contractData;
          totalContractsToProcess++;
        }
        if (contractData.type == "erc721" || contractData.type == "erc1155") {
          for (const [tokenId, tokenData] of Object.entries(contractData.tokenIds)) {
            if (!context.state.prices[parameter.chainId] || !context.state.prices[parameter.chainId][contract] || !context.state.prices[parameter.chainId][contract][tokenId]) {
              if (!(contract in tokensToProcess)) {
                tokensToProcess[contract] = {};
              }
              tokensToProcess[contract][tokenId] = tokenData;
              totalTokensToProcess++;
            }
          }
        }
      }
      // console.log("contractsToProcess: " + JSON.stringify(contractsToProcess));
      console.log("tokensToProcess: " + JSON.stringify(tokensToProcess, null, 2));

      if (true) {
        context.commit('setSyncSection', { section: 'Token Contract Metadata', total: totalContractsToProcess });
        let completed = 0;
        for (const [contract, contractData] of Object.entries(contractsToProcess)) {
          console.log("Processing: " + contract + " => " + JSON.stringify(contractData));
          context.commit('setSyncCompleted', completed);
          const interface = new ethers.Contract(contract, ERC20ABI, provider);
          let symbol = null;
          let name = null;
          let decimals = null;
          let totalSupply = null;
          if (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS) {
            symbol = "ENS";
            name = "Ethereum Name Service";
          } else if (contract == ENS_NAMEWRAPPER_ADDRESS) {
            symbol = "ENSW";
            name = "Ethereum Name Service Name Wrapper";
          } else {
            try {
              symbol = await interface.symbol();
            } catch (e) {
            }
            try {
              name = await interface.name();
            } catch (e) {
            }
          }
          if (contractData.type == "erc20") {
              try {
                decimals = await interface.decimals();
              } catch (e) {
              }
          }
          try {
            totalSupply = await interface.totalSupply();
          } catch (e) {
          }
          // console.log(contract + " " + contractData.type + " " + symbol + " " + name + " " + decimals + " " + totalSupply);
          context.commit('addTokenContractMetadata', {
            chainId: parameter.chainId,
            contract,
            symbol,
            name,
            decimals: decimals && parseInt(decimals) || null,
            totalSupply: totalSupply && totalSupply.toString() || null,
            ...contractData,
          });
          completed++;
          if ((completed % 10) == 0) {
            await context.dispatch('saveData', ['contractMetadata']);
          }
          if (context.state.sync.halt) {
            break;
          }
        }
        // console.log("context.state.metadata: " + JSON.stringify(context.state.metadata, null, 2));
        await context.dispatch('saveData', ['contractMetadata']);
      }

      completed = 0;
      context.commit('setSyncSection', { section: 'Token Metadata', total: totalTokensToProcess });
      context.commit('setSyncCompleted', 0);
      // data:application/json;base64, 0x72A94e6c51CB06453B84c049Ce1E1312f7c05e2c Wiiides
      // https:// -> ipfs://           0x31385d3520bCED94f77AaE104b406994D8F2168C BGANPUNKV2
      // data:application/json;base64, 0x1C60841b70821dcA733c9B1a26dBe1a33338bD43 GLICPIXXXVER002
      // IPFS data in another contract 0xC2C747E0F7004F9E8817Db2ca4997657a7746928 Hashmask
      // No tokenURI                   0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85 ENS
      // TODO ?                        0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401 ENS Name Wrapper
      // IPFS retrieval failure        0xbe9371326F91345777b04394448c23E2BFEaa826 OSP Gemesis

      for (const [contract, contractData] of Object.entries(tokensToProcess)) {
        const contractType = context.state.tokens[parameter.chainId][contract].type;
        // console.log(contract + " => " + contractType);
        for (const [tokenId, tokenData] of Object.entries(contractData)) {
          context.commit('setSyncCompleted', completed);
          try {
            let tokenURIResult = null;
            if (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || contract == ENS_NAMEWRAPPER_ADDRESS) {
              tokenURIResult = "https://metadata.ens.domains/mainnet/" + contract + "/" + tokenId;
            // } else if (contract == HASHMASK) {
            //   // Cannot access to server CORS configuration tokenURIResult = "https://hashmap.azurewebsites.net/getMask/" + tokenId;
            //   tokenURIResult = "https://api.reservoir.tools/tokens/v7?tokens=" + contract + "%3A" + tokenId + "&includeAttributes=true";
            } else {
              if (contractType == "erc721") {
                const interface = new ethers.Contract(contract, ERC721ABI, provider);
                tokenURIResult = await interface.tokenURI(tokenId);
              } else if (contractType == "erc1155") {
                const interface = new ethers.Contract(contract, ERC1155ABI, provider);
                tokenURIResult = await interface.uri(tokenId);
                // console.log("ERC-1155 tokenURIResult: " + tokenURIResult);
              }
            }
            console.log("FIRST: " + contract + "/" + tokenId + " => " + JSON.stringify(tokenURIResult));
            let name = null;
            let description = null;
            let attributes = null;
            let imageSource = null;
            let image = null;
            let expiry = null;
            let expired = false;
            if (tokenURIResult && tokenURIResult.substring(0, 29) == "data:application/json;base64,") {
              const decodedJSON = atob(tokenURIResult.substring(29));
              const data = JSON.parse(decodedJSON);
              name = data.name || undefined;
              description = data.description || undefined;
              attributes = data.attributes || {};
              image = data.image || undefined;
              context.commit('addTokenMetadata', {
                chainId: parameter.chainId,
                contract,
                tokenId,
                name,
                description,
                image,
                attributes,
              });
            } else if (tokenURIResult && (tokenURIResult.substring(0, 7) == "ipfs://" || tokenURIResult.substring(0, 8) == "https://")) {
              let metadataFile = null;
              if (tokenURIResult.substring(0, 12) == "ipfs://ipfs/") {
                metadataFile = "https://ipfs.io/" + tokenURIResult.substring(7)
              } else if (tokenURIResult.substring(0, 7) == "ipfs://") {
                metadataFile = "https://ipfs.io/ipfs/" + tokenURIResult.substring(7);
              } else {
                metadataFile = tokenURIResult;
              }
              // let metadataFile = tokenURIResult.substring(0, 7) == "ipfs://" ? ("https://ipfs.io/ipfs/" + tokenURIResult.substring(7)) : tokenURIResult;
              console.log("metadataFile: " + metadataFile + ", tokenURIResult: " + tokenURIResult);

              // console.log("metadataFile: " + JSON.stringify(metadataFile, null, 2));
              if (contractType == "erc1155") {
                // console.log("ERC-1155 metadataFile BEFORE: " + JSON.stringify(metadataFile, null, 2));
                metadataFile = metadataFile.replace(/0x{id}/, tokenId);
                // console.log("ERC-1155 metadataFile AFTER: " + JSON.stringify(metadataFile, null, 2));
              }
              try {
                const metadataFileContent = await fetch(metadataFile, {mode: 'cors'}).then(response => response.json());
                console.log("metadataFile: " + metadataFile + " => " + JSON.stringify(metadataFileContent, null, 2));

                if (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || contract == ENS_NAMEWRAPPER_ADDRESS) {
                  if (metadataFileContent && metadataFileContent.message) {
                    // metadataFileContent: {
                    //   "message": "'©god.eth' is already been expired at Fri, 29 Sep 2023 06:31:14 GMT."
                    // }
                    // console.log("EXPIRED: " + metadataFileContent.message);
                    let inputString;
                    [inputString, name, expiryString] = metadataFileContent.message.match(/'(.*)'.*at\s(.*)\./) || [null, null, null]
                    expiry = moment.utc(expiryString).unix();
                    console.log("EXPIRED - name: '" + name + "', expiryString: '" + expiryString + "', expiry: " + expiry);
                    expired = true;
                    context.commit('addTokenMetadata', {
                      chainId: parameter.chainId,
                      contract,
                      tokenId,
                      created: null,
                      registration: null,
                      expiry,
                      name: name,
                      description: "Expired '" + name + "'",
                      image: null,
                      attributes: [],
                    });
                  } else { // if (metadataFileContent && metadataFileContent.attributes) {
                    if (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS) {
                      const createdRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Created Date");
                      created = createdRecord.length == 1 && createdRecord[0].value / 1000 || null;
                      const registrationRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Registration Date");
                      registration = registrationRecord.length == 1 && registrationRecord[0].value / 1000 || null;
                      const expiryRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Expiration Date");
                      expiry = expiryRecord.length == 1 && expiryRecord[0].value / 1000 || null;
                      const attributes = metadataFileContent.attributes || [];
                      attributes.sort((a, b) => {
                        return ('' + a.trait_type).localeCompare(b.trait_type);
                      });
                      context.commit('addTokenMetadata', {
                        chainId: parameter.chainId,
                        contract,
                        tokenId,
                        created,
                        registration,
                        expiry,
                        name: metadataFileContent.name || null,
                        description: metadataFileContent.name || null,
                        image: metadataFileContent.image || null,
                        attributes,
                      });
                    } else if (contract == ENS_NAMEWRAPPER_ADDRESS) {
                      const createdRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Created Date");
                      created = createdRecord.length == 1 && createdRecord[0].value / 1000 || null;
                      const expiryRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Namewrapper Expiry Date");
                      expiry = expiryRecord.length == 1 && expiryRecord[0].value / 1000 || null;
                      const attributes = metadataFileContent.attributes || [];
                      attributes.sort((a, b) => {
                        return ('' + a.trait_type).localeCompare(b.trait_type);
                      });
                      context.commit('addTokenMetadata', {
                        chainId: parameter.chainId,
                        contract,
                        tokenId,
                        created,
                        expiry,
                        name: metadataFileContent.name || null,
                        description: metadataFileContent.name || null,
                        image: metadataFileContent.image || null,
                        attributes,
                      });
                    }
                  }
                } else {
                  console.log("NON-ENS");
                  const attributes = metadataFileContent.attributes || [];
                  attributes.sort((a, b) => {
                    return ('' + a.trait_type).localeCompare(b.trait_type);
                  });
                  const image = metadataFileContent.image || null;
                  console.log(contract + "/" + tokenId + " => " + image);
                  context.commit('addTokenMetadata', {
                    chainId: parameter.chainId,
                    contract,
                    tokenId,
                    name: metadataFileContent.name || null,
                    description: metadataFileContent.name || null,
                    image: metadataFileContent.image || null,
                    attributes,
                  });
                }
              } catch (e1) {
                console.error(e1.message);
              }
            }
          } catch (e) {
            console.error(e.message);
          }
          completed++;
          if ((completed % 10) == 0) {
            await context.dispatch('saveData', ['prices']);
          }
          if (context.state.sync.halt) {
            break;
          }
        }
        if (context.state.sync.halt) {
          break;
        }
      }
      await context.dispatch('saveData', ['prices']);
      logInfo("dataModule", "actions.syncTokenMetadataOld END");
    },

    // async syncENS(context, parameter) {
    //   logInfo("dataModule", "actions.syncENS BEGIN: " + JSON.stringify(parameter));
    //   const db = new Dexie(context.state.db.name);
    //   db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //
    //   let rows = 0;
    //   let done = false;
    //
    //   return;
    //
    //   let collection = null;
    //   const tokens = {};
    //   const owners = {};
    //   do {
    //     let data = await db.tokens.where('[chainId+contract+tokenId]').between([parameter.chainId, context.state.selectedCollection, Dexie.minKey],[parameter.chainId, context.state.selectedCollection, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
    //     logInfo("dataModule", "actions.syncENS - tokens - data.length: " + data.length + ", first[0..1]: " + JSON.stringify(data.slice(0, 2).map(e => e.contract + '/' + e.tokenId )));
    //     for (const item of data) {
    //       if (!(item.owner in owners)) {
    //         owners[item.owner] = [];
    //       }
    //       owners[item.owner].push(item.tokenId);
    //     }
    //     rows = parseInt(rows) + data.length;
    //     done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
    //   } while (!done);
    //   // console.log("owners: " + JSON.stringify(owners, null, 2));
    //
    //   context.commit('setSyncSection', { section: "ENS", total: Object.keys(owners).length });
    //   let completed = 0;
    //
    //   const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
    //   const addresses = Object.keys(owners);
    //   const ENSOWNERBATCHSIZE = 25; // Can do 200, but incorrectly misconfigured reverse ENS causes the whole call to fail
    //   for (let i = 0; i < addresses.length; i += ENSOWNERBATCHSIZE) {
    //     const batch = addresses.slice(i, parseInt(i) + ENSOWNERBATCHSIZE);
    //     try {
    //       const allnames = await ensReverseRecordsContract.getNames(batch);
    //       for (let j = 0; j < batch.length; j++) {
    //         const address = batch[j];
    //         const name = allnames[j];
    //         // const normalized = normalize(address);
    //         if (name) {
    //           console.log(address + " => " + name);
    //           context.commit('setENS', { address, name });
    //         }
    //       }
    //     } catch (e) {
    //       for (let j = 0; j < batch.length; j++) {
    //         try {
    //           const address = batch[j];
    //           const allnames = await ensReverseRecordsContract.getNames([address]);
    //           const name = allnames[0];
    //           if (name) {
    //             console.log(address + " => " + name);
    //             context.commit('setENS', { address, name });
    //           }
    //         } catch (e1) {
    //           console.log("Error - address: " + batch[j] + ", message: " + e1.message);
    //         }
    //       }
    //     }
    //     completed += batch.length;
    //     context.commit('setSyncCompleted', completed);
    //   }
    //   console.log("context.state.ens: " + JSON.stringify(context.state.ens, null, 2));
    //   context.dispatch('saveData', ['ens']);
    // },

    // async syncImportExchangeRates(context, parameter) {
    //   const reportingCurrency = store.getters['config/settings'].reportingCurrency;
    //   logInfo("dataModule", "actions.syncImportExchangeRates - reportingCurrency: " + reportingCurrency);
    //   const MAXDAYS = 2000;
    //   const MINDATE = moment("2015-07-30");
    //   let toTs = moment();
    //   const results = {};
    //   while (toTs.year() >= 2015) {
    //     let days = toTs.diff(MINDATE, 'days');
    //     if (days > MAXDAYS) {
    //       days = MAXDAYS;
    //     }
    //     let url = "https://min-api.cryptocompare.com/data/v2/histoday?fsym=ETH&tsym=" + reportingCurrency + "&toTs=" + toTs.unix() + "&limit=" + days;
    //     if (parameter.cryptoCompareAPIKey) {
    //       url = url + "&api_key=" + parameter.cryptoCompareAPIKey;
    //     }
    //     console.log(url);
    //     const data = await fetch(url)
    //       .then(response => response.json())
    //       .catch(function(e) {
    //         console.log("error: " + e);
    //       });
    //     for (day of data.Data.Data) {
    //       results[moment.unix(day.time).format("YYYYMMDD")] = day.close;
    //     }
    //     toTs = moment(toTs).subtract(MAXDAYS, 'days');
    //   }
    //   context.commit('setExchangeRates', results);
    //   context.dispatch('saveData', ['exchangeRates']);
    // },

    // async syncRefreshENS(context, parameter) {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
    //   const addresses = Object.keys(context.state.accounts);
    //   const ENSOWNERBATCHSIZE = 200; // Can do 200, but incorrectly misconfigured reverse ENS causes the whole call to fail
    //   for (let i = 0; i < addresses.length; i += ENSOWNERBATCHSIZE) {
    //     const batch = addresses.slice(i, parseInt(i) + ENSOWNERBATCHSIZE);
    //     const allnames = await ensReverseRecordsContract.getNames(batch);
    //     for (let j = 0; j < batch.length; j++) {
    //       const account = batch[j];
    //       const name = allnames[j];
    //       // const normalized = normalize(account);
    //       // console.log(account + " => " + name);
    //       context.commit('addENSName', { account, name });
    //     }
    //   }
    //   context.dispatch('saveData', ['ensMap']);
    // },
    // Called by Connection.execWeb3()
    async execWeb3({ state, commit, rootState }, { count, listenersInstalled }) {
      logInfo("dataModule", "execWeb3() start[" + count + ", " + listenersInstalled + ", " + JSON.stringify(rootState.route.params) + "]");
    },
  },
};
