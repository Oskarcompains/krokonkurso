import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const userId = session?.user?.id || `anon-${socketId}`;
  const userInfo = session
    ? { name: session.user.name || session.user.email, email: session.user.email }
    : { name: "Guest" };

  const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
    user_id: userId,
    user_info: userInfo,
  });

  return NextResponse.json(authResponse);
}
