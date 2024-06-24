const Names = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">
        <!-- <b-icon-eye-slash shift-v="+1" font-scale="1.0"></b-icon-eye-slash> -->
        <!-- <b-icon-eye-slash-fill shift-v="+1" font-scale="1.0"></b-icon-eye-slash-fill> -->

        <div class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 pr-1" style="width: 200px;">
            <b-form-input type="text" size="sm" v-model.trim="settings.filter" @change="saveSettings" debounce="600" v-b-popover.hover.top="'Regex filter by name'" placeholder="🔍 name regex"></b-form-input>
          </div>
          <div class="mt-0 pr-1">
            <b-form-select size="sm" v-model="settings.dateOption" @change="saveSettings" :options="dateOptions"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <b-dropdown size="sm" variant="link" v-b-popover.hover="'Junk filter'">
              <template #button-content>
                <span v-if="settings.junkFilter == 'excludejunk'">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                    <b-icon stacked icon="slash-circle" variant="danger"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else-if="settings.junkFilter == null">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="circle-fill" variant="warning"></b-icon>
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else>
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
              </template>
              <b-dropdown-item href="#" @click="settings.junkFilter = 'excludejunk'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  <b-icon stacked icon="slash-circle" variant="danger"></b-icon>
                </b-iconstack>
                Exclude Junk
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.junkFilter = null; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="circle-fill" variant="warning"></b-icon>
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                </b-iconstack>
                Include Junk
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.junkFilter = 'junk'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                </b-iconstack>
                Junk
              </b-dropdown-item>
            </b-dropdown>
          </div>
          <!-- <div class="mt-0 pr-1">
            <b-button size="sm" :pressed.sync="settings.favouritesOnly" @click="saveSettings" variant="transparent" v-b-popover.hover.bottom="'Show favourited only'"><b-icon :icon="settings.favouritesOnly ? 'heart-fill' : 'heart'" font-scale="0.95" variant="danger"></b-icon></b-button>
          </div> -->
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="viewSyncOptions" variant="link" v-b-popover.hover.top="'Sync data from the blockchain'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button>
          </div>
          <div v-if="sync.section != null" class="mt-1" style="width: 300px;">
            <b-progress height="1.5rem" :max="sync.total" show-progress :animated="sync.section != null" :variant="sync.section != null ? 'success' : 'secondary'" v-b-popover.hover.top="'Click the button on the right to stop. This process can be continued later'">
              <b-progress-bar :value="sync.completed">
                {{ sync.total == null ? (sync.completed + ' ' + sync.section) : (sync.completed + '/' + sync.total + ' ' + ((sync.completed / sync.total) * 100).toFixed(0) + '% ' + sync.section) }}
              </b-progress-bar>
            </b-progress>
          </div>
          <div class="ml-0 mt-1">
            <b-button v-if="sync.section != null" size="sm" @click="halt" variant="link" v-b-popover.hover.top="'Click to stop. This process can be continued later'"><b-icon-stop-fill shift-v="+1" font-scale="1.0"></b-icon-stop-fill></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-form-select size="sm" v-model="settings.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.top="'Yeah. Sort'"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover.top="'# tokens / total tokens transferred'">{{ filteredSortedItems.length + '/' + totalNames }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedItems.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.top="'Page size'"></b-form-select>
          </div>
        </div>

        <b-table ref="namesTable" small fixed striped responsive hover selectable select-mode="single" @row-selected='rowSelected' :fields="fields" :items="pagedFilteredSortedItems" show-empty head-variant="light" class="m-0 mt-1">
          <template #empty="scope">
            <h6>{{ scope.emptyText }}</h6>
            <div>
              <ul>
                <li>
                  Connect to the Ethereum mainnet
                </li>
                <li>
                  Enter your addresses in the Addresses menu
                </li>
                <li>
                  Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button> above to retrieve your ENS names from the blockchain
                </li>
              </ul>
            </div>
          </template>
          <template #cell(number)="data">
            {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
          </template>

          <!-- <b-avatar button @click="toggleTrait(layer, trait.value)" rounded size="7rem" :src="getSVG(layer, trait.value)">
            <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template>
          </b-avatar> -->

          <template #cell(image)="data">
            <!-- <b-avatar v-if="data.item.image" button rounded fluid size="7rem" :src="data.item.image"> -->
              <!-- <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template> -->
            <!-- </b-avatar> -->
            <b-img button rounded fluid size="7rem" :src="'https://metadata.ens.domains/mainnet/' + data.item.contract + '/' + data.item.tokenId + '/image'">
            </b-img>
          </template>

          <template #cell(info)="data">
            <b-link v-if="chainInfo[chainId]" :href="chainInfo[chainId].nftTokenPrefix + data.item.contract + '/' + data.item.tokenId" target="_blank">
              <span v-if="data.item.name">
                <font size="-1">
                  <b-badge :variant="data.item.status">
                    {{ data.item.name }}
                  </b-badge>
                </font>
              </span>
              <span v-else>
                <font size="-1">{{ '#' + (data.item.tokenId.length > 20 ? (data.item.tokenId.substring(0, 10) + '...' + data.item.tokenId.slice(-8)) : data.item.tokenId) }}</font>
              </span>
            </b-link>
            <br />

            <b-link v-if="chainInfo[chainId]" :href="chainInfo[chainId].explorerTokenPrefix + data.item.contract + '#code'" target="_blank">
              <font size="-1">{{ data.item.collectionName }}</font>
            </b-link>
            <b-button size="sm" @click="toggleTokenJunk(data.item);" variant="transparent"><b-icon :icon="data.item.junk ? 'trash-fill' : 'trash'" font-scale="0.9" :variant="data.item.junk ? 'info' : 'secondary'"></b-icon></b-button>
            <!-- <b-button size="sm" :disabled="data.item.junk" @click="toggleTokenContractFavourite(data.item);" variant="transparent"><b-icon :icon="data.item.favourite & !data.item.junk ? 'heart-fill' : 'heart'" font-scale="0.9" :variant="data.item.junk ? 'dark' : 'danger'"></b-icon></b-button> -->
          </template>

          <template #cell(expiry)="data">
            <font size="-1">
              <b-badge :variant="data.item.status">
                {{ formatTimestamp(data.item.expiry) }}
              </b-badge>
            </font>
          </template>

          <template #cell(owner)="data">
            <div v-for="(info, i) in data.item.owners"  v-bind:key="i" class="m-0 p-0">
              <b-link v-if="chainInfo[chainId]" :href="chainInfo[chainId].explorerTokenPrefix + data.item.contract + '?a=' + info.owner + '#inventory'" target="_blank">
                <font size="-1">
                  {{ info.owner.substring(0, 10) + '...' + info.owner.slice(-8) }}
                  <span v-if="data.item.type == 'erc1155'" class="small muted">
                    {{ 'x' + info.count }}
                  </span>
                </font>
              </b-link>
            </div>
          </template>

          <template #cell(prices)="data">
            <font size="-1">
              <b-badge v-if="data.item.lastSale && data.item.lastSale.amount" v-b-popover.hover.top="data.item.lastSale.amountUSD + ' USD'" variant="transparent">
                Last: {{ data.item.lastSale.amount + ' ' + data.item.lastSale.currency + ' @ ' + formatTimestamp(data.item.lastSale.timestamp) }}
              </b-badge>
              <br />
              <b-badge v-if="data.item.topBid && data.item.topBid.amount" v-b-popover.hover.top="'Net amount: ' + data.item.topBid.netAmount + ' ' + data.item.topBid.currency + ' ' + data.item.topBid.netAmountUSD + ' USD'" variant="transparent">
                Top Bid: {{ data.item.topBid.amount + ' ' + data.item.topBid.currency + ' ' +  data.item.topBid.amountUSD + ' USD' }}
              </b-badge>
              <br />
              <b-badge v-if="data.item.price && data.item.price.amount" v-b-popover.hover.top="data.item.price.amountUSD + ' USD on ' + data.item.price.source" variant="transparent">
                Price: {{ data.item.price.amount + ' ' + data.item.price.currency + ' Expiry ' + formatTimestamp(data.item.price.expiry) }}
              </b-badge>
            </font>
          </template>

          <template #cell(attributes)="data">
            <!-- {{ data.item.attributes }} -->
            <b-row v-for="(attribute, i) in data.item.attributes"  v-bind:key="i" class="m-0 p-0">
              <b-col cols="4" class="m-0 px-2 text-right"><font size="-3">{{ attribute.trait_type }}</font></b-col>
              <b-col cols="8" class="m-0 px-2"><b><font size="-2">{{ ["Created", "Registration", "Expiry"].includes(attribute.trait_type) ? formatTimestamp(attribute.value) : attribute.value }}</font></b></b-col>
            </b-row>
          </template>

          <template #cell(favourite)="data">
            <b-button size="sm" @click="toggleTokenContractFavourite(data.item);" variant="transparent"><b-icon :icon="data.item.favourite ? 'heart-fill' : 'heart'" font-scale="0.9" variant="danger"></b-icon></b-button>
          </template>

          <template #cell(contract)="data">
            <b-link v-if="chainInfo[chainId]" :href="chainInfo[chainId].explorerTokenPrefix + data.item.contract + '#code'" target="_blank">
              <font size="-1">{{ data.item.contract.substring(0, 10) + '...' + data.item.contract.slice(-8) }}</font>
            </b-link>
          </template>
          <template #cell(type)="data">
            <!-- <font size="-1">{{ data.item.type == "erc20" ? "ERC-20" : "ERC-721" }}</font> -->
          </template>
          <template #cell(symbol)="data">
            <!-- <font size="-1">{{ data.item.symbol }}</font> -->
          </template>
          <template #cell(name)="data">
            <!-- <font size="-1">{{ data.item.name }}</font> -->
          </template>
          <template #cell(firstEventBlockNumber)="data">
            <!-- <font size="-1">{{ commify0(data.item.firstEventBlockNumber) }}</font> -->
          </template>
          <template #cell(lastEventBlockNumber)="data">
            <!-- <font size="-1">{{ commify0(data.item.lastEventBlockNumber) }}</font> -->
          </template>
          <template #cell(decimals)="data">
            <!-- <font size="-1">{{ data.item.type == "erc20" ? parseInt(data.item.decimals) : "" }}</font> -->
          </template>
          <template #cell(balance)="data">
            <!-- <span v-if="data.item.balances[coinbase] && data.item.type == 'erc20'">
              <b-button size="sm" :href="'https://sepolia.etherscan.io/token/' + data.item.address + '?a=' + coinbase" variant="link" class="m-0 ml-2 p-0" target="_blank">{{ formatDecimals(data.item.balances[coinbase], data.item.decimals || 0) }}</b-button>
            </span>
            <span v-if="data.item.type == 'erc721'">
              <font size="-1">
                <span v-for="(tokenData, tokenId) of data.item.tokenIds">
                  <b-button v-if="chainInfo[chainId]" size="sm" :href="chainInfo[chainId].nftTokenPrefix + data.item.address + '/' + tokenId" variant="link" v-b-popover.hover.bottom="tokenId" class="m-0 ml-2 p-0" target="_blank">{{ tokenId.toString().length > 20 ? (tokenId.toString().substring(0, 8) + '...' + tokenId.toString().slice(-8)) : tokenId.toString() }}</b-button>
                </span>
              </font>
            </span> -->
          </template>

          <template #cell(totalSupply)="data">
            <font size="-1">{{ data.item.type == "erc20" ? formatDecimals(data.item.totalSupply, data.item.decimals || 0) : data.item.totalSupply }}</font>
          </template>


          <template #cell(timestamp)="data">
            <b-link :href="'https://sepolia.etherscan.io/tx/' + data.item.txHash" v-b-popover.hover.bottom="'Block #' + commify0(data.item.blockNumber) + ', txIndex: ' + data.item.txIndex + ', logIndex: ' + data.item.logIndex" target="_blank">
              <span v-if="data.item.timestamp">
                {{ formatTimestamp(data.item.timestamp) }}
              </span>
              <span v-else>
                {{ '#' + commify0(data.item.blockNumber) }}
              </span>
            </b-link>
          </template>
          <template #cell(sender)="data">
            <div v-if="data.item.tx && data.item.tx.from">
              <b-link :href="'https://sepolia.etherscan.io/address/' + data.item.tx.from" v-b-popover.hover.bottom="'View in etherscan.io'" target="_blank">
                {{ data.item.tx.from }}
              </b-link>
            </div>
          </template>
          <template #cell(receiver)="data">
            <div v-if="data.item.stealthAddress">
              <b-link :href="'https://sepolia.etherscan.io/address/' + data.item.stealthAddress" v-b-popover.hover.bottom="'View in etherscan.io'" target="_blank">
                {{ data.item.stealthAddress }}
              </b-link>
            </div>
          </template>
          <template #cell(tokens)="data">
            <b-row v-for="(item, index) of data.item.transfers" v-bind:key="item.token">
              <b-col>
                <span v-if="getTokenType(item.token) == 'eth'">
                  <font size="-1">{{ formatETH(item.value) + ' ETH'}}</font>
                </span>
                <span v-else-if="getTokenType(item.token) == 'erc20'">
                  <font size="-1">
                    {{ formatETH(item.value) }}
                    <b-link :href="chainInfo.explorerTokenPrefix + item.token" v-b-popover.hover.bottom="item.tokenId" target="_blank">{{ getTokenSymbol(item.token) }}</b-link>
                  </font>
                </span>
                <span v-else>
                  <font size="-1">
                    <b-link :href="'https://testnets.opensea.io/assets/sepolia/' + item.token + '/' + item.value" v-b-popover.hover.bottom="item.value" target="_blank">{{ item.value.toString().length > 20 ? (item.value.toString().substring(0, 8) + '...' + item.value.toString().slice(-8)) : item.value.toString() }}</b-link>
                    <b-link :href="'https://sepolia.etherscan.io/token/' + item.token" v-b-popover.hover.bottom="item.tokenId" target="_blank">{{ item.token.substring(0, 10) + '...' + item.token.slice(-8) /*getTokenSymbol(item.token)*/ }}</b-link>
                  </font>
                </span>
              </b-col>
            </b-row>
          </template>

        </b-table>
      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
      settings: {
        filter: null,
        dateOption: 'active',
        junkFilter: null,
        favouritesOnly: false,
        currentPage: 1,
        pageSize: 10,
        sortOption: 'expiryasc',
        version: 0,
      },
      transfer: {
        item: null,
        stealthPrivateKey: null,
      },
      modalFaucet: {
        selectedFaucet: null,
      },
      dateOptions: [
        { value: null, text: 'All' },
        { value: 'active', text: 'Active' },
        { value: 'grace', text: 'Grace Period' },
        { value: 'expired', text: 'Expired' },
        { value: 'expiry1m', text: 'Expiry <= 1m' },
        { value: 'expiry3m', text: 'Expiry <= 3m' },
        { value: 'expiry1y', text: 'Expiry <= 1y' },
        { value: 'expiry1yp', text: 'Expiry > 1y' },
      ],
      sortOptions: [
        // { value: 'nameasc', text: '▲ Name' },
        // { value: 'namedsc', text: '▼ Name' },
        // { value: 'priceasc', text: '▲ Price' },
        // { value: 'pricedsc', text: '▼ Price' },
        { value: 'expiryasc', text: '▲ Expiry' },
        { value: 'expirydsc', text: '▼ Expiry' },
        // { value: 'registrationasc', text: '▲ Registration' },
        // { value: 'registrationdsc', text: '▼ Registration' },
        // { value: 'latesttransferdateasc', text: '▲ Latest Transfer Date' },
        // { value: 'latesttransferdatedsc', text: '▼ Latest Transfer Date' },
        // { value: 'creationdateasc', text: '▲ Creation Date' },
        // { value: 'creationdatedsc', text: '▼ Creation Date' },
        // { value: 'lengthname', text: '▲ Length, ▲ Name' },
        // { value: 'random', text: 'Random' },
      ],
      // fields: [
      //   { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
      //   { key: 'timestamp', label: 'When', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-truncate' },
      //   { key: 'sender', label: 'Sender', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
      //   { key: 'receiver', label: 'Receiver', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
      //   { key: 'tokens', label: 'Tokens', sortable: false, thStyle: 'width: 20%;', thClass: 'text-left', tdClass: 'text-truncate' },
      // ],
      fields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'image', label: 'Image', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'info', label: 'Info', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'owner', label: 'Owner', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'prices', label: 'Prices', sortable: false, thStyle: 'width: 20%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'attributes', label: 'Attributes', sortable: false, thStyle: 'width: 20%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'favourite', label: '', sortable: false, thStyle: 'width: 3%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'contract', label: 'Contract', sortable: false, thStyle: 'width: 16%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'type', label: 'Type', sortable: false, thStyle: 'width: 7%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'symbol', label: 'Symbol', sortable: false, thStyle: 'width: 10%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'name', label: 'Name', sortable: false, thStyle: 'width: 20%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'firstEventBlockNumber', label: 'First Ev#', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'lastEventBlockNumber', label: 'Last Ev#', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'decimals', label: 'Decs', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'balance', label: 'Balance', sortable: false, thStyle: 'width: 20%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'totalSupply', label: 'Total Supply', sortable: false, thStyle: 'width: 20%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
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
    sync() {
      return store.getters['data/sync'];
    },
    pageSizes() {
      return store.getters['config/pageSizes'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    tokens() {
      return store.getters['data/tokens'];
    },
    metadata() {
      return store.getters['data/metadata'];
    },
    prices() {
      return store.getters['data/prices'];
    },
    contractMetadata() {
      return store.getters['data/contractMetadata'];
    },
    tokenInfo() {
      return store.getters['data/tokenInfo'];
    },

    totalNames() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [address, data] of Object.entries(this.tokens[this.chainId] || {})) {
        result += Object.keys(data.tokenIds).length;
      }
      return result;
    },
    filteredItems() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
      let regex = null;
      if (this.settings.filter != null && this.settings.filter.length > 0) {
        try {
          regex = new RegExp(this.settings.filter, 'i');
        } catch (e) {
          console.log("filteredItems - regex error: " + e.message);
          regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }

      const graceFrom = moment().subtract(90, 'days').unix();
      const expiry1m = moment().add(1, 'months').unix();
      const expiry3m = moment().add(3, 'months').unix();
      const expiry1y = moment().add(1, 'years').unix();
      let dateFrom = null;
      let dateTo = null;
      if (this.settings.dateOption) {
        if (this.settings.dateOption == "active") {
          dateFrom = graceFrom;
        } else if (this.settings.dateOption == "grace") {
          dateFrom = graceFrom;
          dateTo = moment().unix();
        } else if (this.settings.dateOption == "expired") {
          dateTo = moment().unix();
        } else if (this.settings.dateOption == "expiry1m") {
          dateFrom = graceFrom;
          dateTo = expiry1m;
        } else if (this.settings.dateOption == "expiry3m") {
          dateFrom = graceFrom;
          dateTo = expiry3m;
        } else if (this.settings.dateOption == "expiry1y") {
          dateFrom = graceFrom;
          dateTo = expiry1y;
        } else if (this.settings.dateOption == "expiry1yp") {
          dateFrom = expiry1y;
        }
      }

      const selectedAddressesMap = {};
      for (const [address, addressData] of Object.entries(this.addresses)) {
        if (address.substring(0, 2) == "0x" && addressData.process) {
          selectedAddressesMap[address] = true;
        }
      }

      for (const [contract, data] of Object.entries(this.tokens[this.chainId] || {})) {
        for (const [tokenId, tokenData] of Object.entries(data.tokenIds)) {
          const metadata = this.metadata[this.chainId] && this.metadata[this.chainId][contract] && this.metadata[this.chainId][contract][tokenId] || {};
          const price = this.prices[this.chainId] && this.prices[this.chainId][contract] && this.prices[this.chainId][contract][tokenId] || {};
          const info = this.tokenInfo[this.chainId] && this.tokenInfo[this.chainId][contract] && this.tokenInfo[this.chainId][contract][tokenId] || {};
          if (metadata.name == null || metadata.name == "null") {
            console.log("  metadata: " + JSON.stringify(metadata, null, 2));
            console.log("  price: " + JSON.stringify(price, null, 2));
            console.log("  info: " + JSON.stringify(info, null, 2));
          }
          let include = true;
          if (this.settings.junkFilter) {
            if (this.settings.junkFilter == 'junk' && !info.junk) {
              include = false;
            } else if (this.settings.junkFilter == 'excludejunk' && info.junk) {
              include = false;
            }
          }
          if (include && dateFrom) {
            if (metadata.expiry < dateFrom) {
              include = false;
            }
          }
          if (include && dateTo) {
            if (metadata.expiry > dateTo) {
              include = false;
            }
          }
          if (include && regex) {
            const name = metadata.name || null;
            if (name) {
              label = name.replace(/\.eth$/, '');
              if (!(regex.test(label))) {
                include = false;
              }
            } else {
              logInfo("Names", "filteredItems - missing name: " + JSON.stringify(metadata, null, 2));
              include = false;
            }
          }
          if (include) {
            // console.log(contract + "/" + tokenId + " => " + JSON.stringify(tokenData));
            let image = null;
            if (metadata.image) {
              if (metadata.image.substring(0, 12) == "ipfs://ipfs/") {
                image = "https://ipfs.io/" + metadata.image.substring(7)
              } else if (metadata.image.substring(0, 7) == "ipfs://") {
                image = "https://ipfs.io/ipfs/" + metadata.image.substring(7);
              } else {
                image = metadata.image;
              }
            }
            const owners = [];
            if (data.type == "erc721") {
              if (tokenData in selectedAddressesMap) {
                owners.push({ owner: tokenData });
              }
            } else {
              for (const [owner, count] of Object.entries(tokenData)) {
                if (owner in selectedAddressesMap) {
                  owners.push({ owner, count });
                }
              }
            }
            if (owners.length > 0) {
              let status = "danger";
              if (metadata.expiry) {
                if (metadata.expiry < moment().unix()) {
                  status = "danger";
                } else if (metadata.expiry < expiry3m) {
                  status = "warning";
                } else if (metadata.expiry < expiry1y) {
                  status = "primary";
                } else {
                  status = "success";
                }
              }
              // console.log(metadata.name + " " + moment.unix(metadata.expiry).format() + " " + status);

              results.push({
                contract,
                type: data.type,
                junk: info && info.junk || false,
                // favourite: data.favourite,
                totalSupply: data.totalSupply,
                tokenId,
                owners,
                name: metadata.name || null,
                description: metadata.description || null,
                expiry: metadata.expiry || undefined,
                attributes: price.attributes || null,
                status,
                lastSale: price.lastSale,
                price: price.price,
                topBid: price.topBid,
              });
            }
          }
        }
      }
      return results;
    },
    filteredSortedItems() {
      const results = this.filteredItems;
      if (this.settings.sortOption == 'expiryasc') {
        results.sort((a, b) => {
          return a.expiry - b.expiry;
        });
      } else if (this.settings.sortOption == 'expirydsc') {
        results.sort((a, b) => {
          return b.expiry - a.expiry;
        });
      }
      return results;
    },
    pagedFilteredSortedItems() {
      // logInfo("Names", "pagedFilteredSortedItems - results[0..1]: " + JSON.stringify(this.filteredSortedItems.slice(0, 2), null, 2));
      return this.filteredSortedItems.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
    toggleTokenJunk(token) {
      logInfo("Names", "methods.toggleTokenJunk - token: " + JSON.stringify(token, null, 2));
      store.dispatch('data/toggleTokenJunk', token);
    },
    toggleTokenContractFavourite(item) {
      logInfo("Names", "methods.toggleTokenContractFavourite - item: " + JSON.stringify(item, null, 2));
      store.dispatch('data/toggleTokenContractFavourite', item);
    },
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
    formatDecimals(e, decimals = 18) {
      return e ? ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
    },
    saveSettings() {
      logInfo("Names", "methods.saveSettings - onlyfensNamesSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.onlyfensNamesSettings = JSON.stringify(this.settings);
    },
    async viewSyncOptions() {
      store.dispatch('syncOptions/viewSyncOptions');
    },
    async halt() {
      store.dispatch('data/setSyncHalt', true);
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
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    rowSelected(item) {
      logInfo("Names", "methods.rowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        store.dispatch('viewName/viewName', { contract: item[0].contract, tokenId: item[0].tokenId });
        // store.dispatch('viewToken/viewToken', { contract: item[0].contract, tokenId: item[0].tokenId });
        this.$refs.namesTable.clearSelected();
      }
    },

    async timeoutCallback() {
      logDebug("Names", "timeoutCallback() count: " + this.count);

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
    logDebug("Names", "beforeDestroy()");
  },
  mounted() {
    logDebug("Names", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('onlyfensNamesSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.onlyfensNamesSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("Names", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const namesModule = {
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
      logDebug("namesModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("namesModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("namesModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
  },
};
