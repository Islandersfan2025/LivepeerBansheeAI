# Banshee Music

Demo: https://islandersfan2025.github.io/LivepeerBansheeAI/

**Banshee is a music launchpad that turns songs, albums, tickets, and recorded performances into onchain music assets with their own markets.**

Banshee gives artists a direct path from creating or releasing music to launching a tradable digital asset. Rather than treating music NFTs as static collectibles, Banshee combines **ERC-1155 music assets, Livepeer AI, Uniswap v4, BNB Chain, and onchain Proof-of-Performance** to create markets around an artist's work.

For the hackathon, Banshee demonstrates a new **recording-to-market workflow** powered by Livepeer AI: an artist can record or upload a performance, have the media processed and prepared as a release, authorize the creation of a limited-edition ERC-1155 performance asset, and launch it through Banshee's market infrastructure.

> **Record the performance. Create the release. Launch the market.**

---

## The Problem

Artists have more ways than ever to publish music, but the relationship between releasing music and creating an economic market around that music remains fragmented.

Traditional platforms primarily treat music as content to stream. Existing Web3 music applications have experimented with NFTs and collectibles, but these assets are often disconnected from liquid markets, creator revenue, and measurable onchain activity.

Artists still face several problems:

* Music releases are generally treated as content rather than programmable financial assets.
* Creating an onchain music release usually requires several separate tools.
* Live performances rarely have a direct path from recording to an ownable digital release.
* Secondary-market activity often provides limited value back to the artist.
* Artist performance metrics are largely controlled by centralized platforms.
* Onchain music activity lacks a consistent mechanism for measuring the economic performance of a release.

Banshee is designed to connect these pieces into one launchpad.

---

## The Solution

Banshee allows artists to launch **songs, albums, tickets, and recorded performances as ERC-1155 music assets**.

Each release can move through a launch lifecycle:

```text
Artist
   ↓
Music / Performance
   ↓
Banshee
   ↓
ERC-1155 Music Asset
   ↓
Initial Launch
   ↓
BansheeHook
   ↓
Uniswap v4 Market
   ↓
Trading Activity
   ↓
Proof-of-Performance
   ↓
Artist Revenue + Release Economy
```

Instead of minting an asset and stopping there, Banshee is designed around the complete lifecycle of a music release.

The result is a platform where artists can create an asset, distribute a limited edition, establish a market around it, and build a verifiable onchain history for the release.

---

# Powered by Livepeer AI

A major part of the hackathon implementation is Banshee's **Livepeer AI-powered creator workflow**.

Artists can record a performance directly inside Banshee or upload an existing recorded video. Banshee sends the recording through its media-processing workflow, prepares the performance as a release, generates the release metadata, and presents the final transaction to the artist for authorization.

The artist's wallet remains in control of the onchain action.

```text
Artist
   ↓
Record / Upload Performance
   ↓
Banshee Creator Workflow
   ↓
Livepeer Processing
   ↓
Banshee AI Release Preparation
   ↓
Performance Metadata
   ↓
Artist Wallet Authorization
   ↓
ERC-1155 Performance Asset
   ↓
Banshee Launch
```

This creates a simple **recording-to-market pipeline**.

An artist can perform a song, record the performance, and turn that recording into a limited digital edition without leaving Banshee.

The creator-facing experience is intentionally simple:

```text
RECORD
   ↓
PROCESS
   ↓
CREATE
   ↓
LAUNCH
```

Behind that interface, Banshee coordinates the media and blockchain infrastructure required to transform the performance into an onchain asset.

---

## Why Livepeer AI?

Live video and recorded performances are an important part of music culture, but there is usually a separation between the performance itself and the digital asset representing it.

Banshee uses Livepeer to bridge that gap.

For example, an artist could perform:

**Midnight Run — Live in Atlanta**

and create:

```text
Title:       Midnight Run — Live in Atlanta
Artist:      The Banshees
Asset Type:  PERFORMANCE
Edition:     Live Recording
Supply:      250
Source:      Recorded Performance
```

The recording becomes the media associated with the ERC-1155 release.

The artist can then launch a limited number of editions through Banshee.

The important design principle is that **AI assists with preparing the release—it does not control the artist's wallet or decide financial payouts.**

The artist authorizes the final blockchain transaction.

---

# ERC-1155 Music Assets

Banshee uses **ERC-1155** as its primary asset standard because music releases naturally support multiple editions and multiple asset types.

Banshee can represent:

```text
SONG
ALBUM
TICKET
PERFORMANCE
```

A release might therefore look like:

```text
Artist:       The Banshees
Release:      Ghost Frequency
Asset Type:   SONG
Supply:       500
```

while a live recording could be:

```text
Artist:       The Banshees
Release:      Midnight Run — Live
Asset Type:   PERFORMANCE
Supply:       100
```

ERC-1155 allows Banshee to use a common asset architecture across these different types of music releases.

---

# BansheeVideo

For the Livepeer AI demo, recorded performances are represented through the `BansheeVideo` ERC-1155 contract.

The workflow is:

```text
Processed Recording
        ↓
Release Metadata
        ↓
BansheeVideo.sol
        ↓
ERC-1155
        ↓
Artist Receives Editions
```

The contract records information connecting the onchain asset with its underlying processed media, including the media asset identifier, playback identifier, metadata URI, artist, edition supply, and creation timestamp.

Most importantly, the artist calls the creation function from their own wallet.

Banshee does **not** require the artist to provide a private key to the AI service.

---

# BansheeHook

`BansheeHook` is the market layer of the protocol.

It is built around **Uniswap v4** and manages the lifecycle of Banshee launches.

Conceptually:

```text
ERC-1155 Music Asset
        ↓
Banshee Launch
        ↓
Initial Distribution
        ↓
BansheeHook
        ↓
Uniswap v4
        ↓
Open Market
```

Banshee's model takes inspiration from token launchpads, but applies the concept to music assets.

The goal is to create a lifecycle where an artist can launch an edition at an initial price before the release transitions into an open market.

This turns Banshee into more than an NFT storefront.

It becomes a **music-asset launchpad**.

---

# Music Assets + Uniswap v4

ERC-1155 remains the canonical representation of the music asset.

The market infrastructure can associate the release with a fungible market representation used by the Uniswap v4 liquidity layer.

Conceptually:

```text
               BANSHEE RELEASE

              ERC-1155 Asset
                    │
                    │
                    ▼
              BansheeHook
                    │
                    ▼
             Market Token
                    │
                    ▼
             Uniswap v4 Pool
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
       Trading            Liquidity
```

This separation lets Banshee preserve the benefits of ERC-1155 for music editions while using fungible liquidity infrastructure for market activity.

---

# Proof-of-Performance

Banshee introduces the concept of **Proof-of-Performance (PoP)**.

Instead of relying primarily on centralized listening statistics, Proof-of-Performance measures the verifiable economic activity generated by a music release.

Potential signals include:

* primary sales,
* unique holders,
* secondary trading activity,
* holder retention,
* liquidity depth,
* liquidity persistence,
* ticket activity,
* performance-edition ownership.

The core principle is:

> **Proof-of-Performance measures verifiable onchain economic activity around a music release.**

This allows Banshee to build an onchain performance history for each release.

---

# SubQuery

Banshee uses **SubQuery** as the indexing and analytics layer for Proof-of-Performance.

Rather than placing complex analytics inside `BansheeHook`, relevant blockchain events can be indexed and transformed into release-level metrics.

```text
Banshee Contracts
       ↓
Onchain Events
       ↓
SubQuery
       ↓
Release Metrics
       ↓
Proof-of-Performance
```

This separation keeps the smart contracts focused on deterministic settlement and market logic while the indexing layer handles historical analytics.

For ERC-1155 releases, holder activity can be derived from `TransferSingle` and `TransferBatch` events alongside Banshee launch and market events.

---

# Creator Economics

Banshee is designed to create several potential revenue channels around a release.

### Primary Launch Revenue

Artists can receive revenue from the initial distribution of their music asset.

```text
Artist
  ↓
Launch Release
  ↓
Fans Purchase Editions
  ↓
Primary Revenue
```

### Secondary Market Revenue

After a release enters its market phase, Banshee can allocate a portion of market-generated revenue back toward the artist and release ecosystem.

```text
Market Activity
      ↓
Trading Fees / Market Revenue
      ↓
Banshee
   ┌──┴─────────────┐
   ↓                ↓
Artist          Release Market
```

### Proof-of-Performance Rewards

Proof-of-Performance can also provide a foundation for future incentive programs based on verifiable activity.

Importantly, **AI does not determine these payouts**. Financial settlement remains deterministic and contract-driven.

---

# Artist-Controlled Authorization

Banshee is designed so the AI workflow never needs custody of an artist's wallet.

The architecture separates media processing from blockchain authorization:

```text
Banshee AI
     ↓
Prepare Release
     ↓
Transaction Request
     ↓
Artist Wallet
     ↓
Artist Signs
     ↓
Blockchain
```

For a complete market launch, the artist can authorize the ERC-1155 release and approve the appropriate Banshee market contract before the launch transaction.

This keeps control with the creator while still allowing AI to simplify the workflow.

---

# Creator Experience

The technical architecture is intentionally hidden behind a simple creator interface.

An artist sees:

```text
1. Connect Wallet

2. Record Performance
       or
   Choose Video

3. Enter:
   - Release title
   - Edition size
   - Launch price
   - Artist royalty
   - Description

4. Create + Launch

5. Approve wallet transaction

6. Release created
```

During processing, the interface displays:

```text
UPLOAD → PROCESS → CREATE → LAUNCH
```

with the creator workflow visibly labeled:

**Powered by Livepeer AI**

The goal is to make launching an onchain music asset feel closer to publishing a piece of content than interacting manually with several blockchain protocols.

---

# Audius Creator Path

Banshee's broader architecture also supports an **Audius creator path** for musicians who already have music and identity on Audius.

Instead of recording new content through the Banshee creator workflow, an Audius artist can connect their account, select eligible music from their catalog, configure a Banshee release, and launch an exclusive music asset.

```text
Audius Artist
      ↓
Connect Audius
      ↓
Select Existing Content
      ↓
Configure Banshee Release
      ↓
ERC-1155
      ↓
Banshee Launchpad
```

This gives Banshee two complementary creator entry points:

```text
Existing Music                 New Performance
     │                               │
   Audius                     Banshee Creator Studio
     │                               │
     └──────────────┬────────────────┘
                    ↓
               ERC-1155
                    ↓
                Banshee
                    ↓
              BansheeHook
                    ↓
               Uniswap v4
```

The two paths share the same underlying Banshee asset and market infrastructure.

---

# BNB Chain

Banshee uses **BNB Chain** for its music-asset and application smart contracts.

The onchain architecture includes contracts responsible for:

* ERC-1155 music assets,
* release creation,
* market lifecycle,
* artist revenue,
* market revenue,
* and future Proof-of-Performance rewards.

This keeps ownership and economic activity verifiable onchain.

---

# BNB Greenfield

Banshee's broader architecture can use **BNB Greenfield** as its protected content and storage layer.

For music releases, Greenfield can store content associated with an ERC-1155 asset while Banshee verifies that the requesting wallet owns the appropriate edition.

Conceptually:

```text
Fan
 ↓
Owns Banshee ERC-1155
 ↓
Ownership Verification
 ↓
Protected Content
 ↓
BNB Greenfield
```

This provides a path for token-gated songs, albums, recordings, and other exclusive artist content.

---

# Architecture

The broader Banshee architecture looks like this:

```text
                         ARTISTS
                            │
              ┌─────────────┴─────────────┐
              │                           │
        Existing Music             New Performance
              │                           │
           Audius                    Record / Upload
              │                           │
              │                    Livepeer Processing
              │                           │
              │                    Banshee AI Workflow
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                       ERC-1155
                     MUSIC ASSETS
                            │
                            ▼
                      BansheeHook
                            │
                            ▼
                       Uniswap v4
                            │
                 ┌──────────┴──────────┐
                 │                     │
              Trading              Liquidity
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼
                     ONCHAIN EVENTS
                            │
                            ▼
                         SubQuery
                            │
                            ▼
                  PROOF-OF-PERFORMANCE
                            │
                 ┌──────────┴──────────┐
                 │                     │
          Artist Economics       Release Economy
```

For protected media:

```text
ERC-1155 Ownership
        ↓
Content Authorization
        ↓
BNB Greenfield
        ↓
Exclusive Music / Recording
```

---

# Technology Stack

| Technology                 | Role in Banshee                                             |
| -------------------------- | ----------------------------------------------------------- |
| **Livepeer AI**            | AI-powered media/creator workflow for recorded performances |
| **ERC-1155**               | Canonical asset standard for music releases and editions    |
| **Uniswap v4**             | Liquidity and market infrastructure                         |
| **BansheeHook**            | Music-launch market lifecycle                               |
| **BNB Chain**              | Smart-contract and settlement layer                         |
| **BNB Greenfield**         | Protected media/content storage                             |
| **SubQuery**               | Onchain indexing and Proof-of-Performance analytics         |
| **Audius**                 | Existing artist identity/catalog onboarding                 |
| **MetaMask / EVM Wallets** | Artist authorization and asset ownership                    |
| **Foundry**                | Smart-contract development and testing                      |
| **ethers.js**              | Frontend-to-contract integration                            |
| **Bootstrap**              | Responsive creator and market UI                            |

---

# Hackathon Demo

The Livepeer AI integration is the centerpiece of the hackathon demo.

A judge can follow the complete creator workflow:

```text
Open Banshee
     ↓
Connect Wallet
     ↓
Start Recording
     ↓
Perform / Record Video
     ↓
Stop Recording
     ↓
Preview Performance
     ↓
Enter Release Details
     ↓
Click "Create + Launch"
     ↓
Upload Recording
     ↓
Process Recording
     ↓
Banshee Prepares Release
     ↓
Artist Authorizes Transaction
     ↓
ERC-1155 Performance Created
     ↓
Banshee Launch
```

The same interface also allows the artist to choose a prerecorded video, providing a fallback for a reliable live demo.

A sample release could be:

```text
Release:        Midnight Run — Live
Type:           PERFORMANCE
Editions:       100
Launch Price:   10
Artist Royalty: 10%
```

After processing, the recording is associated with the resulting ERC-1155 performance edition.

---

# What Makes Banshee Different?

Banshee is not designed as another streaming service or a conventional NFT marketplace.

The core idea is to connect three things that are normally separate:

```text
MUSIC
  +
OWNERSHIP
  +
MARKETS
```

A release is simultaneously a piece of music, an artist-created digital asset, and something capable of developing an onchain market and economic history.

Livepeer AI extends that model to performances by shortening the path between **creating media and creating a market around that media**.

Proof-of-Performance then gives those markets a measurable onchain history.

This creates the foundation for an artist economy built around releases rather than only streams.

---

# Current Hackathon Scope

The hackathon implementation focuses on demonstrating the core Banshee lifecycle:

**1. Record or upload a performance**

**2. Process the recording through the Livepeer-powered creator workflow**

**3. Prepare the Banshee release metadata**

**4. Have the artist authorize an ERC-1155 performance edition**

**5. Connect the release to Banshee's launch infrastructure**

**6. Create an onchain market lifecycle around the release**

The architecture is deliberately modular. Future versions can extend the same workflow with more sophisticated AI media capabilities, additional music creation tools, richer market mechanisms, protected media distribution, and expanded Proof-of-Performance incentives.

---

# Vision

Banshee's long-term goal is to make launching a music asset as easy as publishing a song.

An artist should be able to create or select their work, choose how many editions to release, define the launch, authorize it from their wallet, and immediately create an onchain economy around that release.

Live performances can become collectible editions. Songs can become launchable assets. Tickets can connect fans to exclusive recordings. Market activity can create measurable Proof-of-Performance. Artists can participate directly in the economic activity generated by their work.

**Banshee turns music releases into measurable onchain markets.**

### Built for artists. Powered by Livepeer AI. Launched onchain.

