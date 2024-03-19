"use strict";
const { Contract } = require("fabric-contract-api");
const {
  checkPatientRole,
  checkAsstDoctorRole,
  checkDoctorRole,
  checkReceptionistRole
} = require("./role-check.js");

const { v4: uuidv4 } = require("uuid");

class EHRContract extends Contract {
  async CreateDoctor(ctx, doctorId, data) {
    const validUser = await checkDoctorRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const doctorKey = `doctor_${doctorId}`;
    const exists = await this.UserExists(ctx, doctorKey);
    if (exists) {
      throw new Error(`The doctor with ID ${doctorId} already exists`);
    }
    const doctor = { type: "doctor", u_id: doctorId, ...JSON.parse(data) };
    await ctx.stub.putState(doctorKey, Buffer.from(JSON.stringify(doctor)));
  }

  async CreatePatient(ctx, patientId, data) {
    const validUser = await checkPatientRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const patientKey = `patient_${patientId}`;
    const exists = await this.UserExists(ctx, patientKey);
    if (exists) {
      throw new Error(`The patient with ID ${patientId} already exists`);
    }
    const patient = { type: "patient", u_id: patientId, ...JSON.parse(data) };
    await ctx.stub.putState(patientKey, Buffer.from(JSON.stringify(patient)));
  }

  async CreateAssistantDoctor(ctx, assistantDoctorId, data) {
    const validUser = await checkAsstDoctorRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const assistantDoctorKey = `assistantDoctor_${assistantDoctorId}`;
    const exists = await this.UserExists(ctx, assistantDoctorKey);
    if (exists) {
      throw new Error(
        `The assistantDoctor with ID ${assistantDoctorId} already exists`
      );
    }
    const assistantDoctor = {
      type: "assistantDoctor",
      u_id: assistantDoctorId,
      ...JSON.parse(data),
    };
    await ctx.stub.putState(
      assistantDoctorKey,
      Buffer.from(JSON.stringify(assistantDoctor))
    );
  }

  async GetMyProfileDoctor(ctx, doctorId) {
    const validUser = await checkDoctorRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const doctorKey = `doctor_${doctorId}`;
    const doctorData = await ctx.stub.getState(doctorKey);
    if (!doctorData || doctorData.length === 0) {
      throw new Error(`The doctor with ID ${doctorId} does not exist`);
    }
    return doctorData.toString();
  }

  async GetMyProfilePatient(ctx, patientId) {
    const validUser = await checkPatientRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const patientKey = `patient_${patientId}`;
    const patientData = await ctx.stub.getState(patientKey);
    if (!patientData || patientData.length === 0) {
      throw new Error(`The patient with ID ${patientId} does not exist`);
    }
    return patientData.toString();
  }

  async GetMyProfileAssistantDoctor(ctx, assistantDoctorId) {
    const validUser = await checkAsstDoctorRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const assistantDoctorKey = `assistantDoctor_${assistantDoctorId}`;
    const assistantDoctorData = await ctx.stub.getState(assistantDoctorKey);
    if (!assistantDoctorData || assistantDoctorData.length === 0) {
      throw new Error(`The doctor with ID ${assistantDoctorId} does not exist`);
    }
    return assistantDoctorData.toString();
  }

  async UpdateHospitalDetails(ctx, hospitalId, details) {
    const validUser = await checkHospitalAdminRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const hospitalKey = `hospital_${hospitalId}`;
    const exists = await this.UserExists(ctx, hospitalKey);
    if (!exists) {
      throw new Error(`The hospital with ID ${hospitalId} does not exist.`);
    }
    const hospitalDetails = JSON.parse(details);
    const hospital = { type: "hospital", ...hospitalDetails };
    await ctx.stub.putState(hospitalKey, Buffer.from(JSON.stringify(hospital)));
  }

  async UpdatePatientCareRecord(ctx, patientId, careRecord) {
    const validUser = await checkDoctorRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const patientKey = `patient_${patientId}`;
    const exists = await this.UserExists(ctx, patientKey);
    if (!exists) {
      throw new Error(`The patient with ID ${patientId} does not exist.`);
    }
    const patientData = await ctx.stub.getState(patientKey);
    const patient = JSON.parse(patientData.toString());
    if (!patient.careRecords) {
      patient.careRecords = [];
    }
    patient.careRecords.push(JSON.parse(careRecord));
    await ctx.stub.putState(patientKey, Buffer.from(JSON.stringify(patient)));
  }

  async LogMaintenanceActivity(ctx, activityDetails) {
    const details = JSON.parse(activityDetails);
    const activityId = `maintenanceActivity_${uuidv4()}`; // Generating structured key
    const activity = {
      ...details,
      type: "maintenanceActivity", // Adding type for easy identification
    };
    await ctx.stub.putState(activityId, Buffer.from(JSON.stringify(activity)));
    return JSON.stringify({
      success: true,
      message: "Maintenance activity logged successfully.",
      activityId: activityId,
    });
  }

  async LogLearningActivity(ctx, internId, activityDetails) {
    const internKey = `intern_${internId}`;
    const exists = await this.UserExists(ctx, internKey);
    if (!exists) {
      throw new Error(`The intern with ID ${internId} does not exist.`);
    }
    const internData = await ctx.stub.getState(internKey);
    const intern = JSON.parse(internData.toString());
    if (!intern.learningActivities) {
      intern.learningActivities = [];
    }
    intern.learningActivities.push({
      type: "learningActivity",
      ...JSON.parse(activityDetails),
    });
    await ctx.stub.putState(internKey, Buffer.from(JSON.stringify(intern)));
  }

  async LogTestResults(ctx, patientId, testResults) {
    const isMedicalTechnician = await checkMedicalTechnicianRole(ctx.stub);
    if (!isMedicalTechnician) {
      throw new Error("Access denied. Insufficient permissions.");
    }

    const patientKey = `patient_${patientId}`;
    const exists = await this.UserExists(ctx, patientKey);
    if (!exists) {
      throw new Error(`The patient with ID ${patientId} does not exist.`);
    }

    const patientData = await ctx.stub.getState(patientKey);
    const patient = JSON.parse(patientData.toString());

    if (!patient.testResults) {
      patient.testResults = [];
    }
    patient.testResults.push(JSON.parse(testResults));

    await ctx.stub.putState(patientKey, Buffer.from(JSON.stringify(patient)));

    return JSON.stringify({
      success: true,
      message: "Test results logged successfully",
    });
  }

  async UpdateMedicationDispensation(ctx, patientId, medicationDetails) {
    const validUser = await checkPharmacistRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }

    const patientKey = `patient_${patientId}`;
    const exists = await this.UserExists(ctx, patientKey);
    if (!exists) {
      throw new Error(`The patient with ID ${patientId} does not exist.`);
    }
    const patientData = await ctx.stub.getState(patientKey);
    const patient = JSON.parse(patientData.toString());
    if (!patient.medicationRecords) {
      patient.medicationRecords = [];
    }
    patient.medicationRecords.push({
      type: "medicationRecord",
      ...JSON.parse(medicationDetails),
    });
    await ctx.stub.putState(patientKey, Buffer.from(JSON.stringify(patient)));
  }

  async LogEmergencyResponse(ctx, incidentId, responseDetails) {
    const validUser = await checkSecurityPersonnelRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const incidentKey = `emergencyResponse_${incidentId}`;
    const response = {
      type: "emergencyResponse",
      details: JSON.parse(responseDetails),
      incidentId: incidentId,
    };
    await ctx.stub.putState(incidentKey, Buffer.from(JSON.stringify(response)));
  }

  async GetPatientStatus(ctx, patientId) {
    const validUser = await checkPatientMemberRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const patientKey = `patient_${patientId}`;
    const exists = await this.UserExists(ctx, patientKey);
    if (!exists) {
      throw new Error(`The patient with ID ${patientId} does not exist.`);
    }
    const patientData = await ctx.stub.getState(patientKey);
    const patient = JSON.parse(patientData.toString());
    const status = patient.status || "Status not set";
    return JSON.stringify({ patientId: patientId, status: status });
  }

  async LogSecurityIncident(ctx, incidentDetails) {
    const validUser = await checkSecurityPersonnelRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const incidentId = `securityIncident_${uuidv4()}`;
    const incident = {
      type: "securityIncident",
      ...JSON.parse(incidentDetails),
    };
    await ctx.stub.putState(incidentId, Buffer.from(JSON.stringify(incident)));
    return JSON.stringify({
      success: true,
      message: "Security incident logged successfully.",
      incidentId: incidentId,
    });
  }

  async ManageUserPermissions(ctx, userId, permissions) {
    const validUser = await checkHospitalAdminRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const userKey = `user_${userId}`;
    const exists = await this.UserExists(ctx, userKey);
    if (!exists) {
      throw new Error(`The user with ID ${userId} does not exist.`);
    }
    const userData = await ctx.stub.getState(userKey);
    const user = JSON.parse(userData.toString());
    user.permissions = JSON.parse(permissions); // Assuming permissions is a JSON string
    await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
  }

  async ScheduleDietaryConsultation(
    ctx,
    patientId,
    dietitianId,
    consultationDetails
  ) {
    const validUser = await checkDietitianRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const patientKey = `patient_${patientId}`;
    const dietitianKey = `dietitian_${dietitianId}`;
    const patientExists = await this.UserExists(ctx, patientKey);
    const dietitianExists = await this.UserExists(ctx, dietitianKey);

    if (!patientExists) {
      throw new Error(`The patient with ID ${patientId} does not exist.`);
    }
    if (!dietitianExists) {
      throw new Error(`The dietitian with ID ${dietitianId} does not exist.`);
    }

    const consultationId = `dietaryConsultation_${uuidv4()}`;
    const details = {
      type: "dietaryConsultation",
      patientId: patientId,
      dietitianId: dietitianId,
      ...JSON.parse(consultationDetails),
    };
    await ctx.stub.putState(
      consultationId,
      Buffer.from(JSON.stringify(details))
    );

    return JSON.stringify({
      success: true,
      message: "Dietary consultation scheduled successfully.",
      consultationId: consultationId,
    });
  }

  async UpdateITInfrastructure(ctx, updateDetails) {
    const validUser = await checkITStaffRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const updateId = `ITUpdate_${uuidv4()}`;
    const details = { type: "ITUpdate", ...JSON.parse(updateDetails) };
    await ctx.stub.putState(updateId, Buffer.from(JSON.stringify(details)));

    return JSON.stringify({
      success: true,
      message: "IT infrastructure update logged successfully.",
      updateId: updateId,
    });
  }

  async SubmitResearchFindings(ctx, researchId, findings) {
    const validUser = await checkResearchRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const researchKey = `research_${researchId}`;
    const exists = await this.UserExists(ctx, researchKey);
    if (!exists) {
      throw new Error(
        `The research record with ID ${researchId} does not exist.`
      );
    }
    const researchData = {
      type: "researchFindings",
      findings: JSON.parse(findings),
    };
    await ctx.stub.putState(
      researchKey,
      Buffer.from(JSON.stringify(researchData))
    );

    return JSON.stringify({
      success: true,
      message: "Research findings submitted successfully.",
      researchId: researchId,
    });
  }

  async CreateAppointment(ctx, patientId, doctorId, appointmentDetails) {
    const validUser = await checkReceptionistRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const patientKey = `patient_${patientId}`;
    const doctorKey = `doctor_${doctorId}`;
    const patientExists = await this.UserExists(ctx, patientKey);
    const doctorExists = await this.UserExists(ctx, doctorKey);

    if (!patientExists || !doctorExists) {
      throw new Error("Either the patient or the doctor does not exist.");
    }

    const appointmentId = `appointment_${uuidv4()}`;
    const details = JSON.parse(appointmentDetails);
    const appointment = {
      type: "appointment",
      appointmentId,
      patientId,
      doctorId,
      status: "pending",
      ...details,
    };
    await ctx.stub.putState(
      appointmentId,
      Buffer.from(JSON.stringify(appointment))
    );

    return JSON.stringify({
      success: true,
      message: "Appointment created successfully",
      appointmentId,
    });
  }

  async AcceptAppointment(ctx, appointmentId) {
    const validDoctor = await checkDoctorRole(ctx.stub);
    if (!validDoctor) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const appointmentKey = `appointment_${appointmentId}`;
    const exists = await this.AppointmentExists(ctx, appointmentKey);

    if (!exists) {
      throw new Error("Appointment does not exist.");
    }

    const appointmentData = await ctx.stub.getState(appointmentKey);
    const appointment = JSON.parse(appointmentData.toString());
    appointment.status = "accepted"; // Updating the status of the appointment

    await ctx.stub.putState(
      appointmentKey,
      Buffer.from(JSON.stringify(appointment))
    );

    return JSON.stringify({
      success: true,
      message: "Appointment accepted successfully",
      appointmentId,
    });
  }

  async FindAppointmentByUserId(ctx, userId) {
    let queryString = {};
    queryString.selector = {
      $or: [{ doctorId: userId }, { patientId: userId }],
      type: "appointment",
    };

    const queryResults = await this.QueryWithQueryString(
      ctx,
      JSON.stringify(queryString)
    );
    return queryResults; // Return all appointments associated with the userId
  }

  async GetAppointmentData(ctx, userId) {
    let userRole;
    const isDoctor = await checkDoctorRole(ctx.stub);
    const isPatient = await checkPatientRole(ctx.stub);
    const isPharmacist = await checkPharmacistRole(ctx.stub);
    const isMedicalTechnician = await checkReceptionistRole(ctx.stub);

    if (isDoctor) {
      userRole = "doctor";
    } else if (isPatient) {
      userRole = "patient";
    } else if (isPharmacist) {
      userRole = "pharmacist";
    } else if (isMedicalTechnician) {
      userRole = "MedicalTechnician";
    } else {
      throw new Error("Access denied. Insufficient permissions.");
    }

    const appointments = await this.FindAppointmentByUserId(ctx, userId);
    if (!appointments || appointments.length === 0) {
      throw new Error("No appointments found for the user!");
    }

    const appointmentId = appointments[0]; // Taking the first appointment
    const appointmentKey = `appointment_${appointmentId}`;
    const exists = await this.UserExists(ctx, appointmentKey);
    if (!exists) {
      throw new Error(
        `The appointment with ID ${appointmentId} does not exist.`
      );
    }

    const appointmentData = await ctx.stub.getState(appointmentKey);
    const appointment = JSON.parse(appointmentData.toString());

    if (
      (userRole === "doctor" && appointment.doctorId !== userId) ||
      (userRole === "patient" &&
        appointment.patientId !== userId &&
        userRole !== "pharmacist" &&
        userRole !== "MedicalTechnician")
    ) {
      throw new Error(
        "Access denied. User does not have rights to this appointment."
      );
    }

    if (userRole != "doctor" && appointment.status === "pending") {
      return JSON.stringify({
        success: false,
        message: "Appointment not confirmed yet.",
      });
    } 
    else {
      return JSON.stringify({
        success: true,
        message: "Appointment data retrieved successfully",
        appointmentData: appointment,
      });
    }
  }

  async GetAppointmentDataForReceptionist(ctx, appointmentId) {
    const isReceptionist = await checkReceptionistRole(ctx.stub);
    if (!isReceptionist) {
      throw new Error(
        "Access denied. Only receptionists can access this function."
      );
    }

    const appointmentKey = `appointment_${appointmentId}`;
    const exists = await this.AppointmentExists(ctx, appointmentKey);
    if (!exists) {
      throw new Error(
        `The appointment with ID ${appointmentId} does not exist.`
      );
    }

    const appointmentData = await ctx.stub.getState(appointmentKey);
    const appointment = JSON.parse(appointmentData.toString());

    return JSON.stringify({
      success: true,
      message: "Appointment data retrieved successfully",
      appointmentData: appointment,
    });
  }

  async SendEHRToAppointment(ctx, appointmentId, ehrId) {
    const validPatient = await checkPatientRole(ctx.stub);
    if (!validPatient) {
      throw new Error("Access denied. Insufficient permissions.");
    }

    const appointmentKey = `appointment_${appointmentId}`;
    const ehrKey = `ehr_${ehrId}`;

    const appointmentExists = await this.UserExists(ctx, appointmentKey);
    const ehrExists = await this.UserExists(ctx, ehrKey);

    if (!appointmentExists || !ehrExists) {
      throw new Error("Either the appointment or EHR does not exist.");
    }

    const appointmentData = await ctx.stub.getState(appointmentKey);
    const appointment = JSON.parse(appointmentData.toString());
    appointment.ehrId = ehrId; // Link the EHR to the appointment

    await ctx.stub.putState(
      appointmentKey,
      Buffer.from(JSON.stringify(appointment))
    );

    return JSON.stringify({
      success: true,
      message: "EHR linked to appointment successfully",
      appointmentId,
      ehrId,
    });
  }
  async GetEHRForDoctor(ctx, appointmentId) {
    const validDoctor = await checkDoctorRole(ctx.stub);
    if (!validDoctor) {
      throw new Error("Access denied. Insufficient permissions.");
    }

    const appointmentKey = `appointment_${appointmentId}`;
    const appointmentExists = await this.UserExists(ctx, appointmentKey);

    if (!appointmentExists) {
      throw new Error("Appointment does not exist.");
    }

    const appointmentData = await ctx.stub.getState(appointmentKey);
    const appointment = JSON.parse(appointmentData.toString());

    if (!appointment.ehrId) {
      throw new Error("No EHR linked to this appointment.");
    }

    const ehrData = await ctx.stub.getState(`ehr_${appointment.ehrId}`);
    return ehrData.toString();
  }
  async GetEHRForPatient(ctx, patientId) {
    const validUser = await checkPatientRole(ctx.stub);
    if (!validUser) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const patientKey = `patient_${patientId}`;
    const exists = await this.UserExists(ctx, patientKey);
    if (!exists) {
      throw new Error(`The patient with ID ${patientId} does not exist.`);
    }
    const ehrData = await ctx.stub.getState(patientKey);
    const patient = JSON.parse(ehrData.toString());
    // Assuming EHR data is directly stored in the patient document
    if (!patient.ehr) {
      throw new Error("EHR data not found for this patient.");
    }
    return JSON.stringify(patient.ehr);
  }
  async CreateConsultationAppointment(ctx, patientId, consultantId, details) {
    const patientKey = `patient_${patientId}`;
    const consultantKey = `consultant_${consultantId}`;
    const patientExists = await this.UserExists(ctx, patientKey);
    const consultantExists = await this.UserExists(ctx, consultantKey);

    if (!patientExists || !consultantExists) {
      throw new Error(`Either the patient or the consultant does not exist.`);
    }

    const consultationId = `consultation_${uuidv4()}`;
    const consultationDetails = {
      type: "consultation",
      details: JSON.parse(details),
      patientId,
      consultantId,
      status: "scheduled",
    };

    await ctx.stub.putState(
      consultationId,
      Buffer.from(JSON.stringify(consultationDetails))
    );

    return JSON.stringify({
      success: true,
      message: "Consultation appointment created successfully.",
      consultationId,
    });
  }
  async UserExists(ctx, key) {
    const record = await ctx.stub.getState(key);
    return !!record && record.length > 0;
  }

  async AppointmentExists(ctx, appointmentId) {
    const appointmentKey = `appointment_${appointmentId}`;
    const record = await ctx.stub.getState(appointmentKey);
    return !!record && record.length > 0;
  }
}

module.exports = EHRContract;
