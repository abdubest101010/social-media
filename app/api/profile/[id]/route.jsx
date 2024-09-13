// pages/api/profile/[id].js

import prisma  from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    // Fetch the user's profile
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          livingIn: true,
          wentTo: true,
          worksAt: true,
          bio: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
