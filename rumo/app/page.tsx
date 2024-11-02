"use client";
import { useEffect, useState } from "react";
import { socket } from "../atom";

interface Message {
  text: string;
  sender: "user" | "server";
  id: string;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    // Handle server responses
    function onServerResponse(data: { message: string; socketId: string }) {
      setMessages(prev => [...prev, {
        text: `${data.message} (from ${data.socketId})`,
        sender: "server",
        id: Date.now().toString()
      }]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("server-response", onServerResponse);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("server-response", onServerResponse);
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (messageInput.trim() && isConnected) {
      // Add user message to the messages array
      setMessages(prev => [...prev, {
        text: messageInput,
        sender: "user",
        id: Date.now().toString()
      }]);

      // Send message to server
      socket.emit("send-message", messageInput);
      
      // Clear input
      setMessageInput("");
    }
  };


  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        <p>Transport: {transport}</p>
      </div>

      <div className="border rounded-lg p-4 mb-4 h-96 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded-lg max-w-[80%] ${
              message.sender === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}