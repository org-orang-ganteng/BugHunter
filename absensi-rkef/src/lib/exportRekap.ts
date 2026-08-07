import ExcelJS from "exceljs";

export type DayDetail = { pagi: boolean; sore: boolean; lembur: number };

export type RekapRow = {
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
};

const MONTHS_ID = [
  "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
  "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER",
];

const DAYS = 31;
const FIRST_DAY_COL = 5; // E
const LAST_DAY_COL = FIRST_DAY_COL + DAYS - 1; // AI (35)
const COL = {
  total: LAST_DAY_COL + 1, // AJ 36
  lembur: LAST_DAY_COL + 2, // AK 37
  gajiHari: LAST_DAY_COL + 3, // AL 38
  lemburJam: LAST_DAY_COL + 4, // AM 39
  gaji: LAST_DAY_COL + 5, // AN 40
  lemburPay: LAST_DAY_COL + 6, // AO 41
  jumlah: LAST_DAY_COL + 7, // AP 42
};
const LAST_COL = COL.jumlah; // 42

const BRAND_BLUE = "FF283C91";
const HEADER_BLUE = "FF22336F";
const WAKTU_FILL = "FFF3F1ED";
const TOTAL_FILL = "FFEEF1FF";
const ZEBRA_FILL = "FFFBFBFA";

function colLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function thinBorder(): ExcelJS.Borders {
  const side: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FFC9CCD6" } };
  return { top: side, left: side, bottom: side, right: side } as ExcelJS.Borders;
}

export async function exportRekapExcel(
  rows: RekapRow[],
  opts: { period?: Date; title?: string } = {},
): Promise<void> {
  const period = opts.period ?? new Date();
  const periodLabel =
    opts.title ??
    `ABSEN BULAN ${MONTHS_ID[period.getMonth()]}/${period.getMonth() + 1} ${period.getFullYear()}`;

  const wb = new ExcelJS.Workbook();
  wb.creator = "PT Along Mega Persada";
  wb.created = new Date();
  const ws = wb.addWorksheet("Rekap RKEF", {
    views: [{ state: "frozen", xSplit: 4, ySplit: 4 }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  const lastLetter = colLetter(LAST_COL);

  // ── Row 1: company name ──
  ws.mergeCells(`A1:${lastLetter}1`);
  const c1 = ws.getCell("A1");
  c1.value = "PT ALONG MEGA PERSADA";
  c1.font = { bold: true, size: 15, color: { argb: BRAND_BLUE } };
  c1.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 26;

  // ── Row 2: period ──
  ws.mergeCells(`A2:${lastLetter}2`);
  const c2 = ws.getCell("A2");
  c2.value = periodLabel;
  c2.font = { bold: true, size: 11, color: { argb: "FF17212B" } };
  c2.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(2).height = 20;

  // ── Rows 3-4: header ──
  const headMerges: [number, string][] = [
    [1, "No."],
    [2, "NAMA 姓名"],
    [3, "JABATAN 职位"],
    [4, "WAKTU 时间"],
  ];
  for (const [col, label] of headMerges) {
    const L = colLetter(col);
    ws.mergeCells(`${L}3:${L}4`);
    ws.getCell(`${L}3`).value = label;
  }
  // TANGGAL spanning days
  ws.mergeCells(`${colLetter(FIRST_DAY_COL)}3:${colLetter(LAST_DAY_COL)}3`);
  ws.getCell(`${colLetter(FIRST_DAY_COL)}3`).value = "TANGGAL 日期";
  // day numbers on row 4
  for (let d = 1; d <= DAYS; d++) {
    ws.getCell(4, FIRST_DAY_COL + d - 1).value = d;
  }
  // right-side totals
  const totalHeads: [number, string][] = [
    [COL.total, "TOTAL 总日数"],
    [COL.lembur, "LEMBUR"],
    [COL.gajiHari, "GAJI/HARI"],
    [COL.lemburJam, "LEMBUR/JAM"],
    [COL.gaji, "GAJI"],
    [COL.lemburPay, "LEMBUR"],
    [COL.jumlah, "JUMLAH"],
  ];
  for (const [col, label] of totalHeads) {
    const L = colLetter(col);
    ws.mergeCells(`${L}3:${L}4`);
    ws.getCell(`${L}3`).value = label;
  }
  // style header rows
  for (const r of [3, 4]) {
    const row = ws.getRow(r);
    for (let c = 1; c <= LAST_COL; c++) {
      const cell = row.getCell(c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: r === 3 ? BRAND_BLUE : HEADER_BLUE } };
      cell.font = { bold: true, size: 8, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = thinBorder();
    }
  }
  ws.getRow(3).height = 26;
  ws.getRow(4).height = 16;

  // ── Data: 3 rows per person ──
  let r = 5;
  rows.forEach((p, idx) => {
    const rowPagi = r;
    const rowSore = r + 1;
    const rowLembur = r + 2;

    // No / Nama / Jabatan merged across 3 rows
    ws.mergeCells(`A${rowPagi}:A${rowLembur}`);
    ws.getCell(`A${rowPagi}`).value = idx + 1;
    ws.mergeCells(`B${rowPagi}:B${rowLembur}`);
    ws.getCell(`B${rowPagi}`).value = p.name;
    ws.mergeCells(`C${rowPagi}:C${rowLembur}`);
    ws.getCell(`C${rowPagi}`).value = `${p.position}\n${p.positionCn}`;

    // WAKTU
    ws.getCell(`D${rowPagi}`).value = "早上";
    ws.getCell(`D${rowSore}`).value = "下午";
    ws.getCell(`D${rowLembur}`).value = "加班";

    // day marks
    for (let d = 1; d <= DAYS; d++) {
      const col = FIRST_DAY_COL + d - 1;
      const det = p.daysMap[d];
      if (det?.pagi) ws.getCell(rowPagi, col).value = "✓";
      if (det?.sore) ws.getCell(rowSore, col).value = "✓";
      if (det && det.lembur > 0) ws.getCell(rowLembur, col).value = det.lembur;
    }

    // totals merged across 3 rows
    const totals: [number, number, string?][] = [
      [COL.total, p.daysCount],
      [COL.lembur, p.totalOvertime],
      [COL.gajiHari, p.dailyRate, "money"],
      [COL.lemburJam, p.hourlyOvertimeRate, "money"],
      [COL.gaji, p.baseSalary, "money"],
      [COL.lemburPay, p.overtimePay, "money"],
      [COL.jumlah, p.totalSalary, "money"],
    ];
    for (const [col, val, kind] of totals) {
      const L = colLetter(col);
      ws.mergeCells(`${L}${rowPagi}:${L}${rowLembur}`);
      const cell = ws.getCell(`${L}${rowPagi}`);
      cell.value = val;
      if (kind === "money") cell.numFmt = "#,##0";
    }

    // styling for the 3 rows
    for (let rr = rowPagi; rr <= rowLembur; rr++) {
      for (let c = 1; c <= LAST_COL; c++) {
        const cell = ws.getCell(rr, c);
        cell.border = thinBorder();
        if (!cell.alignment) cell.alignment = {};
        const isNameCol = c === 2;
        const isPosCol = c === 3;
        const isMoney = c >= COL.gajiHari;
        cell.alignment = {
          horizontal: isNameCol || isPosCol ? "left" : isMoney ? "right" : "center",
          vertical: "middle",
          wrapText: isPosCol,
        };
        cell.font = { size: 9, color: { argb: "FF17212B" } };
        if (idx % 2 === 1 && c > 4 && c <= LAST_DAY_COL) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA_FILL } };
        }
      }
      // No & Nama bold
      ws.getCell(rr, 1).font = { size: 9, bold: true, color: { argb: "FF17212B" } };
      ws.getCell(rr, 2).font = { size: 9, bold: true, color: { argb: "FF17212B" } };
      // WAKTU fill
      const waktu = ws.getCell(rr, 4);
      waktu.fill = { type: "pattern", pattern: "solid", fgColor: { argb: WAKTU_FILL } };
      waktu.font = { size: 8, bold: true, color: { argb: rr === rowLembur ? "FFEE2B32" : "FF17212B" } };
    }
    // marks color
    for (let d = 1; d <= DAYS; d++) {
      const col = FIRST_DAY_COL + d - 1;
      ws.getCell(rowPagi, col).font = { size: 10, bold: true, color: { argb: "FF283C91" } };
      ws.getCell(rowSore, col).font = { size: 10, bold: true, color: { argb: "FF283C91" } };
      ws.getCell(rowLembur, col).font = { size: 9, bold: true, color: { argb: "FFEE2B32" } };
    }
    // JUMLAH highlight
    const jml = ws.getCell(`${colLetter(COL.jumlah)}${rowPagi}`);
    jml.font = { size: 10, bold: true, color: { argb: BRAND_BLUE } };
    jml.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TOTAL_FILL } };

    r += 3;
  });

  // ── Column widths ──
  ws.getColumn(1).width = 6;
  ws.getColumn(2).width = 20;
  ws.getColumn(3).width = 11;
  ws.getColumn(4).width = 8;
  for (let c = FIRST_DAY_COL; c <= LAST_DAY_COL; c++) ws.getColumn(c).width = 3.6;
  ws.getColumn(COL.total).width = 9;
  ws.getColumn(COL.lembur).width = 8;
  ws.getColumn(COL.gajiHari).width = 12;
  ws.getColumn(COL.lemburJam).width = 12;
  ws.getColumn(COL.gaji).width = 14;
  ws.getColumn(COL.lemburPay).width = 12;
  ws.getColumn(COL.jumlah).width = 15;

  // ── Download ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fileMonth = `${MONTHS_ID[period.getMonth()]}-${period.getFullYear()}`;
  a.href = url;
  a.download = `Rekap-Absensi-AMP-${fileMonth}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
