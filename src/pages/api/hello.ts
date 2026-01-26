// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  HTTP_RESPONSE_MESSAGE,
  type HttpResponses,
} from "@/types/http-responses";

type User = {
  name: string;
};

type Response = HttpResponses<User>;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response["success"]["data"] | Response["error"]>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: HTTP_RESPONSE_MESSAGE.METHOD_NOT_ALLOWED,
      status: 405,
      errors: `Method ${req.method} not allowed`,
    });
  }

  res.status(200).json({
    message: HTTP_RESPONSE_MESSAGE.SUCCESS,
    data: { name: "John Doe" },
    status: 200,
  });
}
