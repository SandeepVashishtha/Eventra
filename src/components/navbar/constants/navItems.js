import {
  Home,
  Calendar,
  FolderKanban,
  Users,
  Trophy,
  Info,
  MessageSquare,
  HelpCircle,
  Book,
  Bookmark,
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
    name: "Saved",
    href: "/saved-events",
    icon: <Bookmark className="w-5 h-5" />,
  },
  {
    name: "Community",
    href: "/communityEvent",
    icon: <Users className="w-5 h-5" />,
    subItems: [
      {
        name: "Community Events",
        href: "/communityEvent",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Leaderboard",
        href: "/leaderBoard",
        icon: <Trophy className="w-5 h-5" />,
      },
      {
        name: "Contributors",
        href: "/contributors",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Contributors Guide",
        href: "/contributorguide",
        icon: <Book className="w-5 h-5" />,
      },
    ],
  },

  {
    name: "Contact",
    href: "/contact",
    icon: <MessageSquare className="w-5 h-5" />,
  },
];
