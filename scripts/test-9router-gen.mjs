import fs from 'fs';

async function testGen() {
  const prompt = `Buatlah konten artikel edukasi teknologi dan keamanan siber yang SUPER LENGKAP, MENDALAM, DAN DETAIL dalam format HTML siap render (tanpa tag html/body/head, hanya konten semantik HTML di dalam <div class="blog-rich-content space-y-8">) untuk topik: 'Bahaya Juice Jacking di Port USB Publik'.
Syarat Mutlak:
1. Penulis WAJIB: Eka Syarif Maulana, S.Kom (Senior Fullstack Web & Mobile Developer & AI Systems Engineer, Sarjana Komputer UMSU). DILARANG MENYEBUT Founder Inka.tech!
2. JANGAN sertakan tag <img> slide di dalam teks (karena slide sudah ada di player khusus samping/atas).
3. Struktur konten:
   - Header & Direct Answer Box untuk AI-SEO
   - Penjelasan teknis mendalam (Arsitektur USB pinout, VBUS, D+, D-, protokol MTP, ADB, HID attack)
   - Skenario serangan nyata & payload hardware (misal O.MG Cable, Raspberry Pi Zero)
   - Tabel perbandingan risiko & proteksi
   - Panduan mitigasi langkah-demi-langkah (USB data blocker, power bank mandiri, OS lockdown)
   - Checklist keamanan harian
   - FAQ teknis (minimal 4 pertanyaan)
   - Kotak profil penulis Eka Syarif Maulana, S.Kom
4. Gunakan class Tailwind modern: rounded-2xl, border border-border/60, bg-card, p-6, shadow-xs, badge, dll.
5. Kembalikan HANYA kode HTML mentah di dalam tag (tanpa markdown backticks \`\`\`html).`;

  try {
    const res = await fetch('https://9router.serverinka.cloud/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-7016dd129191d903-u8emvi-c0b721b9'
      },
      body: JSON.stringify({
        model: 'gemini/gemini-3.6-flash',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const text = await res.text();
    const lines = text.split('\n');
    let full = '';
    for (const line of lines) {
      if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
        try {
          const json = JSON.parse(line.slice(6));
          full += json.choices?.[0]?.delta?.content || '';
        } catch {}
      }
    }
    console.log('Generated length:', full.length);
    console.log('Preview first 400 chars:\n', full.slice(0, 400));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testGen();
