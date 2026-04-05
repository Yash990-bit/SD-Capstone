const Appointment = require('../models/Appointment');

const createAppointment = async (data) => {
  const appointment = new Appointment(data);
  return await appointment.save();
};

const getPatientAppointments = async (patientId) => {
  return await Appointment.find({ patientId }).populate('doctorId', 'name email').sort({ date: -1 });
};

const getDoctorAppointments = async (doctorId) => {
  return await Appointment.find({ doctorId }).populate('patientId', 'name email').sort({ date: -1 });
};

const updateAppointmentStatus = async (appointmentId, status, notes = '') => {
  const updateData = { status };
  if (notes) {
    updateData.notes = notes;
  }
  return await Appointment.findByIdAndUpdate(
    appointmentId,
    updateData,
    { new: true }
  ).populate('patientId doctorId', 'name email');
};

const cancelAppointment = async (appointmentId, patientId) => {
  return await Appointment.findOneAndUpdate(
    { _id: appointmentId, patientId },
    { status: 'Cancelled' },
    { new: true }
  );
};

module.exports = {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
};
