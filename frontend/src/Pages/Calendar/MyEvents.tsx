import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: {
    hallName: string;
    houseNo: string;
    roadNo: string;
    areaName: string;
    thana: string;
    district: string;
  };
}

const MyEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMyEvents = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found.");
        alert("Please log in to view your events.");
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/events/myevents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching my events:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          alert("Unauthorized. Please log in again.");
        } else {
          alert("Failed to load your events. Please try again.");
        }
      }
    };

    fetchMyEvents();
  }, []);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);

    const filteredEvents = events.filter(
      (event) =>
        new Date(event.date).toDateString() === date.toDateString()
    );

    setSelectedDateEvents(filteredEvents);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedDateEvents([]);
    setIsModalOpen(false);
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center bg-gray-100">
      <h1 className="text-2xl font-bold my-4">My Events</h1>
      <div className="flex-grow w-full flex justify-center items-center">
        <Calendar
          className="w-full max-w-4xl mx-auto p-0"
          onClickDay={handleDateClick}
          tileContent={({ date }) => {
            const dateEvents = events.filter(
              (event) => new Date(event.date).toDateString() === date.toDateString()
            );

            return (
              <div>
                {dateEvents.map((event) => (
                  <p key={event._id} className="text-sm text-blue-700 truncate">
                    {event.title}
                  </p>
                ))}
              </div>
            );
          }}
        />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              &#10005; {/* Cross Icon */}
            </button>
            <h2 className="text-xl font-bold mb-4">
              Events on {selectedDate?.toLocaleDateString()}
            </h2>
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event, index) => (
                <div
                  key={event._id}
                  className="p-4 mb-4 border rounded-md bg-gray-50"
                >
                  <p className="font-medium">Event {index + 1}</p>
                  <p className="font-semibold">Time: {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="font-semibold">Title: {event.title}</p>
                  <p>Description: {event.description}</p>
                  <p className="text-sm text-gray-600">
                    Location: {event.location.hallName}, {event.location.houseNo}, {event.location.roadNo},{" "}
                    {event.location.areaName}, {event.location.thana},{" "}
                    {event.location.district}.
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No events found on this date.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
