import { notFound } from "next/navigation";

import { HostedReportView } from "@/components/reports/HostedReportView";
import { prisma } from "@/lib/prisma";
import { reportDeliveryTokenMatches } from "@/lib/report-delivery";

export default async function HostedReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  const report = await prisma.report.findFirst({
    where: {
      webSlug: slug,
      deliveries: {
        some: {
          status: {
            in: ["SENT", "OPENED"],
          },
        },
      },
    },
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
      deliveries: {
        where: {
          status: {
            in: ["SENT", "OPENED"],
          },
        },
        select: {
          id: true,
          deliveryTokenHash: true,
          status: true,
        },
      },
    },
  });

  if (!report) {
    notFound();
  }

  const matchedDelivery = report.deliveries.find((delivery) => reportDeliveryTokenMatches(token, delivery.deliveryTokenHash));

  if (!matchedDelivery) {
    notFound();
  }

  if (matchedDelivery.status !== "OPENED") {
    await prisma.reportDelivery.update({
      where: { id: matchedDelivery.id },
      data: {
        status: "OPENED",
        openedAt: new Date(),
      },
    });
  }

  return <HostedReportView report={report} />;
}
