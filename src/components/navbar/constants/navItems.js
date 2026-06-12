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
    icon: <Home className="h-5 w-5" />,
  },
  {
    nameKey: "nav.events",
    href: "/events",
    icon: <Calendar className="h-5 w-5" />,
    subItems: [
      {
        nameKey: "nav.exploreEvents",
        href: "/events",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        nameKey: "nav.eventCalendar",
        href: "/calendar",
        icon: <CalendarDays className="h-5 w-5" />,
      },
      {
        nameKey: "nav.scheduler",
        href: "/events/scheduler",
        icon: <Clock className="h-5 w-5" />,
      },
    ],
  },
  {
    nameKey: "nav.hackathons",
    href: "/hackathons",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    nameKey: "nav.projects",
    href: "/projects",
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    nameKey: "nav.networking",
    href: "/networking",
    icon: <Users className="h-5 w-5" />,
  },
  {
    nameKey: "nav.saved",
    href: "/bookmarks",
    icon: <Bookmark className="h-5 w-5" />,
  },
  {
    nameKey: "nav.community",
    href: "/community-event",
    icon: <Users className="h-5 w-5" />,
    subItems: [
      {
        nameKey: "nav.communityEvents",
        href: "/community-event",
        icon: <Users className="h-5 w-5" />,
      },
      {
        nameKey: "nav.leaderboard",
        href: "/leaderboard",
        icon: <Trophy className="h-5 w-5" />,
      },
      {
        nameKey: "nav.contributors",
        href: "/contributors",
        icon: <Users className="h-5 w-5" />,
      },
      {
        nameKey: "nav.contributorsGuide",
        href: "/contributorguide",
        icon: <Book className="h-5 w-5" />,
      },
    ],
  },
  {
    nameKey: "nav.more",
    href: "/about",
    icon: <MoreHorizontal className="h-5 w-5" />,
    subItems: [
      {
        nameKey: "nav.about",
        href: "/about",
        icon: <Info className="h-5 w-5" />,
      },
      {
        nameKey: "nav.faq",
        href: "/faq",
        icon: <HelpCircle className="h-5 w-5" />,
      },
      {
        nameKey: "nav.contact",
        href: "/contact",
        icon: <MessageSquare className="h-5 w-5" />,
      },
    ],
  },
];
