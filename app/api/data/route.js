import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const KEY = "gallery:data";

const DEFAULT_DATA = [
  { id:1, name:"AMV TYPOGRAPHY", eyebrow:"FREE", rarity:"rare",
    thumb:"https://i.pinimg.com/736x/0d/0d/3c/0d0d3cde5fd01b5de4c902ab5aca8940.jpg", color:"#3a4a6b",
    variants:[
      {name:"𝖠𝗍𝗁𝖺𝗇𝖺𝗌𝗂𝖺 𝖽𝖾 𝖠𝗅𝗀𝖾𝗋 𝖮𝖻𝖾𝗅𝗂𝖺", total:2, selected:1,
        thumb:"https://i.pinimg.com/736x/0d/0d/3c/0d0d3cde5fd01b5de4c902ab5aca8940.jpg",
        drive:"https://drive.google.com/drive/folders/1vK2wBa858EUvVSYg9yU-NK9K3jM-llBF?usp=sharing",
        files:[{n:"part 1.aep",s:"84 MB"},{n:"preview.png",s:"3.1 MB"}]}
    ]},
  { id:2, name:"ytta", eyebrow:"CHARACTER", rarity:"epic",
    thumb:"PASTE_LINK_THUMBNAIL_PRUNE", color:"#4a2f6b",
    variants:[
      {name:"Mid", total:3, selected:1,
        thumb:"PASTE_LINK_PREVIEW_PRUNE_REQUIEM",
        drive:"PASTE_LINK_DRIVE_PRUNE_REQUIEM",
        files:[{n:"b",s:"91 MB"},{n:"h",s:"22 MB"}]}
    ]},
  { id:3, name:"s", eyebrow:"CHARACTER", rarity:"rare",
    thumb:"PASTE_LINK_THUMBNAIL_NICOLE", color:"#6b3a2f",
    variants:[
      {name:"Golr", total:2, selected:2,
        thumb:"PASTE_LINK_PREVIEW_NICOLE_GOLDENHOUR",
        drive:"PASTE_LINK_DRIVE_NICOLE_GOLDENHOUR",
        files:[{n:"b",s:"79 MB"},{n:"f",s:"14 MB"}]}
    ]},
  { id:4, name:"u", eyebrow:"CHARACTER", rarity:"rare",
    thumb:"PASTE_LINK_THUMBNAIL_LINNEA", color:"#2f6b52",
    variants:[
      {name:"jj", total:1, selected:1,
        thumb:"PASTE_LINK_PREVIEW_LINNEA_SPRINGWING",
        drive:"PASTE_LINK_DRIVE_LINNEA_SPRINGWING",
        files:[{n:"j.psd",s:"68 MB"}]}
    ]}
];

// Publik: siapapun bisa liat data gallery
export async function GET() {
  let data = await redis.get(KEY);
  if (!data) {
    data = DEFAULT_DATA;
    await redis.set(KEY, data);
  }
  return NextResponse.json({ data });
}

// Protected: butuh ADMIN_PASSWORD yang bener, dicek di server tiap kali nulis
export async function POST(req) {
  const body = await req.json();
  const { password, data } = body || {};

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }
  if (!Array.isArray(data)) {
    return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });
  }

  await redis.set(KEY, data);
  return NextResponse.json({ ok: true });
}
