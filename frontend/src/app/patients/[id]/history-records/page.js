'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Activity, User, Phone, Mail, Calendar, 
  FileText, Clock, CheckCircle, AlertCircle, Syringe 
} from 'lucide-react';
import Link from 'next/link';

export default function PatientHistoryRecords() {
  const { user, token, API_BASE_URL } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/patients/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setPatient(data);
        } else {
          setError(data.error || 'Failed to fetch patient records');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && token && params.id) {
      fetchPatientData();
    }
  }, [user, token, params.id, API_BASE_URL]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8">
        
        {/* Navigation & Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          
          <div className="glass p-8 rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden bg-gradient-to-br from-teal-500/10 via-transparent to-transparent">
            {/* Ambient Background Gradient */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            <div className="flex items-start gap-4">
              <div className="p-4 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl shadow-inner">
                <Activity className="h-8 w-8" />
              </div>
              <div className="relative z-10">
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Clinical History Report
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Comprehensive patient diagnostic records and appointment chronology.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="pulse-loader mb-4">
              <div></div><div></div>
            </div>
            <p className="text-sm font-bold text-slate-400 animate-pulse">Retrieving secure medical records...</p>
          </div>
        )}

        {error && (
          <div className="p-5 mb-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <div className="font-semibold text-sm">
              <span className="block font-bold mb-1">Access Denied</span>
              {error}
            </div>
          </div>
        )}

        {/* Patient Profile Content */}
        {!loading && !error && patient && (
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Left Column: Patient Bio & History */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* Profile Card */}
              <div className="glass p-6 rounded-3xl shadow-md border border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <User className="h-4 w-4" /> Patient Bio
                </h3>
                
                <div className="text-center mb-6">
                  <div className="h-20 w-20 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center text-3xl font-black text-white shadow-inner mb-3">
                    {patient.name.charAt(0)}
                  </div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{patient.name}</h2>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-500 uppercase tracking-widest mt-1">
                    {patient.age} yrs • {patient.gender}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {patient.phoneNumber}
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {patient.email}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Registered: {new Date(patient.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Medical History Card */}
              <div className="glass p-6 rounded-3xl shadow-md border border-slate-200/50 dark:border-slate-800/50 hover:-translate-y-1 transition-transform duration-300">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Anamnesis Notes
                </h3>
                <div className="p-4 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    {patient.medicalHistory || 'No pre-existing conditions or medical history documented for this patient.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Appointment Timeline */}
            <div className="lg:col-span-2">
              <div className="glass p-6 sm:p-8 rounded-3xl shadow-md border border-slate-200/50 dark:border-slate-800/50 h-full">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Appointment Chronology
                </h3>

                {(!patient.appointments || patient.appointments.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-slate-500/10 rounded-full mb-4">
                      <Syringe className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">No appointments found.</p>
                    <p className="text-xs text-slate-400 mt-1">This patient has not scheduled any visits yet.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-8 pb-4">
                    {patient.appointments.map((app, index) => (
                      <div key={app.id} className="relative pl-8 group">
                        
                        {/* Timeline Node */}
                        <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 bg-white dark:bg-slate-950 transition-colors duration-300 ${
                          app.status === 'COMPLETED' ? 'border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]' :
                          app.status === 'PENDING' ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                          'border-rose-500'
                        }`}></div>

                        {/* Appointment Card */}
                        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm group-hover:shadow-md group-hover:border-teal-500/30 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {new Date(app.appointmentDate).toLocaleDateString(undefined, {
                                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                              })}
                              <span className="text-slate-400 font-medium ml-2">
                                at {new Date(app.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </span>
                            
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xxs font-extrabold uppercase tracking-wider w-fit ${
                              app.status === 'COMPLETED' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' :
                              app.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500' :
                              'bg-rose-500/10 text-rose-600 dark:text-rose-500'
                            }`}>
                              {app.status === 'COMPLETED' && <CheckCircle className="h-3 w-3" />}
                              {app.status}
                            </span>
                          </div>
                          
                          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Reason:</span> {app.reason || 'Routine checkup / No specific reason provided'}
                          </div>
                          <div className="text-xs text-slate-400 mt-2 font-semibold">
                            ID: {app.id.substring(0, 8)}...
                          </div>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}
