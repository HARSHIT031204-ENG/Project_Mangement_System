import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/async-handler.js";
/*export const healthController = async (req, res) => {
  try {
    res
      .status(200)
      .json(new ApiResponse(200, { message: "server health is fitfat" }));
  } catch (error) {
    console.log("error in helath check routing ", error);
  }
};
*/

export const healthController = asynchandler(async (req, res, next) => {
  
  const {email} = req.body
  res
    .status(200)
    .json(new ApiResponse(200, { message: "server is still running ", email }));
});
