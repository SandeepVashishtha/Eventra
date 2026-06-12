import { useState } from "react";
import { CalendarDays, Users } from "lucide-react";

const EventCTA = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <section
      className="relative m-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-8 py-16 text-white shadow-xl"
      // AOS Implementation
      data-aos="zoom-in-up"
      data-aos-duration="1000"
    >
      {/* Snake-like glowing line */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0,100 Q150,200 300,100 T600,100 T900,150 T1200,120"
          fill="transparent"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
        {/* Text */}
        <div className="text-center md:w-1/2 md:text-left">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">Stay Updated with Our Events</h2>
          <p className="mb-6 text-lg md:text-xl">
            Explore upcoming events, workshops, and webinars. Join the community and never miss out
            on learning opportunities.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 md:flex-row">
          <a
            href="/events"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-700"
          >
            Explore Events <CalendarDays size={20} />
          </a>

          {/* UPDATED: The secondary button needs dark mode styles for when the main page is dark. */}
          <button
            onClick={() => setShowModal(true)}
            className="relative inline-flex items-center rounded-lg border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 shadow transition-all duration-300 hover:scale-105 hover:bg-slate-50 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            <Users size={20} /> Participate
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="bg-opacity-60 fixed inset-0 z-50 flex items-center justify-center bg-black">
          {/* UPDATED: Modal card background, border, and text */}
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center dark:border dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Join Our Community
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-400">
              To participate in events, please explore the event cards listed on this page.
            </p>
            {/* The close button works well in both themes. */}
            <button
              className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventCTA;
