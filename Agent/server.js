import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
  config,
  validateConfig
} from "./config.js";

import {
  createVideoUpload,
  getVideoAsset
} from "./livepeer.js";

import {
  prepareBansheeRelease
} from "./banshee-agent.js";


/* =========================================================
   ENVIRONMENT
========================================================= */

dotenv.config();

validateConfig();


/* =========================================================
   EXPRESS
========================================================= */

const app =
  express();


app.use(
  cors({
    origin: true,
    credentials: true
  })
);


app.use(
  express.json({
    limit: "2mb"
  })
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/health",
  (req, res) => {
    res.json({
      ok: true,
      service: "banshee-live-agent",
      poweredBy: "Livepeer AI"
    });
  }
);


/* =========================================================
   CREATE VIDEO UPLOAD

   Frontend:
       recording
          ↓
       POST /api/video/upload
          ↓
       Livepeer upload endpoint

   The actual video does NOT pass through Express.
   The browser uploads directly to the returned TUS endpoint.
========================================================= */

app.post(
  "/api/video/upload",

  async (req, res) => {
    try {

      const {
        name
      } = req.body;


      if (
        !name ||
        typeof name !== "string"
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error: "Video name is required"
          });
      }


      const upload =
        await createVideoUpload(
          name.trim()
        );


      return res.json({
        ok: true,

        assetId:
          upload.assetId,

        playbackId:
          upload.playbackId,

        status:
          upload.status,

        tusEndpoint:
          upload.tusEndpoint
      });

    } catch (error) {

      console.error(
        "[Banshee] Video upload creation failed:",
        error
      );


      return res
        .status(500)
        .json({
          ok: false,

          error:
            error?.message ||
            "Unable to create video upload"
        });
    }
  }
);


/* =========================================================
   GET VIDEO / PROCESSING STATUS

   Frontend polls:

       GET /api/video/:assetId

   until the recording becomes ready.
========================================================= */

app.get(
  "/api/video/:assetId",

  async (req, res) => {
    try {

      const {
        assetId
      } = req.params;


      if (!assetId) {
        return res
          .status(400)
          .json({
            ok: false,
            error: "Asset ID is required"
          });
      }


      const asset =
        await getVideoAsset(
          assetId
        );


      return res.json({
        ok: true,
        asset
      });

    } catch (error) {

      console.error(
        "[Banshee] Asset lookup failed:",
        error
      );


      return res
        .status(500)
        .json({
          ok: false,

          error:
            error?.message ||
            "Unable to retrieve video asset"
        });
    }
  }
);


/* =========================================================
   PREPARE BANSHEE RELEASE

   Livepeer asset
        ↓
   Banshee Agent
        ↓
   Release metadata
        ↓
   Frontend
        ↓
   Artist wallet
        ↓
   BansheeVideo.sol

   IMPORTANT:

   This endpoint does NOT mint anything.

   It prepares the release. The artist still authorizes the
   actual ERC-1155 transaction through their wallet.
========================================================= */

app.post(
  "/api/release/prepare",

  async (req, res) => {
    try {

      const {
        assetId,
        artist,
        title,
        supply,
        price,
        description,
        royalty
      } = req.body;


      /* -----------------------------------------------------
         Basic validation
      ----------------------------------------------------- */

      if (
        !assetId ||
        typeof assetId !== "string"
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error: "Asset ID is required"
          });
      }


      if (
        !artist ||
        typeof artist !== "string"
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error: "Artist wallet is required"
          });
      }


      if (
        !title ||
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error: "Release title is required"
          });
      }


      const editionSupply =
        Number(supply);


      if (
        !Number.isInteger(
          editionSupply
        ) ||
        editionSupply <= 0
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error: "Invalid edition supply"
          });
      }


      const artistRoyalty =
        Number(
          royalty ?? 10
        );


      if (
        !Number.isFinite(
          artistRoyalty
        ) ||
        artistRoyalty < 0 ||
        artistRoyalty > 100
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "Royalty must be between 0 and 100"
          });
      }


      /* -----------------------------------------------------
         Retrieve the processed Livepeer asset
      ----------------------------------------------------- */

      const asset =
        await getVideoAsset(
          assetId
        );


      if (!asset) {
        return res
          .status(404)
          .json({
            ok: false,
            error: "Video asset not found"
          });
      }


      /* -----------------------------------------------------
         Make sure Livepeer has finished processing
      ----------------------------------------------------- */

      if (
        !isAssetReady(
          asset.status
        )
      ) {

        return res
          .status(409)
          .json({
            ok: false,

            error:
              "Video is still processing",

            status:
              asset.status
          });
      }


      if (!asset.playbackId) {
        return res
          .status(409)
          .json({
            ok: false,

            error:
              "Processed video does not have a playback ID"
          });
      }


      /* -----------------------------------------------------
         Banshee Agent prepares release
      ----------------------------------------------------- */

      const release =
        prepareBansheeRelease({
          asset,

          artist,

          title:
            title.trim(),

          supply:
            editionSupply,

          price,

          description:
            typeof description === "string"
              ? description.trim()
              : "",

          royalty:
            artistRoyalty
        });


      /* -----------------------------------------------------
         Metadata

         DEMO IMPLEMENTATION:

         For now we encode the metadata as a data URI.

         Later:

             metadata
                ↓
             Greenfield / IPFS
                ↓
             permanent metadata URI
                ↓
             ERC-1155

         The contract therefore does not need to change when
         you switch storage providers.
      ----------------------------------------------------- */

      const metadataJson =
        JSON.stringify(
          release.metadata
        );


      const metadataURI =
        "data:application/json;base64," +
        Buffer
          .from(
            metadataJson,
            "utf8"
          )
          .toString(
            "base64"
          );


      /* -----------------------------------------------------
         Return release package to frontend

         The frontend now has everything needed to call:

             BansheeVideo.tokenizeVideo()

         The server DOES NOT sign that transaction.
      ----------------------------------------------------- */

      return res.json({
        ok: true,

        release: {
          ...release,

          metadataURI
        }
      });

    } catch (error) {

      console.error(
        "[Banshee] Release preparation failed:",
        error
      );


      return res
        .status(500)
        .json({
          ok: false,

          error:
            error?.message ||
            "Unable to prepare Banshee release"
        });
    }
  }
);


/* =========================================================
   ASSET READY HELPER

   Livepeer SDK responses can expose processing state either
   directly as a string or through a status object.

   Examples handled:

       "ready"

       {
         phase: "ready"
       }

       {
         phase: "completed"
       }
========================================================= */

function isAssetReady(
  status
) {

  if (!status) {
    return false;
  }


  if (
    typeof status === "string"
  ) {

    const phase =
      status.toLowerCase();


    return (
      phase === "ready" ||
      phase === "completed"
    );
  }


  if (
    typeof status === "object"
  ) {

    const phase =
      String(
        status.phase || ""
      ).toLowerCase();


    return (
      phase === "ready" ||
      phase === "completed"
    );
  }


  return false;
}


/* =========================================================
   404
========================================================= */

app.use(
  (req, res) => {

    return res
      .status(404)
      .json({
        ok: false,
        error: "Banshee API route not found"
      });
  }
);


/* =========================================================
   EXPRESS ERROR HANDLER
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "[Banshee] Server error:",
      error
    );


    if (
      res.headersSent
    ) {
      return next(
        error
      );
    }


    return res
      .status(500)
      .json({
        ok: false,

        error:
          error?.message ||
          "Internal Banshee server error"
      });
  }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
  config.port,

  () => {

    console.log("");
    console.log(
      "========================================"
    );

    console.log(
      " BANSHEE CREATOR AGENT"
    );

    console.log(
      " Powered by Livepeer AI"
    );

    console.log(
      "========================================"
    );

    console.log(
      ` Server: http://localhost:${config.port}`
    );

    console.log(
      ` Health: http://localhost:${config.port}/health`
    );

    console.log(
      ""
    );

    console.log(
      " Workflow:"
    );

    console.log(
      " Recording -> Process -> ERC-1155 -> Banshee"
    );

    console.log(
      ""
    );
  }
);