import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import './BDEStudentsAppliedJobsList.css';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const departments = [
    'CSE',
    'CIS',
    'IT',
    'ECE',
    'EEE',
    'CIVIL',
    'MECH',
    'AIML',
    'AIDS',
    'CSD',
    'MBA',
    'MTECH CSE',
    'IoT',
    'BBA',
    'BCA',
    'BSC',
    'MCA',
    'MSC',
    'Others'
  ];
  

function getStyles(department, selectedDepartments, theme) {
  return {
    fontWeight:
      selectedDepartments.indexOf(department) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultipleSelect({ selectedDepartments, handleChange }) {
  const theme = useTheme();

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-department-label">
            <span style={{fontWeight:"bold !important"}}>Departments</span>
        </InputLabel>
        <Select
          labelId="demo-multiple-department-label"
          id="demo-multiple-department"
          multiple
          value={selectedDepartments}
          onChange={handleChange}
          input={<OutlinedInput label="Departments" />}
          MenuProps={MenuProps}
        >
          {departments.map((department) => (
            <MenuItem 
            className='menu-item'
              key={department}
              value={department}
              style={getStyles(department, selectedDepartments, theme)}
            >
              {department}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
