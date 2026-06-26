import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardCard, PageTitle } from "@/components/admin";
import { newsletterService } from "@/services";

export function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSubscribers() {
    try {
      setLoading(true);

      const result = await newsletterService.list();

      if (result.data) {
        setSubscribers(result.data);
      }
    } catch {
      toast.error("Unable to load subscribers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscribers();
  }, []);

  return (
    <>
      <PageTitle
        title="Newsletter Subscribers"
        description="People who subscribed to Patani Letters."
      />

      <DashboardCard title={`Subscribers (${subscribers.length})`}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : subscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subscribers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-maroon/10">
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Source</th>
                  <th className="p-3 text-left">Subscribed On</th>
                </tr>
              </thead>

              <tbody>
                {subscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-maroon/10"
                  >
                    <td className="p-3">{subscriber.email}</td>
                    <td className="p-3">{subscriber.source}</td>
                    <td className="p-3">
                      {new Date(subscriber.created_at).toLocaleString()}
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
