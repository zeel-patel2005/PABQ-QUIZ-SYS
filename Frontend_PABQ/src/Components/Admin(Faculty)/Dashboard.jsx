import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardCard from './DashboardCard';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [studentData, setStudentData] = useState([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [numberOfStudents, setNumberOfStudents] = useState(1);
  const [error, setError] = useState('');
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    duration: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/auth/admin/noofstudents');
      setTotalStudents(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prevData) => {
      const updatedData = [...prevData];
      updatedData[currentStudentIndex] = {
        ...updatedData[currentStudentIndex],
        [name]: value,
      };
      return updatedData;
    });
  };

  const handleNumberChange = (e) => {
    const newNumber = Number(e.target.value);
    setNumberOfStudents(newNumber);
    setStudentData((prevData) =>
      Array.from({ length: newNumber }, (_, index) => prevData[index] || {
        name: '',
        email: '',
        rollNumber: '',
        studentID: '',
        sem: '',
      })
    );
  };

  const handleNext = async () => {
    const currentData = studentData[currentStudentIndex];
    const emailRegex = /^[a-zA-Z0-9._%+-]+@ddu.ac\.in$/;

    if (!currentData.name || !currentData.rollNumber || !emailRegex.test(currentData.email)) {
      setError('Please fill all fields correctly before proceeding.');
      return;
    }

    setError('');
    if (currentStudentIndex < numberOfStudents - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1);
    } else {
      try {
        await axios.post('http://localhost:8080/auth/admin/addstudentdata', studentData);
        setIsStudentModalOpen(false);
      } catch (err) {
        console.error('Error adding students:', err);
        setError('Error adding students. Please try again.');
      }
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/auth/admin/createquiz', quizForm);
      setIsQuizModalOpen(false);
      setQuizForm({ title: '', description: '', duration: '' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  return (
    <div className="container mx-auto p-20">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard title="Total Students :" value={totalStudents} description="View the total number of students currently registered in the system."/>
        <DashboardCard title="Add Student :" handleOpenModal={() => setIsStudentModalOpen(true)} description="Register new students to the system with their details."/>
        <DashboardCard title="Create Quiz :" handleOpenModal={() => setIsQuizModalOpen(true)} description="Set up a new quiz with title, description, and duration." />
      </div>

      {isStudentModalOpen && (
        <Modal title="Add Students" handleCloseModal={() => setIsStudentModalOpen(false)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Students</label>
            <select
              value={numberOfStudents}
              onChange={handleNumberChange}
              className="w-full border rounded-lg p-2"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <form>
            <Input
              label="Name"
              name="name"
              value={studentData[currentStudentIndex]?.name || ''}
              onChange={handleStudentChange}
            />
            <Input
              label="Student ID"
              name="studentID"
              value={studentData[currentStudentIndex]?.studentID || ''}
              onChange={handleStudentChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={studentData[currentStudentIndex]?.email || ''}
              onChange={handleStudentChange}
            />
            <Input
              label="Roll Number"
              name="rollNumber"
              value={studentData[currentStudentIndex]?.rollNumber || ''}
              onChange={handleStudentChange}
            />
            <Input
              label="Semester"
              name="sem"
              value={studentData[currentStudentIndex]?.sem || ''}
              onChange={handleStudentChange}
            />

            <div className="flex justify-end space-x-4">
              <Button onClick={() => setIsStudentModalOpen(false)}>Cancel</Button>
              <Button onClick={handleNext}>
                {currentStudentIndex < numberOfStudents - 1 ? 'Next' : 'Finish'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isQuizModalOpen && (
        <Modal title="Create Quiz" handleCloseModal={() => setIsQuizModalOpen(false)}>
          <form onSubmit={handleQuizSubmit}>
            <Input
              label="Quiz Title"
              name="title"
              value={quizForm.title}
              onChange={(e) => setQuizForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
            />
            <Input
              label="Description"
              name="description"
              value={quizForm.description}
              onChange={(e) => setQuizForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
            />
            <Input
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={quizForm.duration}
              onChange={(e) => setQuizForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
            />
            <Button type="submit">Create Quiz</Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;