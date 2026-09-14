import fs from 'fs';
import dotenv from 'dotenv';

const envConfig = dotenv.parse(fs.readFileSync('.env'));

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || envConfig.CLOUDFLARE_ACCOUNT_ID;
const projectName = 'eka-portfolio';
const apiToken = process.env.CLOUDFLARE_API_TOKEN || envConfig.CLOUDFLARE_API_TOKEN;

async function syncEnv() {
  if (!apiToken || !accountId) {
    console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in environment');
    return;
  }

  const currentProject = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`, {
    headers: { Authorization: `Bearer ${apiToken}` }
  }).then(r => r.json());

  if (!currentProject.success) {
    console.error('Failed to get project:', currentProject.errors);
    return;
  }

  const existingProdVars = currentProject.result.deployment_configs?.production?.env_vars || {};
  const existingPreviewVars = currentProject.result.deployment_configs?.preview?.env_vars || {};

  const mergedProdVars = { ...existingProdVars };
  const mergedPreviewVars = { ...existingPreviewVars };

  for (const [key, val] of Object.entries(envConfig)) {
    if (!val) continue;
    const isSecret = ['DATABASE_URL', 'JWT_SECRET', 'GITHUB_TOKEN', 'CLOUDFLARE_API_TOKEN', 'AI_API_KEY', 'AI_GATEWAY_API_KEY'].includes(key);
    mergedProdVars[key] = {
      type: isSecret ? 'secret_text' : 'plain_text',
      value: val
    };
    mergedPreviewVars[key] = {
      type: isSecret ? 'secret_text' : 'plain_text',
      value: val
    };
  }

  mergedProdVars['NPM_FLAGS'] = { type: 'plain_text', value: '--include=dev' };
  mergedPreviewVars['NPM_FLAGS'] = { type: 'plain_text', value: '--include=dev' };

  const patchBody = {
    deployment_configs: {
      production: {
        env_vars: mergedProdVars,
        compatibility_date: '2024-09-23',
        compatibility_flags: ['nodejs_compat']
      },
      preview: {
        env_vars: mergedPreviewVars,
        compatibility_date: '2024-09-23',
        compatibility_flags: ['nodejs_compat']
      }
    }
  };

  const patchRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patchBody)
  }).then(r => r.json());

  console.log('PATCH result success:', patchRes.success);
  if (!patchRes.success) {
    console.error('PATCH errors:', patchRes.errors);
  } else {
    console.log('Synchronized env vars count (production):', Object.keys(mergedProdVars).length);
  }
}

syncEnv();
