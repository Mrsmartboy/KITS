import React, { useEffect, useRef } from 'react';

// import GEC from '../images/GEC.webp';
// import KBN from '../images/KBN.webp';
// import KIT from '../images/KIT.webp';
// import LBC from '../images/LBC.webp';
// import NEC from '../images/NEC.webp';
// import SECV from '../images/SECV.webp';
// import VIJAYAWADA from '../images/VIJAYAWADA.webp';
// import LOYOLA from '../images/LOYOLA.webp';

import './Collaboration.css';

const Collaboration = () => {
  const carouselRef = useRef(null);

  const collaborationList = [
    { id: 1, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849442/GEC_criduj.webp", alt: 'GEC' },
    { id: 2, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849444/KBN_pu820v.webp", alt: 'KBN' },
    { id: 3, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849444/KIT_xvsxok.webp", alt: 'KIT' },
    { id: 4, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849444/LBC_hsj1ti.webp", alt: 'LBC' },
    { id: 5, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849453/NEC_apltpw.webp", alt: 'NEC' },
    { id: 6, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849456/SECV_cmabmn.webp", alt: 'SEC' },
    { id: 7, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849464/VIJAYAWADA_wgk6wt.webp", alt: 'Vijayawada' },
      { id: 8, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849448/LOYOLA_hyadey.webp", alt: 'LOYOLA' },
      { id: 9, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849442/GEC_criduj.webp", alt: 'GEC' },
    { id: 10, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849444/KBN_pu820v.webp", alt: 'KBN' },
    { id: 11, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849444/KIT_xvsxok.webp", alt: 'KIT' },
    { id: 12, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849444/LBC_hsj1ti.webp", alt: 'LBC' },
    { id: 13, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849453/NEC_apltpw.webp", alt: 'NEC' },
    { id: 14, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849456/SECV_cmabmn.webp", alt: 'SEC' },
    { id: 15, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849464/VIJAYAWADA_wgk6wt.webp", alt: 'Vijayawada' },
      { id: 16, image: "https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849448/LOYOLA_hyadey.webp", alt: 'LOYOLA' },

  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({
          left: -150, 
          behavior: 'smooth',
        });

        if (carouselRef.current.scrollLeft <= 0) {
          carouselRef.current.scrollTo({
            left: carouselRef.current.scrollWidth, 
            behavior: 'smooth',
          });
        }
      }
    }, 3000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="collaboration-container">
      <h1 className="collaboration-title">Our Collaboration</h1>
      <div className="collaboration-carousel" ref={carouselRef}>
        {collaborationList.map((eachItem) => (
          <div key={eachItem.id} className="collaboration-item">
            <img src={eachItem.image} alt={eachItem.alt} className="collaboration-image" width="300" 
             height="200"/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collaboration;
