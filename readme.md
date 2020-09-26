# SPV Client
A lightweight SPV Client that syncs and stores block headers, validates SPV proofs, and optionally shares them with other SPV Clients via its inbuilt REST API.

### Introduction
Section 8 of the Bitcoin whitepaper, entitled: Simplifiied Payment Verification (SPV), is a means of proving that a transaction has been recorded within a certain Bitcoin block by maintaining only its merkle proofs and a copy of the block headers in the longest chain of proof of work. The primary purpose of SPV is to reclaim disk space without compromising on security. As such, When it comes to SPV and SPV services, we have defined several modes of operation:

__1. SPV Node__ - An SPV node is a node designed for generating SPV proofs and providing SPV-related cloud services. It is distinct from a Bitcoin full node in that it does not require the complete dataset of the blockchain. Instead, it is able to simply maintain the little endian transaction hashes at the base layer of the merkle tree of each block in the Bitcoin blockchain, along with their transaction indexes within the block, and a full set of Bitcoin block headers (~34gb at time of publishing with a full set of merkle branches). From this, the SPV node is able to generate SPV proofs either just in time (JIT), ahead of time (AOT), or a mixture of the two. It is recommended that miners and blockchain service providers run SPV nodes to power their cloud services and enable their customers to benefit from SPV.

__2. SPV Client__ - An SPV client maintains a full set of block headers, validating each header as it is received to ensure it comes from the preceeding header in the longest chain of proof of work. From this, they are able to validate SPV proofs, as well as reseed the entire header set to other SPV clients in order to assist in the propagation of Bitcoin block headers outside of the P2P broadcast network, creating an anti-fragile system (~90mb at time of publishing). It is recommended that the majority of applications and wallets at least run an SPV Client.

__3. SPV Light Client__ - An SPV light client maintains a lightweight subset of the block headers used only for validating SPV proofs. After syncing up and validating the full chain of block headers, an SPV Light Client discards all information in the block headers not used for validating SPV proofs or handing reorgs, maintaining only the block hash and merkle root (~42mb at time of publishing). It is recommended that SPV Light Clients sync up from a trusted SPV Client and validate the entire chain of headers moving forwards.

For some more specific applications of SPV Light Clients, it may be possible to omit even more data to reclaim space, for example: An SPV Light Client tasked only with validating SPV proofs for Layer 1 tokens that could only have existed after the Genesis Upgrade would be able to discard of all block headers prior to block #620538 after validating them, leaving a tiny dataset of just ~1.8mb at the time of publishing. Such models of lightweight SPV may be particualrly useful in low-powered computing and IoT applications.

### Installation
To install the SPV Client, simply clone this repo, install it and run it like so:

```sh
$ git clone matterpool/spv-client
$ cd spv-client
$ npm install
$ npm run start
```

### Configuration
While the SPV Client defaults to MatterCloud's header beacon, it is possible to set the peer to any other SPV Client in the config file, like so:
```js
//config.js
peer: "https://spv.mywebsite.com/api/v1/header"
```

# Acknowledgements
[@deanmlittle](https://twitter.com/deanmlittle)/[u40](https://twetch.app/u/40) - Creator of RAWSPV and SPVTX formats, SPV.js bsv2 extension, SPV Client, SPV Node and Mattercloud SPV API software.

[@attilaaros](https://twitter.com/AttilaAros)/[u205](https://twetch.app/u/205) - Creator of TXDB, the enabling technology that allowed us to prove that SPV truly does work at scale.

# License
The idea of exclusive licensing becomes somewhat arbitrary when a piece of software is only really useful on a UTXO-based blockchain with massive scale. To anyone wishing to use this elsewhere, we wish you the best of luck, you're going to need it.