import Chat from "@/components/client/chat";

export default function ChatPage() {
  return (
    <div className="px-4 xl:pl-8">
      <div className="prose py-4 md:prose-lg">
        <h2>Chat</h2>
      </div>
      <Chat />
    </div>
  );
}
