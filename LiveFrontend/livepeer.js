const API =
  window.BANSHEE_CONFIG.apiBase;


export async function createUpload(
  file
) {
  const response =
    await fetch(
      `${API}/api/video/upload`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            name:
              file.name ||
              `banshee-${Date.now()}.webm`
          })
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ||
      "Unable to create video upload"
    );
  }

  return result;
}


export async function uploadTus(
  file,
  endpoint,
  onProgress
) {
  if (!window.tus) {
    throw new Error(
      "TUS client not loaded"
    );
  }

  return new Promise(
    (resolve,reject) => {
      const upload =
        new window.tus.Upload(
          file,
          {
            endpoint,

            retryDelays: [
              0,
              1000,
              3000,
              5000
            ],

            metadata: {
              filename:
                file.name,

              filetype:
                file.type
            },

            onError:
              reject,

            onProgress:
              (
                uploaded,
                total
              ) => {
                const percent =
                  total
                    ? Math.round(
                        uploaded /
                        total *
                        100
                      )
                    : 0;

                onProgress?.(
                  percent
                );
              },

            onSuccess:
              () => {
                resolve({
                  url:
                    upload.url
                });
              }
          }
        );

      upload.start();
    }
  );
}


export async function waitForAsset(
  assetId,
  {
    interval = 2500,
    timeout = 180000
  } = {}
) {
  const started =
    Date.now();

  while (
    Date.now() -
    started <
    timeout
  ) {
    const response =
      await fetch(
        `${API}/api/video/${assetId}`
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
        "Asset lookup failed"
      );
    }

    const asset =
      result.asset;

    const phase =
      typeof asset.status ===
      "string"
        ? asset.status
        : asset.status?.phase;

    if (
      phase === "ready" ||
      phase === "completed"
    ) {
      return asset;
    }

    if (
      phase === "failed"
    ) {
      throw new Error(
        "Video processing failed"
      );
    }

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          interval
        )
    );
  }

  throw new Error(
    "Video processing timed out"
  );
}


export async function prepareRelease({
  assetId,
  artist,
  title,
  supply,
  price
}) {
  const response =
    await fetch(
      `${API}/api/release/prepare`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            assetId,
            artist,
            title,
            supply,
            price
          })
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ||
      "Unable to prepare release"
    );
  }

  return result.release;
}