import { LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { EllipsisVertical, File, FilePlus, Globe, LogOut, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "~/components/ui/sidebar";
import { fetchUser } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await fetchUser(request);

  if (!user) return redirect('/login');

  return {
    user,
  }
}

export const meta: MetaFunction = () => {
  const description = "is-a.bio is the best app to create your portfolio. Start building your portfolio today with is-a.bio.";

  return [
    { title: 'Builder | is-a.bio' },
    {
      property: "og:title",
      content: "Builder | is-a.bio",
    },
    {
      name: "description",
      content: description,
    },
    {
      property: "og:description",
      content: description,
    },

    { tagName: "link", rel: 'icon', href: '/favicon.png', type: 'image/png' }
  ]
}

export default function RootLayout() {
  const { user } = useLoaderData<typeof loader>();

  return <SidebarProvider className="min-h-screen bg-slate-100">
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="py-2">
            <Link to="/">
              <img src="/logo.svg" className="w-1/3 mx-auto" alt="" />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Websites
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/builder/new">
                    <FilePlus />
                    Create a new website
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/builder">
                    <File />
                    View websites
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/builder/new">
                    <Globe />

                    Manage your subdomains
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <img src={user.avatarURL} className="h-8 w-8 rounded-full" alt="" />
                  
                  <div className="flex flex-col">
                    <span>
                      {user.name}
                    </span>

                    <span className="text-xs -mt-0.5 text-muted-foreground">
                      {user.username}
                    </span>
                  </div>
                </SidebarMenuButton>

                <SidebarMenuBadge>
                  <EllipsisVertical className="h-4 w-auto" />
                </SidebarMenuBadge>
              </SidebarMenuItem>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to="/logout">
                  <LogOut />
                  Logout
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    <main className="w-full">
      <div className="grid place-items-center px-8">
        <Outlet />
      </div>
    </main>
  </SidebarProvider>;
}