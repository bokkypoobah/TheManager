const Search = {
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
          <div v-if="false && sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="viewSyncOptions" variant="link" v-b-popover.hover.top="'Sync data from the blockchain'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button>
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="syncIt()" variant="link" v-b-popover.hover.top="'Retrieve ENS registration and renewal events'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button>
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="retrieveData()" variant="link" v-b-popover.hover.top="'Retrieve detailed ENS data for the searched names'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button>
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
            <!-- <font size="-2" v-b-popover.hover.top="'# tokens / total tokens transferred'">{{ filteredSortedItems.length + '/' + totalNames }}</font> -->
            <font size="-2" v-b-popover.hover.top="'# names'">{{ filteredSortedItems.length }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedItems.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.top="'Page size'"></b-form-select>
          </div>
        </div>

        <b-table ref="searchTable" small fixed striped responsive hover selectable select-mode="single" @row-selected='rowSelected' :fields="fields" :items="pagedFilteredSortedItems" show-empty head-variant="light" class="m-0 mt-1">
          <template #empty="scope">
            <h6>{{ scope.emptyText }}</h6>
            <div>
              <ul>
                <li>
                  Connect to the Ethereum mainnet
                </li>
                <li>
                  Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button> above to incrementally retrieve all ENS registration and renewal events for storage locally
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
            <!-- <b-img button rounded fluid size="7rem" :src="'https://metadata.ens.domains/mainnet/' + data.item.contract + '/' + data.item.tokenId + '/image'">
            </b-img> -->
            <b-img button rounded width="100px;" :src="'https://metadata.ens.domains/mainnet/' + data.item.contract + '/' + data.item.tokenId + '/image'">
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
      return store.getters['search/sync'];
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
    names() {
      return store.getters['search/names'];
    },
    infos() {
      return store.getters['search/infos'];
    },
    tokenInfo() {
      return store.getters['data/tokenInfo'];
    },

    totalNames() {
      // let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      // for (const [address, data] of Object.entries(this.tokens[this.chainId] || {})) {
      //   result += Object.keys(data.tokenIds).length;
      // }
      // return result;
      return Object.keys(this.names).length;
    },
    filteredItems() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
      console.log("infos: " + JSON.stringify(this.infos, null, 2));

      let regex = null;
      if (this.settings.filter != null && this.settings.filter.length > 0) {
        try {
          regex = new RegExp(this.settings.filter, 'i');
        } catch (e) {
          console.log("filteredItems - regex error: " + e.message);
          regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }
      // const filter = this.settings.filter && this.settings.filter.length > 0 ? this.settings.filter : null;

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

      logInfo("Search", "filteredItems - start");
      // for (const [name, expiry] of Object.entries(this.names || {})) {
      for (const [name, expiry] of this.names) {
        let include = true;
        if (regex) {
          if (!(regex.test(name))) {
            include = false;
          }
        }
        // TODO: Not significantly faster than regex
        // if (name && filter) {
        //   // if (!name.includes(filter)) {
        //   if (name.indexOf(filter) == -1) {
        //     include = false;
        //   }
        // }
        if (include && dateFrom) {
          if (expiry < dateFrom) {
            include = false;
          }
        }
        if (include && dateTo) {
          if (expiry > dateTo) {
            include = false;
          }
        }
        if (include) {
          let status = "danger";
          if (expiry < moment().unix()) {
            status = "danger";
          } else if (expiry < expiry3m) {
            status = "warning";
          } else if (expiry < expiry1y) {
            status = "primary";
          } else {
            status = "success";
          }

          const info = this.infos[name] || {};
          const wrapped = info.wrapped || false;
          const contract = wrapped ? ENS_NAMEWRAPPER_ADDRESS : ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS;

          results.push({
            name,
            expiry,
            status,
            wrapped,
            contract,
          });
        }
      }
      logInfo("Search", "filteredItems - end");
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
      logInfo("Search", "pagedFilteredSortedItems - results[0..9]: " + JSON.stringify(this.filteredSortedItems.slice(0, 10), null, 2));
      const results = this.filteredSortedItems.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
      // const supplementedResults = [];
      // for (const result of results) {
      //   const labelhash = ethers.utils.solidityKeccak256(["string"], [result.name]);
      //   const labelhashDecimals = ethers.BigNumber.from(labelhash).toString();
      //   supplementedResults.push({
      //     name: result.name,
      //     expiry: result.expiry,
      //     status: result.status,
      //     contract: ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS,
      //     tokenId: labelhashDecimals,
      //   });
      // }
      // return supplementedResults;
      return results;
    },
    // filteredItemsOld() {
    //   return [];
    //   const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
    //   let regex = null;
    //   if (this.settings.filter != null && this.settings.filter.length > 0) {
    //     try {
    //       regex = new RegExp(this.settings.filter, 'i');
    //     } catch (e) {
    //       console.log("filteredItems - regex error: " + e.message);
    //       regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
    //     }
    //   }
    //
    //   const graceFrom = moment().subtract(90, 'days').unix();
    //   const expiry1m = moment().add(1, 'months').unix();
    //   const expiry3m = moment().add(3, 'months').unix();
    //   const expiry1y = moment().add(1, 'years').unix();
    //   let dateFrom = null;
    //   let dateTo = null;
    //   if (this.settings.dateOption) {
    //     if (this.settings.dateOption == "active") {
    //       dateFrom = graceFrom;
    //     } else if (this.settings.dateOption == "grace") {
    //       dateFrom = graceFrom;
    //       dateTo = moment().unix();
    //     } else if (this.settings.dateOption == "expired") {
    //       dateTo = moment().unix();
    //     } else if (this.settings.dateOption == "expiry1m") {
    //       dateFrom = graceFrom;
    //       dateTo = expiry1m;
    //     } else if (this.settings.dateOption == "expiry3m") {
    //       dateFrom = graceFrom;
    //       dateTo = expiry3m;
    //     } else if (this.settings.dateOption == "expiry1y") {
    //       dateFrom = graceFrom;
    //       dateTo = expiry1y;
    //     } else if (this.settings.dateOption == "expiry1yp") {
    //       dateFrom = expiry1y;
    //     }
    //   }
    //
    //   const selectedAddressesMap = {};
    //   for (const [address, addressData] of Object.entries(this.addresses)) {
    //     if (address.substring(0, 2) == "0x" && addressData.process) {
    //       selectedAddressesMap[address] = true;
    //     }
    //   }
    //
    //   for (const [contract, data] of Object.entries(this.tokens[this.chainId] || {})) {
    //     for (const [tokenId, tokenData] of Object.entries(data.tokenIds)) {
    //       const metadata = this.metadata[this.chainId] && this.metadata[this.chainId][contract] && this.metadata[this.chainId][contract][tokenId] || {};
    //       const price = this.prices[this.chainId] && this.prices[this.chainId][contract] && this.prices[this.chainId][contract][tokenId] || {};
    //       const info = this.tokenInfo[this.chainId] && this.tokenInfo[this.chainId][contract] && this.tokenInfo[this.chainId][contract][tokenId] || {};
    //       if (metadata.name == null || metadata.name == "null") {
    //         console.log("  metadata: " + JSON.stringify(metadata, null, 2));
    //         console.log("  price: " + JSON.stringify(price, null, 2));
    //         console.log("  info: " + JSON.stringify(info, null, 2));
    //       }
    //       let include = true;
    //       if (this.settings.junkFilter) {
    //         if (this.settings.junkFilter == 'junk' && !info.junk) {
    //           include = false;
    //         } else if (this.settings.junkFilter == 'excludejunk' && info.junk) {
    //           include = false;
    //         }
    //       }
    //       if (include && dateFrom) {
    //         if (metadata.expiry < dateFrom) {
    //           include = false;
    //         }
    //       }
    //       if (include && dateTo) {
    //         if (metadata.expiry > dateTo) {
    //           include = false;
    //         }
    //       }
    //       if (include && regex) {
    //         const name = metadata.name || null;
    //         if (name) {
    //           label = name.replace(/\.eth$/, '');
    //           if (!(regex.test(label))) {
    //             include = false;
    //           }
    //         } else {
    //           logInfo("Search", "filteredItems - missing name: " + JSON.stringify(metadata, null, 2));
    //           include = false;
    //         }
    //       }
    //       if (include) {
    //         // console.log(contract + "/" + tokenId + " => " + JSON.stringify(tokenData));
    //         let image = null;
    //         if (metadata.image) {
    //           if (metadata.image.substring(0, 12) == "ipfs://ipfs/") {
    //             image = "https://ipfs.io/" + metadata.image.substring(7)
    //           } else if (metadata.image.substring(0, 7) == "ipfs://") {
    //             image = "https://ipfs.io/ipfs/" + metadata.image.substring(7);
    //           } else {
    //             image = metadata.image;
    //           }
    //         }
    //         const owners = [];
    //         if (data.type == "erc721") {
    //           if (tokenData in selectedAddressesMap) {
    //             owners.push({ owner: tokenData });
    //           }
    //         } else {
    //           for (const [owner, count] of Object.entries(tokenData)) {
    //             if (owner in selectedAddressesMap) {
    //               owners.push({ owner, count });
    //             }
    //           }
    //         }
    //         if (owners.length > 0) {
    //           let status = "danger";
    //           if (metadata.expiry) {
    //             if (metadata.expiry < moment().unix()) {
    //               status = "danger";
    //             } else if (metadata.expiry < expiry3m) {
    //               status = "warning";
    //             } else if (metadata.expiry < expiry1y) {
    //               status = "primary";
    //             } else {
    //               status = "success";
    //             }
    //           }
    //           // console.log(metadata.name + " " + moment.unix(metadata.expiry).format() + " " + status);
    //
    //           results.push({
    //             contract,
    //             type: data.type,
    //             junk: info && info.junk || false,
    //             // favourite: data.favourite,
    //             totalSupply: data.totalSupply,
    //             tokenId,
    //             owners,
    //             name: metadata.name || null,
    //             description: metadata.description || null,
    //             expiry: metadata.expiry || undefined,
    //             attributes: price.attributes || null,
    //             status,
    //             lastSale: price.lastSale,
    //             price: price.price,
    //             topBid: price.topBid,
    //           });
    //         }
    //       }
    //     }
    //   }
    //   return results;
    // },

  },
  methods: {
    toggleTokenJunk(token) {
      logInfo("Search", "methods.toggleTokenJunk - token: " + JSON.stringify(token, null, 2));
      store.dispatch('data/toggleTokenJunk', token);
    },
    toggleTokenContractFavourite(item) {
      logInfo("Search", "methods.toggleTokenContractFavourite - item: " + JSON.stringify(item, null, 2));
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
      logInfo("Search", "methods.saveSettings - onlyfensSearchSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.onlyfensSearchSettings = JSON.stringify(this.settings);
    },
    async viewSyncOptions() {
      store.dispatch('syncOptions/viewSyncOptions');
    },
    async syncIt() {
      store.dispatch('search/syncIt', {});
    },
    async retrieveData() {
      const labels = this.filteredSortedItems.map(e => e.name);
      console.log("labels: " + JSON.stringify(labels));
      store.dispatch('search/retrieveData', labels);
    },
    async halt() {
      store.dispatch('search/setSyncHalt', true);
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
      logInfo("Search", "methods.rowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        store.dispatch('viewToken/viewToken', { contract: item[0].contract, tokenId: item[0].tokenId });
        this.$refs.searchTable.clearSelected();
      }
    },

    async timeoutCallback() {
      logDebug("Search", "timeoutCallback() count: " + this.count);

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
    logDebug("Search", "beforeDestroy()");
  },
  mounted() {
    logDebug("Search", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    store.dispatch('search/restoreState');
    if ('onlyfensSearchSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.onlyfensSearchSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("Search", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const searchModule = {
  namespaced: true,
  state: {
    names: [],
    infos: {},
    sync: {
      section: null,
      total: null,
      completed: null,
      halt: false,
    },
  },
  getters: {
    names: state => state.names,
    infos: state => state.infos,
    sync: state => state.sync,
  },
  mutations: {
    setState(state, info) {
      // logInfo("searchModule", "mutations.setState - info: " + JSON.stringify(info, null, 2));
      Vue.set(state, info.name, info.data);
    },
    setSyncSection(state, info) {
      logInfo("searchModule", "mutations.setSyncSection info: " + JSON.stringify(info));
      state.sync.section = info.section;
      state.sync.total = info.total;
    },
    setSyncCompleted(state, completed) {
      logInfo("searchModule", "mutations.setSyncCompleted completed: " + completed + (state.sync.total ? ("/" + state.sync.total) : "") + " " + state.sync.section);
      state.sync.completed = completed;
    },
    setSyncHalt(state, halt) {
      state.sync.halt = halt;
    },
  },
  actions: {
    async restoreState(context) {
      logInfo("searchModule", "actions.restoreState");
      if (Object.keys(context.state.names).length == 0) {
        const dbInfo = store.getters['data/db'];
        const db = new Dexie(dbInfo.name);
        db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
        for (let type of [ 'infos', 'names' ]) {
          const data = await db.cache.where("objectName").equals(type).toArray();
          if (data.length == 1) {
            if (type == "infos") {
              logInfo("searchModule", "actions.restoreState " + type + " => " + JSON.stringify(data[0].object, null, 2));
            }
            context.commit('setState', { name: type, data: data[0].object });
          }
        }
      }
    },
    async saveData(context, types) {
      logInfo("searchModule", "actions.saveData - types: " + JSON.stringify(types));
      const dbInfo = store.getters['data/db'];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      for (let type of types) {
        await db.cache.put({ objectName: type, object: context.state[type] }).then(function() {
        }).catch(function(error) {
          console.log("error: " + error);
        });
      }
      db.close();
    },
    async setSyncHalt(context, halt) {
      logInfo("searchModule", "actions.setSyncHalt");
      context.commit('setSyncHalt', halt);
    },

    async syncIt(context, options) {
      logInfo("searchModule", "actions.syncIt - options: " + JSON.stringify(options, null, 2));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const block = await provider.getBlock();
      const confirmations = 1000;
      const blockNumber = block && block.number || null;
      const chainId = store.getters['connection/chainId'];
      const parameter = { chainId, blockNumber, confirmations, ...options };
      await context.dispatch('syncSearchDatabase', parameter);
      if (!context.state.sync.halt) {
        await context.dispatch('collateSearchDatabase', parameter);
      }
      context.commit('setSyncSection', { section: null, total: null });
      context.commit('setSyncHalt', false);
      // context.commit('forceRefresh');
    },

    async syncSearchDatabase(context, parameter) {
      logInfo("dataModule", "actions.syncSearchDatabase: " + JSON.stringify(parameter));
      const dbInfo = store.getters['data/db'];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const oldETHRegistarController1Interface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER1_ABI);
      const oldETHRegistarController2Interface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER2_ABI);
      const oldETHRegistarControllerInterface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER_ABI);
      const ethRegistarControllerInterface = new ethers.utils.Interface(ENS_ETHREGISTRARCONTROLLER_ABI);
      const nameWrapperInterface = new ethers.utils.Interface(ENS_NAMEWRAPPER_ABI);

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

      let total = 0;
      let t = this;
      async function processLogs(fromBlock, toBlock, logs) {
        total = parseInt(total) + logs.length;
        context.commit('setSyncCompleted', toBlock);
        logInfo("dataModule", "actions.syncSearchDatabase.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length + ", total: " + total);
        const records = [];
        for (const log of logs) {
          // console.log("log: " + JSON.stringify(log));
          if (!log.removed) {
            const contract = log.address;
            let eventRecord = null;
            if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f" && contract == ENS_OLDETHREGISTRARCONTROLLER1_ADDRESS) {
              // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
              const logData = oldETHRegistarController1Interface.parseLog(log);
              const [name, label, owner, cost, expires] = logData.args;
              if (ethers.utils.isValidName(name)) {
                eventRecord = { type: "NameRegistered", label: name, /*labelhash: label, owner, cost: cost.toString(), */expires: parseInt(expires) };
              }
            } else if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f" && contract == ENS_OLDETHREGISTRARCONTROLLER2_ADDRESS) {
              // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              const [name, label, owner, cost, expires] = logData.args;
              if (ethers.utils.isValidName(name)) {
                eventRecord = { type: "NameRegistered", label: name, /*labelhash: label, owner, cost: cost.toString(), */expires: parseInt(expires) };
              }
            } else if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f" && contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
              // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              const [name, label, owner, cost, expires] = logData.args;
              if (ethers.utils.isValidName(name)) {
                eventRecord = { type: "NameRegistered", label: name, /*labelhash: label, owner, cost: cost.toString(), */expires: parseInt(expires) };
              }
            } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_OLDETHREGISTRARCONTROLLER1_ADDRESS) {
              // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              const [name, label, cost, expires] = logData.args;
              if (ethers.utils.isValidName(name)) {
                eventRecord = { type: "NameRenewed", label: name, /*labelhash: label, cost: cost.toString(), */expires: parseInt(expires) };
              }
            } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_OLDETHREGISTRARCONTROLLER2_ADDRESS) {
              // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              const [name, label, cost, expires] = logData.args;
              if (ethers.utils.isValidName(name)) {
                eventRecord = { type: "NameRenewed", label: name, /*labelhash: label, cost: cost.toString(), */expires: parseInt(expires) };
              }
            } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_OLDETHREGISTRARCONTROLLER_ADDRESS) {
              // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              const logData = oldETHRegistarControllerInterface.parseLog(log);
              const [name, label, cost, expires] = logData.args;
              if (ethers.utils.isValidName(name)) {
                eventRecord = { type: "NameRenewed", label: name, /*labelhash: label, cost: cost.toString(), */expires: parseInt(expires) };
              }
            } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae" && contract == ENS_ETHREGISTRARCONTROLLER_ADDRESS) {
              // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              const logData = ethRegistarControllerInterface.parseLog(log);
              const [name, label, cost, expires] = logData.args;
              if (ethers.utils.isValidName(name)) {
                eventRecord = { type: "NameRenewed", label: name, /*labelhash: label, cost: cost.toString(), */expires: parseInt(expires) };
              }
            } else if (log.topics[0] == "0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340" && contract == ENS_NAMEWRAPPER_ADDRESS) {
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
              if (ethers.utils.isValidName(label)) {
                eventRecord = { type: "NameWrapped", /*namehash: node, name: nameString, */label, /*labelhash, subdomain, owner, fuses, */expiry: parseInt(expiry) };
              }
              // console.log(JSON.stringify(eventRecord, null, 2));
            } else if (log.topics[0] == "0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4" && contract == ENS_NAMEWRAPPER_ADDRESS) {
              // NameUnwrapped (index_topic_1 bytes32 node, address owner)
              const logData = nameWrapperInterface.parseLog(log);
              const [node, owner] = logData.args;
              eventRecord = { type: "NameUnwrapped", namehash: node/*, owner*/ };
            } else if (log.topics[0] == "0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340" && contract == "0x2411C98CC59D88e13Cc9CbFc576F7D40828aC47c") {
              console.log("IGNORING: " + JSON.stringify(log));
            } else {
              console.log("NOT HANDLED: " + JSON.stringify(log));
            }
            // if (eventRecord && (contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || contract == ENS_NAMEWRAPPER_ADDRESS)) {
            if (eventRecord) {
              records.push( {
                // chainId: parameter.chainId,
                blockNumber: parseInt(log.blockNumber),
                logIndex: parseInt(log.logIndex),
                // txIndex: parseInt(log.transactionIndex),
                txHash: log.transactionHash,
                // contract,
                ...eventRecord,
                confirmations: parameter.blockNumber - log.blockNumber,
              });
            }
          }
        }
        if (records.length) {
          await db.registrations.bulkAdd(records).then(function(lastKey) {
            console.log("syncSearchDatabase.bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log("syncSearchDatabase.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
        }
      }
      async function getLogs(fromBlock, toBlock, processLogs) {
        logInfo("dataModule", "actions.syncSearchDatabase.getLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock);
        try {
          const topics = [[
              '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f',
              '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae',
              '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340',
              // '0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4',
            ],
            null,
            null
          ];
          if (total < 100000000 && !store.getters['search/sync'].halt) {
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, logs);
          }
        } catch (e) {
          logInfo("dataModule", "actions.syncSearchDatabase.getLogs - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getLogs(fromBlock, mid, processLogs);
          await getLogs(parseInt(mid) + 1, toBlock, processLogs);
        }
      }

      logInfo("dataModule", "actions.syncSearchDatabase BEGIN");
      context.commit('setSyncSection', { section: 'Rego+Renew Events', total: parameter.blockNumber });

      const deleteCall = await db.registrations.where("confirmations").below(parameter.confirmations).delete();
      const latest = await db.registrations.where('[blockNumber+logIndex]').between([Dexie.minKey, Dexie.minKey],[Dexie.maxKey, Dexie.maxKey]).last();
      const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
      context.commit('setSyncCompleted', startBlock);
      logInfo("dataModule", "actions.syncSearchDatabase - startBlock: " + startBlock);
      await getLogs(startBlock, parameter.blockNumber, processLogs);
      logInfo("dataModule", "actions.syncSearchDatabase END");
    },

    async collateSearchDatabase(context, parameter) {
      logInfo("dataModule", "actions.collateSearchDatabase: " + JSON.stringify(parameter));
      const dbInfo = store.getters['data/db'];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      logInfo("dataModule", "actions.collateSearchDatabase BEGIN");
      let counter = 0;
      const nameMap = {};
      const total = await db.registrations.count();
      context.commit('setSyncSection', { section: 'Collating Names', total });
      // await db.registrations.orderBy('[label+blockNumber+logIndex]').limit(10).each(e => {
      await db.registrations.orderBy('[label+blockNumber+logIndex]').each(e => {
        let label = null;
        let expiry = null;
        if (e.type == "NameRegistered") {
          label = e.label;
          expiry = e.expires;
        } else if (e.type == "NameRenewed") {
          label = e.label;
          expiry = e.expires;
        } else if (e.type == "NameWrapped") {
          label = e.label;
          expiry = e.expiry;
          subdomain = e.subdomain;
        } else {
          // console.log(JSON.stringify(e));
        }
        // if (ethers.utils.isValidName(label)) {
          nameMap[label] = expiry;
        // } else {
        //   console.log("Invalid: '" + label + "' " + e.txHash);
        // }
        if ((counter % 10000) == 0) {
          context.commit('setSyncSection', { section: e.label.substring(0, 30), total });
          context.commit('setSyncCompleted', counter);
        }
        counter++;
        // if (store.getters['search/sync'].halt) {
        //   return false; // TODO: Does not work
        // }
      });
      const names = [];
      for (const [label, expiry] of Object.entries(nameMap)) {
        names.push([label, expiry]);
      }
      // console.log("names: " + JSON.stringify(names, null, 2));
      context.commit('setState', { name: "names", data: names });
      // console.log("context.state.names: " + JSON.stringify(context.state.names, null, 2));
      await context.dispatch('saveData', ['names']);
      logInfo("dataModule", "actions.collateSearchDatabase END");
    },
    async retrieveData(context, labels) {
      logInfo("dataModule", "actions.retrieveData: " + JSON.stringify(labels));
      const BATCHSIZE = 50;
      const DELAYINMILLIS = 2000;
      let completed = 0;
      context.commit('setSyncSection', { section: 'Details', total: labels.length });
      context.commit('setSyncCompleted', 0);
      const infos = {};
      for (let i = 0; i < labels.length && !context.state.sync.halt; i += BATCHSIZE) {
        const batch = labels.slice(i, parseInt(i) + BATCHSIZE);
        let continuation = null;
        // console.log("batch: " + JSON.stringify(batch));
        do {
          let url = "https://api.reservoir.tools/tokens/v7?";
          let separator = "";
          const tokenIdToLabelMap = {};
          for (let j = 0; j < batch.length; j++) {
            const labelhash = ethers.utils.solidityKeccak256(["string"], [batch[j]]);
            const labelhashDecimals = ethers.BigNumber.from(labelhash).toString();
            url = url + separator + "tokens=" + ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS + ":" + labelhashDecimals;
            separator = "&";
            tokenIdToLabelMap[labelhashDecimals] = batch[j];
          }
          url = url + (continuation != null ? "&continuation=" + continuation : '');
          url = url + "&limit=100&includeAttributes=true&includeLastSale=true&includeTopBid=true";
          console.log(url);
          const data = await fetch(url).then(response => response.json());
          continuation = data.continuation;
          let i = 0;
          for (token of data.tokens) {
            const tokenData = parseReservoirTokenData(token);
            const label = tokenIdToLabelMap[tokenData.tokenId];
            infos[label] = { ...tokenData, wrapped: false };
            completed++;
            i++;
          }
          context.commit('setSyncCompleted', completed);
          await delay(DELAYINMILLIS);
        } while (continuation != null && !context.state.sync.halt);
        console.log("infos: " + JSON.stringify(infos, null, 2));
        context.commit('setState', { name: "infos", data: infos });
        await context.dispatch('saveData', ['infos']);
      }
      context.commit('setSyncSection', { section: null, total: null });

      const wrappedNames = [];
      for (const [label, info] of Object.entries(infos)) {
        if (info.owner == ENS_NAMEWRAPPER_ADDRESS) {
          wrappedNames.push(label);
        }
      }
      completed = 0;
      context.commit('setSyncSection', { section: 'Wrapped Details', total: wrappedNames.length });
      context.commit('setSyncCompleted', 0);
      for (let i = 0; i < wrappedNames.length && !context.state.sync.halt; i += BATCHSIZE) {
        const batch = wrappedNames.slice(i, parseInt(i) + BATCHSIZE);
        let continuation = null;
        // console.log("batch: " + JSON.stringify(batch));
        do {
          let url = "https://api.reservoir.tools/tokens/v7?";
          let separator = "";
          const tokenIdToLabelMap = {};
          for (let j = 0; j < batch.length; j++) {
            let namehash = null;
            try {
              namehash = ethers.utils.namehash(batch[j] + ".eth");
              const namehashDecimals = ethers.BigNumber.from(namehash).toString();
              url = url + separator + "tokens=" + ENS_NAMEWRAPPER_ADDRESS + ":" + namehashDecimals;
              separator = "&";
              tokenIdToLabelMap[namehashDecimals] = batch[j];
            } catch (e) {
              console.log("Error namehash: " + batch[j] + " " + e.message);
            }
          }
          url = url + (continuation != null ? "&continuation=" + continuation : '');
          url = url + "&limit=100&includeAttributes=true&includeLastSale=true&includeTopBid=true";
          console.log(url);
          const data = await fetch(url).then(response => response.json());
          continuation = data.continuation;
          let i = 0;
          for (token of data.tokens) {
            const tokenData = parseReservoirTokenData(token);
            const label = tokenIdToLabelMap[tokenData.tokenId];
            infos[label] = { ...tokenData, wrapped: true };
            completed++;
            i++;
          }
          context.commit('setSyncCompleted', completed);
          await delay(DELAYINMILLIS);
        } while (continuation != null && !context.state.sync.halt);
        console.log("infos: " + JSON.stringify(infos, null, 2));
        context.commit('setState', { name: "infos", data: infos });
        await context.dispatch('saveData', ['infos']);
      }
      context.commit('setSyncSection', { section: null, total: null });
      context.commit('setSyncHalt', false);
      logInfo("dataModule", "actions.retrieveData END");
    },
  },
};
