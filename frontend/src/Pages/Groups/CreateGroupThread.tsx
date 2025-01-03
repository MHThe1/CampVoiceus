import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function CreateGroupThread() {
  const { groupId } = useParams<{ groupId: string }>(); // Extract groupId from the URL
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    file: null,
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files, type } = e.target as HTMLInputElement;
    if (type === "file" && files) {
      // Handle file input
      setFile(files[0]);
      setFormData({ ...formData, [name]: files[0] });
    } else {
      // Handle other inputs (text, textarea, etc.)
      setFormData({ ...formData, [name]: value });
    }
  };

  const clearFile = () => {
    setFile(null);
    (document.getElementById("file") as HTMLInputElement).value = ""; // Reset input field
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!groupId) {
      setError("Group ID is missing. Cannot create a thread without a group.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const threadData = new FormData();
      threadData.append("title", formData.title);
      threadData.append("content", formData.content);
      threadData.append("groupId", groupId); // Add groupId to the request body
      if (file) {
        threadData.append("file", file);
      }

      // Post data to the backend
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/groups/createthread`, threadData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      setFormData({ title: "", content: "", file: null });
      clearFile();
    } catch (err) {
      console.error("Error creating thread:", err);
      setError("Failed to create the thread. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">
        Create a Thread for Group
      </h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm mb-4">
          Thread created successfully!
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows={6}
            value={formData.content}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            File Upload
          </label>
          <div className="relative mt-1 flex items-center">
            <input
              id="file"
              name="file"
              type="file"
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold 
              file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {file && (
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 focus:outline-none"
                aria-label="Clear file"
              >
                &#x2715; {/* Cross Icon */}
              </button>
            )}
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected File: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 ${
            loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          } text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
          {loading ? "Submitting..." : "Submit Thread"}
        </button>
      </form>
    </div>
  );
}
