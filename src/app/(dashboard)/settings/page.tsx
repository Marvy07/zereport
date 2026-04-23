import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <Header
        title="Settings"
        description="Review account preferences, workspace defaults, and future platform controls."
      />
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Workspace settings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-slate-500">
            Settings controls will live here once account preferences, branding options, and automation defaults are wired up.
          </CardContent>
        </Card>
      </main>
    </>
  );
}
