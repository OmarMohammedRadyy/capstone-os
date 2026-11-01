import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getUserProjects } from "@/server/services/projects";

export default async function AppRootPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const projects = await getUserProjects(user);

  if (projects.length > 0) {
    const targetSlug = projects[0]!.slug;
    redirect(`/app/p/${targetSlug}/overview`);
  } else {
    redirect("/app/projects");
  }
}

