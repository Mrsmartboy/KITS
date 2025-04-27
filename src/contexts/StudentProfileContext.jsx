import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { decryptData } from '../../cryptoUtils.jsx';


const StudentProfileContext = createContext();

export const useStudent = () => useContext(StudentProfileContext);

export const StudentProvider = ({ children }) => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: Profile picture states ---
  const [profilePicture, setProfilePicture] = useState(null);

  const navigate = useNavigate();

  // --------------------------------------------------
  // 1) FETCH STUDENT DETAILS (existing code)
  // --------------------------------------------------
  const fetchStudentDetails = useCallback(async () => {
    const student_id = decryptData(sessionStorage.getItem('student_login_details'));
    const location = decryptData(sessionStorage.getItem('location'));
    if (!student_id) {
      setError('Student ID not found in local storage.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/getstudentdetails`,
        {
          params: { student_id, location },
        }
      );

      setStudentDetails(response.data || { studentSkills: [] });
      setError(null);
    } catch (error) {
      console.error('Error fetching student details:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.clear(); // Clear all user data
        navigate('/login');   // Redirect to login
      } else {
        setError('Failed to load student details. Please try again.');
      }

      setStudentDetails({ studentSkills: [] });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // --------------------------------------------------
  // 2) FETCH PROFILE PICTURE (new)
  // --------------------------------------------------
  const fetchProfilePicture = useCallback(async () => {
    if (!studentDetails?.studentId) return; // no ID => nothing to fetch

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/pic`,
        {
          params: { student_id: studentDetails.studentId },
          responseType: 'blob', // so we can create a local URL
        }
      );

      const contentType = response.headers['content-type'];
      if (contentType.includes('image/png') || contentType.includes('image/jpeg')) {
        // Convert the blob to a local image URL
        const imageUrl = URL.createObjectURL(response.data);
        setProfilePicture(imageUrl);
      } else {
        console.error('Unsupported file type:', contentType);
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);

      // Handle unauthorized errors (optional):
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to load profile picture. Please try again.');
      }
      setProfilePicture(null);
    }
  }, [studentDetails, navigate]);

  // --------------------------------------------------
  // 3) UPDATE (UPLOAD) PROFILE PICTURE (new)
  // --------------------------------------------------
  async function updateProfilePicture(newFile) {
    if (!studentDetails?.studentId) return;

    try {
      const formData = new FormData();
      formData.append('profilePic', newFile);
      formData.append('student_id', studentDetails.studentId);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/profilepic`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.status === 200) {
        console.log('✅ Profile picture updated. Re-fetching...');
        await fetchProfilePicture(); // refresh the local state
      }
    } catch (error) {
      console.error('Error uploading new profile picture:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to update profile picture. Please try again.');
      }
    }
  }

  // --------------------------------------------------
  // 4) ON COMPONENT MOUNT => fetch details
  // --------------------------------------------------
  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  // --------------------------------------------------
  // 5) WHEN studentDetails ARRIVES => fetch picture
  // --------------------------------------------------
  useEffect(() => {
    if (studentDetails?.studentId) {
      fetchProfilePicture();
    }
  }, [studentDetails, fetchProfilePicture]);

  // If still loading, you might optionally do a loading screen

  // --------------------------------------------------
  // 6) PROVIDER VALUE
  // --------------------------------------------------
  return (
    <StudentProfileContext.Provider
      value={{
        studentDetails,
        setStudentDetails,
        loading,
        error,
        fetchStudentDetails,

        // NEW: Export our new picture states & actions
      profilePicture,
        fetchProfilePicture,
        updateProfilePicture,
      }}
    >
      {children}
    </StudentProfileContext.Provider>
  );
};
