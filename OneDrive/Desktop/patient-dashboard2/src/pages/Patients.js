// src/pages/Patients.js
import React, { useState, useEffect } from "react";
import PatientModal from "../components/PatientModal";
import "../App.css";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    contact: ""
  });

  useEffect(() => {
    fetch("/data/mockPatients.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch patients");
        return res.json();
      })
      .then((data) => {
        setPatients(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new patient to local state
  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age || !newPatient.contact) return;

    const newId = patients.length ? patients[patients.length - 1].id + 1 : 1;
    const patientToAdd = { id: newId, ...newPatient, age: Number(newPatient.age) };
    setPatients([...patients, patientToAdd]);

    // Reset form
    setNewPatient({ name: "", age: "", contact: "" });
  };

  return (
    <div className="patient-list-container">
      <h2>Patient List</h2>

      {/* Add New Patient Form */}
      <form onSubmit={handleAddPatient} className="add-patient-form">
        <input
          type="text"
          placeholder="Name"
          value={newPatient.name}
          onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Age"
          value={newPatient.age}
          onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
        />
        <input
          type="text"
          placeholder="Contact"
          value={newPatient.contact}
          onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
        />
        <button type="submit">Add Patient</button>
      </form>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* Loading & Error */}
      {loading && <p style={{ textAlign: "center" }}>Loading patients...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {/* Patient Grid */}
      {!loading && !error && (
        <div className="patient-grid">
          {filteredPatients.length === 0 ? (
            <p style={{ textAlign: "center" }}>No patients found.</p>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="patient-card">
                <h3>{patient.name}</h3>
                <p>Age: {patient.age}</p>
                <p>Contact: {patient.contact}</p>
                <button onClick={() => setSelectedPatient(patient)}>View Details</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};

export default Patients;
