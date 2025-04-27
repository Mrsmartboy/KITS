import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleSaveNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      if (isEditing) {
        const updatedNotes = notes.map((note, index) =>
          index === editIndex ? newNote : note
        );
        setNotes(updatedNotes);
        setIsEditing(false);
        setEditIndex(null);
        Swal.fire({
          icon: "success",
          title: "Note Updated!",
          text: "Your note has been successfully updated.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        setNotes([...notes, newNote]);
        Swal.fire({
          icon: "success",
          title: "Note Saved!",
          text: "Your note has been successfully saved.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setNewNote({ title: "", content: "" });
    } else {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Both title and content are required to save a note.",
      });
    }
  };

  const handleEditNote = (index) => {
    setNewNote(notes[index]);
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleDeleteNote = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this note!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setNotes(notes.filter((_, i) => i !== index));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your note has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-4xl font-extrabold text-indigo-800 mb-6">Notes</h2>
      {/* New Note Form */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <input
          type="text"
          placeholder="Title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 text-lg"
        />
        <ReactQuill
          value={newNote.content}
          onChange={(content) => setNewNote({ ...newNote, content })}
          placeholder="Take a Note"
          className="mb-4 rounded-lg shadow-sm"
          style={{ height: "250px" }}
        />
        <div className="flex justify-end space-x-4 mt-20">
          <button
            onClick={() => setNewNote({ title: "", content: "" })}
            className="px-6 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveNote}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            {isEditing ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* Notes Display */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between hover:shadow-2xl transition-shadow"
          >
            <div>
              <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                {note.title}
              </h3>
              <div
                className="text-gray-600 mb-4"
                dangerouslySetInnerHTML={{ __html: note.content }}
              ></div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => handleEditNote(index)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteNote(index)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {notes.length === 0 && (
        <p className="text-gray-500 text-center mt-8">No notes yet. Add one!</p>
      )}
    </div>
  );
};

export default Notes;
