"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import ManagePanel from "@/components/ManagePanel";
import { exportRekapExcel } from "@/lib/exportRekap";

type DayDetail = {
  pagi: boolean;
  sore: boolean;
  lembur: number;
};

type ReportItem = {
  id: string;
  name: string;
  position: string;
  positionCn: string;
  daysCount: number;
  totalOvertime: number;
  dailyRate: number;
  hourlyOvertimeRate: number;
  baseSalary: number;
  overtimePay: number;
  totalSalary: number;
  daysMap: Record<number, DayDetail>;
  status: string;
};

type OptionItem = {
  id: string;
  name: string;
};

type SummaryData = {
  totalMembers: number;
  presentTodayCount: number;
  totalOvertimeHours: number;
  totalPayroll: number;
  locations: OptionItem[];
  supervisors: OptionItem[];
  report: ReportItem[];
};

export default function AdminPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [viewMode, setViewMode] = useState<"excel" | "compact">("excel");

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedLocation) params.append("locationId", selectedLocation);
      if (selectedSupervisor) params.append("supervisorId", selectedSupervisor);

      const response = await fetch(`/api/admin/summary?${params.toString()}`);
      const result = await response.json();
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedLocation, selectedSupervisor]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const filteredReport = (data?.report || []).filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.position.toLowerCase().includes(search.toLowerCase())
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedDate("");
    setSelectedLocation("");
    setSelectedSupervisor("");
  };

  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <main className="app-shell admin-shell">
      <header className="app-topbar">
        <Link className="app-brand" href="/">
          <Image
            src="/LOGOPT.png"
            alt="Logo PT Along Mega Persada"
            width={70}
            height={58}
            priority
          />
          <span>
            <strong>ALONG MEGA PERSADA</strong>
            <small>ABSENSI / ADMIN</small>
          </span>
        </Link>
        <div className="topbar-meta">
          <span className="local-chip">
            <i /> Server SQLite aktif
          </span>
          <Link href="/pengawas" className="text-link">
            Mode pengawas ↗
          </Link>
        </div>
      </header>

      <div className="app-container">
        <section className="admin-block block-realtime">
          <div className="admin-heading">
            <div>
              <p className="section-kicker kicker-realtime">DASHBOARD REAL-TIME / MR HE RKEF</p>
              <h1>Ringkasan operasional.</h1>
              <p>
                Format matriks absensi disesuaikan persis seperti file Excel &ldquo;Mr HE RKEF juli.xlsx&rdquo;.
              </p>
            </div>
            <div className="period-control">
              <span>STATUS REKAP</span>
              <strong>{loading ? "Memuat data..." : "Matriks Auto-Sync"}</strong>
            </div>
          </div>

          {/* METRIC CARDS */}
          <section className="metric-grid">
          <article className="metric-card metric-primary">
            <span className="metric-label">Total anggota</span>
            <strong>{data?.totalMembers || 0}</strong>
            <small>Terdaftar di sistem</small>
            <span className="metric-art">∿</span>
          </article>
          <article className="metric-card">
            <span className="metric-label">Hadir hari ini</span>
            <strong>
              {data?.presentTodayCount || 0} <em>/ {data?.totalMembers || 0}</em>
            </strong>
            <small>
              <b className="green-text">
                {data?.totalMembers
                  ? ((data.presentTodayCount / data.totalMembers) * 100).toFixed(1)
                  : 0}
                %
              </b>{" "}
              kehadiran
            </small>
            <div className="progress-track">
              <i
                style={{
                  width: `${
                    data?.totalMembers
                      ? (data.presentTodayCount / data.totalMembers) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-label">Total lembur</span>
            <strong>
              {data?.totalOvertimeHours || 0} <em>jam</em>
            </strong>
            <small>
              <b className="red-text">
                Rp{((data?.totalOvertimeHours || 0) * 30000).toLocaleString("id-ID")}
              </b>{" "}
              upah lembur
            </small>
          </article>
          <article className="metric-card">
            <span className="metric-label">Estimasi payroll</span>
            <strong className="money">
              Rp{((data?.totalPayroll || 0) / 1000000).toFixed(1)} jt
            </strong>
            <small>Gaji pokok + lembur</small>
            <span className="metric-bar" />
          </article>
          </section>
        </section>

        {/* KELOLA DATA MASTER */}
        <ManagePanel onChanged={loadSummary} />

        {/* REKAP TABLE CARD */}
        <section className="table-card block-rekap">
          <div className="table-toolbar">
            <div>
              <p className="section-kicker kicker-rekap">REKAP ANGGOTA</p>
              <h2>Detail kehadiran & payroll</h2>
            </div>
            <div className="toolbar-actions">
              <div className="view-toggle" role="tablist" aria-label="Mode tampilan tabel">
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "excel"}
                  className={`view-toggle-btn ${viewMode === "excel" ? "is-active" : ""}`}
                  onClick={() => setViewMode("excel")}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                  </svg>
                  <span>Matriks <em>31 hari</em></span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "compact"}
                  className={`view-toggle-btn ${viewMode === "compact" ? "is-active" : ""}`}
                  onClick={() => setViewMode("compact")}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 6h13M8 12h13M8 18h13" />
                    <circle cx="3.5" cy="6" r="1.4" />
                    <circle cx="3.5" cy="12" r="1.4" />
                    <circle cx="3.5" cy="18" r="1.4" />
                  </svg>
                  <span>Ringkas</span>
                </button>
              </div>
              <button
                type="button"
                className="xlsx-button"
                onClick={() =>
                  exportRekapExcel(filteredReport, {
                    period: selectedDate ? new Date(selectedDate) : new Date(),
                  })
                }
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="xlsx-icon">
                  <path d="M12 3v10m0 0l-4-4m4 4l4-4" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* FILTER TOOLBAR */}
          <div className="filter-bar">
            <div className="filter-group">
              <label>Filter Tanggal:</label>
              <input
                type="date"
                className="filter-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Filter Lokasi Kerja:</label>
              <select
                className="filter-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">-- Semua Lokasi --</option>
                {data?.locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Filter Pengawas:</label>
              <select
                className="filter-select"
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
              >
                <option value="">-- Semua Pengawas --</option>
                {data?.supervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group filter-search">
              <input
                className="field-input search-input"
                placeholder="Cari nama atau jabatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {(selectedDate || selectedLocation || selectedSupervisor || search) && (
              <button className="reset-filter-btn" onClick={resetFilters}>
                ✕ Reset Filter
              </button>
            )}
          </div>

          {/* TABLE DISPLAY */}
          {viewMode === "excel" ? (
            <div className="table-scroll excel-matrix-scroll">
              <table className="excel-table">
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ width: "40px" }}>
                      No.
                    </th>
                    <th rowSpan={2} style={{ minWidth: "160px" }}>
                      NAMA 姓名
                    </th>
                    <th rowSpan={2} style={{ minWidth: "120px" }}>
                      JABATAN 职位
                    </th>
                    <th rowSpan={2} style={{ minWidth: "70px" }}>
                      WAKTU 时间
                    </th>
                    <th colSpan={31} style={{ textAlign: "center" }}>
                      TANGGAL 日期
                    </th>
                    <th rowSpan={2}>TOTAL 总日数</th>
                    <th rowSpan={2}>LEMBUR</th>
                    <th rowSpan={2}>GAJI/HARI</th>
                    <th rowSpan={2}>LEMBUR/JAM</th>
                    <th rowSpan={2}>GAJI</th>
                    <th rowSpan={2}>LEMBUR</th>
                    <th rowSpan={2}>JUMLAH</th>
                  </tr>
                  <tr>
                    {daysArray.map((d) => (
                      <th key={d} className="day-col">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                {filteredReport.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={42} style={{ textAlign: "center", padding: "40px" }}>
                        {loading
                          ? "Memuat data matriks..."
                          : "Tidak ada data anggota sesuai filter."}
                      </td>
                    </tr>
                  </tbody>
                  ) : (
                    filteredReport.map((person, idx) => (
                      <tbody key={person.id} className="person-row-group">
                        {/* SUB-BARIS 1: PAGI (早上) */}
                        <tr>
                          <td className="num-cell merge-cell" />
                          <td className="name-cell merge-cell" />
                          <td className="pos-cell merge-cell" />
                          <td className="waktu-cell">早上 (Pagi)</td>
                          {daysArray.map((d) => (
                            <td key={d} className="mark-cell">
                              {person.daysMap[d]?.pagi ? "✓" : ""}
                            </td>
                          ))}
                          <td className="stat-cell strong-val merge-cell" />
                          <td className="stat-cell merge-cell" />
                          <td className="money-col merge-cell" />
                          <td className="money-col merge-cell" />
                          <td className="money-col merge-cell" />
                          <td className="money-col merge-cell" />
                          <td className="money-col total-pay-col merge-cell" />
                        </tr>

                        {/* SUB-BARIS 2: SORE (下午) — baris tengah memuat data ringkas */}
                        <tr>
                          <td className="num-cell merge-cell">{idx + 1}</td>
                          <td className="name-cell merge-cell">
                            <strong>{person.name}</strong>
                          </td>
                          <td className="pos-cell merge-cell">
                            <span>{person.position}</span>
                            <small>{person.positionCn}</small>
                          </td>
                          <td className="waktu-cell">下午 (Sore)</td>
                          {daysArray.map((d) => (
                            <td key={d} className="mark-cell">
                              {person.daysMap[d]?.sore ? "✓" : ""}
                            </td>
                          ))}
                          <td className="stat-cell strong-val merge-cell">
                            {person.daysCount}
                          </td>
                          <td className="stat-cell merge-cell">
                            {person.totalOvertime}
                          </td>
                          <td className="money-col merge-cell">
                            Rp{person.dailyRate.toLocaleString("id-ID")}
                          </td>
                          <td className="money-col merge-cell">
                            Rp{person.hourlyOvertimeRate.toLocaleString("id-ID")}
                          </td>
                          <td className="money-col merge-cell">
                            Rp{person.baseSalary.toLocaleString("id-ID")}
                          </td>
                          <td className="money-col merge-cell">
                            Rp{person.overtimePay.toLocaleString("id-ID")}
                          </td>
                          <td className="money-col total-pay-col merge-cell">
                            Rp{person.totalSalary.toLocaleString("id-ID")}
                          </td>
                        </tr>

                        {/* SUB-BARIS 3: LEMBUR (加班) */}
                        <tr>
                          <td className="num-cell merge-cell" />
                          <td className="name-cell merge-cell" />
                          <td className="pos-cell merge-cell" />
                          <td className="waktu-cell lembur-waktu">加班 (Lembur)</td>
                          {daysArray.map((d) => (
                            <td key={d} className="mark-cell lembur-mark">
                              {person.daysMap[d]?.lembur > 0
                                ? person.daysMap[d].lembur
                                : ""}
                            </td>
                          ))}
                          <td className="stat-cell strong-val merge-cell" />
                          <td className="stat-cell merge-cell" />
                          <td className="money-col merge-cell" />
                          <td className="money-col merge-cell" />
                          <td className="money-col merge-cell" />
                          <td className="money-col merge-cell" />
                          <td className="money-col total-pay-col merge-cell" />
                        </tr>
                      </tbody>
                    ))
                  )}
              </table>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Nama anggota</th>
                    <th>Jabatan</th>
                    <th>Hari masuk</th>
                    <th>Lembur</th>
                    <th>Total gaji</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReport.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "30px" }}>
                        {loading
                          ? "Memuat..."
                          : "Belum ada data absensi untuk filter ini."}
                      </td>
                    </tr>
                  ) : (
                    filteredReport.map((person) => (
                      <tr key={person.id}>
                        <td>
                          <span className="person-avatar">
                            {person.name.charAt(0)}
                          </span>
                          <strong>{person.name}</strong>
                        </td>
                        <td>
                          {person.position} ({person.positionCn})
                        </td>
                        <td className="strong-cell">{person.daysCount} hari</td>
                        <td>{person.totalOvertime} jam</td>
                        <td className="money-cell">
                          Rp{person.totalSalary.toLocaleString("id-ID")}
                        </td>
                        <td>
                          <span
                            className={`table-status ${
                              person.status.includes("Hadir") ? "present" : "pending"
                            }`}
                          >
                            <i />
                            {person.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-footer">
            <span>Menampilkan {filteredReport.length} dari 74 anggota</span>
            <button className="ghost-button" onClick={loadSummary}>
              ↺ Refresh Data
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
