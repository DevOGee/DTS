import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  CalendarPlus,
  ClipboardList,
  FileText,
  Users,
  Video,
  CalendarDays,
  Settings,
  UserPlus,
  BadgeCheck,
  Send,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { DYNAMIC_ROUTES, getRouteByPath } from "../../routes/routeConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

type QuickAction = {
  id: string;
  title: string;
  description: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

type ActionGroup = {
  id: string;
  title: string;
  description: string;
  actions: QuickAction[];
};

function routeIsAccessible(
  path: string,
  role: string | undefined,
  permissionsByRole: Record<string, Record<string, boolean>>,
) {
  const route = getRouteByPath(path) ?? DYNAMIC_ROUTES.find((r) => r.path === path);
  if (!route) return false;
  if (!role) return false;
  if (role === "System Admin") return true;
  const required = route.permissions ?? [];
  if (required.length === 0) return true;
  const rolePerms = permissionsByRole[role] ?? {};
  return required.some((p) => rolePerms[p]);
}

export function QuickActions({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { permissions } = useData();

  const groups: ActionGroup[] = useMemo(
    () => [
      {
        id: "workshops",
        title: "Workshops",
        description: "Plan, schedule, and switch active workshops.",
        actions: [
          {
            id: "create_workshop",
            title: "Create workshop",
            description: "Schedule a new digitisation workshop.",
            to: "/workshops/add-workshop",
            icon: CalendarPlus,
          },
          {
            id: "active_workshops",
            title: "Active workshops",
            description: "View and manage ongoing workshops.",
            to: "/workshops/active",
            icon: CalendarDays,
          },
          {
            id: "all_workshops",
            title: "All workshops",
            description: "Browse upcoming and completed workshops.",
            to: "/workshops/all",
            icon: ClipboardList,
          },
        ],
      },
      {
        id: "content",
        title: "Content",
        description: "Add and track digitisation content.",
        actions: [
          {
            id: "add_course",
            title: "Add course",
            description: "Create a new course and modules.",
            to: "/courses/add-course",
            icon: BookOpen,
          },
          {
            id: "manage_courses",
            title: "Manage courses",
            description: "View and update existing courses.",
            to: "/courses",
            icon: BadgeCheck,
          },
          {
            id: "log_multimedia",
            title: "Log multimedia",
            description: "Record video/multimedia activity per group.",
            to: "/multimedia/log-video",
            icon: Video,
          },
        ],
      },
      {
        id: "people",
        title: "Participants",
        description: "Register, manage, and track attendance.",
        actions: [
          {
            id: "add_participant",
            title: "Add participant",
            description: "Register a new team member.",
            to: "/participants/add-participant",
            icon: UserPlus,
          },
          {
            id: "manage_participants",
            title: "Manage participants",
            description: "Search, edit, and verify participant records.",
            to: "/participants",
            icon: Users,
          },
          {
            id: "attendance",
            title: "Mark attendance",
            description: "Record daily attendance and DSA eligibility.",
            to: "/attendance",
            icon: BadgeCheck,
          },
        ],
      },
      {
        id: "reports",
        title: "Reporting",
        description: "Generate summaries and keep delivery on track.",
        actions: [
          {
            id: "open_reports",
            title: "Generate reports",
            description: "Open analytics, logs, and exports.",
            to: "/reports",
            icon: FileText,
          },
          {
            id: "checklist",
            title: "Phase checklist",
            description: "Track milestones and completion status.",
            to: "/checklist",
            icon: ClipboardList,
          },
          {
            id: "requests",
            title: "Requests",
            description: "Create and manage digitisation requests.",
            to: "/requests",
            icon: Send,
          },
        ],
      },
      {
        id: "admin",
        title: "Administration",
        description: "System configuration and user management.",
        actions: [
          {
            id: "settings",
            title: "Settings",
            description: "Manage users, rates, and system options.",
            to: "/settings",
            icon: Settings,
          },
        ],
      },
    ],
    [],
  );

  const visibleGroups = useMemo(() => {
    const role = user?.role;
    const permsByRole = permissions as unknown as Record<string, Record<string, boolean>>;
    return groups
      .map((g) => ({
        ...g,
        actions: g.actions.filter((a) => routeIsAccessible(a.to, role, permsByRole)),
      }))
      .filter((g) => g.actions.length > 0);
  }, [groups, permissions, user?.role]);

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Quick actions</h2>
          <p className="text-sm text-muted-foreground">
            Jump straight into common workflows.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
          <FileText className="h-4 w-4" />
          Open reports
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleGroups.map((group) => (
          <Card key={group.id} className="bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{group.title}</CardTitle>
              <CardDescription className="text-sm">
                {group.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => navigate(action.to)}
                    className="group w-full rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-left transition hover:bg-muted/60 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold text-sm">
                            {action.title}
                          </div>
                          <span className="text-xs text-muted-foreground group-hover:text-foreground transition">
                            Open
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

