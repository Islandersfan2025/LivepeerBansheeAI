import dotenv from "dotenv";

dotenv.config();


export const config = {

  port:
    Number(
      process.env.PORT ||
      8787
    ),

  livepeerApiKey:
    process.env.LIVEPEER_API_KEY,

  bansheeVideoAddress:
    process.env.BANSHEE_VIDEO_ADDRESS,

  bansheeHookAddress:
    process.env.BANSHEE_HOOK_ADDRESS,

  rpcUrl:
    process.env.BSC_RPC_URL
};


export function validateConfig() {

  const required = [

    [
      "LIVEPEER_API_KEY",
      config.livepeerApiKey
    ],

    [
      "BANSHEE_VIDEO_ADDRESS",
      config.bansheeVideoAddress
    ],

    [
      "BANSHEE_HOOK_ADDRESS",
      config.bansheeHookAddress
    ]

  ];


  for (
    const [name, value]
    of required
  ) {

    if (!value) {

      console.warn(
        `[config] ${name} is not set`
      );

    }

  }

}