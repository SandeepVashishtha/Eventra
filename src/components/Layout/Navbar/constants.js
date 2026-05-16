import React from "react";
import {
  Home,
  Calendar,
  Sparkles,
  FolderKanban,
  Users,
  Trophy,
  Info,
  MessageSquare,
  Book,
  HelpCircle,
} from "lucide-react";

export const navItems = [
  { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
  { name: "Events", href: "/events", icon: <Calendar className="w-5 h-5" /> },
  {
    name: "Hackathons",
    href: "/hackathons",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: <FolderKanban className="w-5 h-5" />,
  },
  {
    name: "Community",
    icon: <Users className="w-5 h-5" />,
    subItems: [
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
      {
        name: "Community Events",
        href: "/communityEvent",
        icon: <Users className="w-5 h-5" />,
      },
    ],
  },
  { name: "About", href: "/about", icon: <Info className="w-5 h-5" /> },
  { name: "FAQ", href: "/faq", icon: <HelpCircle className="w-5 h-5" /> },
  {
    name: "Contact",
    href: "/contact",
    icon: <MessageSquare className="w-5 h-5" />,
  },
];