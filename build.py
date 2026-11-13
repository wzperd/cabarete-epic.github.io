#!/usr/bin/env python3
"""Genera el tema de WordPress y la vista previa a partir de los archivos de src/."""
import base64, os, re, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
THEME = os.path.join(ROOT, "theme", "cabarete-epic")
OUT = os.path.join(ROOT, "out")
os.makedirs(OUT, exist_ok=True)

def rd(p, enc="utf8"):
    with open(p, encoding=enc) as f:
        return f.read()

def wr(p, s):
    with open(p, "w", encoding="utf8") as f:
        f.write(s)

nav, main, foot = rd(f"{SRC}/nav.html"), rd(f"{SRC}/main.html"), rd(f"{SRC}/footer.html")
css, js = rd(f"{SRC}/main.css"), rd(f"{SRC}/main.js")
bs_css = rd(f"{THEME}/assets/css/bootstrap.min.css")
bs_js = rd(f"{THEME}/assets/js/bootstrap.bundle.min.js")
FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600&display=swap"

# ---- archivos de assets del tema ----
wr(f"{THEME}/assets/css/main.css", css)
wr(f"{THEME}/assets/js/main.js", js)

# ---- sustituciones ----
_b64 = {}
def data_uri(name):
    if name not in _b64:
        with open(f"{THEME}/assets/img/{name}.jpg", "rb") as f:
            _b64[name] = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()
    return _b64[name]

def render(html, mode):
    if mode == "wp":
        html = re.sub(r"\{\{img:(\w+)\}\}", lambda m: f"<?php echo esc_url( cab_img( '{m.group(1)}' ) ); ?>", html)
        html = html.replace("{{HOME}}", "<?php echo esc_url( home_url( '/' ) ); ?>")
        html = html.replace("{{YEAR}}", "<?php echo esc_html( gmdate( 'Y' ) ); ?>")
        html = html.replace("{{FORM_OPEN}}", '<form class="cab-form" method="post" action="<?php echo esc_url( admin_url( \'admin-post.php\' ) ); ?>" novalidate>\n          <input type="hidden" name="action" value="cab_contact">')
        html = html.replace("{{FORM_NONCE}}", "<?php wp_nonce_field( 'cab_contact', 'cab_nonce' ); ?>")
        html = html.replace("{{FORM_STATUS}}", "<?php echo cab_form_notice(); // phpcs:ignore WordPress.Security.EscapeOutput ?>")
    else:
        html = re.sub(r"\{\{img:(\w+)\}\}", lambda m: data_uri(m.group(1)), html)
        html = html.replace("{{HOME}}", "")
        html = html.replace("{{YEAR}}", "2026")
        html = html.replace("{{FORM_OPEN}}", '<form class="cab-form" method="post" action="#" data-preview novalidate>')
        html = html.replace("{{FORM_NONCE}}", "")
        html = html.replace("{{FORM_STATUS}}", "")
    return html

# ---- tema de WordPress ----
header_php = """<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#03121A">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div class="cab-app" data-bs-theme="dark">
""" + render(nav, "wp")

footer_php = render(foot, "wp") + """
</div><!-- .cab-app -->
<?php wp_footer(); ?>
</body>
</html>
"""

front_php = """<?php
/**
 * Portada de Cabarete Épico.
 * Los textos están en esta plantilla; las imágenes se cambian en Apariencia > Personalizar.
 *
 * @package cabarete-epic
 */

get_header();
?>
""" + render(main, "wp") + """
<?php
get_footer();
"""

wr(f"{THEME}/header.php", header_php)
wr(f"{THEME}/footer.php", footer_php)
wr(f"{THEME}/front-page.php", front_php)

# ---- vista previa para el artifact (Bootstrap CSS en línea; JS desde cdnjs) ----
bs_css_clean = re.sub(r"@charset\s+\"UTF-8\";", "", bs_css)
bs_css_clean = re.sub(r"/\*#\s*sourceMappingURL=.*?\*/", "", bs_css_clean)
body = '<div class="cab-app" data-bs-theme="dark">\n' + render(nav, "preview") + render(main, "preview") + render(foot, "preview") + "\n</div>\n"

preview = (
    "<title>Guía de Cabarete</title>\n"
    '<meta name="claude:viewport-fit-sides" content="cover">\n'
    f'<link rel="stylesheet" href="{FONTS}">\n'
    "<style>\n" + bs_css_clean + "\n" + css + "\n</style>\n"
    + body +
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"></script>\n'
    "<script>\n" + js + "\n</script>\n"
)
wr(f"{OUT}/cabarete-epic-preview.html", preview)

# ---- variante de prueba local (Bootstrap JS en línea, sin red) ----
test = (
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    "<style>\n" + bs_css_clean + "\n" + css + "\n</style></head><body>\n" + body +
    "<script>\n" + bs_js + "\n</script>\n<script>\n" + js + "\n</script></body></html>\n"
)
wr(f"{OUT}/test-local.html", test)

print("preview KB:", os.path.getsize(f"{OUT}/cabarete-epic-preview.html") // 1024)
print("tokens sin resolver:", re.findall(r"\{\{[^}]+\}\}", preview + header_php + footer_php + front_php))
