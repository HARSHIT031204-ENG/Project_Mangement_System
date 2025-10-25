import { z } from "zod";
import { ApiError } from "../utils/api-error.js";
const uservalid_schema = z.object({
  username: z.preprocess(
    (val) => (typeof val == String ? val.trim().toLowerCase() : val),
    z
      .string({ message: "enter in a string formatt." })
      .min(3, { message: "atleast three character ,ust be exist " })
      .max(20, { message: " not more than 20 character " }),
  ),

  email: z.preprocess(
    (val) => (typeof val == String ? val.trim().toLowerCase() : val),
    z.email({ message: "email not valid !" }),
  ),
});

export const validation = (req, res, next) => {
  const { email, username } = req.body;
  // console.log(email);

  const result = uservalid_schema.safeParse({ username, email });
  // console.log("Result data: ", result);

  if (!result.success) {
    console.log(result.error.format());
    throw new ApiError(400, "Validation Error.", result.error.format());
  }

  req.validation = result.data;
  next();
};
