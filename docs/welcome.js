const Welcome = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-2">

          <b-card-body class="p-0">
            <b-card class="mb-2 border-0">

              <b-card-text>
                <h5>Welcome</h5>
                to <i>Only for ENS Portfolio Manager</i>. Status: <b>WIP</b>
              </b-card-text>

              <b-card-text class="mt-3 mb-2">
                <h6>Algorithm - Addresses and Names</h6>
                <ul>
                  <li>
                    Enter one or more of your Ethereum addresses
                  </li>
                  <li>
                    Scrape all ERC-721 and ERC-1155 transfer events to and from your list of addresses
                  </li>
                  <li>
                    Scrape all ERC-721 ENS <i>NameRegistered</i> and <i>NameRenewed</i> events for all the tokenIds of your transferred ERC-721 events
                  </li>
                  <li>
                    Scrape all ERC-1155 ENS <i>NameWrapped</i> events for all the tokenIds of your transferred ERC-1155 events
                  </li>
                  <li>
                    Scrape last, listing and best offer prices from the Reservoir API for each of the ERC-721 and ERC-1155 ENS tokenIds
                  </li>
                  <li>
                    Scrape the block timestamps for each event above
                  </li>
                  <li>
                    Merge all the data together
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-3 mb-2">
                <h6>Algorithm - Search (WIP)</h6>
                <ul>
                  <li>
                    Retrieve all ERC-721 ENS <i>NameRegistered</i> and <i>NameRenewed</i> and ERC-1155 ENS <i>NameWrapped</i> events
                  </li>
                  <li>
                    Use information above for initial search query results
                  </li>
                  <li>
                    Retrieve transfers and prices for search query results when requested
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-3 mb-2">
                <h6>Your Data</h6>
                <ul>
                  <li>
                    Your personal information (e.g., accounts) is stored in your web browser local storage (LocalStorage and IndexedDB)
                  </li>
                  <li>
                    Your accounts will be used when querying data via the web3 connection
                  </li>
                  <li>
                    Your collections and tokens will be used when querying data via the Reservoir API
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-3 mb-2">
                <h6>This Web3 Dapp</h6>
                <ul>
                  <li>
                    <b-link href="https://bokkypoobah.github.io/onlyfens/" target="_blank">https://bokkypoobah.github.io/onlyfens/</b-link>
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-3 mb-2">
                <h6>Source Code</h6>
                <ul>
                  <li>
                    <b-link href="https://github.com/bokkypoobah/onlyfens" target="_blank">https://github.com/bokkypoobah/onlyfens</b-link>
                  </li>
                </ul>
              </b-card-text>

            </b-card>
          </b-card-body>
        </b-card>
      </b-card>
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
    explorer () {
      return store.getters['connection/explorer'];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    chainId() {
      return store.getters['connection/chainId'];
    },
  },
  methods: {
    async syncIt(info) {
      store.dispatch('data/syncIt', info);
    },
    async timeoutCallback() {
      logDebug("Welcome", "timeoutCallback() count: " + this.count);

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
    logDebug("Welcome", "beforeDestroy()");
  },
  mounted() {
    logDebug("Welcome", "mounted() $route: " + JSON.stringify(this.$route.params));
    this.reschedule = true;
    logDebug("Welcome", "Calling timeoutCallback()");
    this.timeoutCallback();
    // this.loadNFTs();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const welcomeModule = {
  namespaced: true,
  state: {
    params: null,
    executing: false,
    executionQueue: [],
  },
  getters: {
    params: state => state.params,
    executionQueue: state => state.executionQueue,
  },
  mutations: {
    deQueue(state) {
      logDebug("welcomeModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("welcomeModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("welcomeModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
  },
};
