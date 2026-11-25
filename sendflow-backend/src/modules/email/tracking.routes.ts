
import { Router, Request, Response } from "express";
import { prisma } from "../../config/database";

const router = Router();

const trackingPixel = Buffer.from(
  "R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
  "base64"
);

router.get(
  "/open/:token",
  async (req: Request<{ token: string }>, res: Response) => {
    try {
      const token = req.params.token;

      if (!token || token.length > 191) {
        return res.status(200).type("image/gif").send(trackingPixel);
      }

      const email = await prisma.email.findUnique({
        where: { trackingToken: token },
        select: {
          id: true,
          firstOpenedAt: true,
        },
      });

      if (email) {
        const now = new Date();

        await prisma.email.update({
          where: { id: email.id },
          data: {
            openCount: { increment: 1 },
            firstOpenedAt: email.firstOpenedAt ?? now,
            lastOpenedAt: now,
          },
        });
      }
    } catch (error) {
      console.error("Email tracking error:", error);
    }

    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    return res.status(200).type("image/gif").send(trackingPixel);
  }
);

export default router;
