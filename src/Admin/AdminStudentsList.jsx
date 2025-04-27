import React, { useState, useEffect } from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { write, utils } from 'xlsx';
import { useStudentsData } from '../contexts/StudentsListContext';
import { saveAs } from 'file-saver';
import { useUniqueBatches } from '../contexts/UniqueBatchesContext.jsx';
import { decryptData } from '../../cryptoUtils.jsx';

export default function AdminStudentsList() {
  const [searchStudentId, setSearchStudentId] = useState('');
  const [searchStudentName, setSearchStudentName] = useState('');
  const [searchBatchNo, setSearchBatchNo] = useState('');
  const [searchLocation, setSearchLocation] = useState('SelectLocation');
  const [page, setPage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState(null);

  const { studentsList, loading: studentsLoading, error: studentsError, fetchStudentsData } = useStudentsData();
  const { batches, fetchBatches } = useUniqueBatches();
  const { book_new, book_append_sheet, json_to_sheet } = utils;

  const locations = [
    { value: 'SelectLocation', label: 'Select Location', disabled: true },
    { value: 'vijayawada', label: 'Vijayawada' },
    { value: 'vijayawada', label: 'Vijayawada' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'bangalore', label: 'Bangalore' },
  ];

  // Decrypt userType and location from sessionStorage
  useEffect(() => {
    // Handle userType
    const encryptedUserType = sessionStorage.getItem('userType');
    if (encryptedUserType) {
      try {
        const decryptedUserType = decryptData(encryptedUserType);
        if (decryptedUserType === 'Python' || decryptedUserType === 'Java') {
          setUserType(decryptedUserType);
        } else {
          console.error('Invalid userType:', decryptedUserType);
          setError('Invalid user type. Please log in again.');
        }
      } catch (err) {
        console.error('Error decrypting userType:', err);
        setError('Failed to decrypt user type. Please log in again.');
      }
    } else {
      console.error('No userType found in sessionStorage');
      setError('No user type found. Please log in again.');
    }

    // Handle location
    const encryptedLocation = sessionStorage.getItem('location');
    if (encryptedLocation) {
      try {
        const decryptedLocation = decryptData(encryptedLocation);
        if (decryptedLocation === 'all') {
          setIsAdmin(true);
          setSearchLocation('vijayawada');
        } else if (['vijayawada', 'hyderabad', 'bangalore'].includes(decryptedLocation)) {
          setSearchLocation(decryptedLocation);
        } else {
          console.error('Invalid location:', decryptedLocation);
          setError('Invalid location. Please log in again.');
        }
      } catch (err) {
        console.error('Error decrypting location:', err);
        setError('Failed to decrypt location. Please log in again.');
      }
    } else {
      console.error('No location found in sessionStorage');
      setError('No location found. Please log in again.');
    }
  }, []);

  // Filter batches by userType
  const filteredBatches = userType
    ? batches.filter(batch => {
        if (!batch.Batch || typeof batch.Batch !== 'string') {
          console.warn(`Missing or invalid Batch for batch ID: ${batch._id}`);
          return false;
        }
        const prefix = userType === 'Python' ? 'PFS-' : 'JFS-';
        if (!batch.Batch.startsWith(prefix)) {
          console.warn(`Invalid batch prefix for ${userType}: ${batch.Batch} (ID: ${batch._id})`);
          return false;
        }
        return true;
      })
    : [];

  // Fetch students and batches on mount
  useEffect(() => {
    if (!error) {
      fetchStudentsData();
      const effectiveLocation = searchLocation !== 'SelectLocation' ? searchLocation : 'vijayawada';
      fetchBatches(isAdmin ? effectiveLocation : searchLocation);
    }
  }, [fetchStudentsData, fetchBatches, searchLocation, isAdmin, error]);

  const studentsPerPage = 5;

  const handleChange = (event, value) => {
    setPage(value);
  };

  const exportToExcel = () => {
    const wb = book_new();
    const studentsWithoutPassword = filteredStudents.map(({ password, ...rest }) => rest);
    const ws = json_to_sheet(studentsWithoutPassword);
    book_append_sheet(wb, ws, 'Students');
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `students-list_${userType || 'unknown'}_${searchLocation || 'vijayawada'}.xlsx`);
  };

  // Filtering logic
  const filteredStudents = (studentsList || []).filter(student => {
    const studentName = student?.name || '';
    const studentId = student?.studentId || '';
    const batchNo = student?.BatchNo || '';
    const studentLocation = student?.location || '';

    const effectiveLocation = isAdmin ? (searchLocation === 'SelectLocation' ? '' : searchLocation) : searchLocation;

    // Check BatchNo prefix based on userType
    const batchPrefix = userType === 'Python' ? 'PFS-' : userType === 'Java' ? 'JFS-' : '';
    if (userType && batchNo && !batchNo.startsWith(batchPrefix)) {
      console.warn(`Invalid BatchNo prefix for ${userType}: ${batchNo} (Student ID: ${studentId})`);
      return false;
    }

    return (
      (searchStudentId === '' || studentId.toLowerCase().includes(searchStudentId.toLowerCase())) &&
      (searchStudentName === '' || studentName.toLowerCase().includes(searchStudentName.toLowerCase())) &&
      (searchBatchNo === '' || batchNo.toLowerCase() === searchBatchNo.toLowerCase()) &&
      (effectiveLocation === '' || studentLocation.toLowerCase().includes(effectiveLocation.toLowerCase()))
    );
  });

  const indexOfLastStudent = page * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);

  return (
    <div className="bg-blue-100 flex flex-col mx-auto p-6 min-h-[89vh] mt-0">
      <h2 className="text-blue-800 text-2xl font-bold text-center mb-4">
        {userType
          ? `${userType === 'Python' ? 'Python Full Stack (PFS)' : 'Java Full Stack (JFS)'} Students List (${totalStudents})`
          : `Students List (${totalStudents})`}
      </h2>
      {error ? (
        <p className="text-center text-red-500 font-semibold">{error}</p>
      ) : (
        <>
          <div className="flex flex-col items-center space-y-4 mb-4">
            <button
              className="bg-pink-600 hover:bg-pink-500 text-white font-semibold px-4 py-2 rounded"
              onClick={exportToExcel}
              disabled={totalStudents === 0}
            >
              Download Excel
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-white shadow-md rounded-md">
            <input
              type="text"
              value={searchStudentId}
              onChange={(e) => setSearchStudentId(e.target.value)}
              placeholder="Filter by Student ID"
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
            />
            <input
              type="text"
              value={searchStudentName}
              onChange={(e) => setSearchStudentName(e.target.value)}
              placeholder="Filter by Student Name"
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
            />
            <select
              value={searchBatchNo}
              onChange={(e) => setSearchBatchNo(e.target.value)}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
              disabled={filteredBatches.length === 0}
            >
              <option value="">All Batches</option>
              {filteredBatches.map((batch) => (
                <option key={batch._id} value={batch.Batch}>
                  {batch.Batch}
                </option>
              ))}
            </select>
            <select
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
              disabled={!isAdmin}
            >
              {locations.map(({ value, label, disabled }) => (
                <option key={value} value={value} disabled={disabled}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {studentsLoading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : studentsError ? (
            <p className="text-center text-red-500">Error loading students. Please try again.</p>
          ) : totalStudents > 0 ? (
            <div className="overflow-x-auto w-full mb-4">
              <table className="w-full border-collapse">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="px-4 py-2">StudentId</th>
                    <th className="px-4 py-2">BatchNO</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Phone</th>
                    <th className="px-4 py-2">Location</th>
                    <th className="px-4 py-2">College Name</th>
                    <th className="px-4 py-2">Department</th>
                    <th className="px-4 py-2">Graduation Percentage</th>
                    <th className="px-4 py-2">Skills</th>
                    <th className="px-4 py-2">Year of Passing</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student) => (
                    <tr key={student.id} className="bg-white odd:bg-gray-100">
                      <td className="px-4 py-2 text-center">{student.studentId || '__'}</td>
                      <td className="px-4 py-2 text-center">{student.BatchNo || '__'}</td>
                      <td className="px-4 py-2 text-center">{student.name || '__'}</td>
                      <td className="px-4 py-2 text-center">{student.email || '__'}</td>
                      <td className="px-4 py-2 text-center">{student.studentPhNumber || '__'}</td>
                      <td className="px-4 py-2 text-center">{student.location || '__'}</td>
                      <td className="px-4 py-2 text-center">{student.collegeName || '__'}</td>
                      <td className="px-4 py-2 text-center">{student.department || '__'}</td>
                      <td className="px-4 py-2 text-center">
                        {student.highestGraduationpercentage ? `${student.highestGraduationpercentage}%` : '__'}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {student.studentSkills?.length > 0 ? student.studentSkills.join(', ') : 'No skills listed'}
                      </td>
                      <td className="px-4 py-2 text-center">{student.yearOfPassing || '__'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center mt-4">
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handleChange}
                    variant="outlined"
                    shape="rounded"
                  />
                </Stack>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600">
              No {userType === 'Python' ? 'PFS' : userType === 'Java' ? 'JFS' : ''} students found for{' '}
              {searchLocation !== 'SelectLocation' ? searchLocation : 'Vijayawada'}.
            </p>
          )}
        </>
      )}
    </div>
  );
}