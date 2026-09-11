import os
import sys
from playwright.sync_api import sync_playwright

BASE_PROFILE_DIR = os.path.expandvars(r"%LOCALAPPDATA%\hermes\browser_profiles")
profile_dir = os.path.join(BASE_PROFILE_DIR, "dian")

def check_dian():
    print(f"[*] Checking profile 'dian' at: {profile_dir}")
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            channel="chrome",
            headless=True,
            args=[
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-extensions",
                "--window-size=1280,800"
            ]
        )
        page = context.pages[0] if context.pages else context.new_page()
        try:
            print("[*] Navigating to https://chatgpt.com ...")
            page.goto("https://chatgpt.com", wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(4000)
            
            title = page.title()
            url = page.url
            print(f"[✓] Page Title: {title}")
            print(f"[✓] Current URL: {url}")
            
            # Check login state
            login_btn = page.locator('button:has-text("Log in"), a:has-text("Log in")').count()
            prompt_box = page.locator('#prompt-textarea').count()
            
            print(f"[+] Login button count: {login_btn}")
            print(f"[+] Prompt textarea count: {prompt_box}")
            
            # Take screenshot
            screenshot_path = os.path.abspath("dian_debug_screenshot.png")
            page.screenshot(path=screenshot_path)
            print(f"[✓] Screenshot saved to: {screenshot_path}")
            
            # Check user info or modal
            modals = page.locator('div[role="dialog"]').all_inner_texts()
            if modals:
                print(f"[!] Modals found: {modals}")
            
        except Exception as e:
            print(f"[X] Error checking dian: {e}")
        finally:
            context.close()

if __name__ == "__main__":
    check_dian()
