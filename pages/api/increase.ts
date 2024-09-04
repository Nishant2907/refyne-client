import { NextApiRequest, NextApiResponse } from "next";

import { MAX_FREE_CREDITS } from "@/constants";
import prismadb from "@/lib/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = await req.body;
    const { userId, amount, totalCredits } = body;

    if (!userId) return;

    if (totalCredits !== 0) {
      if (!(amount < totalCredits))
        return res.status(400).json({ message: "Amount exceeds" });
    } else {
      if (!(amount < MAX_FREE_CREDITS))
        return res.status(400).json({ message: "Amount exceeds" });
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
      where: { userId: userId },
    });

    if (userApiLimit) {
      if (totalCredits !== 0) {
        if (userApiLimit.freeCreditsCount + amount > totalCredits) {
          return res.status(400).json({ message: "Amount exceeds" });
        }
      } else {
        if (userApiLimit.freeCreditsCount + amount > MAX_FREE_CREDITS) {
          return res.status(400).json({ message: "Amount exceeds" });
        }
      }
      await prismadb.userApiLimit.update({
        where: { userId: userId },
        data: { freeCreditsCount: userApiLimit.freeCreditsCount + amount },
      });
    } else {
      await prismadb.userApiLimit.create({
        data: { userId: userId, freeCreditsCount: amount },
      });
    }

    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log("[INCREASE_APILIMIT]", error);
    return res.status(500).json({ message: "Internal error" });
  }
}
