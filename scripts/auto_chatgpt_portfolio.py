import os
import sys
import json
import time
import subprocess
import psycopg2

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECTS_DIR = os.path.join(BASE_DIR, "public", "uploads", "projects")
STATUS_FILE = os.path.join(BASE_DIR, "scripts", "chatgpt_status.json")
LOCAL_BROWSER_SCRIPT = r"C:\Users\NCN0C\Videos\konten\local_ai_browser.py"
PYTHON_VENV = r"C:\Users\NCN0C\Videos\konten\.venv\Scripts\python.exe"

DATABASE_URL = "postgresql://neondb_owner:npg_4IsokTFSh0Gf@ep-lucky-meadow-a93qe14n-pooler.gwc.azure.neon.tech/neondb?sslmode=require"

def load_status():
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"completed": ["ai-poster-prompt-studio-preview.png", "9router-preview.png"]}

def save_status(data):
    with open(STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def build_custom_prompt(project, category_name):
    title = project["title"]
    slug = project["slug"]
    text = (title + " " + slug).lower()

    if "pos" in text or "kasir" in text or "shoope" in text or "toko" in text or "kios" in text:
        return f"Buatkan gambar 16:9 widescreen landscape: UI mockup dan dashboard antarmuka modern Point of Sale (POS) dan e-commerce checkout '{title}'. Tampilkan katalog produk modern, ringkasan transaksi kasir, analitik penjualan, dan antarmuka SaaS yang sangat bersih, elegan, dan estetik sekelas Dribbble/Behance tanpa laptop buram, tanpa teks terdistorsi."
    elif "wa" in text or "whatsapp" in text or "telegram" in text or "bot" in text:
        return f"Buatkan gambar 16:9 widescreen landscape: UI dashboard developer modern untuk '{title}' (Automation & Messaging Gateway). Tampilkan grafik throughput pesan real-time, status multi-device connected, log webhook aktif, antarmuka dark mode glassmorphism futuristik yang sangat bersih sekelas Dribbble/Behance."
    elif "esp32" in text or "cam" in text or "iot" in text or "sensor" in text:
        return f"Buatkan gambar 16:9 widescreen landscape: UI dashboard pemantauan IoT & telemetri modern untuk '{title}'. Tampilkan live surveillance streaming camera, deteksi AI bounding box, dial telemetri sensor suhu/kelembaban, antarmuka cyber-tech futuristik yang sangat tajam dan profesional."
    elif "wedding" in text or "invitation" in text or "undangan" in text or "simfoni" in text:
        return f"Buatkan gambar 16:9 widescreen landscape: Tampilan UI/UX web aplikasi undangan pernikahan digital elegan '{title}'. Sentuhan warna champagne gold dan emerald mewah, tipografi romantis modern, galeri foto pasangan, widget RSVP dan countdown elegan, antarmuka web responsif berkelas studio."
    elif "pesantren" in text or "santri" in text or "sekolah" in text or "rapor" in text:
        return f"Buatkan gambar 16:9 widescreen landscape: UI dashboard portal akademik cloud '{title}'. Tampilkan ringkasan statistik santri/siswa, grafik kehadiran digital, modul pembayaran SPP/donasi, antarmuka modern clean SaaS berlatar terang-gelap minimalis yang rapi dan elegan."
    elif "hrd" in text or "hris" in text or "karyawan" in text:
        return f"Buatkan gambar 16:9 widescreen landscape: UI dashboard human resource management HRIS '{title}'. Tampilkan kalender kehadiran, penggajian otomatis, metrik performa karyawan, antarmuka enterprise SaaS modern yang sangat rapi dan estetik sekelas Dribbble."
    elif "ai" in text or "gpt" in text or "prompt" in text or "llm" in text:
        return f"Buatkan gambar 16:9 widescreen landscape: UI antarmuka generative AI modern untuk '{title}'. Tampilkan visual canvas AI prompt, panel parameter model, visualisasi grafis futuristik beresolusi studio 4k yang memukau dan inovatif."
    else:
        return f"Buatkan gambar 16:9 widescreen landscape: UI mockup aplikasi modern '{title}' dalam kategori {category_name}. Tampilkan antarmuka SaaS berkelas tinggi dengan card komponen presisi, navigasi rapi, chart analitik tajam, visual estetik modern Dribbble/Behance tanpa perangkat laptop buram."

def generate_for_project(project, category_name):
    filename = f"{project['slug']}-preview.png"
    target_path = os.path.join(PROJECTS_DIR, filename)
    prompt = build_custom_prompt(project, category_name)

    print(f"\n🚀 [ChatGPT] Memproses '{project['title']}' ({filename})...")
    print(f"📝 Prompt: {prompt[:90]}...")

    cmd = [
        PYTHON_VENV,
        LOCAL_BROWSER_SCRIPT,
        "--target", "chatgpt",
        "--action", "image",
        "--prompt", prompt,
        "--output", target_path,
        "--account", "dian"
    ]

    try:
        subprocess.run(cmd, check=True, timeout=300)
        if os.path.exists(target_path) and os.path.getsize(target_path) > 50000:
            # Resize & optimize to 1200x675
            opt_cmd = f"node -e \"import('sharp').then(async ({{default:s}})=>{{const b=await s('{target_path.replace(chr(92), '/')}').resize(1200, 675, {{fit:'cover'}}).png({{quality:90,compressionLevel:8}}).toBuffer(); (await import('fs')).writeFileSync('{target_path.replace(chr(92), '/')}', b);}})\""
            subprocess.run(["powershell", "-Command", opt_cmd], capture_output=True)
            print(f"✅ Berhasil meng-generate dan mengoptimasi {filename}!")
            return True
    except Exception as e:
        print(f"❌ Gagal pada {filename}: {e}")
    return False

def main():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("SELECT id, name, slug FROM project_category")
    cat_map = {row[0]: row[1] for row in cur.fetchall()}

    cur.execute("SELECT id, title, slug, \"categoryId\" FROM project WHERE \"coverImage\" LIKE '%uploads/projects%' ORDER BY id ASC")
    projects = [{"id": r[0], "title": r[1], "slug": r[2], "categoryId": r[3]} for r in cur.fetchall()]
    cur.close()
    conn.close()

    status = load_status()
    completed_set = set(status.get("completed", []))

    pending = [p for p in projects if f"{p['slug']}-preview.png" not in completed_set]
    print(f"📊 Total Proyek: {len(projects)} | Sudah Selesai: {len(completed_set)} | Tersisa: {len(pending)}")

    # Process next batch of projects
    success_batch = 0
    for idx, p in enumerate(pending[:5]):  # Process 5 at a time
        cat_name = cat_map.get(p["categoryId"], "Web App")
        fname = f"{p['slug']}-preview.png"
        ok = generate_for_project(p, cat_name)
        if ok:
            completed_set.add(fname)
            status["completed"] = list(completed_set)
            save_status(status)
            success_batch += 1

    if success_batch > 0:
        print(f"\n🎉 Berhasil menyelesaikan batch {success_batch} gambar ChatGPT!")

if __name__ == "__main__":
    main()
