// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { useRef } from 'react';
// import {
//   FaBullseye,
//   FaBolt,
//   FaChartLine,
//   FaUsers,
//   FaShieldAlt,
//   FaGlobe,
//   FaArrowRight
// } from 'react-icons/fa';

// const Features = () => {
//   const navigate = useNavigate();

//   const ref = useRef(null);

//   const features = [
//     {
//       icon: <FaBullseye className="text-indigo-600" />,
//       title: "Smart Event Creation",
//       description: "Launch events in minutes with intelligent templates, automatic capacity management, and integrated ticketing. Support for workshops, conferences, meetups, and more.",
//       cta: "Start Creating",
//       highlight: true,
//       stats: "90% faster setup",
//       action: () => navigate('/create-event')
//     },
//     {
//       icon: <FaBolt className="text-yellow-500" />,
//       title: "Instant QR Check-ins",
//       description: "Lightning-fast attendee check-ins with QR codes that work offline. Real-time attendance tracking and automated no-show management.",
//       cta: "See Demo",
//       highlight: true,
//       stats: "3 sec check-in"
//     },
//     {
//       icon: <FaChartLine className="text-green-500" />,
//       title: "Live Analytics",
//       description: "Real-time dashboards showing registration trends, attendance patterns, and engagement metrics. Make data-driven decisions for better events.",
//       cta: "View Dashboard",
//       highlight: false,
//       stats: "15+ metrics"
//     },
//     {
//       icon: <FaUsers className="text-blue-500" />,
//       title: "Team Collaboration",
//       description: "Invite co-organizers, assign roles, and coordinate effortlessly. Built-in communication tools and task management for seamless teamwork.",
//       cta: "Add Team",
//       highlight: false,
//       stats: "Unlimited members"
//     },
//     {
//       icon: <FaShieldAlt className="text-purple-500" />,
//       title: "Enterprise Security",
//       description: "SOC 2 compliant with end-to-end encryption. Advanced privacy controls and GDPR compliance for handling sensitive attendee data.",
//       cta: "Learn More",
//       highlight: false,
//       stats: "Bank-level security"
//     },
//     {
//       icon: <FaGlobe className="text-cyan-500" />,
//       title: "Global Reach",
//       description: "Multi-timezone support, 30+ languages, and international payment processing. Host events anywhere, welcome attendees from everywhere.",
//       cta: "Go Global",
//       highlight: false,
//       stats: "195 countries"
//     }
//   ];

//   const container = {
//     hidden: { opacity: 1 },
//     show: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//         when: "beforeChildren"
//       }
//     }
//   };

//   const item = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: {
//         duration: 0.6,
//         ease: "easeOut"
//       }
//     },
//     hover: {
//       boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
//       borderColor: '#c7d2fe',
//       transition: { duration: 0 }
//     }
//   };

//   return (
//     <section ref={ref} className="py-16 sm:py-20 bg-indigo-50/90 overflow-hidden">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <motion.div
//           className="text-center mb-12"
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={{ duration: 0.6 }}
//         >
//           <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
//             Everything you need to host <span className="text-indigo-600">amazing events</span>
//           </h2>
//           <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
//             From intimate workshops to large conferences, Eventra provides the tools that modern event organizers trust
//           </p>
//         </motion.div>

//         <motion.div
//           className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
//           variants={container}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true, amount: 0.2 }}
//         >
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               variants={item}
//               whileHover="hover"
//               className="relative flex flex-col p-7 rounded-xl overflow-hidden h-full min-h-[320px] bg-white border-2 border-gray-100 transition-all duration-300"
//             >
//               <div className="flex items-center justify-between mb-5">
//                 <motion.div
//                   className="p-3 bg-indigo-50 rounded-lg"
//                   whileHover={{ scale: 1.1 }}
//                   transition={{ type: 'spring', stiffness: 400, damping: 10 }}
//                 >
//                   <div className="text-2xl">
//                     {feature.icon}
//                   </div>
//                 </motion.div>
//                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
//                   {feature.stats}
//                 </span>
//               </div>

//               <h3 className="text-xl font-bold text-gray-900 mb-3.5">{feature.title}</h3>
//               <p className="text-gray-600 mb-6 flex-1 text-justify">{feature.description}</p>

//               <button
//                 onClick={feature.action || (() => { })}
//                 disabled={!feature.action}
//                 className={`mt-auto w-full inline-flex items-center justify-center px-4 py-2.5 border border-indigo-100 rounded-lg text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200 ${feature.action ? 'cursor-pointer' : 'cursor-not-allowed'}`}
//               >
//                 {feature.cta}
//                 <FaArrowRight className="ml-2 -mr-1 w-3.5 h-3.5" />
//               </button>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default Features;
