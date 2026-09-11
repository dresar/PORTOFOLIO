import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_PROFILE_DIR = os.path.expandvars(r"%LOCALAPPDATA%\hermes\browser_profiles")
profile_dir = os.path.join(BASE_PROFILE_DIR, "dian")

def solve_turnstile():
    print(f"[*] Solving Cloudflare challenge for profile 'dian'...")
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            channel="chrome",
            headless=False,
            args=[
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-blink-features=AutomationControlled",
                "--window-size=1280,900"
            ],
            ignore_default_args=["--enable-automation"]
        )
        page = context.pages[0] if context.pages else context.new_page()
        try:
            print("[*] Opening https://chatgpt.com ...")
            page.goto("https://chatgpt.com", wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(3000)

            for attempt in range(10):
                title = page.title()
                print(f"[{attempt+1}/10] Page title: '{title}', URL: {page.url}")

                if page.locator('#prompt-textarea').count() > 0:
                    print("🎉 SUCCESS: ChatGPT prompt textarea is visible! Cloudflare solved!")
                    break

                # Check if Cloudflare turnstile is present
                cf_found = False
                for f in page.frames:
                    if "cloudflare" in f.url or "challenges" in f.url:
                        print(f"[!] Cloudflare challenge frame found: {f.url}")
                        box = f.locator('input[type="checkbox"], .ctp-checkbox-label, #challenge-stage, span.mark').first
                        if box.count() > 0:
                            print("[*] Clicking Cloudflare Turnstile checkbox inside frame...")
                            box.click(delay=150)
                            cf_found = True
                            page.wait_for_timeout(4000)
                            break
                
                if not cf_found:
                    # Try clicking the coordinates of the Turnstile checkbox on main page
                    # In 1280x900, the Turnstile widget is around x=400, y=420 or center
                    print("[*] Trying mouse click at Turnstile checkbox position...")
                    page.mouse.click(400, 424, delay=100)
                    page.wait_for_timeout(3000)

            # Final check and screenshot
            page.wait_for_timeout(3000)
            screenshot_path = os.path.abspath("dian_solved_screenshot.png")
            page.screenshot(path=screenshot_path)
            print(f"[✓] Final screenshot saved to: {screenshot_path}")

            if page.locator('#prompt-textarea').count() > 0:
                print("✅ Akun dian berhasil melewati Cloudflare dan siap digunakan!")
            else:
                print(f"[-] Status saat ini: Title='{page.title()}', URL='{page.url}'")

        except Exception as e:
            print(f"[X] Error: {e}")
        finally:
            context.close()

if __name__ == "__main__":
    solve_turnstile()
