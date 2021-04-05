const { Keyring } = require('@polkadot/keyring')
const {
  cryptoWaitReady,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  naclKeypairFromSeed
} = require('@polkadot/util-crypto')
const { hexToU8a, isHex, u8aToHex } = require('@polkadot/util');
const Gun = require('gun')
const util = require('util')
const nacl = require('tweetnacl');
const fs = require('fs');

// https://gun.eco/docs/SEA
async function gunCrypto() {
  /**
   * Crypto types
   * ECDSA for signing
   * ECDH for encryption
   * */

  /*
  const SEA = Gun.SEA
  const pair = await SEA.pair()
  console.log(pair)
  */
  gun = Gun()
  user = gun.user()

  const alias = "Kevin"
  const pass = "password"
  /*
  user.create(alias, pass, (ack) => {
    console.log(ack)
  })
  */
  user.auth(alias, pass, (ack) => {
    /*
    console.log(
      util.inspect(ack, false, null, true)
    )
    */
    console.log(ack.$._.user)
  })
}

// https://github.com/dchest/tweetnacl-js
async function naclCrypto() {
  const { publicKey, secretKey } = nacl.sign.keyPair()

  console.log('publicKey', u8aToHex(publicKey))
  console.log('secretKey', u8aToHex(secretKey))
}

// https://polkadot.js.org/docs/
async function polkadotCrypto() {
  // we only need to do this once per app, somewhere in our init code
  await cryptoWaitReady()

  /**
   * Crypto Types
   * --------
   * ed25519
   * sr25519
   * ecdsa
   *
   * ss58Format
   * -----------
   *  42  - standard substrate
   *  2   - kusama
   *  0   - polkadot
   * */
  const keyring = new Keyring({ type: 'ecdsa', ss58Format: 42 });

  const mnemonic = mnemonicGenerate()
  console.log('mnemonic: ')
  console.log(mnemonic)
  console.log(' ')
  console.log(' ')

  const seed = mnemonicToMiniSecret(mnemonic)
  console.log('seed: ')
  console.log(seed)
  console.log(' ')
  console.log(' ')

  const { publicKey, secretKey } = naclKeypairFromSeed(seed)

  // naclKeypair produces the same pubkey as ed25519
  console.log('naclKeypair: pubKey', u8aToHex(publicKey))
  console.log('key length: ', u8aToHex(publicKey).length)
  console.log('naclKeypair: secretKey', u8aToHex(secretKey))
  console.log('key length: ', u8aToHex(secretKey).length)
  console.log(' ')

  const ed25519Pair = keyring.addFromUri(mnemonic, { name: 'ed25519' }, 'ed25519')
  const sr25519Pair = keyring.addFromUri(mnemonic, { name: 'sr25519' }, 'sr25519')
  const ecdsaPair = keyring.addFromUri(mnemonic, { name: 'ecdsa' }, 'ecdsa')

  console.log('edwards: ed25519 pubKey', u8aToHex(ed25519Pair.publicKey))
  console.log('key length: ', u8aToHex(ed25519Pair.publicKey).length)
  console.log('address: ', ed25519Pair.address)
  console.log(' ')

  console.log('schnorkel: sr25519 pubKey', u8aToHex(sr25519Pair.publicKey))
  console.log('key length: ', u8aToHex(sr25519Pair.publicKey).length)
  console.log('address: ', sr25519Pair.address)
  console.log(' ')

  console.log('ethereum: ecdsa pubKey', u8aToHex(ecdsaPair.publicKey))
  console.log('key length: ', u8aToHex(ecdsaPair.publicKey).length)
  console.log('address: ', ecdsaPair.address)
  console.log(' ')


  const password = 'test1234'
  const address = ed25519Pair.address
  const backup = JSON.stringify(keyring.getPair(address).toJson(password))
  console.log('backup', backup)
  fs.writeFile('backup.json', backup, function (err) {
    if (err) return console.log(err);
    console.log('Backed Up! : backup.json');
  });
}


async function main() {
  await polkadotCrypto()
  //await gunCrypto()
  //await naclCrypto()
}

main()
