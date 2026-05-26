import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { getSession } from "@/lib/session";
import { GlassCard } from "@/components/glass-card";
import { ChatRoom } from "./chat-room";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  return (
    <main className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <MessageSquare className="h-5 w-5" />
          公司聊天室
        </h1>
      </div>

      <GlassCard variant="strong" className="flex-1 overflow-hidden p-0">
        <ChatRoom currentUserId={session.userId} role={session.role ?? "EMPLOYEE"} />
      </GlassCard>
    </main>
  );
}
