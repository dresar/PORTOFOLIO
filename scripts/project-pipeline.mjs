import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { chromium } from 'playwright';

dotenv.config();

const execAsync = promisify(exec);

const GITHUB_CLONE_TOKEN = process.env.GITHUB_CLONE_TOKEN || '';
const GITHUB_ASSETS_TOKEN = process.env.GITHUB_TOKEN || '';
const ASSETS_REPO = process.env.GITHUB_REPO || 'ekasyarifmaulana10-crypto/PORTOFOLIO-assets';
const ASSETS_BRANCH = process.env.GITHUB_BRANCH || 'main';

const TEMP_BASE = path.join(process.env.TEMP || 'C:\\Temp', 'portfolio_runner_' + Date.now());

async function uploadToCdn(filename, buffer) {
  const base64Content = buffer.toString('base64');
  const targetPath = 'public/uploads/' + filename;

  let sha = undefined;
  try {
    const chk = await fetch(`https://api.github.com/repos/${ASSETS_REPO}/contents/${targetPath}?ref=${ASSETS_BRANCH}`, {
      headers: {
        'Authorization': 'Bearer ' + GITHUB_ASSETS_TOKEN,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-App'
      }
    });
    if (chk.ok) {
      const data = await chk.json();
      sha = data.sha;
    }
  } catch {}

  const payload = {
    message: 'upload project screenshot: ' + filename,
    content: base64Content,
    branch: ASSETS_BRANCH
  };
  if (sha) payload.sha = sha;

  const res = await fetch(`https://api.github.com/repos/${ASSETS_REPO}/contents/${targetPath}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + GITHUB_ASSETS_TOKEN,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Portfolio-App'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload to CDN failed (${res.status}): ${errText}`);
  }

  return `https://cdn.jsdelivr.net/gh/${ASSETS_REPO}@${ASSETS_BRANCH}/public/uploads/${filename}`;
}

function normalizeRepoUrl(repoUrl) {
  if (!repoUrl) return null;
  let clean = repoUrl.trim().replace(/\/+$/, '');
  if (!clean.endsWith('.git')) clean += '.git';
  const match = clean.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return clean;
  return `https://${GITHUB_CLONE_TOKEN}@github.com/${match[1]}/${match[2]}`;
}

function cleanDescription(text) {
  if (!text) return '';
  return text
    .replace(/[#*`_\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function processProject(project, pool) {
  const slug = project.slug || `project-${project.id}`;
  const projectDir = path.join(TEMP_BASE, slug);

  console.log(`\n========================================`);
  console.log(`[START] Processing Project ID: ${project.id} - ${project.title}`);
  console.log(`Repo: ${project.repoUrl}`);
  console.log(`Demo: ${project.demoUrl}`);

  let serverProcess = null;
  let targetUrl = null;
  let readmeContent = '';

  try {
    fs.mkdirSync(TEMP_BASE, { recursive: true });

    if (project.repoUrl && project.repoUrl.includes('github.com')) {
      const authCloneUrl = normalizeRepoUrl(project.repoUrl);
      console.log(`[GIT] Cloning repository...`);
      try {
        await execAsync(`git clone --depth 1 ${authCloneUrl} "${projectDir}"`, { timeout: 45000 });
        console.log(`[GIT] Successfully cloned to ${projectDir}`);

        const readmeFiles = ['README.md', 'readme.md', 'Readme.md'];
        for (const rf of readmeFiles) {
          const rPath = path.join(projectDir, rf);
          if (fs.existsSync(rPath)) {
            readmeContent = fs.readFileSync(rPath, 'utf8');
            break;
          }
        }
      } catch (err) {
        console.warn(`[GIT] Clone warning/error: ${err.message}. Will try demoUrl if available.`);
      }
    }

    const pkgPath = path.join(projectDir, 'package.json');
    const indexHtmlPath = path.join(projectDir, 'index.html');
    const port = 5200 + (project.id % 50);

    if (fs.existsSync(pkgPath)) {
      console.log(`[NPM] package.json detected. Checking scripts...`);
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const scripts = pkg.scripts || {};

        console.log(`[NPM] Installing dependencies (prefer-offline)...`);
        await execAsync(`npm install --legacy-peer-deps --prefer-offline --no-audit --no-fund`, {
          cwd: projectDir,
          timeout: 60000
        });

        if (scripts.dev) {
          console.log(`[SERVER] Starting dev server on port ${port}...`);
          serverProcess = spawn('npx', ['vite', '--port', String(port), '--host'], {
            cwd: projectDir,
            shell: true,
            stdio: 'pipe'
          });
          targetUrl = `http://localhost:${port}`;
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else if (scripts.start) {
          serverProcess = spawn('npm', ['start'], {
            cwd: projectDir,
            shell: true,
            stdio: 'pipe',
            env: { ...process.env, PORT: String(port) }
          });
          targetUrl = `http://localhost:${port}`;
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
      } catch (e) {
        console.warn(`[NPM] Build/dev error: ${e.message}`);
      }
    }

    if (!targetUrl && fs.existsSync(indexHtmlPath)) {
      console.log(`[SERVER] Serving static HTML files via npx serve on port ${port}...`);
      serverProcess = spawn('npx', ['serve', projectDir, '-l', String(port), '--no-request-logging'], {
        shell: true,
        stdio: 'pipe'
      });
      targetUrl = `http://localhost:${port}`;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (!targetUrl && project.demoUrl && project.demoUrl.startsWith('http')) {
      console.log(`[TARGET] Using live demoUrl: ${project.demoUrl}`);
      targetUrl = project.demoUrl;
    }

    if (!targetUrl) {
      throw new Error(`No runnable web server or live demo URL found for project ${project.id}`);
    }

    console.log(`[PLAYWRIGHT] Capturing screenshots from: ${targetUrl}...`);
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let coverWebpBuffer = null;
    let previewWebpBuffer = null;

    try {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1.5,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      });

      const page = await context.newPage();
      try {
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 20000 });
      } catch {
        console.log(`[PLAYWRIGHT] Networkidle timeout, proceeding with domcontentloaded...`);
      }

      await page.waitForTimeout(2500);

      const coverPngBuffer = await page.screenshot({ fullPage: false, type: 'png' });
      coverWebpBuffer = await sharp(coverPngBuffer)
        .webp({ quality: 88, effort: 4 })
        .toBuffer();

      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(1000);
      const previewPngBuffer = await page.screenshot({ fullPage: false, type: 'png' });
      previewWebpBuffer = await sharp(previewPngBuffer)
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      console.log(`[PLAYWRIGHT] Screenshots captured and compressed to WebP successfully!`);
    } finally {
      await browser.close();
    }

    if (serverProcess) {
      try {
        serverProcess.kill('SIGTERM');
      } catch {}
    }

    const timestamp = Date.now();
    const coverFilename = `project_${slug}_${timestamp}_cover.webp`;
    const previewFilename = `project_${slug}_${timestamp}_gallery.webp`;

    console.log(`[CDN] Uploading cover image: ${coverFilename}...`);
    const coverCdnUrl = await uploadToCdn(coverFilename, coverWebpBuffer);
    console.log(`[CDN] Cover uploaded: ${coverCdnUrl}`);

    console.log(`[CDN] Uploading gallery image: ${previewFilename}...`);
    const previewCdnUrl = await uploadToCdn(previewFilename, previewWebpBuffer);
    console.log(`[CDN] Gallery uploaded: ${previewCdnUrl}`);

    let updateFields = [`"coverImage" = $1`, `gallery = $2`, `"updatedAt" = NOW()`];
    let values = [coverCdnUrl, JSON.stringify([coverCdnUrl, previewCdnUrl])];
    let valIdx = 3;

    if (project.title === 'Automated backup of local coding project' && readmeContent) {
      const firstHeadingMatch = readmeContent.match(/^#\s+(.+)$/m);
      if (firstHeadingMatch && firstHeadingMatch[1]) {
        const extractedTitle = cleanDescription(firstHeadingMatch[1]);
        if (extractedTitle && extractedTitle.length > 3 && extractedTitle.length < 100) {
          updateFields.push(`title = $${valIdx++}`);
          values.push(extractedTitle);
          console.log(`[DB] Upgraded title to: "${extractedTitle}"`);
        }
      }

      const descMatch = readmeContent.match(/(?:^#.+?\n\n)([^#\n].+?)(?:\n\n|$)/s);
      if (descMatch && descMatch[1]) {
        const extractedDesc = cleanDescription(descMatch[1]);
        if (extractedDesc && extractedDesc.length > 15) {
          updateFields.push(`description = $${valIdx++}`);
          values.push(extractedDesc.slice(0, 300));
          console.log(`[DB] Upgraded description to: "${extractedDesc.slice(0, 80)}..."`);
        }
      }
    }

    values.push(project.id);
    const updateSql = `UPDATE project SET ${updateFields.join(', ')} WHERE id = $${valIdx}`;
    await pool.query(updateSql, values);
    console.log(`[DB] Successfully updated project ID ${project.id} in Neon database!`);

    return {
      id: project.id,
      title: project.title,
      coverCdnUrl,
      previewCdnUrl,
      status: 'SUCCESS'
    };
  } finally {
    if (serverProcess) {
      try {
        serverProcess.kill('SIGTERM');
      } catch {}
    }
    if (fs.existsSync(projectDir)) {
      console.log(`[CLEANUP] Removing local project directory ${projectDir}...`);
      try {
        fs.rmSync(projectDir, { recursive: true, force: true });
        console.log(`[CLEANUP] Done.`);
      } catch (err) {
        console.warn(`[CLEANUP] Warning: ${err.message}`);
      }
    }
  }
}
