// import React from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { ChevronDown } from "lucide-react";

// // Desktop nav links with dropdown support
// export const DesktopNavLinks = ({
//   navItems,
//   location,
//   openDropdown,
//   setOpenDropdown,
// }) => {
//   return (
//     <>
//       {navItems.map((item) => {
//         const isActive = item.href
//           ? location.pathname === item.href
//           : item.subItems?.some((sub) => location.pathname === sub.href);

//         if (item.subItems) {
//           return (
//             <div key={item.name} className="relative">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
   
//                   setOpenDropdown(
//                     openDropdown === item.name ? null : item.name
//                   );
                  
//                 }}
//                 className={`flex items-center gap-1 text-base font-medium transition-colors ${
//                   isActive || openDropdown === item.name
//                     ? "text-black dark:text-white"
//                     : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
//                 }`}
//               >
//                 {item.name}
//                 <ChevronDown
//                   className={`w-4 h-4 transition-transform duration-200 ${
//                     openDropdown === item.name ? "rotate-180" : ""
//                   }`}
//                 />
//               </button>

//               {openDropdown === item.name && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: 10 }}
//                   className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-xl rounded-lg z-50 border border-black/10 dark:border-white/20 p-2"
//                 >
//                   {item.subItems.map((sub) => (
//                     <Link
//                       key={sub.name}
//                       to={sub.href}
//                       onClick={() => setOpenDropdown(null)}
//                       className={`group flex items-center gap-3 w-full px-3 py-2 text-base font-medium rounded-md transition-colors ${
//                         location.pathname === sub.href
//                           ? "bg-black/10 dark:bg-white/15 text-black dark:text-white"
//                           : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
//                       }`}
//                     >
//                       {React.cloneElement(sub.icon, {
//                         className: "w-5 h-5 text-gray-500 dark:text-gray-400",
//                       })}
//                       {sub.name}
//                     </Link>
//                   ))}
//                 </motion.div>
//               )}
//             </div>
//           );
//         }

//         return (
//           <Link
//             key={item.name}
//             to={item.href}
//             className={`text-base font-medium transition-colors ${
//               isActive
//                 ? "text-black dark:text-white"
//                 : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
//             }`}
//           >
//             {item.name}
//           </Link>
//         );
//       })}
//     </>
//   );
// };

// // Mobile nav links with accordion dropdown support
// export const MobileNavLinks = ({
//   navItems,
//   location,
//   openDropdown,
//   setOpenDropdown,
//   closeAllMenus,
// }) => {
//   return (
//     <>
//       {navItems.map((item) => {
//         const isActive = item.href
//           ? location.pathname === item.href
//           : item.subItems?.some((sub) => location.pathname === sub.href);

//         if (item.subItems) {
//           return (
//             <div key={item.name}>
//               <button
//                 onClick={() =>
//                   setOpenDropdown(
//                     openDropdown === item.name ? null : item.name
//                   )
//                 }
//                 className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors text-left text-base font-medium ${
//                   isActive
//                     ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
//                     : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
//                 }`}
//               >
//                 <span className="flex items-center gap-3">
//                   {item.icon} {item.name}
//                 </span>
//                 <ChevronDown
//                   className={`w-4 h-4 transition-transform ${
//                     openDropdown === item.name ? "rotate-180" : ""
//                   }`}
//                 />
//               </button>

//               {openDropdown === item.name && (
//                 <div className="mt-2 ml-3 pl-3 border-l-2 border-gray-200 dark:border-white/20 space-y-1">
//                   {item.subItems.map((sub) => {
//                     const isSubActive = location.pathname === sub.href;
//                     return (
//                       <Link
//                         key={sub.name}
//                         to={sub.href}
//                         onClick={closeAllMenus}
//                         className={`flex items-center gap-3 px-4 py-2 rounded-md text-base font-medium ${
//                           isSubActive
//                             ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
//                             : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
//                         }`}
//                       >
//                         {sub.icon}
//                         {sub.name}
//                       </Link>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         }

//         return (
//           <Link
//             key={item.name}
//             to={item.href}
//             onClick={closeAllMenus}
//             className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${
//               isActive
//                 ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
//                 : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
//             }`}
//           >
//             {item.icon}
//             {item.name}
//           </Link>
//         );
//       })}
//     </>
//   );
// };

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Desktop nav links with dropdown support
export const DesktopNavLinks = ({
  navItems,
  location,
  openDropdown,
  setOpenDropdown,
}) => {
  return (
    <>
      {navItems.map((item) => {
        const isActive = item.href
          ? location.pathname === item.href
          : item.subItems?.some((sub) => location.pathname === sub.href);

        if (item.subItems) {
          return (
            <div key={item.name} className="relative">
              <button
                aria-expanded={openDropdown === item.name}
                aria-haspopup="true"
                aria-label={`${item.name} navigation menu`}
                onClick={(e) => {
                  e.stopPropagation();

                  setOpenDropdown(
                    openDropdown === item.name ? null : item.name
                  );
                }}
                className={`flex items-center gap-1 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md ${
                  isActive || openDropdown === item.name
                    ? "text-black dark:text-white"
                    : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
                }`}
              >
                {item.name}

                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openDropdown === item.name ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === item.name && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-xl rounded-lg z-50 border border-black/10 dark:border-white/20 p-2"
                >
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.name}
                      to={sub.href}
                      onClick={() => setOpenDropdown(null)}
                      className={`group flex items-center gap-3 w-full px-3 py-2 text-base font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        location.pathname === sub.href
                          ? "bg-black/10 dark:bg-white/15 text-black dark:text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      {React.cloneElement(sub.icon, {
                        className: "w-5 h-5 text-gray-500 dark:text-gray-400",
                      })}

                      {sub.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            to={item.href}
            className={`text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md ${
              isActive
                ? "text-black dark:text-white"
                : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </>
  );
};

// Mobile nav links with accordion dropdown support
export const MobileNavLinks = ({
  navItems,
  location,
  openDropdown,
  setOpenDropdown,
  closeAllMenus,
}) => {
  return (
    <>
      {navItems.map((item) => {
        const isActive = item.href
          ? location.pathname === item.href
          : item.subItems?.some((sub) => location.pathname === sub.href);

        if (item.subItems) {
          return (
            <div key={item.name}>
              <button
                aria-expanded={openDropdown === item.name}
                aria-haspopup="true"
                aria-label={`${item.name} mobile navigation menu`}
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === item.name ? null : item.name
                  )
                }
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors text-left text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive
                    ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon} {item.name}
                </span>

                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openDropdown === item.name ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === item.name && (
                <div className="mt-2 ml-3 pl-3 border-l-2 border-gray-200 dark:border-white/20 space-y-1">
                  {item.subItems.map((sub) => {
                    const isSubActive = location.pathname === sub.href;

                    return (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        onClick={closeAllMenus}
                        className={`flex items-center gap-3 px-4 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isSubActive
                            ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                            : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {sub.icon}

                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={closeAllMenus}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isActive
                ? "bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-black dark:text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {item.icon}

            {item.name}
          </Link>
        );
      })}
    </>
  );
};

















