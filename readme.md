# SPV Client
A lightweight SPV Client that syncs and stores block headers, validates SPV proofs, and optionally shares them with other SPV Clients via its inbuilt REST API.

### What is an SPV Client?
Section 8 of the Bitcoin whitepaper, Simplifiied Payment Verification (SPV), is a method of being able to verify that a transaction has been recorded within the longest chain of proof of work without having to run a full node. The method outlined in the whitepaper requires a sender to provide the merkle proofs for the transaction, and the validator to maintaining a copy of the block headers for the longest chain of proof of work. This allows an SPV Client primary purpose of SPV is to reclaim disk space without compromising on security. As such, When it comes to SPV and SPV services, we have defined several modes of operation:

__1. SPV Node__ - An SPV node is a node designed for generating SPV proofs and providing SPV-related cloud services. It is distinct from a Bitcoin full node in that it does not require the complete dataset of the blockchain. Instead, it is able to simply maintain the little endian transaction hashes at the base layer of the merkle tree of each block in the Bitcoin blockchain, along with their transaction indexes within the block, and a full set of Bitcoin block headers (~34gb at time of publishing with a full set of merkle branches). From this, the SPV node is able to generate SPV proofs either just in time (JIT), ahead of time (AOT), or a mixture of the two. By default, our SPV Client software syncs up to MatterCloud's SPV Node service, however it is recommended that other miners and blockchain service providers also run SPV nodes to power their cloud services, enabling their customers and the ecosystem as a whole to benefit from SPV.

__2. SPV Client__ - An SPV client maintains a full set of block headers, validating each header as it is received to ensure it comes from the preceeding header in the longest chain of proof of work. From this, they are able to validate SPV proofs, as well as reseed the entire header set to other SPV clients in order to assist in the propagation of Bitcoin block headers outside of the P2P broadcast network, creating an anti-fragile system (~90mb at time of publishing). It is recommended that the majority of applications and wallets at least run an SPV Client.

__3. SPV Light Client__ - An SPV Light Client communicates with either an SPV Client or SPV Node to sync up and validate the block headers, but only maintains a lightweight subset of the headers for validating the SPV proofs it cares about. For example: An SPV Light Client tasked with validating SPV proofs purely for layer 1 tokens that could only have existed after the Genesis Upgrade would be able to discard all block headers prior to block #620538 after validating them, retaining only the tiny subset of the block headers required to fulfil its specific task (a mere ~2.7mb at the time of publishing).

Assuming the filesystem is safe and will not suffer from flipping bits or corruption, while not recommended, the above client could also take an even more radical approach to pruning, discardning all information in the block headers not used for validating SPV proofs or handing reorgs. This means that after validating the chain of proof ot work, it would only need to maintain the block hash and merkle root for these headers  (~1.8mb at time of publishing). This kind of aggressive pruning model for SPV Light Clients may be particualrly useful in low-powered computing and IoT applications, but does come with the downside of not being able to recheck the chain of proof of work from genesis locally after pruning.

### Installation
To install the SPV Client, simply clone this repo, install it and run it like so:

```sh
$ git clone https://github.com/MatterPool/spv-client.git
$ cd spv-client
$ npm install
$ npm run start
```

### Configuration
While the SPV Client defaults to MatterCloud's header beacon, it is possible to set the peer to any other SPV Client in the config file：
```js
//config/index.js
peer: "https://spv.mywebsite.com/api/v1/header"
```

### API

Every SPV Client also has an inbuilt API that other nodes can use to sync up block headers, check node status and verify SPV proofs. The API endpoints are as follows:

##### GET Status

`/api/v1/status` - Get the current status of an SPV Client, including it's best height and block hash.

##### GET Header

`/api/v1/header/:header` - Get headers by either hash or height, along with up to 10,000 headers in either direction. 

Accepts the following route parameters:
`:header` - Insert either a header hash or height for your query.

Accepts the following query parameters:
`order` - Request headers in ascending or descending order, accepts: `ASC|DESC`
`limit` - Request a limited number of headers. accepts: `1-10000`

##### GET Verify

`/api/v1/verify/:proof` - Verify either a RAWSPV or SPVTX from an SPV Client. Please note, this may not work for all SPVTXs as some of them exceed the maximum size of a URL. It is recommended to use the POST endpoint where possible.

Accepts the following route parameters:
`:proof` - A hex encoded RAWTX or SPVTX

##### POST verify
`/api/v1/verify` - Verify a RAWSPV or SPVTX from an SPV Client.

Accepts a JSON body with one of the following two formats:

```json
{ "spvtx": "<spvtx in hex encoding>" }
```
or
```json
{ "rawspv": "<rawspv in hex encoding>" }
```



# Acknowledgements
[@deanmlittle](https://twitter.com/deanmlittle)/[u40](https://twetch.app/u/40) - Creator of RAWSPV and SPVTX formats, SPV.js bsv2 extension, SPV Client, SPV Node and Mattercloud SPV API software.

[@attilaaros](https://twitter.com/AttilaAros)/[u205](https://twetch.app/u/205) - Creator of TXDB, the enabling technology that allowed us to prove that SPV truly does work at scale.

# License
The idea of exclusive licensing becomes somewhat arbitrary when a piece of software is only really useful on a UTXO-based blockchain with massive scale. To anyone wishing to use this elsewhere, we wish you the best of luck, you're going to need it.