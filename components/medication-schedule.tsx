import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Medication {
  id?: string;
  user_id?: string;
  name: string;
  dosage?: string;
  schedule?: string;
  start_date?: string;
  end_date?: string;
  meal: string;
  notes?: string;
  times: string[];
}

interface Props {
  medications: Medication[];
  onMedicationsChange: (meds: Medication[]) => void;
}

export default function MedicationSchedule({ medications, onMedicationsChange }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Medication>({
    name: "",
    dosage: "",
    times: [""],
    meal: "before",
    notes: "",
    start_date: "",
    end_date: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  useEffect(() => {
    if (Notification.permission !== notificationPermission) {
      setNotificationPermission(Notification.permission);
    }
  }, [notificationPermission]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("User not found");
      return;
    }

    const medicationData = {
      user_id: user.id,
      name: form.name,
      dosage: form.dosage,
      times: form.times,
      meal: form.meal,
      notes: form.notes,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    let result;
    if (editIdx !== null) {
      // Update existing medication
      const medId = medications[editIdx].id;
      result = await supabase.from("medications").update(medicationData).eq("id", medId).select();
    } else {
      // Add new medication
      result = await supabase.from("medications").insert(medicationData).select();
    }

    const { data, error: dbError } = result;

    if (dbError) {
      setError(dbError.message);
    } else if (data) {
      if (editIdx !== null) {
        onMedicationsChange(medications.map((med, idx) => (idx === editIdx ? data[0] : med)));
      } else {
        onMedicationsChange([...medications, data[0]]);
      }
      resetForm();
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const supabase = createClient();
    const { error: dbError } = await supabase.from("medications").delete().eq("id", id);
    if (dbError) {
      setError(dbError.message);
    } else {
      onMedicationsChange(medications.filter(m => m.id !== id));
    }
  };

  const handleTimeChange = (idx: number, value: string) => {
    setForm(f => ({
      ...f,
      times: f.times.map((t, i) => (i === idx ? value : t)),
    }));
  };

  const addTime = () => {
    setForm(f => ({ ...f, times: [...f.times, ""] }));
  };

  const resetForm = () => {
    setShowModal(false);
    setEditIdx(null);
    setForm({ name: "", dosage: "", times: [""], meal: "before", notes: "", start_date: "", end_date: "" });
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medications</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Add Medication
        </button>
      </div>

      {medications?.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {medications.map((med, idx) => (
            <div
              key={med.id || idx}
              className="card bg-base-100 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="card-body p-4 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-start">
                  <h3 className="card-title">{med.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setForm({ ...med, times: Array.isArray(med.times) ? med.times : [""] });
                        setEditIdx(idx);
                        setShowModal(true);
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p>Dosage: {med.dosage || 'Not specified'}</p>
                <p>Times: {Array.isArray(med.times) ? med.times.join(", ") : 'Not specified'}</p>
                <p>Meal: {med.meal === 'before' ? 'Before meal' : 'After meal'}</p>
                {med.notes && <p>Notes: {med.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <span>No medications added yet</span>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editIdx !== null ? 'Edit' : 'Add'} Medication</h3>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="block font-semibold">Name</label>
                <input
                  className="w-full p-2 border rounded"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              {/* Dosage */}
              <div className="space-y-2">
                <label className="block font-semibold">Dosage</label>
                <input
                  className="w-full p-2 border rounded"
                  value={form.dosage}
                  onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                />
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <label className="block font-semibold">Start Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="block font-semibold">End Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                />
              </div>

              {/* Times */}
              <div className="space-y-2">
                <label className="block font-semibold">Times</label>
                {form.times.map((t, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 p-2 border rounded"
                      value={t}
                      onChange={e => handleTimeChange(idx, e.target.value)}
                      placeholder="e.g. 08:00 AM"
                      pattern="^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$"
                      required
                    />
                    {form.times.length > 1 && (
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => setForm(f => ({ ...f, times: f.times.filter((_, i) => i !== idx) }))}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={addTime}
                >
                  Add Time
                </button>
              </div>

              {/* Meal Timing */}
              <div className="space-y-2">
                <label className="block font-semibold">Meal Timing</label>
                <select
                  className="w-full p-2 border rounded"
                  value={form.meal}
                  onChange={e => setForm(f => ({ ...f, meal: e.target.value }))}
                >
                  <option value="before">Before Meal</option>
                  <option value="after">After Meal</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block font-semibold">Notes</label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-red-400 dark:text-black"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
