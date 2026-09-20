import { useState, useEffect } from "react";
import { Trash2, Mail } from "lucide-react";
import { API_URL } from "../config";
export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);

  const token = localStorage.getItem("accessToken");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages`, { headers: authHeaders });
      const text = await res.text();

      if (!res.ok) {
        console.error("Fetch messages failed:", res.status, text);
        return;
      }

      const data = text ? JSON.parse(text) : [];
      setMessages(data || []);
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;

    const res = await fetch(`${API_URL}/messages/${id}`, { method: "DELETE", headers: authHeaders });

    if (!res.ok) {
      alert("فشل الحذف.");
      return;
    }

    fetchMessages();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">Messages</h1>
        <span className="text-sm text-muted">{messages.length} messages</span>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted">
          <Mail size={32} strokeWidth={1.5} className="mb-3" />
          <p className="text-sm">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{msg.name}</p>
                  <p className="text-xs text-muted">{msg.email}</p>
                </div>
                <button onClick={() => handleDelete(msg.id)} className="text-muted hover:text-red-600 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-sm mt-3 whitespace-pre-wrap">{msg.message}</p>
              <p className="text-xs text-muted mt-3 border-t border-gray-100 pt-2">
                {new Date(msg.createdAt).toLocaleString("ar-EG")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}