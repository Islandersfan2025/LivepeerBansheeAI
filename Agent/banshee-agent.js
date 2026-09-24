export function prepareBansheeRelease({
  asset,
  artist,
  title,
  supply,
  price,
  description,
  royalty
}) {
  if (!asset?.id) {
    throw new Error(
      "Processed video asset required"
    );
  }

  if (!asset.playbackId) {
    throw new Error(
      "Playback ID missing"
    );
  }

  if (!artist) {
    throw new Error(
      "Artist wallet required"
    );
  }

  const cleanTitle =
    (
      title ||
      asset.name ||
      "Banshee Performance"
    ).trim();

  const editionSupply =
    Number(
      supply || 100
    );

  if (
    !Number.isInteger(
      editionSupply
    ) ||
    editionSupply <= 0
  ) {
    throw new Error(
      "Invalid supply"
    );
  }

  const artistRoyalty =
    Number(
      royalty ?? 10
    );

  const metadata = {

    name:
      cleanTitle,

    description:
      description?.trim() ||
      "Recorded performance released through Banshee.",

    animation_url:
      asset.playbackUrl || "",

    external_url:
      asset.playbackUrl || "",

    properties: {

      category:
        "PERFORMANCE",

      artist,

      livepeerAssetId:
        asset.id,

      playbackId:
        asset.playbackId,

      editionSupply,

      launchPrice:
        String(
          price || "10"
        ),

      artistRoyalty,

      poweredBy:
        "Livepeer AI",

      platform:
        "Banshee"
    }
  };


  return {

    assetType:
      "PERFORMANCE",

    title:
      cleanTitle,

    artist,

    supply:
      editionSupply,

    price:
      String(
        price || "10"
      ),

    royalty:
      artistRoyalty,

    livepeerAssetId:
      asset.id,

    playbackId:
      asset.playbackId,

    playbackUrl:
      asset.playbackUrl,

    metadata
  };
}
