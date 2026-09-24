const VIDEO_ABI = [
  "function tokenizeVideo(string livepeerAssetId,string playbackId,string metadataURI,uint256 supply) returns (uint256)",
  "event VideoTokenized(uint256 indexed tokenId,address indexed artist,string livepeerAssetId,string playbackId,uint256 supply,string metadataURI)"
];


const HOOK_ABI = [
  "function createLaunch(address asset,uint256 tokenId,address marketToken,address quoteToken,uint8 assetType,uint256 supply,uint256 launchPrice,uint256 startTime,uint256 fairLaunchDuration,uint16 protocolFeeBps,uint16 secondaryRoyaltyBps,uint16 creatorMarketShareBps,bytes32 poolId) returns (uint256)"
];


export async function connectBansheeWallet() {
  if (!window.ethereum) {
    throw new Error(
      "Wallet not found"
    );
  }

  await window.ethereum.request({
    method:
      "eth_requestAccounts"
  });

  const provider =
    new ethers.BrowserProvider(
      window.ethereum
    );

  const signer =
    await provider.getSigner();

  const address =
    await signer.getAddress();

  return {
    provider,
    signer,
    address
  };
}


export async function tokenizeRecording(
  signer,
  release
) {
  const contract =
    new ethers.Contract(
      window.BANSHEE_CONFIG.bansheeVideo,
      VIDEO_ABI,
      signer
    );

  const transaction =
    await contract.tokenizeVideo(
      release.livepeerAssetId,
      release.playbackId,
      release.metadataURI,
      release.supply
    );

  const receipt =
    await transaction.wait();

  let tokenId =
    null;

  for (
    const log
    of receipt.logs
  ) {
    try {
      const parsed =
        contract.interface.parseLog(
          log
        );

      if (
        parsed?.name ===
        "VideoTokenized"
      ) {
        tokenId =
          parsed.args.tokenId;

        break;
      }

    } catch {
      // Ignore unrelated logs.
    }
  }

  if (tokenId === null) {
    throw new Error(
      "Video token id not found"
    );
  }

  return {
    tokenId,
    transactionHash:
      receipt.hash
  };
}