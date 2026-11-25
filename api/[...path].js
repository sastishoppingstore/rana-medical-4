/* Single Vercel function that dispatches to the original agon API handlers.
 * Hobby plan limits a deployment to 12 serverless functions, so the
 * per-resource handlers live in server/handlers and are routed here. */
import admissions from '../server/handlers/admissions.js';
import appointments from '../server/handlers/appointments.js';
import beds from '../server/handlers/beds.js';
import blog from '../server/handlers/blog.js';
import departments from '../server/handlers/departments.js';
import doctors from '../server/handlers/doctors.js';
import employees from '../server/handlers/employees.js';
import expenses from '../server/handlers/expenses.js';
import faqs from '../server/handlers/faqs.js';
import inquiries from '../server/handlers/inquiries.js';
import invoices from '../server/handlers/invoices.js';
import labReports from '../server/handlers/lab-reports.js';
import labResults from '../server/handlers/lab-results.js';
import labSamples from '../server/handlers/lab-samples.js';
import labTests from '../server/handlers/lab-tests.js';
import medicines from '../server/handlers/medicines.js';
import opdTokens from '../server/handlers/opd-tokens.js';
import packages from '../server/handlers/packages.js';
import patients from '../server/handlers/patients.js';
import pharmacySales from '../server/handlers/pharmacy-sales.js';
import prescriptionItems from '../server/handlers/prescription-items.js';
import prescriptions from '../server/handlers/prescriptions.js';
import services from '../server/handlers/services.js';
import stats from '../server/handlers/stats.js';
import testimonials from '../server/handlers/testimonials.js';
import vitals from '../server/handlers/vitals.js';
import wards from '../server/handlers/wards.js';

const routes = {
  admissions, appointments, beds, blog, departments, doctors, employees, expenses,
  faqs, inquiries, invoices, 'lab-reports': labReports, 'lab-results': labResults,
  'lab-samples': labSamples, 'lab-tests': labTests, medicines, 'opd-tokens': opdTokens,
  packages, patients, 'pharmacy-sales': pharmacySales, 'prescription-items': prescriptionItems,
  prescriptions, services, stats, testimonials, vitals, wards,
};

function resolveName(req) {
  const segments = req.query?.path;
  if (Array.isArray(segments) && segments.length) return String(segments[0]);
  if (typeof segments === "string" && segments) return segments.split("/")[0];
  const raw = String(req.url || "");
  const path = raw.split("?")[0];
  const parts = path.split("/").filter(Boolean);
  const apiIndex = parts.indexOf("api");
  if (apiIndex >= 0 && parts[apiIndex + 1]) return parts[apiIndex + 1];
  return "";
}

export default async function handler(req, res) {
  const name = resolveName(req);
  const route = routes[name];
  if (!route) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(404).json({ error: 'API route not found', debug: { name, url: req.url, query: req.query } });
  }
  return route(req, res);
}
