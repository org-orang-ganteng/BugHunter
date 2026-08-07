import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let supervisors = await prisma.supervisor.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    if (supervisors.length === 0) {
      supervisors = [
        await prisma.supervisor.create({ data: { name: "Andi Pratama" } }),
        await prisma.supervisor.create({ data: { name: "Budi Santoso" } }),
      ];
    }

    let locations = await prisma.workLocation.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    if (locations.length === 0) {
      locations = [
        await prisma.workLocation.create({
          data: { name: "Area RKEF — Site 01" },
        }),
        await prisma.workLocation.create({
          data: { name: "Area HPAL — Site 02" },
        }),
      ];
    }

    let members = await prisma.member.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    if (members.length === 0) {
      members = await Promise.all([
        prisma.member.create({
          data: { name: "ARI SUROTO", position: "Pekerja umum" },
        }),
        prisma.member.create({
          data: { name: "AUDRA", position: "Pekerja umum" },
        }),
        prisma.member.create({
          data: { name: "IKSAN", position: "Pekerja umum" },
        }),
        prisma.member.create({
          data: { name: "RIZAL MAULANA", position: "Tukang besi" },
        }),
        prisma.member.create({
          data: { name: "HAIKAL", position: "Tukang kayu" },
        }),
      ]);
    }

    const attendances = await prisma.attendance.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        supervisor: true,
        member: true,
        location: true,
      },
    });

    return NextResponse.json({
      supervisors,
      locations,
      members,
      attendances,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data absensi", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supervisorId, locationId, memberId, type, overtimeHour } = body;

    if (!supervisorId || !locationId || !memberId || !type) {
      return NextResponse.json(
        { error: "Semua data utama wajib diisi." },
        { status: 400 }
      );
    }

    if (type === "LEMBUR" && (!overtimeHour || Number(overtimeHour) <= 0)) {
      return NextResponse.json(
        { error: "Jumlah jam lembur harus diisi." },
        { status: 400 }
      );
    }

    const today = new Date();
    const workDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const created = await prisma.attendance.create({
      data: {
        workDate,
        type,
        overtimeHour: type === "LEMBUR" ? Number(overtimeHour) : null,
        supervisorId,
        locationId,
        memberId,
      },
      include: {
        supervisor: true,
        member: true,
        location: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Catatan absensi ganda atau gagal disimpan.", details: String(error) },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID absensi wajib disertakan." },
        { status: 400 }
      );
    }

    await prisma.attendance.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Absensi berhasil dihapus." });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus absensi.", details: String(error) },
      { status: 500 }
    );
  }
}
