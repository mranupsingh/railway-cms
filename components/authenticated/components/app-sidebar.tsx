"use client"

import {
  ArrowUpCircleIcon,
  Bot,
  CameraIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  LucideIcon,
  SearchIcon,
  Settings2,
  SettingsIcon,
  SquareTerminal
} from "lucide-react"
import * as React from "react"

import { UserInfo } from "@/app/lib/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ROUTE } from "@/lib/routes"
import { NavMain } from "./nav-main"
import { NavDocuments } from "./nav-documents"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"

const data = {
  user: {
    id: "12345",
    loginId: 'Anup Admin',
    email: 'anup@example.com',
    username: 'Anupkumar Pramod Singh'
  },
  navMain: [
    {
      title: "Dashboard",
      url: ROUTE.DASHBOARD,
      icon: LayoutDashboardIcon,
    },
    {
      title: "Daily Operations",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Add coach in yard",
          url: ROUTE.ADD_COACH_IN_YARD,
        },
        {
          title: "Remove coaches from yard",
          url: ROUTE.REMOVE_COACHES_FROM_YARD,
        },
        {
          title: "Air brake",
          url: ROUTE.AIR_BRAKE,
        },

        {
          title: "R-Lifting",
          url: ROUTE.R_LIFTING,
        },
        {
          title: "Upholstery",
          url: ROUTE.UPHOLSTERY,
        },
        {
          title: "Battery & Upholstery",
          url: ROUTE.BATTERY_UPHOLSTERY,
        },
        {
          title: "Bio-tank",
          url: ROUTE.BIO_TANK,
        },
        {
          title: "Electric and NTXR Fit",
          url: ROUTE.ELECTRIC_NTXR,
        },
        {
          title: "Corrosion Status",
          url: ROUTE.LIFTING_REPORT,
        },
      ],
    },
    {
      title: "Monthly Operation",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Add coaches in master",
          url: "#",
        },
      ],
    },
    {
      title: "Inquiries",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Master",
          url: "#",
        },
        {
          title: "History",
          url: "#",
        },
      ],
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
    {
      title: "Logs",
      url: ROUTE.LOGS,
      icon: FileCodeIcon,
    },
  ],
  documents: [
    {
      title: "Master Report",
      url: ROUTE.MASTER_RECORD,
      icon: DatabaseIcon,
    },
    {
      title: "History Report",
      url: ROUTE.HISTORY_RECORD,
      icon: DatabaseIcon,
    }
  ],
}

export interface MenuItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: MenuItem[]
}


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userInfo: UserInfo | null
}

export function AppSidebar(props: AppSidebarProps) {

  // ** Props
  const { userInfo = data.user, ...restProps } = props

  return (
    <Sidebar collapsible="offcanvas" {...restProps}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Railway CMS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo as UserInfo} />
      </SidebarFooter>
    </Sidebar>
  )
}
