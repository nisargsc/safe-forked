import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    buildbear: {
      url: "https://rpc.buildbear.io/coherent-bail-prestor-organa-2c226244",
    },
  },
  defaultNetwork: "buildbear",
};

export default config;
