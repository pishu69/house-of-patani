import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { DashboardCard, PageTitle, SearchInput } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { newsletterService } from "@/services";

export function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const filteredSubscribers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return subscribers;

    return subscribers.filter((subscriber) =>
      String(subscriber.email ?? "").toLowerCase().includes(query) ||
      String(subscriber.source ?? "").toLowerCase().includes(query),
    );
  }, [search, subscribers]);

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

  function exportCsv() {
    if (filteredSubscribers.length === 0) {
      toast.error("No subscribers to export.");
      return;
    }

    const rows = [
      ["Email", "Source", "Subscribed On"],
      ...filteredSubscribers.map((subscriber) => [
        subscriber.email ?? "",
        subscriber.source ?? "",
        subscriber.created_at
          ? new Date(subscriber.created_at).toLocaleString()
          : "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, `""`)}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `newsletter-subscribers-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    toast.success("Newsletter CSV exported.");
  }

  useEffect(() => {
    loadSubscribers();
  }, []);

  return (
    <>
      <PageTitle
        action={
          <Button onClick={exportCsv} type="button">
            <Download aria-hidden="true" size={17} />
            Export CSV
          </Button>
        }
        title="Newsletter Subscribers"
        description="People who subscribed to Patani Letters."
      />

      <DashboardCard title={`Subscribers (${filteredSubscribers.length})`}>
        <div className="mb-5">
          <SearchInput
            onChange={setSearch}
            placeholder="Search by email or source"
            value={search}
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : subscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subscribers yet.</p>
        ) : filteredSubscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subscribers match your search.
          </p>
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
                {filteredSubscribers.map((subscriber) => (
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
