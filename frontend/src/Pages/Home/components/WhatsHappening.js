import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const WhatsHappening = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const upcomingEvents = [
    {
      id: 1,
      title: "GirlScript Summer of Code 2025",
      description: "Join the largest open-source program for students. Contribute to Eventra and other amazing projects!",
      date: "March 15 - June 15, 2025",
      type: "Open Source Program",
      status: "Registration Open",
      link: "https://gssoc.girlscript.tech/",
      featured: true
    },
    {
      id: 2,
      title: "Eventra Community Meetup",
      description: "Virtual meetup to discuss roadmap, features, and community contributions to the platform.",
      date: "February 10, 2025",
      type: "Community Event",
      status: "Coming Soon",
      link: "#",
      featured: false
    },
    {
      id: 3,
      title: "Open Source Workshop",
      description: "Learn how to contribute to Eventra. Perfect for beginners wanting to get started with open source.",
      date: "February 20, 2025",
      type: "Workshop",
      status: "Planning",
      link: "#",
      featured: false
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const statusColors = {
    'Registration Open': 'bg-green-100 text-green-800',
    'Coming Soon': 'bg-blue-100 text-blue-800',
    'Planning': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What's Happening Now
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Stay updated with upcoming events, community programs, and opportunities to contribute to Eventra
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {upcomingEvents.map((event) => (
            <motion.div
              key={event.id}
              variants={item}
              className={`flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${
                event.featured ? 'ring-2 ring-indigo-500' : 'border border-gray-100'
              }`}
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[event.status] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                  <span className="text-sm text-gray-500">{event.type}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 flex-1 mb-4">{event.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mt-4">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {event.date}
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4">
                <a
                  href={event.link}
                  className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                    event.featured 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'text-indigo-600 bg-white border-indigo-100 hover:bg-indigo-50'
                  }`}
                  target={event.link.startsWith('http') ? '_blank' : '_self'}
                  rel={event.link.startsWith('http') ? 'noopener noreferrer' : ''}
                >
                  {event.featured ? 'Join Now' : 'Learn More'}
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 bg-indigo-50 rounded-xl p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:flex-1 md:pr-8">
              <h3 className="text-2xl font-bold text-gray-900">Eventra is participating in GirlScript Summer of Code 2025!</h3>
              <p className="mt-3 text-gray-600">
                We're excited to mentor contributors and welcome new developers to our open-source community. 
                Join us in building the future of event management!
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-4">
              <a 
                href="https://gssoc.girlscript.tech/" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply to GSSOC
              </a>
              <a
                href="https://github.com/sandeepvashishtha/Eventra/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Issues
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatsHappening;