/**
 * Collection Detail API Endpoint
 *
 * Handles operations on a specific collection
 * GET: Get collection details with items
 * PUT: Update collection
 * DELETE: Delete collection
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../../lib/prisma.js";
import { setCorsHeaders, handleCorsPreflight, requireAuth } from "../../../lib/api-utils.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (handleCorsPreflight(request, response)) {
    return;
  }

  setCorsHeaders(response);

  try {
    const collectionId = request.query.collectionId as string;
    const userId = await requireAuth(request, response);
    if (!userId) {
      return; // Response already sent by requireAuth
    }

    if (!collectionId) {
      return response.status(400).json({ error: "Collection ID is required" });
    }

    // GET: Get collection with items
    if (request.method === "GET") {
      const collection = await prisma.recipeCollection.findFirst({
        where: {
          id: collectionId,
          userId, // Ensure user owns the collection
        },
        include: {
          items: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { items: true },
          },
        },
      });

      if (!collection) {
        return response.status(404).json({ error: "Collection not found" });
      }

      return response.status(200).json({
        ...collection,
        itemCount: collection._count.items,
        createdAt: collection.createdAt.toISOString(),
        updatedAt: collection.updatedAt.toISOString(),
        items: collection.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      });
    }

    // PUT: Update collection
    if (request.method === "PUT") {
      const { name, description, color } = request.body;

      const collection = await prisma.recipeCollection.updateMany({
        where: {
          id: collectionId,
          userId, // Ensure user owns the collection
        },
        data: {
          ...(name && { name: name.trim() }),
          ...(description !== undefined && { description: description?.trim() }),
          ...(color !== undefined && { color }),
        },
      });

      if (collection.count === 0) {
        return response.status(404).json({ error: "Collection not found" });
      }

      const updated = await prisma.recipeCollection.findUnique({
        where: { id: collectionId },
      });

      return response.status(200).json({
        ...updated,
        createdAt: updated!.createdAt.toISOString(),
        updatedAt: updated!.updatedAt.toISOString(),
      });
    }

    // DELETE: Delete collection
    if (request.method === "DELETE") {
      const deleted = await prisma.recipeCollection.deleteMany({
        where: {
          id: collectionId,
          userId, // Ensure user owns the collection
        },
      });

      if (deleted.count === 0) {
        return response.status(404).json({ error: "Collection not found" });
      }

      return response.status(204).end();
    }

    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling collection request:", error);
    return response.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

