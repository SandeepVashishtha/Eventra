import {
  Home,
  Calendar,
  CalendarDays,
  Clock,
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
    nameKey: "nav.home",
    href: "/",
    icon: <Home className="w-5 h-5" />,
  },
  {
    nameKey: "nav.events",
    href: "/events",
    icon: <Calendar className="w-5 h-5" />,
    subItems: [
      {
        nameKey: "nav.exploreEvents",
        href: "/events",
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        nameKey: "nav.eventCalendar",
        href: "/calendar",
        icon: <CalendarDays className="w-5 h-5" />,
      },
      {
        nameKey: "nav.scheduler",
        href: "/events/scheduler",
        icon: <Clock className="w-5 h-5" />,
      },
    ],
  },
  {
    nameKey: "nav.hackathons",
    href: "/hackathons",
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    nameKey: "nav.projects",
    href: "/projects",
    icon: <FolderKanban className="w-5 h-5" />,
  },
  {
    nameKey: "nav.networking",
    href: "/networking",
    icon: <Users className="w-5 h-5" />,
  },
  {
    nameKey: "nav.saved",
    href: "/saved-events",
    icon: <Bookmark className="w-5 h-5" />,
  },
  {
    nameKey: "nav.community",
    href: "/community-event",
    icon: <Users className="w-5 h-5" />,
    subItems: [
      {
        nameKey: "nav.communityEvents",
        href: "/community-event",
        icon: <Users className="w-5 h-5" />,
      },
      {
        nameKey: "nav.leaderboard",
        href: "/leaderboard",
        icon: <Trophy className="w-5 h-5" />,
      },
      {
        nameKey: "nav.contributors",
        href: "/contributors",
        icon: <Users className="w-5 h-5" />,
      },
      {
        nameKey: "nav.contributorsGuide",
        href: "/contributorguide",
        icon: <Book className="w-5 h-5" />,
      },
    ],
  },
  {
    nameKey: "nav.more",
    href: "/about",
    icon: <MoreHorizontal className="w-5 h-5" />,
    subItems: [
      {
        nameKey: "nav.about",
        href: "/about",
        icon: <Info className="w-5 h-5" />,
      },
      {
        nameKey: "nav.faq",
        href: "/faq",
        icon: <HelpCircle className="w-5 h-5" />,
      },
      {
        nameKey: "nav.contact",
        href: "/contact",
        icon: <MessageSquare className="w-5 h-5" />,
      },
    ],
  },
];
