import React from 'react';

const KitsCollaboration = () => {
  return (
    <div className=" mx-auto font-[Afacad] bg-[#f3f4f6]">
       <h2 className=" text-[25px] lg:text-[50px] text-center text-[#020031] font-semibold text mb-3 ">Our Collaboration</h2>
       <div className="flex flex-col gap-7 md:flex-row  items-center justify-center">

        {/* Logo Section */}
        <div className="mb-6 md:mb-0">
          <img
           src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1745658094/logo_s2toqb.png"
            alt="KITS AKSHAR Logo"
            className=" w-[250px]  md:w-[790px]   lg:w-[1550px]  object-contain"
          />
        </div>

        {/* Content Section */}
        <div className="text-center md:text-left">
         
          <p className="mb-2 font-[Afacad] text-[#000000] font-medium text:[12px] lg:text-[25px] ">
            KITS AKSHAR (Institute of Technology) (Formerly Guntur Engineering College) was established in the year 2008 in Yanamadala Village, Prathipadu Mandal of Guntur district, Andhra Pradesh. KITS AKSHAR is located away from the hustle and bustle of the city life in a scenic and serene environment spread over an expansive 10.77 acres amidst the lush greenery cotton fields. KITS AKSHAR is a unique professional college in the state of Andhra Pradesh. KITS AKSHAR is affiliated to Jawaharlal Nehru Technological University Kakinada (JNTUK) and approved by AICTE.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KitsCollaboration;
