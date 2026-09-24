import { Livepeer } from "livepeer";
import { config } from "./config.js";


const livepeer =
  new Livepeer({
    apiKey:
      config.livepeerApiKey
  });


export async function createVideoUpload(
  name
) {
  if (!name) {
    throw new Error(
      "Video name is required"
    );
  }

  const result =
    await livepeer.asset.create({
      name
    });

  return normalizeUploadResponse(
    result
  );
}


function normalizeUploadResponse(
  result
) {
  const data =
    result?.asset
      ? result
      : result?.data || result;

  const asset =
    data?.asset ||
    data;

  const tusEndpoint =
    data?.tusEndpoint ||
    data?.tus?.endpoint ||
    data?.url;

  if (!asset?.id) {
    throw new Error(
      "Livepeer did not return an asset id"
    );
  }

  if (!tusEndpoint) {
    throw new Error(
      "Livepeer did not return a TUS endpoint"
    );
  }

  return {
    assetId:
      asset.id,

    playbackId:
      asset.playbackId || null,

    status:
      asset.status || null,

    tusEndpoint
  };
}


export async function getVideoAsset(
  assetId
) {
  if (!assetId) {
    throw new Error(
      "Asset id required"
    );
  }

  const result =
    await livepeer.asset.get(
      assetId
    );

  const asset =
    result?.asset ||
    result?.data ||
    result;

  return {
    id:
      asset.id,

    name:
      asset.name,

    playbackId:
      asset.playbackId,

    playbackUrl:
      asset.playbackUrl,

    downloadUrl:
      asset.downloadUrl,

    status:
      asset.status,

    storage:
      asset.storage,

    createdAt:
      asset.createdAt,

    raw:
      asset
  };
}