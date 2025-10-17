// src/components/PatientModal.js
import React from "react";
import "../App.css";

const PatientModal = ({ patient, onClose }) => {
  if (!patient) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{patient.name}</h2>

        <div className="modal-details">
          <p><strong>ID:</strong> {patient.id}</p>
          <p><strong>Age:</strong> {patient.age}</p>
          <p><strong>Contact:</strong> {patient.contact}</p>
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PatientModal;
