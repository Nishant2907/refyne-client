import { NextApiRequest, NextApiResponse } from "next";

import prismadb from "@/lib/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = await req.body;
    const { userId } = body;

    if (!userId) return 0;

    const userApiLimit = await prismadb.userApiLimit.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!userApiLimit) return 0;
    return res.status(200).json({ count: userApiLimit.freeCreditsCount });
  } catch (error) {
    console.log("[GET_FREE_CREDITS_COUNT]", error);
    return res.status(500).json({ message: "Internal error" });
  }
}
