function formatPeriod(periodStart: Date | null, periodEnd: Date | null) {
  if (!periodStart && !periodEnd) return null;

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

interface ReportEmailInput {
  reportTitle: string;
  clientName: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  hostedReportUrl: string;
  pdfDownloadUrl?: string | null;
}

export function buildReportEmailSubject({ reportTitle, clientName }: Pick<ReportEmailInput, "reportTitle" | "clientName">) {
  return `${reportTitle} for ${clientName}`;
}

export function buildReportEmailHtml({ reportTitle, clientName, periodStart, periodEnd, hostedReportUrl, pdfDownloadUrl }: ReportEmailInput) {
  const periodLabel = formatPeriod(periodStart, periodEnd);

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <p>Hello,</p>
      <p>Your report is ready.</p>
      <p>
        <strong>Report:</strong> ${escapeHtml(reportTitle)}<br />
        <strong>Client:</strong> ${escapeHtml(clientName)}${periodLabel ? `<br /><strong>Reporting period:</strong> ${escapeHtml(periodLabel)}` : ""}
      </p>
      <p>
        View the hosted report here:<br />
        <a href="${hostedReportUrl}">${hostedReportUrl}</a>
      </p>
      ${pdfDownloadUrl ? `<p>A PDF download is also available here:<br /><a href="${pdfDownloadUrl}">${pdfDownloadUrl}</a></p>` : ""}
      <p>Thanks,<br />The Zereport team</p>
    </div>
  `;
}

export function buildReportEmailText({ reportTitle, clientName, periodStart, periodEnd, hostedReportUrl, pdfDownloadUrl }: ReportEmailInput) {
  const periodLabel = formatPeriod(periodStart, periodEnd);

  return [
    "Hello,",
    "",
    "Your report is ready.",
    "",
    `Report: ${reportTitle}`,
    `Client: ${clientName}`,
    periodLabel ? `Reporting period: ${periodLabel}` : null,
    "",
    `View the hosted report: ${hostedReportUrl}`,
    pdfDownloadUrl ? `PDF download: ${pdfDownloadUrl}` : null,
    "",
    "Thanks,",
    "The Zereport team",
  ]
    .filter(Boolean)
    .join("\n");
}
