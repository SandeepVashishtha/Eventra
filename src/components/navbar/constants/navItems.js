import {
  Calendar,
  FolderKanban,
  Users,
  Trophy,
  MessageSquare,
  Book,
  Info,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";

export const PRIMARY_NAV_ITEMS = [
  // Fix (Issue #10497): Remove unused/misleading dropdown from Events nav item.
// The subItems (Explore Events, Calendar, Scheduler) were either duplicating
// the parent link or pointing to pages accessible via other nav items,
// causing a chevron to appear with no meaningful dropdown content.
// Events is now a direct nav link with no dropdown.
{
  nameKey: "nav.events",
  href: "/events",
  icon: <Calendar className="w-5 h-5" />,
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
];

export const SECONDARY_NAV_ITEMS = [
  {
    nameKey: "nav.networking",
    href: "/networking",
    icon: <Users className="w-5 h-5" />,
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
