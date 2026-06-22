import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
);

const cardStyle = {
  borderRadius: 24,
  background: '#fff',
  padding: 24,
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  marginBottom: 24,
};

export default function Analytics() {
  const { registeredChild } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!registeredChild) {
      setLoading(false);
      return;
    }
    const learnerId = `${registeredChild.childName || 'child'}_class_${registeredChild.grade || 0}`;
    const baseUrl = 'http://localhost:4000';

    async function load() {
      try {
        setLoading(true);
        const [analyticsRes, sessionsRes] = await Promise.all([
          fetch(`${baseUrl}/api/analytics/${encodeURIComponent(learnerId)}`),
          fetch(`${baseUrl}/api/test-result/${encodeURIComponent(learnerId)}`),
        ]);
        if (!analyticsRes.ok) throw new Error('Failed to load analytics');
        if (!sessionsRes.ok) throw new Error('Failed to load sessions');
        const analyticsJson = await analyticsRes.json();
        const sessionsJson = await sessionsRes.json();
        setAnalytics(analyticsJson);
        setSessions(sessionsJson);
        setError(null);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [registeredChild]);

  if (!registeredChild) {
    return (
      <div style={cardStyle}>
        <p>Please log in as a child to view analytics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={cardStyle}>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={cardStyle}>
        <p style={{ color: '#E74C3C' }}>Error: {error}</p>
      </div>
    );
  }

  const moduleOrder = ['Listening', 'Speaking', 'Reading', 'Writing'];
  const moduleLabels = moduleOrder;

  const preAcc = moduleOrder.map((m) => analytics.modules[m]?.averagePreAccuracy ?? 0);
  const postAcc = moduleOrder.map((m) => analytics.modules[m]?.averagePostAccuracy ?? 0);

  const lineLabels = sessions.map((s, idx) => `${idx + 1}`);
  const lineData = sessions.map((s) => s.accuracy);
  const inattentivePerSession = sessions.map((s) => s.inattentiveCount || 0);
  const calmPerSession = sessions.map((s) => s.calmModeActivatedCount || 0);

  const completed = analytics.engagementRate || 0;
  const abandoned = Math.max(0, 100 - completed);

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', marginBottom: 16 }}>Learner Analytics</h2>
      <p style={{ marginBottom: 24 }}>
        {registeredChild.childName} – class {registeredChild.classType === 'primary' ? 'Primary' : 'Secondary'} {registeredChild.grade}
      </p>

      <section style={cardStyle}>
        <h3 style={{ marginBottom: 16 }}>Key Metrics</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ minWidth: 160 }}>
            <strong>Average session duration</strong>
            <p>{analytics.averageSessionDuration.toFixed(2)} min</p>
          </div>
          <div style={{ minWidth: 160 }}>
            <strong>Total calm mode activations</strong>
            <p>{analytics.totalCalmModeActivations}</p>
          </div>
          <div style={{ minWidth: 160 }}>
            <strong>Total inattentive detections</strong>
            <p>{analytics.totalInattentiveDetections}</p>
          </div>
          <div style={{ minWidth: 160 }}>
            <strong>Engagement rate</strong>
            <p>{analytics.engagementRate.toFixed(2)}%</p>
          </div>
          <div style={{ minWidth: 160 }}>
            <strong>Overall accuracy</strong>
            <p>{analytics.overallAccuracy.toFixed(2)}%</p>
          </div>
          <div style={{ minWidth: 160 }}>
            <strong>Error rate</strong>
            <p>{analytics.overallErrorRate.toFixed(2)}%</p>
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <h3 style={{ marginBottom: 16 }}>Pre-test vs Post-test Accuracy per Module</h3>
        <Bar
          data={{
            labels: moduleLabels,
            datasets: [
              {
                label: 'Pre-test',
                data: preAcc,
                backgroundColor: '#1F4E79',
              },
              {
                label: 'Post-test',
                data: postAcc,
                backgroundColor: '#1E8449',
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: { beginAtZero: true, max: 100 },
            },
          }}
        />
      </section>

      <section style={cardStyle}>
        <h3 style={{ marginBottom: 16 }}>Accuracy Progression Across Sessions</h3>
        <Line
          data={{
            labels: lineLabels,
            datasets: [
              {
                label: 'Accuracy (%)',
                data: lineData,
                borderColor: '#145A32',
                backgroundColor: 'rgba(20, 90, 50, 0.25)',
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: { beginAtZero: true, max: 100 },
            },
          }}
        />
      </section>

      <section style={cardStyle}>
        <h3 style={{ marginBottom: 16 }}>Inattentive Count per Session</h3>
        <Bar
          data={{
            labels: lineLabels,
            datasets: [
              {
                label: 'Inattentive count',
                data: inattentivePerSession,
                backgroundColor: '#922B21',
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </section>

      <section style={cardStyle}>
        <h3 style={{ marginBottom: 16 }}>Calm Mode Activations per Session</h3>
        <Bar
          data={{
            labels: lineLabels,
            datasets: [
              {
                label: 'Calm mode activations',
                data: calmPerSession,
                backgroundColor: '#B9770E',
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </section>

      <section style={cardStyle}>
        <h3 style={{ marginBottom: 16 }}>Engagement Rate</h3>
        <Pie
          data={{
            labels: ['Completed sessions', 'Abandoned sessions'],
            datasets: [
              {
                data: [completed, abandoned],
                backgroundColor: ['#2ECC71', '#E74C3C'],
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </section>
    </div>
  );
}