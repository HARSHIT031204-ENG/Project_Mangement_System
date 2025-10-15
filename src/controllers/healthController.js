import { ApiResponse } from "../utils/api-response.js";

export const healthController = async (req, res) => {
  try {
    res
      .status(200)
      .json(new ApiResponse(200, { message: "server health is fitfat" }));
  } catch (error) {
    console.log("error in helath check routing ", error);
  }
};
