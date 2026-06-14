import React from 'react';
import { Calendar, Clock, MapPin, Tag } from 'lucide-react';
import CountdownTimer from '../common/CountdownTimer';

const EventDetailsGrid = ({ event }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
      <Calendar className="h-5 w-5 text-indigo-600" />
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
        <p className="font-semibold">{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
      </div>
    </div>
    <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
      <Clock className="h-5 w-5 text-indigo-600" />
      <div><p className="text-sm text-gray-500 dark:text-gray-400">Time</p><p className="font-semibold">{event.time}</p></div>
    </div>
    <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
      <MapPin className="h-5 w-5 text-indigo-600" />
      <div><p className="text-sm text-gray-500 dark:text-gray-400">Location</p><p className="font-semibold">{event.location}</p></div>
    </div>
    <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
      <Tag className="h-5 w-5 text-indigo-600" />
      <div><p className="text-sm text-gray-500 dark:text-gray-400">Status</p><p className="font-semibold capitalize">{event.status}</p></div>
    </div>
    <div className="sm:col-span-2">
      <CountdownTimer date={event.date} time={event.time} />
    </div>
  </div>
);

export default EventDetailsGrid;
