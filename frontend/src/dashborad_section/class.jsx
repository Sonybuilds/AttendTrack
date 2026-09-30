import {
  Autocomplete,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BiBookAdd } from 'react-icons/bi';

import { classes_name, departments } from '../data/class_from';
import ClassCard from '../components/class_card';
import ClassForm from '../forms/class_form';
import api from '../api/axios';

export default function Class() {
  const [addAction, setAddAction] = useState(false);
  const [classes, setClasses] = useState([]);
  const [editClass, setEditClass] = useState(null);

  // ================= SEARCH STATES =================

  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // ================= MESSAGE =================

  const [message, setMessage] = useState('');

  // ================= GET CLASSES =================

  const getClasses = useCallback(async () => {
    try {
      const response = await api.get('/teacher/classes');

      setClasses(response.data.classes || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  }, []);

  // ================= INITIAL LOAD =================

  useEffect(() => {
    getClasses();
  }, [getClasses]);

  // ================= ADD CLASS =================

  const handleClassAdded = async () => {
    setAddAction(false);
    await getClasses();
  };

  // ================= DELETE CLASS =================

  const handleDeleteClass = async (id) => {
    try {
      const response = await api.delete(`/teacher/classes/${id}`);

      setMessage(response.data.message);

      await getClasses();

      setTimeout(() => {
        setMessage('');
      }, 1500);

    } catch (error) {
      console.error('Failed to delete class:', error);

      setMessage(
        error.response?.data?.message || 'Failed to delete class'
      );

      setTimeout(() => {
        setMessage('');
      }, 2000);
    }
  };

  // ================= FILTER CLASSES =================

  const filteredClasses = useMemo(() => {
    return classes.filter((classData) => {

      // Subject / Subject Code Search
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        classData.subject?.toLowerCase().includes(searchText) ||
        classData.subjectCode?.toLowerCase().includes(searchText);

      // Class Filter
      const matchesClass =
        !selectedClass ||
        classData.className === selectedClass;

      // Department Filter
      const matchesDepartment =
        !selectedDepartment ||
        classData.department === selectedDepartment;

      return (
        matchesSearch &&
        matchesClass &&
        matchesDepartment
      );
    });
  }, [
    classes,
    search,
    selectedClass,
    selectedDepartment,
  ]);

  return (
    <>
      {/* ================= SNACKBAR ================= */}

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={2000}
        onClose={() => setMessage('')}
        className="!absolute !bottom-0 !left-0 !h-full !w-full"
      >
        <Alert
          icon={
            <CircularProgress
              color="inherit"
              size={20}
            />
          }
          variant="filled"
          className="
            absolute bottom-8 left-[50%]
            !min-h-0
            -translate-x-1/2
            !px-3
          "
        >
          {message}
        </Alert>
      </Snackbar>

      {/* ================= CLASS FORM ================= */}

      <ClassForm
        open={addAction}
        onClose={() => setAddAction(false)}
        onSuccess={handleClassAdded}
      />

      {/* ================= PAGE ================= */}

      <div className="bg-[#fbfbcc07] px-6 py-5">

        {/* HEADER */}

        <div className="flex items-center justify-between pr-8">

          <div className="text-lg font-bold">
            Class Management
          </div>

          <Button
            onClick={() => setAddAction(true)}
            color="success"
            className="
              !m-0 !h-9 !min-h-0 !w-9 !min-w-0
              !rounded-lg !bg-green-100/80 !p-0
              hover:!bg-green-200
            "
          >
            <BiBookAdd className="text-xl" />
          </Button>

        </div>

        {/* ================= SEARCH FILTER ================= */}

        <div className="mt-12 pl-5 pr-8">

          <div className="flex w-full items-center gap-3">

            {/* SUBJECT SEARCH */}

            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Subject Code & Name"
              variant="standard"
              className="w-full"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  color: '#111827',
                  paddingLeft: '5px !important',

                  '&::placeholder': {
                    color: '#6b7280',
                    opacity: 1,
                  },
                },
              }}
            />

            {/* CLASS */}

            <Autocomplete
              value={selectedClass}
              onChange={(event, newValue) => {
                setSelectedClass(newValue);
              }}
              options={classes_name}
              autoHighlight
              clearOnBlur={false}
              openOnFocus
              sx={{
                width: 280,
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search class..."
                  variant="standard"
                />
              )}
            />

            {/* DEPARTMENT */}

            <Autocomplete
              value={selectedDepartment}
              onChange={(event, newValue) => {
                setSelectedDepartment(newValue);
              }}
              options={departments}
              autoHighlight
              clearOnBlur={false}
              openOnFocus
              sx={{
                width: 280,
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search department..."
                  variant="standard"
                />
              )}
            />

          </div>
        </div>

        {/* ================= RESULT COUNT ================= */}

        <div className="mt-6 px-5">

          <p className="text-xs font-medium text-gray-500">
            Showing{' '}
            <span className="font-bold text-gray-800">
              {filteredClasses.length}
            </span>{' '}
            of{' '}
            <span className="font-bold text-gray-800">
              {classes.length}
            </span>{' '}
            classes
          </p>

        </div>

        {/* ================= CARDS ================= */}

        <div
          className="
            mt-8 mb-10 grid grid-cols-1
            gap-8 px-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {filteredClasses.length > 0 ? (

            filteredClasses.map((classData) => (
              <ClassCard
                key={classData._id}
                classData={classData}
                onDelete={handleDeleteClass}
              />
            ))

          ) : (

            <div className="col-span-full py-20 text-center">

              <p className="text-lg font-semibold text-gray-500">
                No classes found
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Try changing your search or filters.
              </p>

            </div>

          )}

        </div>

      </div>
    </>
  );
}
