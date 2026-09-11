import os
import sys
import json
import time
import base64
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECTS_DIR = os.path.join(BASE_DIR, "public", "uploads", "projects")
PROGRESS_FILE = os.path.join(BASE_DIR, "scripts", "chatgpt_30_progress.json")
BASE_PROFILE_DIR = os.path.expandvars(r"%LOCALAPPDATA%\hermes\browser_profiles")
PROFILE_DIR = os.path.join(BASE_PROFILE_DIR, "dian")

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"completed": []}

def save_progress(data):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def download_raw_image(page, img_element, output_path):
    """Downloads 100% raw uncompressed image bytes directly from browser blob/element."""
    src = img_element.get_attribute("src") or ""
    if src and src.startswith("http"):
        fetch_script = """
        async (imgUrl) => {
            try {
                const resp = await fetch(imgUrl);
                const blob = await resp.blob();
                return await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch(e) {
                return null;
            }
        }
        """
        b64_data = page.evaluate(fetch_script, src)
        if b64_data and "," in b64_data:
            b64_str = b64_data.split(",", 1)[-1]
            raw_bytes = base64.b64decode(b64_str)
            with open(output_path, "wb") as f:
                f.write(raw_bytes)
            return len(raw_bytes)
    
    # Fallback to screenshot element
    img_element.scroll_into_view_if_needed()
    img_element.screenshot(path=output_path)
    return os.path.getsize(output_path)

def build_prompt(item):
    title = item["title"]
    category = item.get("category", "Web App")
    slug = item["slug"]
    t_lower = (title + " " + slug).lower()

    if "poster" in t_lower or "prompt" in t_lower:
        return f"Buatkan gambar 16:9 widescreen landscape: UI mockup dan antarmuka web aplikasi modern '{title}' ({category}). Tampilkan visual canvas AI prompt generator yang sangat modern, bersih, elegan, warna cyan dan violet bercahaya, palet style poster, antarmuka SaaS berkelas Dribbble/Behance tanpa laptop buram, tanpa teks rusak."
    elif "wa" in t_lower or "whatsapp" in t_lower or "bot" in t_lower or "automation" in t_lower:
        return f"Buatkan gambar 16:9 widescreen landscape: UI mockup developer dashboard modern untuk '{title}' ({category}). Tampilkan grafik throughput pesan real-time, status koneksi multi-device, log webhook, antarmuka dark glassmorphism modern berkelas Dribbble tanpa laptop buram."
    elif "pos" in t_lower or "kasir" in t_lower or "shoope" in t_lower or "toko" in t_lower:
        return f"Buatkan gambar 16:9 widescreen landscape: UI antarmuka modern Point of Sale (POS) dan e-commerce '{title}' ({category}). Tampilkan katalog produk, panel checkout, analitik kasir, card komponen modern dan rapi berkelas studio."
    elif "invitation" in t_lower or "wedding" in t_lower or "undangan" in t_lower:
        return f"Buatkan gambar 16:9 widescreen landscape: Tampilan UI/UX web aplikasi undangan pernikahan digital modern '{title}' ({category}). Tema champagne gold dan emerald mewah, tipografi elegan, galeri foto, widget RSVP, desain web responsif berkelas."
    elif "pesantren" in t_lower or "santri" in t_lower or "sekolah" in t_lower or "rapor" in t_lower:
        return f"Buatkan gambar 16:9 widescreen landscape: UI dashboard portal akademik cloud '{title}' ({category}). Tampilkan ringkasan statistik santri/siswa, modul kehadiran digital, laporan nilai, antarmuka modern clean SaaS berkelas."
    elif "brevet" in t_lower or "pajak" in t_lower or "tax" in t_lower:
        return f"Buatkan gambar 16:9 widescreen landscape: UI aplikasi edukasi pajak dan AI tutor '{title}' ({category}). Tampilkan modul interaktif simulasi pajak, kurikulum e-learning, kalkulator pajak, antarmuka SaaS modern rapi."
    elif "iot" in t_lower or "sensor" in t_lower or "esp32" in t_lower:
        return f"Buatkan gambar 16:9 widescreen landscape: UI dashboard pemantauan IoT & telemetri sensor modern untuk '{title}' ({category}). Tampilkan live camera feed, grafik dial kelembaban dan suhu real-time, antarmuka futuristik cyber-tech sangat tajam."
    else:
        return f"Buatkan gambar 16:9 widescreen landscape: UI mockup produk modern dan dashboard web aplikasi '{title}' dalam kategori {category}. Tampilkan antarmuka SaaS berkelas tinggi dengan card komponen presisi, navigasi rapi, chart analitik tajam, visual estetik modern Dribbble/Behance tanpa laptop buram."

def run_batch():
    # Load 30 projects
    with open(os.path.join(BASE_DIR, "scripts", "30_projects.json"), "r", encoding="utf-8") as f:
        projects = json.load(f)

    progress = load_progress()
    completed = set(progress.get("completed", []))

    print(f"[*] Total target: {len(projects)} proyek | Selesai: {len(completed)}")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="chrome",
            headless=False,
            args=[
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-blink-features=AutomationControlled",
                "--window-size=1400,950"
            ],
            ignore_default_args=["--enable-automation"]
        )
        page = context.pages[0] if context.pages else context.new_page()

        print("[*] Membuka ChatGPT...")
        page.goto("https://chatgpt.com", wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(3000)

        for i, item in enumerate(projects):
            slug = item["slug"]
            fname = f"{slug}-preview.png"
            target_file = os.path.join(PROJECTS_DIR, fname)

            if fname in completed and os.path.exists(target_file) and os.path.getsize(target_file) > 100000:
                print(f"[{i+1}/{len(projects)}] SKIP (Sudah ada gambar asli): {fname}")
                continue

            print(f"\n[{i+1}/{len(projects)}] Memproses '{item['title']}'...")
            prompt = build_prompt(item)
            print(f"Prompt: {prompt[:80]}...")

            # Buka obrolan baru agar bersih
            try:
                new_chat = page.locator('a[data-testid="new-chat-button"], a:has-text("Obrolan baru")').first
                if new_chat.count() > 0:
                    new_chat.click()
                    page.wait_for_timeout(2000)
            except Exception:
                page.goto("https://chatgpt.com", wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(2000)

            # Isi prompt
            prompt_box = page.locator('#prompt-textarea')
            prompt_box.wait_for(state='visible', timeout=20000)
            prompt_box.click()
            page.wait_for_timeout(300)
            prompt_box.fill(prompt)
            page.wait_for_timeout(1000)

            send_btn = page.locator('button[data-testid="send-button"]').first
            if send_btn.count() > 0 and not send_btn.is_disabled():
                send_btn.click()
            else:
                page.keyboard.press("Enter")

            print("[*] Menunggu ChatGPT DALL-E merender gambar (30-90 detik)...")
            start_t = time.time()
            saved = False

            while time.time() - start_t < 180:
                page.wait_for_timeout(4000)
                # Cek apakah sedang rendering
                is_stop = page.locator('button[data-testid="stop-button"]').count() > 0
                if is_stop:
                    continue

                imgs = page.locator('img').all()
                valid_imgs = []
                for im in imgs:
                    try:
                        src = im.get_attribute("src") or ""
                        alt = (im.get_attribute("alt") or "").lower()
                        is_ready = im.evaluate("(el) => el.complete && el.naturalWidth >= 400 && el.naturalHeight >= 400 && !el.src.includes('avatar')")
                        if is_ready:
                            if any(k in src.lower() for k in ["backend-api", "oaiusercontent", "oaidalle", "blob:"]) or any(k in alt for k in ["dall", "generated"]):
                                valid_imgs.append(im)
                    except Exception:
                        pass

                if valid_imgs:
                    target_img = valid_imgs[-1]
                    raw_size = download_raw_image(page, target_img, target_file)
                    if raw_size and raw_size > 50000:
                        print(f"🎉 SUKSES! Gambar asli disimpan: {fname} ({raw_size:,} bytes - MURNI TANPA KOMPRESI)")
                        completed.add(fname)
                        progress["completed"] = list(completed)
                        save_progress(progress)
                        saved = True
                        break

            if not saved:
                print(f"[!] Gagal mendapatkan gambar untuk {slug}, lanjut ke berikutnya...")

            # Jeda sopan antar generasi
            page.wait_for_timeout(5000)

        context.close()
        print("\n🎉 Selesai memproses batch!")

if __name__ == "__main__":
    run_batch()
