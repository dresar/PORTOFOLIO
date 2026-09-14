<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="id">
      <head>
        <title>XML Sitemap | Eka Syarif Maulana, S.Kom</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style type="text/css">
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #07090e;
            color: #e2e8f0;
            padding: 30px 20px;
            line-height: 1.5;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
          }
          .header {
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid #1e293b;
          }
          .badge {
            display: inline-block;
            background: rgba(6, 182, 212, 0.12);
            color: #06b6d4;
            border: 1px solid rgba(6, 182, 212, 0.3);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 4px 10px;
            border-radius: 6px;
            margin-bottom: 12px;
          }
          h1 {
            font-size: 24px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
          }
          p.desc {
            font-size: 13px;
            color: #94a3b8;
            max-width: 750px;
          }
          .stats {
            display: inline-flex;
            gap: 16px;
            margin-top: 14px;
            font-size: 12px;
            color: #cbd5e1;
          }
          .stats-item strong {
            color: #38bdf8;
          }
          .table-wrapper {
            background: #0f1422;
            border: 1px solid #1e293b;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 13px;
          }
          th {
            background: #151b2e;
            color: #94a3b8;
            font-weight: 600;
            padding: 12px 16px;
            border-bottom: 1px solid #1e293b;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
          }
          td {
            padding: 11px 16px;
            border-bottom: 1px solid #141b2d;
            vertical-align: middle;
          }
          tr:hover td {
            background: rgba(255, 255, 255, 0.02);
          }
          tr:last-child td {
            border-bottom: none;
          }
          a {
            color: #38bdf8;
            text-decoration: none;
            word-break: break-all;
            transition: color 0.15s ease;
          }
          a:hover {
            color: #7dd3fc;
            text-decoration: underline;
          }
          .priority-tag {
            display: inline-block;
            font-weight: 700;
            font-size: 11px;
            padding: 2px 7px;
            border-radius: 4px;
            background: #1e293b;
            color: #f1f5f9;
          }
          .priority-1 {
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
          .priority-high {
            background: rgba(6, 182, 212, 0.15);
            color: #38bdf8;
            border: 1px solid rgba(6, 182, 212, 0.3);
          }
          .freq-tag {
            font-size: 11px;
            color: #94a3b8;
            text-transform: capitalize;
          }
          .footer {
            margin-top: 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
          .footer a {
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Official XML Sitemap</span>
            <h1>Eka Syarif Maulana, S.Kom — Index Peta Situs</h1>
            <p class="desc">
              Peta situs XML resmi untuk mesin pencari (Google, Bing) dan web crawler. Dokumen ini terformat secara terstruktur agar mudah diindeks secara otomatis.
            </p>
            <div class="stats">
              <span class="stats-item">Total URL: <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong></span>
              <span class="stats-item">Domain: <strong>https://ekasyarif.my.id</strong></span>
            </div>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Halaman / URL</th>
                  <th style="width: 110px;">Prioritas</th>
                  <th style="width: 120px;">Frekuensi</th>
                  <th style="width: 130px;">Terakhir Diubah</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td style="color: #64748b; font-size: 11px;">
                      <xsl:value-of select="position()"/>
                    </td>
                    <td>
                      <xsl:variable name="itemURL">
                        <xsl:value-of select="sitemap:loc"/>
                      </xsl:variable>
                      <a href="{$itemURL}" target="_blank">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td>
                      <xsl:variable name="pVal" select="sitemap:priority"/>
                      <span>
                        <xsl:attribute name="class">
                          <xsl:choose>
                            <xsl:when test="$pVal = '1.0'">priority-tag priority-1</xsl:when>
                            <xsl:otherwise>priority-tag priority-high</xsl:otherwise>
                          </xsl:choose>
                        </xsl:attribute>
                        <xsl:value-of select="sitemap:priority"/>
                      </span>
                    </td>
                    <td>
                      <span class="freq-tag">
                        <xsl:value-of select="sitemap:changefreq"/>
                      </span>
                    </td>
                    <td style="color: #94a3b8; font-size: 12px;">
                      <xsl:value-of select="sitemap:lastmod"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>© 2026 Eka Syarif Maulana, S.Kom. Hak cipta dilindungi undang-undang. Kembali ke <a href="https://ekasyarif.my.id">Beranda Portofolio</a></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
