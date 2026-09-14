import dotenv from 'dotenv';
import fs from 'fs';

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const zoneId = '5e926b7c99c7e83bea1ffe78ed7d1a82';
const apiToken = process.env.CLOUDFLARE_API_TOKEN || envConfig.CLOUDFLARE_API_TOKEN;
const rulesetId = 'ff894b1ee921418ab7a14ad5538f9664';
const ruleId = '9bfd257e134f46b69eb44e6644a41310';

const newExpr = 'cf.threat_score > 10 and not cf.client.bot and not (http.request.uri.path in {"/sitemap.xml" "/robots.txt" "/llms.txt" "/google0e7f4f807a599919.html"})';

async function updateRule() {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/${rulesetId}/rules/${ruleId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'managed_challenge',
      description: 'Blokir Ancaman Tinggi / Bot Nakal (Bypass Googlebot & Sitemap)',
      enabled: true,
      expression: newExpr
    })
  }).then(r => r.json());

  console.log('Update WAF rule success:', res.success);
  if (!res.success) {
    console.error('Errors:', res.errors);
  }
}

updateRule();
