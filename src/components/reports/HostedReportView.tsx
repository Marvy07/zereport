import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HostedReportSection {
  id: string;
  title: string;
  type: string;
  sortOrder: number;
}

interface HostedReportViewProps {
  report: {
    title: string;
    status: string;
    periodStart: Date | null;
    periodEnd: Date | null;
    client: {
      name: string;
      companyName?: string | null;
    };
    sections: HostedReportSection[];
  };
}

function formatPeriod(periodStart: Date | null, periodEnd: Date | null) {
  if (!periodStart && !periodEnd) return "No reporting period selected";

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (periodStart && periodEnd) {
    return `${formatter.format(periodStart)} to ${formatter.format(periodEnd)}`;
  }

  return formatter.format(periodStart ?? periodEnd!);
}

export function HostedReportView({ report }: HostedReportViewProps) {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Hosted report</p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{report.title}</h1>
                <p className="mt-2 text-base text-slate-600">{report.client.companyName || report.client.name}</p>
              </div>
            </div>
            <Badge variant={report.status === "READY" ? "default" : report.status === "ARCHIVED" ? "outline" : "secondary"}>{report.status}</Badge>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Client</p>
              <p className="mt-2 text-lg font-medium text-slate-950">{report.client.name}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Period</p>
              <p className="mt-2 text-lg font-medium text-slate-950">{formatPeriod(report.periodStart, report.periodEnd)}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Report sections</h2>
            <p className="text-sm text-slate-500">This public view will expand as report sections become fully rendered in later sections.</p>
          </div>

          {report.sections.length > 0 ? (
            <div className="grid gap-4">
              {report.sections.map((section, index) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{index + 1}. {section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">Type: {section.type.replaceAll("_", " ")}</p>
                    <p className="mt-3 text-sm text-slate-500">Content rendering placeholder. Full section output will be added in a later section.</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-600">No report sections have been added yet. Once sections are created, they will appear here in a clean hosted layout.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
