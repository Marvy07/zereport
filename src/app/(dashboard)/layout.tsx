// TODO: Add Clerk auth guard here in Section 2
// import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // TODO: const { userId } = await auth();
  // TODO: if (!userId) redirect("/sign-in");
  return <>{children}</>;
}
