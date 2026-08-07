import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD
    const locationIdParam = searchParams.get("locationId");
    const supervisorIdParam = searchParams.get("supervisorId");

    const totalMembers = await prisma.member.count({ where: { active: true } });

    // Filter tanggal untuk status hadir hari ini / tanggal yang dipilih
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const workDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );

    const attendanceWhere: Record<string, unknown> = {};
    if (locationIdParam) attendanceWhere.locationId = locationIdParam;
    if (supervisorIdParam) attendanceWhere.supervisorId = supervisorIdParam;

    const todayAttendances = await prisma.attendance.findMany({
      where: {
        workDate,
        ...attendanceWhere,
      },
      include: {
        member: true,
        supervisor: true,
        location: true,
      },
    });

    const presentMemberIds = new Set(
      todayAttendances.map((item) => item.memberId)
    );

    // Ambil seluruh lokasi & pengawas untuk filter dropdown
    const locations = await prisma.workLocation.findMany({ where: { active: true }, orderBy: { name: "asc" } });
    const supervisors = await prisma.supervisor.findMany({ where: { active: true }, orderBy: { name: "asc" } });

    const members = await prisma.member.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        attendances: {
          where: attendanceWhere,
          include: {
            location: true,
            supervisor: true,
          }
        },
      },
    });

    // Peta posisi ke bahasa Mandarin seperti Excel asli
    const posMapCn: Record<string, string> = {
      "Pekerja umum": "小工",
      "Tukang besi": "钢筋工",
      "Tukang las": "焊工",
      "Tukang kayu": "木工",
    };

    const report = members.map((member) => {
      const isPresentToday = presentMemberIds.has(member.id);

      // Peta kehadiran per tanggal (1 - 31)
      const daysMap: Record<number, { pagi: boolean; sore: boolean; lembur: number }> = {};
      for (let d = 1; d <= 31; d++) {
        daysMap[d] = { pagi: false, sore: false, lembur: 0 };
      }

      member.attendances.forEach((att) => {
        const d = new Date(att.workDate).getDate();
        if (d >= 1 && d <= 31) {
          if (att.type === "PAGI") daysMap[d].pagi = true;
          if (att.type === "SORE") daysMap[d].sore = true;
          if (att.type === "LEMBUR" && att.overtimeHour) daysMap[d].lembur += att.overtimeHour;
        }
      });

      const totalPagiSore = member.attendances.filter(
        (a) => a.type === "PAGI" || a.type === "SORE"
      ).length;
      const daysCount = totalPagiSore / 2;

      const totalOvertime = member.attendances
        .filter((a) => a.type === "LEMBUR" && a.overtimeHour)
        .reduce((acc, item) => acc + (item.overtimeHour || 0), 0);

      const dailyRate = 300000;
      const hourlyOvertimeRate = 30000;
      const baseSalary = daysCount * dailyRate;
      const overtimePay = totalOvertime * hourlyOvertimeRate;
      const totalSalary = baseSalary + overtimePay;

      const positionCn = posMapCn[member.position || ""] || "小工";

      return {
        id: member.id,
        name: member.name,
        position: member.position || "Pekerja umum",
        positionCn,
        daysCount,
        totalOvertime,
        dailyRate,
        hourlyOvertimeRate,
        baseSalary,
        overtimePay,
        totalSalary,
        daysMap,
        status: isPresentToday ? "Hadir hari ini" : "Belum masuk",
      };
    });

    const totalOvertimeHours = report.reduce(
      (acc, item) => acc + item.totalOvertime,
      0
    );
    const totalPayroll = report.reduce(
      (acc, item) => acc + item.totalSalary,
      0
    );

    return NextResponse.json({
      totalMembers,
      presentTodayCount: presentMemberIds.size,
      totalOvertimeHours,
      totalPayroll,
      locations,
      supervisors,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memuat rekap admin", details: String(error) },
      { status: 500 }
    );
  }
}
