import React, { useEffect, useState } from "react";
import axios from "axios";
import GroupCard from "../../components/GroupCard";

interface Group {
  _id: string;
  groupName: string;
  description: string;
  members: string[];
}

const ShowAllGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/groups`);
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
        alert("Failed to load groups. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleJoinGroup = async (groupId: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/groups/join`,
        { groupId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Joined group successfully!");
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to join group. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">All Groups</h1>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group._id}
              groupName={group.groupName}
              description={group.description}
              memberCount={group.members.length}
              onJoin={() => handleJoinGroup(group._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowAllGroups;
