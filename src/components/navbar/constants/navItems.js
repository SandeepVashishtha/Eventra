import {
  Home, Calendar, FolderKanban, Users, Trophy,
  MessageSquare, Book, Bookmark, Info, HelpCircle, MoreHorizontal,
} from "lucide-react";

export const getNavItems = (t) => [
  { name: t('nav.home'), href: "/", icon: <Home className="w-5 h-5" /> },
  { name: t('nav.events'), href: "/events", icon: <Calendar className="w-5 h-5" /> },
  { name: t('nav.hackathons'), href: "/hackathons", icon: <Trophy className="w-5 h-5" /> },
  { name: t('nav.projects'), href: "/projects", icon: <FolderKanban className="w-5 h-5" /> },
  { name: t('nav.networking'), href: "/networking", icon: <Users className="w-5 h-5" /> },
  { name: t('nav.saved'), href: "/saved-events", icon: <Bookmark className="w-5 h-5" /> },
  {
    name: t('nav.community'), href: "/community-event", icon: <Users className="w-5 h-5" />,
    subItems: [
      { name: t('nav.community_events'), href: "/community-event", icon: <Users className="w-5 h-5" /> },
      { name: t('nav.leaderboard'), href: "/leaderboard", icon: <Trophy className="w-5 h-5" /> },
      { name: t('nav.contributors'), href: "/contributors", icon: <Users className="w-5 h-5" /> },
      { name: t('nav.contributors_guide'), href: "/contributorguide", icon: <Book className="w-5 h-5" /> },
    ],
  },
  {
    name: t('nav.more'), href: "/about", icon: <MoreHorizontal className="w-5 h-5" />,
    subItems: [
      { name: t('nav.about'), href: "/about", icon: <Info className="w-5 h-5" /> },
      { name: t('nav.faq'), href: "/faq", icon: <HelpCircle className="w-5 h-5" /> },
      { name: t('nav.contact'), href: "/contact", icon: <MessageSquare className="w-5 h-5" /> },
    ],
  },
];