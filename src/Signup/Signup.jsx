import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [activeLink, setActiveLink] = useState('student');
 

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  return (
    <div className='signup'>
      <div className="signup-link-button">
        <Link
          className={`link ${activeLink === 'student' ? 'active' : ''}`}
          to="student"
          onClick={() => handleLinkClick('student')}
        >
          Student Signup
        </Link>
          {/* commenting the signup for company in here need to update in navigation also with /signup only for both*/}
        {/* <Link
          className={`link ${activeLink === 'company' ? 'active' : ''}`}
          to="company"
          onClick={() => handleLinkClick('company')}
        >
          Company Signup
        </Link> */}
      </div>
      <Outlet />
      {/* <div className='signup-quote'> 
        Embark on your journey towards your dream career starts now.<br/> Your path to success begins here.
      </div> */}
    </div>
  );
};

export default Signup;

// import React from 'react';
// import { Link,Outlet } from 'react-router-dom';
// import './Signup.css'

// const Signup = () => {
//   return (
//     <div className='signup'>
//       <div className="signup-link-button">
//         <Link className='link' to="student">Student Signup</Link>
//         <Link className='link' to="company">Company Signup</Link>
//       </div>
//       <Outlet />
     
//     </div>
//   );
// };

// export default Signup;
