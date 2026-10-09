"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "admin";
  timestamp: string;
  read: boolean;
}

interface ChatUser {
  userId: string;
  userName: string;
  email: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export default function AdminChatPage() {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([
    {
      userId: "u-2",
      userName: "Sarah Jenkins",
      email: "sarah.j@example.com",
      lastMessage: "Is the Aurel ANC headset compatible with dual Bluetooth?",
      lastTime: "10:24 AM",
      unread: 1,
    },
    {
      userId: "u-3",
      userName: "Marcus Chen",
      email: "m.chen@studioline.design",
      lastMessage: "We received our shipment today, thank you for the fast delivery!",
      lastTime: "Yesterday",
      unread: 0,
    },
    {
      userId: "u-4",
      userName: "Amina Al-Mansoor",
      email: "amina@harbor.ae",
      lastMessage: "Can we request a volume quote for 25 Lumina lamps?",
      lastTime: "Oct 7",
      unread: 0,
    },
  ]);

  const [selectedUserId, setSelectedUserId] = useState<string>("u-2");
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "u-2": [
      {
        id: "m-1",
        text: "Hi! I am looking at the Aurel ANC Over-Ear Headphones.",
        sender: "user",
        timestamp: "10:20 AM",
        read: true,
      },
      {
        id: "m-2",
        text: "Hello Sarah! Thanks for reaching out to Ayiin support.",
        sender: "admin",
        timestamp: "10:22 AM",
        read: true,
      },
      {
        id: "m-3",
        text: "Is the Aurel ANC headset compatible with dual Bluetooth?",
        sender: "user",
        timestamp: "10:24 AM",
        read: false,
      },
    ],
    "u-3": [
      {
        id: "m-4",
        text: "Tracking update looks great. Excited for the desk set.",
        sender: "user",
        timestamp: "Yesterday",
        read: true,
      },
      {
        id: "m-5",
        text: "We received our shipment today, thank you for the fast delivery!",
        sender: "user",
        timestamp: "Yesterday",
        read: true,
      },
    ],
    "u-4": [
      {
        id: "m-6",
        text: "Can we request a volume quote for 25 Lumina lamps?",
        sender: "user",
        timestamp: "Oct 7",
        read: true,
      },
    ],
  });

  const [inputText, setInputText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeUser = chatUsers.find((u) => u.userId === selectedUserId);
  const activeMessages = messages[selectedUserId] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUserId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      text: inputText.trim(),
      sender: "admin",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedUserId]: [...(prev[selectedUserId] || []), newMsg],
    }));

    setChatUsers((prev) =>
      prev.map((u) =>
        u.userId === selectedUserId
          ? { ...u, lastMessage: `You: ${inputText.trim()}`, lastTime: "Just now", unread: 0 }
          : u
      )
    );

    setInputText("");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Support Chat</h1>
        <p className="text-xs text-gray-500 mt-1">
          Direct real-time concierge and buyer messaging
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs flex-1 flex overflow-hidden min-h-0">
        {/* User list */}
        <div className="w-72 sm:w-80 border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Conversations ({chatUsers.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {chatUsers.map((u) => {
              const isSelected = u.userId === selectedUserId;
              return (
                <button
                  key={u.userId}
                  onClick={() => setSelectedUserId(u.userId)}
                  className={`w-full text-left p-3.5 transition flex items-start gap-3 ${
                    isSelected ? "bg-blue-50/60" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {u.userName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 truncate">{u.userName}</p>
                      <span className="text-[10px] text-gray-400">{u.lastTime}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{u.lastMessage}</p>
                  </div>
                  {u.unread > 0 && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                {activeUser?.userName.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{activeUser?.userName}</p>
                <p className="text-[10px] text-gray-400">{activeUser?.email}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Customer Active
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/40">
            {activeMessages.map((msg) => {
              const isAdmin = msg.sender === "admin";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isAdmin
                        ? "bg-blue-600 text-white rounded-br-xs"
                        : "bg-white text-gray-900 border border-gray-200/80 rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Chat input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Reply to ${activeUser?.userName || "customer"}...`}
              className="flex-1 h-10 px-4 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
