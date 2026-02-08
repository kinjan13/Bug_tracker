// src/pages/About.js
import React from "react";

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Jaruat Care</h1>
      <p className="about-text">
        Welcome to Jaruat Care! We are dedicated to providing top-notch patient care and medical support.
        Our mission is to ensure every patient receives personalized attention and compassionate service.
      </p>

      <h2 className="about-subtitle">Our Vision</h2>
      <p className="about-text">
        To be the leading healthcare platform that bridges technology and patient care, ensuring accessibility and trust for everyone.
      </p>

      <h2 className="about-subtitle">Our Team</h2>
      <p className="about-text">
        Our team consists of skilled professionals committed to enhancing the healthcare experience.
      </p>

      <div className="about-image-section">
        <img
          src="/aboutus.png"
          alt="About Us"
          className="about-image"
        />
      </div>
    </div>
  );
};

export default About;
