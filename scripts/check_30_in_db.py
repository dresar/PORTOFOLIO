import urllib.request, json
req = urllib.request.Request('https://ekasyarif.my.id/api/projects?limit=150', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    with open('scripts/30_projects.json') as f:
        targets = json.load(f)
    slugs = {p['slug'] for p in targets}
    found = [p for p in data if p.get('slug') in slugs]
    print('Found targets in API:', len(found))
    for p in found:
        print('id=' + str(p.get('id')) + ' slug=' + str(p.get('slug')) + ' order=' + str(p.get('order')) + ' cover=' + str(p.get('coverImage')))