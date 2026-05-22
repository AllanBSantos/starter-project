'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

interface Report {
  id: string;
  problem_type: string;
  status: string;
  description: string;
  created_at: string;
}

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch('/api/reports');
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        const data = await response.json();
        setReports(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard - Reports</h1>
        <Link href="/lesson" className={styles.lessonLink}>
          Ir para Aula Demo
        </Link>
      </header>

      {loading && <p>Carregando reports...</p>}
      {error && <p className={styles.error}>Erro: {error}</p>}

      {!loading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Descrição</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    Nenhum report encontrado
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td className={styles.idCell}>{report.id.slice(0, 8)}...</td>
                    <td>
                      <span className={styles.badge}>{report.problem_type}</span>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${styles[`status${report.status}`]}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className={styles.description}>{report.description}</td>
                    <td className={styles.date}>
                      {new Date(report.created_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
