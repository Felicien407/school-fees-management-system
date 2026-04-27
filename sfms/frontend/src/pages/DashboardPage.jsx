import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/apiClient.js';

export function DashboardPage() {
  const [studentCount, setStudentCount] = useState(null);
  const [paymentCount, setPaymentCount] = useState(null);
  const [totalPaid, setTotalPaid] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [students, payments] = await Promise.all([
          apiRequest('/api/students'),
          apiRequest('/api/payments'),
        ]);
        if (cancelled) return;
        setStudentCount(students.length);
        setPaymentCount(payments.length);
        setTotalPaid(payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: 'Students',
      value: studentCount ?? '—',
      to: '/students',
      tone: 'bg-teal-50 text-teal-800',
    },
    {
      label: 'Payments',
      value: paymentCount ?? '—',
      to: '/payments',
      tone: 'bg-emerald-50 text-emerald-800',
    },
    {
      label: 'Total paid',
      value: totalPaid != null ? `${totalPaid.toLocaleString()} FRW` : '—',
      to: '/reports',
      tone: 'bg-cyan-50 text-cyan-900',
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-sfms-ink">Dashboard</h1>
      <p className="text-slate-600 mt-1 text-sm">Overview of school fee data.</p>

      {error && (
        <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={`rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition ${c.tone}`}
          >
            <p className="text-sm font-medium opacity-80">{c.label}</p>
            <p className="text-2xl font-bold mt-2">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
