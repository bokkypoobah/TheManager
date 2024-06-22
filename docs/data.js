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
          <b-col cols="5" class="small px-1 text-right">Names:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ totalNames }}</b-col>
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
    tokens() {
      return store.getters['data/tokens'];
    },
    totalNames() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [address, data] of Object.entries(this.tokens[this.chainId] || {})) {
        result += Object.keys(data.tokenIds).length;
      }
      return result;
    },
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
    DB_PROCESSING_BATCH_SIZE: 123456,
    addresses: {}, // Address => Info

    collection: {}, // chainId -> contract => { id, symbol, name, image, slug, creator, tokenCount }
    tokens: {}, // chainId -> contract -> tokenId => owner or balances
    metadata: {}, // chainId -> contract -> tokenId => owner or balances
    contractMetadata: {}, // chainId -> contract => metadata
    prices: {}, // chainId -> contract -> tokenId => metadata
    tokenInfo: {}, // chainId -> contract -> tokenId => info
    timestamps: {}, // chainId -> blockNumber => timestamp
    names: {}, // name -> data
    txs: {}, // txHash => tx & txReceipt

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
      name: "onlyfensdata080d",
      version: 1,
      schemaDefinition: {
        events: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations,[type+blockNumber]',
        registrations: '[chainId+blockNumber+logIndex],[label+blockNumber+logIndex],confirmations',
        cache: '&objectName',
      },
      updated: null,
    },
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
    names: state => state.names,
    txs: state => state.txs,

    ens: state => state.ens,
    exchangeRates: state => state.exchangeRates,
    forceRefresh: state => state.forceRefresh,
    sync: state => state.sync,
    db: state => state.db,
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
      let type = null;
      let mine = false;
      address = ethers.utils.getAddress(newAccount.address);
      mine = newAccount.mine;
      console.log("address: " + address);
      if (address in state.addresses) {
        Vue.set(state.addresses[address], 'mine', mine);
        Vue.set(state.addresses[address], 'process', newAccount.process);
        Vue.set(state.addresses[address], 'name', newAccount.name);
      } else {
          Vue.set(state.addresses, address, {
            mine,
            process: newAccount.process,
            name: newAccount.name,
          });
      }
      logInfo("dataModule", "mutations.addNewAddress AFTER - state.accounts: " + JSON.stringify(state.accounts, null, 2));
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
    addPrice(state, priceData) {
      logInfo("dataModule", "mutations.addPrice priceData: " + priceData.name);
      if (!(priceData.chainId in state.prices)) {
        Vue.set(state.prices, priceData.chainId, {});
      }
      const contract = ethers.utils.getAddress(priceData.contract);
      if (!(contract in state.prices[priceData.chainId])) {
        Vue.set(state.prices[priceData.chainId], contract, {});
      }
      Vue.set(state.prices[priceData.chainId][priceData.contract], priceData.tokenId, {
        name: priceData.name,
        description: priceData.description,
        image: priceData.image,
        created: priceData.created,
        registration: priceData.registration,
        expiry: priceData.expiry,
        lastSale: priceData.lastSale,
        price: priceData.price,
        topBid: priceData.topBid,
        attributes: [
          { trait_type: "Character Set", value: priceData.characterSet },
          { trait_type: "Length", value: priceData.length },
          { trait_type: "Segment Length", value: priceData.segmentLength },
          { trait_type: "Created", value: priceData.created },
          { trait_type: "Registration", value: priceData.registration },
          { trait_type: "Expiry", value: priceData.expiry },
        ],
      });
      // console.log("state.prices[chainId][contract][tokenId]: " + JSON.stringify(state.prices[priceData.chainId][priceData.contract][priceData.tokenId], null, 2));
    },
    addTimestamp(state, info) {
      logInfo("dataModule", "mutations.addTimestamp: " + info.blockNumber + " => " + moment.unix(info.timestamp).format());
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
        for (let type of ['addresses', 'timestamps', 'prices', 'tokenInfo', 'metadata', 'tokens', 'names']) {
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
    async toggleTokenJunk(context, token) {
      logInfo("dataModule", "actions.toggleTokenJunk - token: " + JSON.stringify(token));
      await context.commit('toggleTokenJunk', token);
      await context.dispatch('saveData', ['tokenInfo']);
    },
    async addPrice(context, info) {
      logInfo("dataModule", "actions.addPrice - info: " + JSON.stringify(info, null, 2));
      context.commit('addPrice', info);
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
          const priceData = parseReservoirTokenData(token);
          console.log("priceData: " + JSON.stringify(priceData, null, 2));
          context.commit('addPrice', priceData);
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
      await db.cache.clear();
      await db.events.clear();
      db.close();
    },
    async addNewAddress(context, newAddress) {
      logInfo("dataModule", "actions.addNewAddress - newAddress: " + JSON.stringify(newAddress, null, 2) + ")");
      context.commit('addNewAddress', newAddress);
      await context.dispatch('saveData', ['addresses']);
    },

    async syncIt(context, options) {
      logInfo("dataModule", "actions.syncIt - options: " + JSON.stringify(options, null, 2));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const block = await provider.getBlock();
      const confirmations = 100;
      const blockNumber = block && block.number || null;
      const chainId = store.getters['connection/chainId'];
      const coinbase = store.getters['connection/coinbase'];
      const parameter = { chainId, coinbase, blockNumber, confirmations, ...options };

      if (options.transfers && !options.devThing) {
        await context.dispatch('syncTransfers', parameter);
      }
      if (options.transfers && !options.devThing) {
        await context.dispatch('collateTokens', parameter);
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
      if (options.timestamps && !options.devThing) {
        await context.dispatch('syncEventTimestamps', parameter);
      }
      // if (options.searchDatabase && !options.devThing) {
      //   await context.dispatch('syncSearchDatabase', parameter);
      // }
      // if (options.searchDatabase || options.devThing) {
      //   await context.dispatch('collateSearchDatabase', parameter);
      // }

      // if (options.ens || options.devThing) {
      //   await context.dispatch('syncENS', parameter);
      // }
      // if (options.devThing) {
      //   console.log("Dev Thing");
      // }

      // TODO: Delete context.dispatch('saveData', ['addresses']);
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

      // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
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
                const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                eventRecord = { type: "Transfer", from, to, tokenId, eventType: "erc721" };
              }
            } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
              if (log.topics.length == 4) {
                const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const approved = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                eventRecord = { type: "Approval", owner, approved, tokenId, eventType: "erc721" };
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
        if (address.substring(0, 2) == "0x" && addressData.process) {
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
        if (address.substring(0, 2) == "0x" && addressData.process) {
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
            tokens[item.contract] = {
              type: item.eventType,
              tokenIds: {},
            };
          }
          if (item.eventType == "erc721" && item.type == "Transfer") {
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

    async syncENSEvents(context, parameter) {
      logInfo("dataModule", "actions.syncENSEvents: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const oldETHRegistarControllerInterface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER_ABI);
      const ethRegistarControllerInterface = new ethers.utils.Interface(ENS_ETHREGISTRARCONTROLLER_ABI);

      // 925.eth ERC-721 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:53835211818918528779359817553631021141919078878710948845228773628660104698081
      // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires) 0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f
      //   [ '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', namehash, null ],
      // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires) 0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae
      //   [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', namehash, null ],
      // TODO: How to access AddressChanged and other ENS attribute changes
      // Need `node` - ENS: Public Resolver 2 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41 AddressChanged (index_topic_1 bytes32 node, uint256 coinType, bytes newAddress) 0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752
      //   [ '0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752', namehash, null ],
      // Need `node` - ENS: Public Resolver 2 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41 AddrChanged (index_topic_1 bytes32 node, address a) 0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2
      //   [ '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2', namehash, null ],
      let total = 0;
      let t = this;
      async function processLogs(logs) {
        total = parseInt(total) + logs.length;
        context.commit('setSyncCompleted', total);
        logInfo("dataModule", "actions.syncENSEvents.processLogs - logs.length: " + logs.length + ", total: " + total);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            const contract = log.address;
            let eventRecord = null;
            if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f" && contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
              // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              const [name, label, owner, cost, expires] = logData.args;
              eventRecord = { type: "NameRegistered", name, label, owner, cost: cost.toString(), expires: parseInt(expires) };
            } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
              // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              const [name, label, cost, expires] = logData.args;
              eventRecord = { type: "NameRenewed", name, label, cost: cost.toString(), expires: parseInt(expires) };
            } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_ETHREGISTRARCONTROLLER_ADDRESS) {
              // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              const logData = ethRegistarControllerInterface.parseLog(log);
              const [name, label, cost, expires] = logData.args;
              eventRecord = { type: "NameRenewed", name, label, cost: cost.toString(), expires: parseInt(expires) };
            } else {
              console.log("NOT HANDLED: " + JSON.stringify(log));
            }
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
          // logInfo("dataModule", "actions.syncENSEvents.bulkAdd - records: " + JSON.stringify(records));
          await db.events.bulkAdd(records).then(function(lastKey) {
            console.log("syncENSEvents.bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log("syncENSEvents.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
        }
      }

      logInfo("dataModule", "actions.syncENSEvents BEGIN");
      let tokensToProcess = [];
      for (const [contract, contractData] of Object.entries(context.state.tokens[parameter.chainId] || {})) {
        if (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS) {
          for (const [tokenId, tokenData] of Object.entries(contractData.tokenIds)) {
            tokensToProcess.push({ contract, tokenId });
          }
        }
      }
      const BATCHSIZE = 100;
      context.commit('setSyncSection', { section: 'ENS Events', total: null });
      context.commit('setSyncCompleted', 0);
      for (let i = 0; i < tokensToProcess.length && !context.state.sync.halt; i += BATCHSIZE) {
        const tokenIds = tokensToProcess.slice(i, parseInt(i) + BATCHSIZE).map(a => "0x" + ethers.BigNumber.from(a.tokenId).toHexString().slice(2).padStart(64, '0'));
        try {
          let topics = [[
              '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f',
              '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae',
              // Need `node` '0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752',
              // Need `node` '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2',
            ],
            tokenIds,
            null,
          ];
          const logs = await provider.getLogs({ address: null, fromBlock: 0, toBlock: parameter.blockNumber, topics });
          await processLogs(logs);
        } catch (e) {
          logInfo("dataModule", "actions.syncENSEvents - getLogs ERROR: " + e.message);
        }
      }
      logInfo("dataModule", "actions.syncENSEvents END");
    },

    async syncWrappedENSEvents(context, parameter) {
      logInfo("dataModule", "actions.syncWrappedENSEvents: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const nameWrapperInterface = new ethers.utils.Interface(ENS_NAMEWRAPPER_ABI);

      // ERC-1155 portraits.eth 27727362303445643037535452095569739813950020376856883309402147522300287323280
      // ERC-1155 yourmum.lovesyou.eth 57229065116737680790555199455465332171886850449809000367294662727325932836690
      // - ENS: Name Wrapper 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401 NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry) 0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340
      //   [ '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', namehash, null ],
      let total = 0;
      let t = this;
      async function processLogs(logs) {
        total = parseInt(total) + logs.length;
        context.commit('setSyncCompleted', total);
        logInfo("dataModule", "actions.syncWrappedENSEvents.processLogs - logs.length: " + logs.length + ", total: " + total);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            const contract = log.address;
            let eventRecord = null;
            if (log.topics[0] == "0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340" && contract == ENS_NAMEWRAPPER_ADDRESS) {
              // NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
              const logData = nameWrapperInterface.parseLog(log);
              const [node, name, owner, fuses, expiry] = logData.args;
              let parts = decodeNameWrapperBytes(name);
              let nameString = parts.join(".");
              let label = null;
              let labelhash = null;
              let labelhashDecimals = null;
              if (parts.length >= 2 && parts[parts.length - 1] == "eth") {
                label = parts[parts.length - 2];
                labelhash = ethers.utils.solidityKeccak256(["string"], [label]);
                labelhashDecimals = ethers.BigNumber.from(labelhash).toString();
              }
              const namehashDecimals = ethers.BigNumber.from(node).toString();
              const subdomain = parts.length >= 3 && parts[parts.length - 3] || null;
              eventRecord = { type: "NameWrapped", namehash: node, name: nameString, label, labelhash, subdomain, owner, fuses, expiry: parseInt(expiry) };
              // console.log(JSON.stringify(eventRecord, null, 2));
            } else {
              console.log("NOT HANDLED: " + JSON.stringify(log));
            }
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
          // logInfo("dataModule", "actions.syncWrappedENSEvents.bulkAdd - records: " + JSON.stringify(records));
          await db.events.bulkAdd(records).then(function(lastKey) {
            console.log("syncWrappedENSEvents.bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log("syncWrappedENSEvents.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
        }
      }

      logInfo("dataModule", "actions.syncWrappedENSEvents BEGIN");
      let tokensToProcess = [];
      for (const [contract, contractData] of Object.entries(context.state.tokens[parameter.chainId] || {})) {
        if (contract == ENS_NAMEWRAPPER_ADDRESS) {
          for (const [tokenId, tokenData] of Object.entries(contractData.tokenIds)) {
            tokensToProcess.push({ contract, tokenId });
          }
        }
      }
      const BATCHSIZE = 100;
      context.commit('setSyncSection', { section: 'Wrapped ENS Events', total: null });
      context.commit('setSyncCompleted', 0);
      for (let i = 0; i < tokensToProcess.length && !context.state.sync.halt; i += BATCHSIZE) {
        const tokenIds = tokensToProcess.slice(i, parseInt(i) + BATCHSIZE).map(a => "0x" + ethers.BigNumber.from(a.tokenId).toHexString().slice(2).padStart(64, '0'));
        try {
          let topics = null;
          topics = [[
              '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340',
            ],
            tokenIds,
            null,
          ];
          const logs = await provider.getLogs({ address: null, fromBlock: 0, toBlock: parameter.blockNumber, topics });
          // console.log("logs: " + JSON.stringify(logs, null, 2));
          await processLogs(logs);
        } catch (e) {
          logInfo("dataModule", "actions.syncWrappedENSEvents - getLogs ERROR: " + e.message);
        }
      }
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
        if (address.substring(0, 2) == "0x" && addressData.process) {
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
          } else if (item.type == "NameRenewed" && (item.contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS || item.contract == ENS_ETHREGISTRARCONTROLLER_ADDRESS)) {
            const contract = ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS;
            const tokenId = ethers.BigNumber.from(item.label);
            if (metadata[item.chainId] && metadata[item.chainId][contract] && (tokenId in metadata[item.chainId][contract])) {
              metadata[item.chainId][contract][tokenId].registered = item.blockNumber;
              metadata[item.chainId][contract][tokenId].expiry = item.expires;
              metadata[item.chainId][contract][tokenId].events.push(item);
            } else {
              // console.log("NOT Found NameRenewed: " + JSON.stringify(item, null, 2));
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
              // console.log("NOT Found NameRenewed - after: " + JSON.stringify(metadata[item.chainId][contract][tokenId], null, 2));
            }
          } else if (["Transfer", "TransferSingle", "TransferBatch"].includes(item.type)) {
            //
          } else if (["ApprovalForAll"].includes(item.type)) {
            //
          } else {
            console.log("Unhandled: " + item.type + " " + JSON.stringify(item, null,  2));
          }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      // console.log("metadata: " + JSON.stringify(metadata, null, 2));
      context.commit('setState', { name: "metadata", data: metadata });
      await context.dispatch('saveData', ['metadata']);
      logInfo("dataModule", "actions.collateMetadata END");
    },

    async syncPrices(context, parameter) {
      logInfo("dataModule", "actions.syncPrices: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokensToProcess = [];
      for (const [contract, contractData] of Object.entries(context.state.tokens[parameter.chainId] || {})) {
        if (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || contract == ENS_NAMEWRAPPER_ADDRESS) {
          for (const [tokenId, tokenData] of Object.entries(contractData.tokenIds)) {
            tokensToProcess.push({ contract, tokenId });
          }
        }
      }
      // console.log("tokensToProcess: " + JSON.stringify(tokensToProcess, null, 2));
      const BATCHSIZE = 50;
      const DELAYINMILLIS = 2000;
      let completed = 0;
      context.commit('setSyncSection', { section: 'Token Metadata', total: tokensToProcess.length });
      context.commit('setSyncCompleted', completed);
      for (let i = 0; i < tokensToProcess.length && !context.state.sync.halt; i += BATCHSIZE) {
        const batch = tokensToProcess.slice(i, parseInt(i) + BATCHSIZE);
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
          for (token of data.tokens) {
            const priceData = parseReservoirTokenData(token);
            // if (/*priceData.created == null ||*/ priceData.expiry == null && false) {
            //   const url = "https://metadata.ens.domains/mainnet/" + priceData.contract + "/" + priceData.tokenId;
            //   const metadataFileContent = await fetch(url, {mode: 'cors'}).then(response => response.json());
            //   const createdRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Created Date");
            //   console.log("createdRecord: " + JSON.stringify(createdRecord));
            //   if (createdRecord.length == 1 && createdRecord[0].value) {
            //     priceData.created = parseInt(createdRecord[0].value) / 1000;
            //   }
            //   const registrationRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Registration Date");
            //   console.log("registrationRecord: " + JSON.stringify(registrationRecord));
            //   if (registrationRecord.length == 1 && registrationRecord[0].value) {
            //     priceData.registration = parseInt(registrationRecord[0].value) / 1000;
            //   }
            //   const expiryRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Expiration Date");
            //   console.log("expiryRecord: " + JSON.stringify(expiryRecord));
            //   if (expiryRecord.length == 1 && expiryRecord[0].value) {
            //     priceData.expiry = parseInt(expiryRecord[0].value) / 1000;
            //   }
            // }
            // console.log("priceData: " + JSON.stringify(priceData, null, 2));
            context.commit('addPrice', priceData);
            completed++;
          }
          context.commit('setSyncCompleted', completed);
          await context.dispatch('saveData', ['prices']);
          await delay(DELAYINMILLIS);
        } while (continuation != null && !context.state.sync.halt);
      }
    },

    async syncEventTimestamps(context, parameter) {
      logInfo("dataModule", "actions.syncEventTimestamps: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let rows = 0;
      let done = false;
      const existingTimestamps = context.state.timestamps[parameter.chainId] || {};
      const newBlocks = {};
      do {
        let data = await db.events.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncEventTimestamps - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (!(item.blockNumber in existingTimestamps) && !(item.blockNumber in newBlocks)) {
            newBlocks[item.blockNumber] = true;
          }
        }
        rows += data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      const total = Object.keys(newBlocks).length;
      logInfo("dataModule", "actions.syncEventTimestamps - total: " + total);
      context.commit('setSyncSection', { section: 'Event Timestamps', total });
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
      logInfo("dataModule", "actions.syncEventTimestamps END");
    },

    // async syncSearchDatabase(context, parameter) {
    //   logInfo("dataModule", "actions.syncSearchDatabase: " + JSON.stringify(parameter));
    //   const db = new Dexie(context.state.db.name);
    //   db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);
    //
    //   const oldETHRegistarController1Interface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER1_ABI);
    //   const oldETHRegistarController2Interface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER2_ABI);
    //   const oldETHRegistarControllerInterface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER_ABI);
    //   const ethRegistarControllerInterface = new ethers.utils.Interface(ENS_ETHREGISTRARCONTROLLER_ABI);
    //   const nameWrapperInterface = new ethers.utils.Interface(ENS_NAMEWRAPPER_ABI);
    //
    //   // ENS: Old ETH Registrar Controller 1 @ 0xF0AD5cAd05e10572EfcEB849f6Ff0c68f9700455 deployed Apr-30-2019 03:54:13 AM +UTC
    //   // ENS: Old ETH Registrar Controller 2 @ 0xB22c1C159d12461EA124b0deb4b5b93020E6Ad16 deployed Nov-04-2019 12:43:55 AM +UTC
    //   // ENS: Old ETH Registrar Controller @ 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 deployed Jan-30-2020 12:56:38 AM +UTC
    //   // ENS: ETH Registrar Controller @ 0x253553366Da8546fC250F225fe3d25d0C782303b deployed Mar-28-2023 11:44:59 AM +UTC
    //
    //   // 925.eth ERC-721 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:53835211818918528779359817553631021141919078878710948845228773628660104698081
    //   // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires) 0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f
    //   //   [ '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', namehash, null ],
    //   // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires) 0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae
    //   //   [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', namehash, null ],
    //
    //   // ERC-1155 portraits.eth 27727362303445643037535452095569739813950020376856883309402147522300287323280
    //   // ERC-1155 yourmum.lovesyou.eth 57229065116737680790555199455465332171886850449809000367294662727325932836690
    //   // - ENS: Name Wrapper 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401 NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry) 0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340
    //   //   [ '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', namehash, null ],
    //   // NameUnwrapped (index_topic_1 bytes32 node, address owner) 0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4
    //
    //   let total = 0;
    //   let t = this;
    //   async function processLogs(fromBlock, toBlock, logs) {
    //     total = parseInt(total) + logs.length;
    //     context.commit('setSyncCompleted', total);
    //     logInfo("dataModule", "actions.syncSearchDatabase.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length + ", total: " + total);
    //     const records = [];
    //     for (const log of logs) {
    //       // console.log("log: " + JSON.stringify(log));
    //       if (!log.removed) {
    //         const contract = log.address;
    //         let eventRecord = null;
    //         if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f" && contract == ENS_OLDETHREGISTRARCONTROLLER1_ADDRESS) {
    //           // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
    //           const logData = oldETHRegistarController1Interface.parseLog(log);
    //           const [name, label, owner, cost, expires] = logData.args;
    //           eventRecord = { type: "NameRegistered", name, label, owner, cost: cost.toString(), expires: parseInt(expires) };
    //         } else if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f" && contract == ENS_OLDETHREGISTRARCONTROLLER2_ADDRESS) {
    //           // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
    //           const logData = oldETHRegistarControllerInterface.parseLog(log);
    //           const [name, label, owner, cost, expires] = logData.args;
    //           eventRecord = { type: "NameRegistered", name, label, owner, cost: cost.toString(), expires: parseInt(expires) };
    //         } else if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f" && contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
    //           // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
    //           const logData = oldETHRegistarControllerInterface.parseLog(log);
    //           const [name, label, owner, cost, expires] = logData.args;
    //           eventRecord = { type: "NameRegistered", name, label, owner, cost: cost.toString(), expires: parseInt(expires) };
    //         } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_OLDETHREGISTRARCONTROLLER1_ADDRESS) {
    //           // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
    //           const logData = oldETHRegistarControllerInterface.parseLog(log);
    //           const [name, label, cost, expires] = logData.args;
    //           eventRecord = { type: "NameRenewed", name, label, cost: cost.toString(), expires: parseInt(expires) };
    //         } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_OLDETHREGISTRARCONTROLLER2_ADDRESS) {
    //           // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
    //           const logData = oldETHRegistarControllerInterface.parseLog(log);
    //           const [name, label, cost, expires] = logData.args;
    //           eventRecord = { type: "NameRenewed", name, label, cost: cost.toString(), expires: parseInt(expires) };
    //         } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
    //           // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
    //           const logData = oldETHRegistarControllerInterface.parseLog(log);
    //           const [name, label, cost, expires] = logData.args;
    //           eventRecord = { type: "NameRenewed", name, label, cost: cost.toString(), expires: parseInt(expires) };
    //         } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_ETHREGISTRARCONTROLLER_ADDRESS) {
    //           // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
    //           const logData = ethRegistarControllerInterface.parseLog(log);
    //           const [name, label, cost, expires] = logData.args;
    //           eventRecord = { type: "NameRenewed", name, label, cost: cost.toString(), expires: parseInt(expires) };
    //         } else if (log.topics[0] == "0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340" && contract == ENS_NAMEWRAPPER_ADDRESS) {
    //           // NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
    //           const logData = nameWrapperInterface.parseLog(log);
    //           const [node, name, owner, fuses, expiry] = logData.args;
    //           let parts = decodeNameWrapperBytes(name);
    //           let nameString = parts.join(".");
    //           let label = null;
    //           let labelhash = null;
    //           let labelhashDecimals = null;
    //           if (parts.length >= 2 && parts[parts.length - 1] == "eth") {
    //             label = parts[parts.length - 2];
    //             labelhash = ethers.utils.solidityKeccak256(["string"], [label]);
    //             labelhashDecimals = ethers.BigNumber.from(labelhash).toString();
    //           }
    //           const namehashDecimals = ethers.BigNumber.from(node).toString();
    //           const subdomain = parts.length >= 3 && parts[parts.length - 3] || null;
    //           eventRecord = { type: "NameWrapped", namehash: node, name: nameString, label, labelhash, subdomain, owner, fuses, expiry: parseInt(expiry) };
    //           // console.log(JSON.stringify(eventRecord, null, 2));
    //         } else if (log.topics[0] == "0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4" && contract == ENS_NAMEWRAPPER_ADDRESS) {
    //           // NameUnwrapped (index_topic_1 bytes32 node, address owner)
    //           const logData = nameWrapperInterface.parseLog(log);
    //           const [node, owner] = logData.args;
    //           eventRecord = { type: "NameUnwrapped", namehash: node, owner };
    //         } else if (log.topics[0] == "0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340" && contract == "0x2411C98CC59D88e13Cc9CbFc576F7D40828aC47c") {
    //           console.log("IGNORING: " + JSON.stringify(log));
    //         } else {
    //           console.log("NOT HANDLED: " + JSON.stringify(log));
    //         }
    //         // if (eventRecord && (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || contract == ENS_NAMEWRAPPER_ADDRESS)) {
    //         if (eventRecord) {
    //           records.push( {
    //             chainId: parameter.chainId,
    //             blockNumber: parseInt(log.blockNumber),
    //             logIndex: parseInt(log.logIndex),
    //             txIndex: parseInt(log.transactionIndex),
    //             txHash: log.transactionHash,
    //             contract,
    //             ...eventRecord,
    //             confirmations: parameter.blockNumber - log.blockNumber,
    //           });
    //         }
    //       }
    //     }
    //     if (records.length) {
    //       await db.registrations.bulkAdd(records).then(function(lastKey) {
    //         console.log("syncSearchDatabase.bulkAdd lastKey: " + JSON.stringify(lastKey));
    //       }).catch(Dexie.BulkError, function(e) {
    //         console.log("syncSearchDatabase.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
    //       });
    //     }
    //   }
    //   async function getLogs(fromBlock, toBlock, processLogs) {
    //     logInfo("dataModule", "actions.syncSearchDatabase.getLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock);
    //     try {
    //       const topics = [[
    //           '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f',
    //           '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae',
    //           '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340',
    //           '0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4',
    //         ],
    //         null,
    //         null
    //       ];
    //       if (total < 1000000 && !context.state.sync.halt) {
    //         const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
    //         await processLogs(fromBlock, toBlock, logs);
    //       }
    //     } catch (e) {
    //       logInfo("dataModule", "actions.syncSearchDatabase.getLogs - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
    //       const mid = parseInt((fromBlock + toBlock) / 2);
    //       await getLogs(fromBlock, mid, processLogs);
    //       await getLogs(parseInt(mid) + 1, toBlock, processLogs);
    //     }
    //   }
    //
    //   logInfo("dataModule", "actions.syncSearchDatabase BEGIN");
    //   context.commit('setSyncSection', { section: 'NameRegistered Events', total: null });
    //
    //   const deleteCall = await db.registrations.where("confirmations").below(parameter.confirmations).delete();
    //   const latest = await db.registrations.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).last();
    //   // const startBlock = (parameter.incrementalSync && latest) ? parseInt(latest.blockNumber) + 1: 0;
    //   // const startBlock = 0;
    //   const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
    //   console.log("startBlock: " + startBlock);
    //   await getLogs(startBlock, parameter.blockNumber, processLogs);
    //
    //   // const fromBlock = 9456662;
    //   // const toBlock = 9456764;
    //   // await getLogs(fromBlock, toBlock, processLogs);
    //
    //   logInfo("dataModule", "actions.syncSearchDatabase END");
    // },

    // async collateSearchDatabase(context, parameter) {
    //   logInfo("dataModule", "actions.collateSearchDatabase: " + JSON.stringify(parameter));
    //   const db = new Dexie(context.state.db.name);
    //   db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   logInfo("dataModule", "actions.collateSearchDatabase BEGIN");
    //
    //   let rows = 0;
    //   let done = false;
    //   const names = {};
    //   const tokens = {};
    //   do {
    //     let data = await db.registrations.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
    //     logInfo("dataModule", "actions.collateSearchDatabase - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
    //     if (data.length > 0) {
    //       logInfo("dataModule", "actions.collateSearchDatabase - data[0..10]: " + JSON.stringify(data.slice(0, 10), null, 2));
    //     }
    //     for (const item of data) {
    //
    //       let name = null;
    //       let label = null;
    //       let labelhash = null;
    //       let namehash = null;
    //       let expiry = null;
    //       let subdomain = null;
    //
    //       if (item.type == "NameRegistered") {
    //         label = item.name;
    //         name = label + ".eth";
    //         labelhash = item.label;
    //         try {
    //           namehash = ethers.utils.namehash(name);
    //         } catch (e) {
    //           console.log("Error namehash: " + name + " " + item.txHash + " " + e.message);
    //         }
    //         expiry = item.expires;
    //
    //       } else if (item.type == "NameRenewed") {
    //         label = item.name;
    //         name = label + ".eth";
    //         labelhash = item.label;
    //         try {
    //           namehash = ethers.utils.namehash(name);
    //         } catch (e) {
    //           console.log("Error namehash: " + name + " " + item.txHash + " " + e.message);
    //         }
    //         expiry = item.expires;
    //
    //       } else if (item.type == "NameWrapped") {
    //         label = item.label;
    //         name = item.name;
    //         labelhash = item.labelhash;
    //         namehash = item.namehash;
    //         expiry = item.expiry;
    //         subdomain = item.subdomain;
    //         // console.log(JSON.stringify(item));
    //
    //       } else {
    //         // console.log(JSON.stringify(item));
    //       }
    //
    //       if (name && namehash) {
    //         if (name in names) {
    //           // console.log("names[name]: " + JSON.stringify(names[name]));
    //           // console.log(name + " expiry updated from " + moment.unix(names[name].expiry).format() + " to " + moment.unix(expiry).format());
    //           names[name] = expiry;
    //         } else {
    //           names[name] = expiry;
    //           // names[name] = {
    //           //   // name,
    //           //   // label,
    //           //   // labelhash,
    //           //   // namehash,
    //           //   expiry,
    //           //   // subdomain,
    //           // };
    //         }
    //       }
    //
    //       // console.log(JSON.stringify(item));
    //       // if (["Transfer", "TransferSingle", "TransferBatch"].includes(item.type) && !(item.contract in tokens)) {
    //       //   tokens[item.contract] = {
    //       //     type: item.eventType,
    //       //     tokenIds: {},
    //       //   };
    //       // }
    //       // if (item.eventType == "erc721" && item.type == "Transfer") {
    //       //   if (item.from in selectedAddressesMap || item.to in selectedAddressesMap) {
    //       //     tokens[item.contract].tokenIds[item.tokenId] = item.to;
    //       //   }
    //       // } else if (item.eventType == "erc1155" && item.type == "TransferSingle") {
    //       //   if (item.from in selectedAddressesMap) {
    //       //     if (!(item.tokenId in tokens[item.contract].tokenIds)) {
    //       //       tokens[item.contract].tokenIds[item.tokenId] = {};
    //       //     }
    //       //     if (item.from in tokens[item.contract].tokenIds[item.tokenId]) {
    //       //       tokens[item.contract].tokenIds[item.tokenId][item.from] = ethers.BigNumber.from(tokens[item.contract].tokenIds[item.tokenId][item.from]).sub(item.value).toString();
    //       //       if (tokens[item.contract].tokenIds[item.tokenId][item.from] == "0") {
    //       //         delete tokens[item.contract].tokenIds[item.tokenId][item.from];
    //       //       }
    //       //     }
    //       //   }
    //       //   if (item.to in selectedAddressesMap) {
    //       //     if (!(item.tokenId in tokens[item.contract].tokenIds)) {
    //       //       tokens[item.contract].tokenIds[item.tokenId] = {};
    //       //     }
    //       //     if (!(item.to in tokens[item.contract].tokenIds[item.tokenId])) {
    //       //       tokens[item.contract].tokenIds[item.tokenId][item.to] = "0";
    //       //     }
    //       //     tokens[item.contract].tokenIds[item.tokenId][item.to] = ethers.BigNumber.from(tokens[item.contract].tokenIds[item.tokenId][item.to]).add(item.value).toString();
    //       //   }
    //       // } else if (item.eventType == "erc1155" && item.type == "TransferBatch") {
    //       //   for (const [index, tokenId] of item.tokenIds.entries()) {
    //       //     if (item.from in selectedAddressesMap) {
    //       //       if (!(tokenId in tokens[item.contract].tokenIds)) {
    //       //         tokens[item.contract].tokenIds[tokenId] = {};
    //       //       }
    //       //       if (item.from in tokens[item.contract].tokenIds[tokenId]) {
    //       //         tokens[item.contract].tokenIds[tokenId][item.from] = ethers.BigNumber.from(tokens[item.contract].tokenIds[tokenId][item.from]).sub(item.values[index]).toString();
    //       //         if (tokens[item.contract].tokenIds[tokenId][item.from] == "0") {
    //       //           delete tokens[item.contract].tokenIds[tokenId][item.from];
    //       //         }
    //       //       }
    //       //     }
    //       //     if (item.to in selectedAddressesMap) {
    //       //       if (!(tokenId in tokens[item.contract].tokenIds)) {
    //       //         tokens[item.contract].tokenIds[tokenId] = {};
    //       //       }
    //       //       if (!(item.to in tokens[item.contract].tokenIds[tokenId])) {
    //       //         tokens[item.contract].tokenIds[tokenId][item.to] = "0";
    //       //       }
    //       //       tokens[item.contract].tokenIds[tokenId][item.to] = ethers.BigNumber.from(tokens[item.contract].tokenIds[tokenId][item.to]).add(item.values[index]).toString();
    //       //     }
    //       //   }
    //       // }
    //     }
    //     rows = parseInt(rows) + data.length;
    //     done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
    //   } while (!done);
    //   console.log("names: " + JSON.stringify(names, null, 2));
    //   // console.log("tokens: " + JSON.stringify(tokens, null, 2));
    //   context.commit('setState', { name: "names", data: names });
    //   await context.dispatch('saveData', ['names']);
    //   logInfo("dataModule", "actions.collateSearchDatabase END");
    // },

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
