

import prisma from "@/lib/prisma"; // Ensure this is set up correctly to connect to your Prisma database

export default async function handler(req, res) {
   const { method } = req;
   const { id } = req.query;

   if (method === "GET") {
      try {
         const order = await prisma.order.findUnique({
            where: { id: String(id) }, 
            include: {
               items: {
                  include: {
                     product: true, // Assuming each order item has a related product
                  },
               },
            },
         });

         if (!order) {
            return res.status(404).json({ error: "Order not found" });
         }

         res.status(200).json(order);
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: "An error occurred while fetching the order" });
      }
   } else {
      res.status(405).json({ error: "Method not allowed" });
   }
}
