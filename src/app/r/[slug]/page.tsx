import { notFound } from "next/navigation";

import { HostedReportView } from "@/components/reports/HostedReportView";
import { prisma } from "@/lib/prisma";

export default async function HostedReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const report = await prisma.report.findUnique({
    where: { webSlug: slug },
    include: {
      client: {
        select: {
          name: true,
          companyName: true,
        },
      },
      sections: {
        select: {
          id: true,
          title: true,
          type: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!report) {
    notFound();
  }

  return <HostedReportView report={report} />;
}
