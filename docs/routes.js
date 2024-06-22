const routes = [{
    path: '/config',
    component: Config,
    name: 'Config',
  }, {
    path: '/names',
    component: Names,
    name: 'Names',
  }, {
    path: '/search',
    component: Search,
    name: 'Search',
  }, {
    path: '/addresses',
    component: Addresses,
    name: 'Addresses',
  }, {
    path: '*',
    component: Welcome,
    name: ''
  }
];
