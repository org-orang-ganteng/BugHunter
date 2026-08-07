import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Entity = "member" | "location" | "supervisor";

function resolveType(value: string | null): Entity | null {
  if (value === "member" || value === "location" || value === "supervisor") return value;
  return null;
}

export async function GET() {
  try {
    const [members, locations, supervisors] = await Promise.all([
      prisma.member.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
        include: { location: true },
      }),
      prisma.workLocation.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }),
      prisma.supervisor.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }),
    ]);
    return NextResponse.json({ members, locations, supervisors });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data.", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = resolveType(body.type);
    if (!type) return NextResponse.json({ error: "Tipe data tidak dikenal." }, { status: 400 });

    if (type === "member") {
      const { name, position, phone, locationId, ktpPhoto } = body;
      if (!name?.trim()) return NextResponse.json({ error: "Nama anggota wajib diisi." }, { status: 400 });
      const created = await prisma.member.create({
        data: {
          name: name.trim(),
          position: position?.trim() || null,
          phone: phone?.trim() || null,
          locationId: locationId || null,
          ktpPhoto: ktpPhoto || null,
        },
        include: { location: true },
      });
      return NextResponse.json(created, { status: 201 });
    }

    if (type === "location") {
      const { name, detail } = body;
      if (!name?.trim()) return NextResponse.json({ error: "Nama lokasi wajib diisi." }, { status: 400 });
      const created = await prisma.workLocation.create({
        data: { name: name.trim(), detail: detail?.trim() || null },
      });
      return NextResponse.json(created, { status: 201 });
    }

    // supervisor
    const { name, phone, identityNo } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Nama pengawas wajib diisi." }, { status: 400 });
    const created = await prisma.supervisor.create({
      data: { name: name.trim(), phone: phone?.trim() || null, identityNo: identityNo?.trim() || null },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data.", details: String(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = resolveType(searchParams.get("type"));
    const id = searchParams.get("id");
    if (!type || !id) return NextResponse.json({ error: "Tipe dan ID wajib disertakan." }, { status: 400 });

    // Soft-delete agar riwayat absensi tetap utuh.
    if (type === "member") await prisma.member.update({ where: { id }, data: { active: false } });
    else if (type === "location") await prisma.workLocation.update({ where: { id }, data: { active: false } });
    else await prisma.supervisor.update({ where: { id }, data: { active: false } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data.", details: String(error) }, { status: 500 });
  }
}
