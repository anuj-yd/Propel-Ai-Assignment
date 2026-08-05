import React, { useState } from 'react';
import { simulateTelemetry } from '../services/api';

export default function FaultSimulator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    device_id: 'KSPDB-P1',
    pole_id: 'P1',
    event: 'power_lost',
    energized: 'false'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      device_id: formData.device_id,
      pole_id: formData.pole_id,
      event: formData.event,
      energized: formData.energized === 'true',
      ts: new Date().toISOString(),
      seq: Date.now()
    };

    try {
      await simulateTelemetry(payload);
      setSuccess(`Telemetry sent for ${payload.pole_id}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send telemetry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl text-blue-400 mb-4">⚡ Fault Simulator</h2>
      <p className="text-slate-400 text-sm mb-6">
        Inject manual telemetry events into the network to test the localization algorithms.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">Device ID</label>
          <input 
            type="text" 
            name="device_id" 
            className="glass-input" 
            value={formData.device_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">Pole ID</label>
          <input 
            type="text" 
            name="pole_id" 
            className="glass-input" 
            value={formData.pole_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">Event Type</label>
          <select 
            name="event" 
            className="glass-input bg-slate-900" 
            value={formData.event}
            onChange={handleChange}
          >
            <option value="power_lost">Power Lost (Fault)</option>
            <option value="scheduled_outage">Scheduled Outage</option>
            <option value="boot">Device Boot</option>
            <option value="status_update">Status Update</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">Energized Status</label>
          <select 
            name="energized" 
            className="glass-input bg-slate-900" 
            value={formData.energized}
            onChange={handleChange}
          >
            <option value="false">False (Dark)</option>
            <option value="true">True (Live)</option>
          </select>
        </div>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && <div className="text-emerald-500 text-sm mt-2">{success}</div>}

        <button 
          type="submit" 
          className={`glass-button mt-4 ${formData.energized === 'false' ? 'glass-button-danger' : 'glass-button-success'}`} 
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Inject Telemetry'}
        </button>
      </form>
    </div>
  );
}
