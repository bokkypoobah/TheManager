// ----------------------------------------------------------------------------
// Script to scrape data from a local ethereum node
//
// Execute `npm install --save ethers@5.7` before first use
// Testing `npm install --save ethers@6.13` before first use
// Then execute `node 01_scrapeData.js`
//
// Enjoy!
// onlyfens.eth, Only for ENS © Bok Consulting Pty Ltd 2024, MIT license
// ----------------------------------------------------------------------------

var fs = require('fs');
const util = require('util');
// npm install --save ethers@5.7
const { ethers } = require("ethers");


// ENS: Old ETH Registrar Controller 1 deployed Apr-30-2019 03:54:13 AM +UTC
const ENS_OLDETHREGISTRARCONTROLLER1_ADDRESS = "0xF0AD5cAd05e10572EfcEB849f6Ff0c68f9700455";
const ENS_OLDETHREGISTRARCONTROLLER1_ABI = [{"constant":true,"inputs":[{"name":"interfaceID","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_prices","type":"address"}],"name":"setPriceOracle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_minCommitmentAge","type":"uint256"},{"name":"_maxCommitmentAge","type":"uint256"}],"name":"setCommitmentAges","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"commitments","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"name","type":"string"},{"name":"duration","type":"uint256"}],"name":"rentPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string"},{"name":"owner","type":"address"},{"name":"duration","type":"uint256"},{"name":"secret","type":"bytes32"}],"name":"register","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"MIN_REGISTRATION_DURATION","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minCommitmentAge","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"name","type":"string"}],"name":"valid","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string"},{"name":"duration","type":"uint256"}],"name":"renew","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"name","type":"string"}],"name":"available","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxCommitmentAge","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"commitment","type":"bytes32"}],"name":"commit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"name","type":"string"},{"name":"owner","type":"address"},{"name":"secret","type":"bytes32"}],"name":"makeCommitment","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"inputs":[{"name":"_base","type":"address"},{"name":"_prices","type":"address"},{"name":"_minCommitmentAge","type":"uint256"},{"name":"_maxCommitmentAge","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"name","type":"string"},{"indexed":true,"name":"label","type":"bytes32"},{"indexed":true,"name":"owner","type":"address"},{"indexed":false,"name":"cost","type":"uint256"},{"indexed":false,"name":"expires","type":"uint256"}],"name":"NameRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"name","type":"string"},{"indexed":true,"name":"label","type":"bytes32"},{"indexed":false,"name":"cost","type":"uint256"},{"indexed":false,"name":"expires","type":"uint256"}],"name":"NameRenewed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"oracle","type":"address"}],"name":"NewPriceOracle","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];

// ENS: Old ETH Registrar Controller 2 deployed Nov-04-2019 12:43:55 AM +UTC
const ENS_OLDETHREGISTRARCONTROLLER2_ADDRESS = "0xB22c1C159d12461EA124b0deb4b5b93020E6Ad16";
const ENS_OLDETHREGISTRARCONTROLLER2_ABI = [{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceID","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"secret","type":"bytes32"},{"internalType":"address","name":"resolver","type":"address"},{"internalType":"address","name":"addr","type":"address"}],"name":"makeCommitmentWithConfig","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"internalType":"contract PriceOracle","name":"_prices","type":"address"}],"name":"setPriceOracle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_minCommitmentAge","type":"uint256"},{"internalType":"uint256","name":"_maxCommitmentAge","type":"uint256"}],"name":"setCommitmentAges","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"commitments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"rentPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"bytes32","name":"secret","type":"bytes32"}],"name":"register","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"MIN_REGISTRATION_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minCommitmentAge","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"valid","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"renew","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"available","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxCommitmentAge","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"commitment","type":"bytes32"}],"name":"commit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"secret","type":"bytes32"}],"name":"makeCommitment","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"bytes32","name":"secret","type":"bytes32"},{"internalType":"address","name":"resolver","type":"address"},{"internalType":"address","name":"addr","type":"address"}],"name":"registerWithConfig","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"contract BaseRegistrar","name":"_base","type":"address"},{"internalType":"contract PriceOracle","name":"_prices","type":"address"},{"internalType":"uint256","name":"_minCommitmentAge","type":"uint256"},{"internalType":"uint256","name":"_maxCommitmentAge","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":true,"internalType":"bytes32","name":"label","type":"bytes32"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"cost","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expires","type":"uint256"}],"name":"NameRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":true,"internalType":"bytes32","name":"label","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"cost","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expires","type":"uint256"}],"name":"NameRenewed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oracle","type":"address"}],"name":"NewPriceOracle","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];

// ENS: Old ETH Registrar Controller deployed Jan-30-2020 12:56:38 AM +UTC
const ENS_OLDETHREGISTRARCONTROLLER_ADDRESS = "0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5";
const ENS_OLDETHREGISTRARCONTROLLER_ABI = [{"inputs":[{"internalType":"contract BaseRegistrar","name":"_base","type":"address"},{"internalType":"contract PriceOracle","name":"_prices","type":"address"},{"internalType":"uint256","name":"_minCommitmentAge","type":"uint256"},{"internalType":"uint256","name":"_maxCommitmentAge","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":true,"internalType":"bytes32","name":"label","type":"bytes32"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"cost","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expires","type":"uint256"}],"name":"NameRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":true,"internalType":"bytes32","name":"label","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"cost","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expires","type":"uint256"}],"name":"NameRenewed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oracle","type":"address"}],"name":"NewPriceOracle","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":true,"inputs":[],"name":"MIN_REGISTRATION_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"available","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"commitment","type":"bytes32"}],"name":"commit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"commitments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"secret","type":"bytes32"}],"name":"makeCommitment","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"secret","type":"bytes32"},{"internalType":"address","name":"resolver","type":"address"},{"internalType":"address","name":"addr","type":"address"}],"name":"makeCommitmentWithConfig","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"maxCommitmentAge","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minCommitmentAge","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"bytes32","name":"secret","type":"bytes32"}],"name":"register","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"bytes32","name":"secret","type":"bytes32"},{"internalType":"address","name":"resolver","type":"address"},{"internalType":"address","name":"addr","type":"address"}],"name":"registerWithConfig","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"renew","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"rentPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_minCommitmentAge","type":"uint256"},{"internalType":"uint256","name":"_maxCommitmentAge","type":"uint256"}],"name":"setCommitmentAges","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"contract PriceOracle","name":"_prices","type":"address"}],"name":"setPriceOracle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceID","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"valid","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];

// ENS: ETH Registrar Controller deployed Mar-28-2023 11:44:59 AM +UTC
const ENS_ETHREGISTRARCONTROLLER_ADDRESS = "0x253553366Da8546fC250F225fe3d25d0C782303b";
const ENS_ETHREGISTRARCONTROLLER_ABI = [{"inputs":[{"internalType":"contract BaseRegistrarImplementation","name":"_base","type":"address"},{"internalType":"contract IPriceOracle","name":"_prices","type":"address"},{"internalType":"uint256","name":"_minCommitmentAge","type":"uint256"},{"internalType":"uint256","name":"_maxCommitmentAge","type":"uint256"},{"internalType":"contract ReverseRegistrar","name":"_reverseRegistrar","type":"address"},{"internalType":"contract INameWrapper","name":"_nameWrapper","type":"address"},{"internalType":"contract ENS","name":"_ens","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"bytes32","name":"commitment","type":"bytes32"}],"name":"CommitmentTooNew","type":"error"},{"inputs":[{"internalType":"bytes32","name":"commitment","type":"bytes32"}],"name":"CommitmentTooOld","type":"error"},{"inputs":[{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"DurationTooShort","type":"error"},{"inputs":[],"name":"InsufficientValue","type":"error"},{"inputs":[],"name":"MaxCommitmentAgeTooHigh","type":"error"},{"inputs":[],"name":"MaxCommitmentAgeTooLow","type":"error"},{"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"NameNotAvailable","type":"error"},{"inputs":[],"name":"ResolverRequiredWhenDataSupplied","type":"error"},{"inputs":[{"internalType":"bytes32","name":"commitment","type":"bytes32"}],"name":"UnexpiredCommitmentExists","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":true,"internalType":"bytes32","name":"label","type":"bytes32"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"baseCost","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"premium","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expires","type":"uint256"}],"name":"NameRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":true,"internalType":"bytes32","name":"label","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"cost","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expires","type":"uint256"}],"name":"NameRenewed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"MIN_REGISTRATION_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"available","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"commitment","type":"bytes32"}],"name":"commit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"commitments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"bytes32","name":"secret","type":"bytes32"},{"internalType":"address","name":"resolver","type":"address"},{"internalType":"bytes[]","name":"data","type":"bytes[]"},{"internalType":"bool","name":"reverseRecord","type":"bool"},{"internalType":"uint16","name":"ownerControlledFuses","type":"uint16"}],"name":"makeCommitment","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"maxCommitmentAge","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minCommitmentAge","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nameWrapper","outputs":[{"internalType":"contract INameWrapper","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"prices","outputs":[{"internalType":"contract IPriceOracle","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"recoverFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"bytes32","name":"secret","type":"bytes32"},{"internalType":"address","name":"resolver","type":"address"},{"internalType":"bytes[]","name":"data","type":"bytes[]"},{"internalType":"bool","name":"reverseRecord","type":"bool"},{"internalType":"uint16","name":"ownerControlledFuses","type":"uint16"}],"name":"register","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"renew","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"rentPrice","outputs":[{"components":[{"internalType":"uint256","name":"base","type":"uint256"},{"internalType":"uint256","name":"premium","type":"uint256"}],"internalType":"struct IPriceOracle.Price","name":"price","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reverseRegistrar","outputs":[{"internalType":"contract ReverseRegistrar","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceID","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"valid","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

// Dodgy? NameWrapper 0x2411C98CC59D88e13Cc9CbFc576F7D40828aC47c Apr-21-2023 12:49:11 PM +UTC

// NameWrapper Mar-28-2023 11:42:59 AM +UTC
const ENS_NAMEWRAPPER_ADDRESS = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401";
const ENS_NAMEWRAPPER_ABI = [{"inputs":[{"internalType":"contract ENS","name":"_ens","type":"address"},{"internalType":"contract IBaseRegistrar","name":"_registrar","type":"address"},{"internalType":"contract IMetadataService","name":"_metadataService","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"CannotUpgrade","type":"error"},{"inputs":[],"name":"IncompatibleParent","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"IncorrectTargetOwner","type":"error"},{"inputs":[],"name":"IncorrectTokenType","type":"error"},{"inputs":[{"internalType":"bytes32","name":"labelHash","type":"bytes32"},{"internalType":"bytes32","name":"expectedLabelhash","type":"bytes32"}],"name":"LabelMismatch","type":"error"},{"inputs":[{"internalType":"string","name":"label","type":"string"}],"name":"LabelTooLong","type":"error"},{"inputs":[],"name":"LabelTooShort","type":"error"},{"inputs":[],"name":"NameIsNotWrapped","type":"error"},{"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"}],"name":"OperationProhibited","type":"error"},{"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"}],"name":"Unauthorised","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"controller","type":"address"},{"indexed":false,"internalType":"bool","name":"active","type":"bool"}],"name":"ControllerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"node","type":"bytes32"},{"indexed":false,"internalType":"uint64","name":"expiry","type":"uint64"}],"name":"ExpiryExtended","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"node","type":"bytes32"},{"indexed":false,"internalType":"uint32","name":"fuses","type":"uint32"}],"name":"FusesSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"node","type":"bytes32"},{"indexed":false,"internalType":"address","name":"owner","type":"address"}],"name":"NameUnwrapped","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"node","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"name","type":"bytes"},{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint32","name":"fuses","type":"uint32"},{"indexed":false,"internalType":"uint64","name":"expiry","type":"uint64"}],"name":"NameWrapped","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"value","type":"string"},{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"URI","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"_tokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"},{"internalType":"uint32","name":"fuseMask","type":"uint32"}],"name":"allFusesBurned","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"}],"name":"canExtendSubnames","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"}],"name":"canModifyName","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"controllers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ens","outputs":[{"internalType":"contract ENS","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"parentNode","type":"bytes32"},{"internalType":"bytes32","name":"labelhash","type":"bytes32"},{"internalType":"uint64","name":"expiry","type":"uint64"}],"name":"extendExpiry","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"operator","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"getData","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint32","name":"fuses","type":"uint32"},{"internalType":"uint64","name":"expiry","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"parentNode","type":"bytes32"},{"internalType":"bytes32","name":"labelhash","type":"bytes32"}],"name":"isWrapped","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"}],"name":"isWrapped","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"metadataService","outputs":[{"internalType":"contract IMetadataService","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"names","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"onERC721Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"recoverFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"label","type":"string"},{"internalType":"address","name":"wrappedOwner","type":"address"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"address","name":"resolver","type":"address"},{"internalType":"uint16","name":"ownerControlledFuses","type":"uint16"}],"name":"registerAndWrapETH2LD","outputs":[{"internalType":"uint256","name":"registrarExpiry","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"registrar","outputs":[{"internalType":"contract IBaseRegistrar","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"renew","outputs":[{"internalType":"uint256","name":"expires","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"parentNode","type":"bytes32"},{"internalType":"bytes32","name":"labelhash","type":"bytes32"},{"internalType":"uint32","name":"fuses","type":"uint32"},{"internalType":"uint64","name":"expiry","type":"uint64"}],"name":"setChildFuses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"controller","type":"address"},{"internalType":"bool","name":"active","type":"bool"}],"name":"setController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"},{"internalType":"uint16","name":"ownerControlledFuses","type":"uint16"}],"name":"setFuses","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IMetadataService","name":"_metadataService","type":"address"}],"name":"setMetadataService","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"resolver","type":"address"},{"internalType":"uint64","name":"ttl","type":"uint64"}],"name":"setRecord","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"},{"internalType":"address","name":"resolver","type":"address"}],"name":"setResolver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"parentNode","type":"bytes32"},{"internalType":"string","name":"label","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint32","name":"fuses","type":"uint32"},{"internalType":"uint64","name":"expiry","type":"uint64"}],"name":"setSubnodeOwner","outputs":[{"internalType":"bytes32","name":"node","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"parentNode","type":"bytes32"},{"internalType":"string","name":"label","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"resolver","type":"address"},{"internalType":"uint64","name":"ttl","type":"uint64"},{"internalType":"uint32","name":"fuses","type":"uint32"},{"internalType":"uint64","name":"expiry","type":"uint64"}],"name":"setSubnodeRecord","outputs":[{"internalType":"bytes32","name":"node","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"},{"internalType":"uint64","name":"ttl","type":"uint64"}],"name":"setTTL","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract INameWrapperUpgrade","name":"_upgradeAddress","type":"address"}],"name":"setUpgradeContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"parentNode","type":"bytes32"},{"internalType":"bytes32","name":"labelhash","type":"bytes32"},{"internalType":"address","name":"controller","type":"address"}],"name":"unwrap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"labelhash","type":"bytes32"},{"internalType":"address","name":"registrant","type":"address"},{"internalType":"address","name":"controller","type":"address"}],"name":"unwrapETH2LD","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"extraData","type":"bytes"}],"name":"upgrade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"upgradeContract","outputs":[{"internalType":"contract INameWrapperUpgrade","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"address","name":"wrappedOwner","type":"address"},{"internalType":"address","name":"resolver","type":"address"}],"name":"wrap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"label","type":"string"},{"internalType":"address","name":"wrappedOwner","type":"address"},{"internalType":"uint16","name":"ownerControlledFuses","type":"uint16"},{"internalType":"address","name":"resolver","type":"address"}],"name":"wrapETH2LD","outputs":[{"internalType":"uint64","name":"expiry","type":"uint64"}],"stateMutability":"nonpayable","type":"function"}];

function decodeNameWrapperBytes(b) {
  let start = 4;
  let len = ethers.BigNumber.from("0x" + b.substring(2, 4));
  const parts = [];
  while (len > 0) {
    const str = b.substring(start, start + len * 2);
    let strUtf8 = ethers.utils.toUtf8String("0x" + str);
    parts.push(strUtf8);
    const s = b.substring(start + len * 2, start + len * 2 + 2);
    const newStart = start + len * 2 + 2;
    len = ethers.BigNumber.from("0x" + b.substring(start + len * 2, start + len * 2 + 2));
    start = newStart;
  }
  return parts;
}

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

const oldETHRegistarController1Interface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER1_ABI);
const oldETHRegistarController2Interface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER2_ABI);
const oldETHRegistarControllerInterface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER_ABI);
const ethRegistarControllerInterface = new ethers.utils.Interface(ENS_ETHREGISTRARCONTROLLER_ABI);
const nameWrapperInterface = new ethers.utils.Interface(ENS_NAMEWRAPPER_ABI);

let total = 0;

async function processLogs(fromBlock, toBlock, logs) {
  const range = toBlock - fromBlock;
  total = parseInt(total) + logs.length;
  console.log("processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", range: " + range + ", logs.length: " + logs.length + ", total: " + total);
  for (const log of logs) {
    const contract = log.address;
    let eventRecord = null;
    // console.log("log: " + JSON.stringify(log, null, 2));
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
      // console.log("NameWrapper - nameString: " + nameString + ", expiry: " + expiry);
      let label = null;
      // let labelhash = null;
      // let labelhashDecimals = null;
      // console.log("parts: " + JSON.stringify(parts));
      if (parts.length >= 2 && parts[parts.length - 1] == "eth" && ethers.utils.isValidName(nameString)) {
        // parts = parts.splice(-1);
        // console.log("parts: " + JSON.stringify(parts));
        label = parts.join(".").replace(/\.eth$/, '');
        // label = parts[parts.length - 2];
      //   labelhash = ethers.utils.solidityKeccak256(["string"], [label]);
      //   labelhashDecimals = ethers.BigNumber.from(labelhash).toString();
      eventRecord = { type: "NameWrapped", /*namehash: node, name: nameString, */label, /*labelhash, subdomain, owner, fuses, */expiry: parseInt(expiry) };
      }
      // const namehashDecimals = ethers.BigNumber.from(node).toString();
      // const subdomain = parts.length >= 3 && parts[parts.length - 3] || null;
      // console.log("subdomain: " + subdomain);
      // if (ethers.utils.isValidName(label)) {
      //   eventRecord = { type: "NameWrapped", /*namehash: node, name: nameString, */label, /*labelhash, subdomain, owner, fuses, */expiry: parseInt(expiry) };
      // }
      // console.log(JSON.stringify(eventRecord, null, 2));
    }
    if (eventRecord) {
      console.log(JSON.stringify(eventRecord));
    }
  }
}

async function scrapeLog(provider, fromBlock, toBlock) {
  const range = toBlock - fromBlock;
  let divide = false;
  if (range <= 50000) {
    console.log("scrapeLog - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", range: " + range);
    try {
      const topics = [
        [
          '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', // NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
          '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
          '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', // NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
          // '0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4', // NameUnwrapped (index_topic_1 bytes32 node, address owner)
        ],
      ];
      const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
      console.log("logs: " + JSON.stringify(logs, null, 2));
      await processLogs(fromBlock, toBlock, logs);
    } catch (e) {
      console.log("scrapeLog - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
      divide = true;
    }
  } else {
    divide = true;
  }
  if (divide) {
    const mid = parseInt((fromBlock + toBlock) / 2);
    await scrapeLog(provider, fromBlock, mid);
    await scrapeLog(provider, parseInt(mid) + 1, toBlock);
  }
}

async function doIt() {
  const provider = new ethers.providers.JsonRpcProvider(); // ethers.js 5.x
  // const provider = ethers.getDefaultProvider("http://localhost:8545/"); // ethers.js 6.x
  // const signer = provider.getSigner()
  const blockNumber = await provider.getBlockNumber();
  console.log("blockNumber: " + blockNumber);
  // const startBlock = 7666495; // older one
  // const startBlock = 16925608; // NameWrapper
  const endBlock = blockNumber;
  const startBlock = endBlock - 10000;
  // const endBlock = startBlock + 100000;

  // const startBlock = 20167298;
  // const endBlock = 20167298;
  // const startBlock = 17525788; // ceo.collections.eth
  // const endBlock = 17525788;


  await scrapeLog(provider, startBlock, endBlock);

  // const tx = await provider.getTransaction("0x0277c0e10517f112bd7faab0680bba313902dcb2191389067426c06e1d05762f");
  // const txReceipt = await provider.getTransactionReceipt("0x0277c0e10517f112bd7faab0680bba313902dcb2191389067426c06e1d05762f");
  // console.log("tx: " + JSON.stringify(tx, null, 2));
  // console.log("txReceipt: " + JSON.stringify(txReceipt, null, 2));

  // const block = 20167298;
  //
  // const topics = [
  //   [
  //     // '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', // NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
  //     // '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
  //     '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', // NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
  //   //   // '0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4',
  //   ],
  //   // null,
  //   // null,
  //   // null
  // ];
  //
  // const logs = await provider.getLogs({ address: null, fromBlock: block, toBlock: block, topics });
  // console.log("logs: " + JSON.stringify(logs, null, 2));

  // const cdboc = new ethers.Contract(CDBOCADDRESS, CDBOCABI, provider);
  // const cdbocBuilder = new ethers.Contract(CDBOCBUILDERADDRESS, CDBOCBUILDERABI, provider);
  //
  // console.log("Hello");
  // const data = [];
  // for (const item of TXS.slice(0, 10000)) {
  //   const txHash = item[0];
  //   const txType = item[1];
  //   if (txType == "Set Data") {
  //     const tx = await provider.getTransaction(txHash);
  //     console.log(txHash + " " + tx.data.substring(0, 100));
  //     let decodedData = cdbocBuilder.interface.parseTransaction({ data: tx.data, value: tx.value });
  //     // console.log(JSON.stringify(decodedData));
  //     const txReceipt = await provider.getTransactionReceipt(txHash);
  //     data.push({ tx, txReceipt, decodedData });
  //   }
  //   // console.log(tx.data);
  //   // const block = await provider.getBlock(txReceipt.blockNumber);
  //   // let decodedData = cdboc.interface.parseTransaction({ data: tx.data, value: tx.value });
  //   // data.push({ tx, txReceipt, decodedData });
  // }
  //
  // for (const item of data) {
  //   console.log(item.tx.data.substring(0, 100));
  // }
  //
  // // console.log("txHash\tlayer\ttuple#\tname\tmimeType\tdata");
  // for (const item of data) {
  //   const key = item.decodedData.args[0];
  //   const imageData = item.decodedData.args[1];
  //   let buffer = Buffer.from(imageData.substring(2), "hex");
  //   let filename = "images/image_" + key + '.unknownformat';
  //   console.log(key + " => " + imageData.substring(0, 100) + " " + filename);
  //   fs.writeFile(filename, buffer, (err) => {
  //     if (err) return console.error(err);
  //     // console.log("File successfully written !");
  //   });
  // //   let tupleIndex = 0;
  //   // for (const tuple of item.decodedData.args[1]) {
  // //     // console.log(item.tx.hash + "\t" + item.decodedData.args[0] + "\t" + tupleIndex + "\t" + tuple[0] + "\t" + tuple[1] + "\t" + tuple[2].substring(0, 10) + "\t" + tuple[3] + "\t" + tuple[4]);
  // //     const name = tuple[0].toLowerCase().replace(/['\/ @]/g, '');
  // //     let buffer = Buffer.from(tuple[2].substring(2), "hex");
  // //     let filename = "images/layer" + item.decodedData.args[0] + "-trait" + tupleIndex.toString().padStart(3, '0') + "-" + name + '.' + tuple[1].replace(/^.*\//, '');
  // //     console.log('\n#### Layer ' + item.decodedData.args[0] + ' ' + LAYERNAMES[item.decodedData.args[0]] + ' Trait ' + tupleIndex.toString().padStart(3, '0') + ' ' + tuple[0]);
  // //     fs.writeFile(filename, buffer, (err) => {
  // //       if (err) return console.error(err);
  // //       // console.log("File successfully written !");
  // //     });
  // //
  // //     filename = "svgs/layer" + item.decodedData.args[0] + "-trait" + tupleIndex.toString().padStart(3, '0')+ "-" + name + ".svg"; // + tuple[1].replace(/^.*\//, '');
  // //     // console.log('<kbd><img src="scripts/' + filename + '" width="150px" height="150px" style="image-rendering: pixelated !important;" /></kbd>'); //  + ' ' + buffer);
  // //     console.log('<kbd><img src="scripts/' + filename + '" width="300px" height="300px" /></kbd>'); //  + ' ' + buffer);
  // //     const base64 = buffer.toString('base64');
  // //     const content = '<svg width="1200" height="1200" viewBox="0 0 1200 1200" version="1.2" xmlns="http://www.w3.org/2000/svg" style="background-color:transparent;background-image:url(data:' + tuple[1] + ';base64,' +
  // //       base64 + ');background-repeat:no-repeat;background-size:contain;background-position:center;image-rendering:-webkit-optimize-contrast;-ms-interpolation-mode:nearest-neighbor;image-rendering:-moz-crisp-edges;image-rendering:pixelated;"></svg>';
  // //     fs.writeFile(filename, content, (err) => {
  // //       if (err) return console.error(err);
  // //       // console.log("File successfully written !");
  // //     });
  // //
  // //     tupleIndex++;
  //   // }
  // }
}

doIt();

// console.log(process.cwd());
