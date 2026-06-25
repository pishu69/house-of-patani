import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardCard, PageTitle } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { contactService } from "@/services";

export function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);

  async function loadMessages() {
    try {
      setLoading(true);
      const result = await contactService.list();

      if (result.data) {
        setMessages(result.data);
      }
    } catch {
      toast.error("Messages could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function toggleRead(id: string, nextRead: boolean) {
    try {
      setWorkingId(id);
      await contactService.markRead(id, nextRead);
      await loadMessages();
      toast.success(nextRead ? "Marked as read." : "Marked as unread.");
    } catch {
      toast.error("Message status could not be updated.");
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteMessage(id: string) {
    const confirmed = window.confirm("Delete this message permanently?");
    if (!confirmed) return;

    try {
      setWorkingId(id);
      await contactService.delete(id);
      await loadMessages();
      toast.success("Message deleted.");
    } catch {
      toast.error("Message could not be deleted.");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <>
      <PageTitle
        title="Contact Messages"
        description="Messages submitted from the website contact form."
      />

      <DashboardCard title="Submitted messages">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-maroon/10 text-left">
                  <th className="p-3">Status</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {messages.map((message) => (
                  <tr
                    key={message.id}
                    className="border-b border-maroon/10 align-top"
                  >
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          message.is_read
                            ? "bg-muted text-muted-foreground"
                            : "bg-gold/20 text-maroon"
                        }`}
                      >
                        {message.is_read ? "Read" : "Unread"}
                      </span>
                    </td>

                    <td className="p-3 font-medium text-charcoal">
                      {message.name}
                    </td>

                    <td className="p-3">
                      <a
                        className="text-maroon hover:text-gold"
                        href={`mailto:${message.email}`}
                      >
                        {message.email}
                      </a>
                    </td>

                    <td className="max-w-md whitespace-pre-wrap p-3 text-muted-foreground">
                      {message.message}
                    </td>

                    <td className="p-3 text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          disabled={workingId === message.id}
                          onClick={() =>
                            toggleRead(message.id, !message.is_read)
                          }
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          {message.is_read ? "Mark unread" : "Mark read"}
                        </Button>

                        <Button
                          disabled={workingId === message.id}
                          onClick={() => deleteMessage(message.id)}
                          size="sm"
                          type="button"
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </>
  );
}
