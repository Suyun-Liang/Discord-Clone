import { Message } from "@prisma/client";
import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

const MESSAGE_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });
    if (!channelId)
      return new NextResponse("Channel Id Missing", { status: 400 });

    let messages: Message[] = [];

    if (cursor) {
      messages = await db.message.findMany({
        take: MESSAGE_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId,
        },
        include: {
          member: {
            include: { profile: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      messages = await db.message.findMany({
        take: MESSAGE_BATCH,
        where: {
          channelId,
        },
        include: { member: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    // check if we reach to the end of the messages, if length is smaller than 10, then its the end of the messages, otherwise is always the last item in the batch
    let nextCursor = null;

    if (messages.length === MESSAGE_BATCH) {
      nextCursor = messages[MESSAGE_BATCH - 1].id;
    }

    // return all the messages for this page
    return NextResponse.json({ items: messages, nextCursor });
  } catch (error) {
    console.log("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
