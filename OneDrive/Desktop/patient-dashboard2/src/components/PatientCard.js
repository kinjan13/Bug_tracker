import React, { useState } from "react";
import PatientModal from "./PatientModal";

function PatientCard({ patient }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="patient-card">
      <h3>{patient.name}</h3>
      <p>Age: {patient.age}</p>
      <p>Contact: {patient.contact}</p>
      <button onClick={() => setOpen(true)}>View Details</button>
      {open && <PatientModal patient={patient} onClose={() => setOpen(false)} />}
    </div>
  );
}

export default PatientCard;
