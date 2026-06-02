import {
  Home,
  Calendar,
  FolderKanban,
  Users,
  Trophy,
  MessageSquare,
  Book,
  Bookmark,
  Info,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    name: "Home",
    href: "/",
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: "Events",
    href: "/events",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    name: "Hackathons",
    href: "/hackathons",
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: <FolderKanban className="w-5 h-5" />,
  },
  {
    name: "More",
    href: "/about",
    icon: <MoreHorizontal className="w-5 h-5" />,
    subItems: [
      {
        name: "Saved",
        href: "/saved-events",
        icon: <Bookmark className="w-5 h-5" />,
      },
      {
        name: "Community",
        href: "/community-event",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "About",
        href: "/about",
        icon: <Info className="w-5 h-5" />,
      },
      {
        name: "Contact",
        href: "/contact",
        icon: <MessageSquare className="w-5 h-5" />,
      },
    ],
  },
]; 