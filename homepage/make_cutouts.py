"""Make transparent cutouts of listing cars for the homepage hero carousel.

For every featured car (featured, not sold, published) this picks one of its uploaded photos that shows the whole car
(the front three-quarter view, as on the other cars, when there is a clean one), removes the background with a segmentation model (rembg + BiRefNet) run on the
full-resolution original, keeps the model's soft edge, checks that the whole car survived, and gives every car the same
restrained treatment: neutral white balance, the same exposure range, softened glare and one soft contact shadow under
the tyres. Paint colour is kept: no tints, no saturation changes.

When no photo gives a clean, complete cutout (car cut off by the photo frame, parts missing, ragged edge), the car gets a
"panel" instead: its own photo, cropped to a 3:2 frame around the whole car and lightly balanced. The page shows every
panel in the same framed style. A car is never shown as a damaged cutout.

Your own cutout wins: when a featured listing has a clean-background image of its own (the listing's "heroImage" field,
set by the upload form, or a file dropped in <out>/manual/<listing id>.png or .webp), that image is used instead of the
tool's. Its pixels are kept exactly as they are; it only gets the same crop, margins and contact shadow as every other
car. It must have a transparent background (PNG or WebP with alpha); if it has none, the tool says so and falls back to
its own cutout.

Results are cached: a car is processed again only when its photos or its own cutout change. The original photos are
never modified.

From the project folder:

    python homepage/make_cutouts.py --api https://www.kamimotorsgroup.com/api/cars --out public/cutouts
    python homepage/make_cutouts.py --api https://www.kamimotorsgroup.com/api/cars --out public/cutouts --only <id>
    python homepage/make_cutouts.py --api https://www.kamimotorsgroup.com/api/cars --out public/cutouts --regrade

(--only redoes one car; --regrade redoes the finish only and reuses the cached masks.) Run it after a featured car is
added or its photos change, then commit and push public/cutouts and public/cutouts.js. Until a car has been processed
the homepage shows its own photo in a framed panel.
Writes:
    <out>/<listing id>.webp        the cutout, or the framed photo for a panel
    <out>/manifest.json            {id: {status: "ready" | "panel", src, w, h, from, photo, model, made, v[, own, reason]}}
    <out>/.work/                   downloaded photos and soft masks, so re-grading does not re-run the model
    <out>/../cutouts.js            the same manifest as window.KM_CUTOUTS, for pages that load it with a script tag

Needs: pip install "rembg[cpu]" pillow numpy scipy. The first run downloads the model weights
(birefnet-general, about 970 MB) into $U2NET_HOME (default ~/.u2net). Each photo takes about 10 s on a laptop CPU.
"""
import argparse, datetime, hashlib, io, json, os, sys, urllib.request

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

VERSION = 4               # bump when the look changes; older results are then redone
MAX_CANDIDATES = 6        # how many of a listing's photos to try, in listing order
MAX_SIDE = 2400           # only larger photos are scaled down before segmentation
OUT_WIDTH = 1400          # widest image we store
SIDE_VIEW = 2.25          # car width / height at or above this is a side view; below, a three-quarter (or nose-on) one
NOSE_ON = .9              # silhouette this mirror-symmetric: a head-on or straight-from-behind photo
HERO_FIELD = 'heroImage'  # listing field holding the owner's own clean-background image (URL)
PANEL_AR = 3 / 2          # fallback photo panels all get this shape

INK = np.array([29, 26, 20]) / 255          # --ink, the shadow colour

lum = lambda x: x[..., 0] * .2126 + x[..., 1] * .7152 + x[..., 2] * .0722   # not @: Accelerate's matmul misfires here


def load_rows(args):
    if args.api:
        req = urllib.request.Request(args.api, headers={'User-Agent': 'kami-cutouts/3'})
        return json.load(urllib.request.urlopen(req, timeout=60))
    text = open(args.snapshot, encoding='utf-8').read()
    return json.loads(text[text.index('{', text.index('KM_INVENTORY')):text.rstrip().rstrip(';').rindex('}') + 1])['rows']


def listed(r):
    return r.get('id') and r.get('status') != 'sold' and r.get('published') not in (False, 'false')


def featured(r):
    return r.get('featured') in (True, 'true')


def fetch_bytes(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 kami-cutouts/4'})
    return urllib.request.urlopen(req, timeout=60).read()


def fetch(url):
    im = Image.open(io.BytesIO(fetch_bytes(url))).convert('RGB')
    if max(im.size) > MAX_SIDE:
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    return im


def photo_and_mask(url, work, model, segment):
    """The photo and the model's soft mask (0-255), cached on disk (lossless) per photo and model."""
    key = hashlib.sha1(url.encode()).hexdigest()[:16]
    pp, mp = os.path.join(work, f'{key}.png'), os.path.join(work, f'{key}-{model}.png')
    if os.path.exists(pp) and os.path.exists(mp):
        return Image.open(pp).convert('RGB'), np.asarray(Image.open(mp).convert('L'))
    img = Image.open(pp).convert('RGB') if os.path.exists(pp) else fetch(url)
    if segment is None:
        raise RuntimeError('no cached mask for this photo; run without --regrade')
    soft = np.asarray(segment(img).convert('L'))
    img.save(pp); Image.fromarray(soft).save(mp)
    return img, soft


def car_region(soft):
    """Which part of the mask is the car: the largest solid region plus anything big touching it. Thin things the
    model sometimes keeps (light poles, sign posts behind the roof) are dropped, unless they stay close to the body
    (antennas, mirror stalks, roof-rack bars)."""
    m = soft > 127
    lab, n = ndi.label(m)
    if not n:
        return None
    sizes = ndi.sum(m, lab, range(1, n + 1))
    m = np.isin(lab, np.where(sizes >= max(sizes.max() * .02, 50))[0] + 1)
    disk = ndi.generate_binary_structure(2, 1)
    body = ndi.binary_opening(m, structure=disk, iterations=4)
    bl, bn = ndi.label(body)
    if not bn:
        return m
    bs = ndi.sum(body, bl, range(1, bn + 1))
    body = np.isin(bl, np.where(bs >= bs.max() * .02)[0] + 1)
    near = ndi.binary_dilation(body, structure=disk, iterations=5)
    ys, xs = np.where(body)
    bh, bw = ys.max() - ys.min() + 1, xs.max() - xs.min() + 1
    box = (ys.min() - .08 * bh, ys.max() + .02 * bh, xs.min() - .03 * bw, xs.max() + .03 * bw)
    thin = m & ~near
    tl, tn = ndi.label(thin)
    for i, sl in enumerate(ndi.find_objects(tl), 1):      # keep a thin part only if all of it is close to the body
        if sl[0].start >= box[0] and sl[0].stop <= box[1] and sl[1].start >= box[2] and sl[1].stop <= box[3]:
            near |= tl == i
    return m & near


def check_frame(m):
    """Reject photos where the car is cut off by the photo frame or too small. Returns (problem, width/height)."""
    h, w = m.shape
    if m.sum() / m.size < .04:
        return 'car too small in photo', 0
    ys, xs = np.where(m)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    aspect = (x1 - x0 + 1) / (y1 - y0 + 1)
    e = max(3, round(min(h, w) * .006))                   # any car pixel this close to an edge: assume it is cut off
    if x0 < e: return 'car cut off on the left', aspect
    if x1 >= w - e: return 'car cut off on the right', aspect
    if y1 >= h - e: return 'car cut off at the bottom', aspect
    if y0 < e: return 'car cut off at the top', aspect
    if not 1.15 <= aspect <= 4.2:
        return 'not a side or three-quarter view', aspect
    return None, aspect


def ground_line(m):
    """The line the tyres stand on: the longest edge of the silhouette's lower hull (in a side or three-quarter view,
    front tyre to rear tyre). Returns y(x) for that line, plus each column's lowest car pixel (-1 where empty)."""
    h, w = m.shape
    has = m.any(0)
    yb = np.where(has, h - 1 - np.argmax(m[::-1], 0), -1)
    cols = np.where(has)[0]
    hull = []
    for p in zip(cols.astype(float), -yb[cols].astype(float)):
        while len(hull) >= 2:
            o, q = hull[-2], hull[-1]
            if (q[0] - o[0]) * (p[1] - o[1]) - (q[1] - o[1]) * (p[0] - o[0]) <= 0: hull.pop()
            else: break
        hull.append(p)
    if len(hull) < 2:
        return (lambda x: np.full(np.shape(x), float(yb[cols].max()))), yb
    i = int(np.argmax(np.diff([p[0] for p in hull])))
    (x0, y0), (x1, y1) = hull[i], hull[i + 1]
    k = (y1 - y0) / (x1 - x0)
    line = lambda x: -(y0 + k * (np.asarray(x, float) - x0))
    line.span = (x0, x1)                                   # the two tyre contacts the line runs between
    return line, yb


def nose_on(m):
    """A photo straight at the nose (or tail) gives a silhouette that is nearly its own mirror image."""
    ys, xs = np.where(m)
    c = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return (c & c[:, ::-1]).sum() / (c | c[:, ::-1]).sum() >= NOSE_ON


def check_car(m, aspect):
    """Is the cutout whole? Holes in the body, a ragged outline, or no tyres on the ground mean something went wrong."""
    filled = ndi.binary_fill_holes(m)
    ys, xs = np.where(filled)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    hc, wc = y1 - y0 + 1, x1 - x0 + 1
    lower = np.zeros_like(m); lower[y0 + int(hc * .45):] = True
    holes = filled & ~m & lower                            # windows sit in the top half; the lower body has none
    hl, hn = ndi.label(holes)
    if hn and ndi.sum(holes, hl, range(1, hn + 1)).max() > filled.sum() * .004:
        return 'part of the body or a wheel is missing'
    edge = lambda b: (b ^ ndi.binary_erosion(b)).sum()
    smooth = ndi.gaussian_filter(filled.astype(np.float32), 4) > .5
    if edge(filled) > edge(smooth) * 1.35:
        return 'ragged outline'
    g, yb = ground_line(filled)
    on = (yb >= 0) & (g(np.arange(m.shape[1])) - yb < hc * .06)
    lab, k = ndi.label(ndi.binary_closing(on, iterations=max(2, int(wc * .015))))
    feet = [s for s in ndi.find_objects(lab) if s[0].stop - s[0].start >= wc * .035]
    if not feet:                                           # in a steep three-quarter view the rear tyre sits higher
        return 'tyres not found on the ground'
    return None


def tyres_in_grass(img, m):
    """Grass in front of the tyres hides their bottoms; a cutout then shows ragged, half-eaten tyres."""
    rgb = np.asarray(img).astype(np.float32)
    g, yb = ground_line(m)
    below = np.zeros_like(m)
    hc = np.ptp(np.where(m.any(1))[0]) + 1
    for x in np.where(yb >= 0)[0][::2]:
        below[yb[x] + 2:yb[x] + 2 + max(3, int(hc * .04)), x] = True
    below &= ~m
    if below.sum() < 50:
        return False
    px = rgb[below]
    return ((px[:, 1] > px[:, 0] * 1.08) & (px[:, 1] > px[:, 2] * 1.08)).mean() > .25


def matte(soft, region):
    """The model's own soft edge, limited to the car region. Pinholes are filled, and the faint outer fringe
    (where the model was unsure and background colour bleeds in) is trimmed."""
    a = soft.astype(np.float32) / 255 * ndi.binary_dilation(region, iterations=2)
    filled = ndi.binary_fill_holes(region) & ~region
    hl, hn = ndi.label(filled)
    if hn:
        hs = ndi.sum(filled, hl, range(1, hn + 1))
        tiny = np.isin(hl, np.where(hs < region.sum() * .002)[0] + 1)   # windows and open roofs stay open
        a[tiny] = 1
    return np.clip((a - .08) / .84, 0, 1)


def decontaminate(rgb, a):
    """Edge pixels are part car, part old background. Take their colour from the nearest solid car pixel,
    so no light or dark halo from the original scene shows against the page."""
    solid = ndi.binary_erosion(a > .96, iterations=1)
    if solid.any():
        _, (iy, ix) = ndi.distance_transform_edt(~solid, return_indices=True)
        edge = (a > 0) & ~solid
        rgb[edge] = rgb[iy[edge], ix[edge]]
    return rgb


def settle_ground(rgb, a, hc):
    """Models often keep a strip of shaded pavement under the bumpers, or grass at the tyres. Right at the ground,
    dark pixels are handed over to the shadow layer (they become soft shadow instead of photo texture).
    Returns the new alpha and the shadow it leaves."""
    h, w = a.shape
    m = a > .5
    g, yb = ground_line(m)
    gy = g(np.arange(w))
    above = (yb[None, :] - np.arange(h)[:, None]).astype(np.float32)          # px above the column's lowest pixel
    band = (yb >= 0)[None, :] & (above >= 0) & (above < hc * .04)
    near = np.clip(1 - (gy - yb) / (hc * .07), 0, 1)[None, :]                 # 1 where that column reaches the ground
    w_band = band * near * np.clip(1 - above / (hc * .04), 0, 1) ** .6
    l = lum(rgb)
    dark = np.clip((.3 - l) / .2, 0, 1)
    hand = np.minimum(w_band * dark, .6)
    shade = ndi.gaussian_filter(a * hand, 2)
    a = a * (1 - hand)
    return a, shade


def soft_blur(x, a, sigma):
    """Blur x using only car pixels (weighted by alpha), so the background never leaks in."""
    w = ndi.gaussian_filter(a, sigma)
    return ndi.gaussian_filter(x * a, sigma) / np.maximum(w, 1e-4)


def house_light(rgb, a, even=True):
    """The same restrained light for every car, whatever the weather and camera were. Works on 0-1 sRGB. Only
    brightness is reshaped; hue and saturation of the paint are left as they are."""
    car = a > .9
    # 1. white balance: neutral parts (tyres, glass, chrome, grey trim) should come out grey
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1e-3)
    l = lum(rgb)
    neutral = car & (sat < .18) & (l > .15) & (l < .9)
    if neutral.sum() > 400:
        means = np.median(rgb[neutral], axis=0)
        rgb = rgb * np.clip(means.mean() / means, .9, 1.12)
    # 2. calm the light: soften big sun patches and deep shade a little, keep reflections and detail
    if even:
        l = np.maximum(lum(rgb), 1e-3)
        base = np.log(np.maximum(soft_blur(l, a, max(rgb.shape[:2]) / 14), 1e-3))
        mean = base[car].mean() if car.any() else base.mean()
        rgb = rgb * np.exp((base - mean) * -.25)[..., None]
    # 3. exposure: the same black point and white point for every car
    l = lum(rgb)
    pick = l[car] if car.sum() > 400 else l.ravel()
    lo, hi = np.percentile(pick, .8), np.percentile(pick, 99.4)
    scale = np.clip((.94 - .035) / max(hi - lo, 1e-3), .9, 1.35)
    l2 = np.maximum((l - lo) * scale + .035, 0)
    # 4. a gentle shoulder for sun glare, on brightness only so colours do not shift
    k = .8
    l2 = np.where(l2 > k, k + (1 - k) * np.tanh((l2 - k) / (1 - k)), l2)
    # scale colour with brightness; near black, add the change instead so tiny colour noise is not blown up
    t = np.clip(l / .08, 0, 1)[..., None]
    rgb = t * rgb * (l2 / np.maximum(l, 1e-4))[..., None] + (1 - t) * (rgb + (l2 - l)[..., None])
    # 5. one light direction for all: a touch brighter on the roof, settling toward the ground
    if even:
        ys = np.where(car.any(1))[0]
        if len(ys):
            t = np.clip((np.arange(rgb.shape[0]) - ys.min()) / max(ys.max() - ys.min(), 1), 0, 1)
            rgb = rgb * (1.02 - .07 * np.clip((t - .5) / .5, 0, 1) ** 1.5)[:, None, None]
    return np.clip(rgb, 0, 1)


def contact_shadow(a, hc):
    """One shadow recipe for every car: a dark, tight contact where each tyre meets the ground, the shade the body
    casts right under its bumpers and sills, and a soft pool along the ground line. The under-body shade is what tells
    the eye the car stands on four wheels when the far-side wheels are hidden behind the body, as they are in any
    three-quarter photo. Same direction (straight down), softness and strength for all, scaled to car height."""
    h, w = a.shape
    m = a > .5
    g, yb = ground_line(m)
    xx = np.arange(w)
    gy = g(xx)
    yy = np.arange(h, dtype=np.float32)[:, None]
    has = yb >= 0
    touch = has * np.exp(-(np.clip(gy - yb, 0, None) / (hc * .03)) ** 2)
    contact = touch[None, :] * np.exp(-((yy - yb[None, :]) / (hc * .014)) ** 2)
    contact = ndi.gaussian_filter(contact, hc * .008)
    cols = np.where(has)[0]
    taper = lambda x0, x1, r: np.clip(np.minimum(xx - x0 + r * .3, x1 - xx + r * .3) / r, 0, 1) ** 2
    cx0, cx1 = cols.min(), cols.max()
    env = taper(cx0, cx1, (cx1 - cx0) * .14)
    sx0, sx1 = getattr(g, 'span', (cx0, cx1))              # the pool runs tyre to tyre, not past the nose or tail
    pool = taper(sx0, sx1, (cx1 - cx0) * .08)[None, :] * np.exp(-((yy - gy[None, :]) / (hc * .02)) ** 2)
    pool = ndi.gaussian_filter(pool, hc * .015)
    below = np.clip(yy - yb[None, :], 0, None)
    under = (has * env)[None, :] * (yy > yb[None, :]) * np.exp(-below / (hc * .03)) * np.exp(-(below / (hc * .07)) ** 2)
    under = ndi.gaussian_filter(under, hc * .01)
    return np.clip(.55 * contact + .34 * under + .16 * pool, 0, .62)


def render(img, soft, region):
    a = matte(soft, region)
    ys, xs = np.where(a > .02)
    rgb = decontaminate(np.asarray(img).astype(np.float32) / 255, a)
    rgb = house_light(rgb, a)
    a, residue = settle_ground(rgb, a, ys.max() - ys.min() + 1)
    return finish(rgb, a, residue, (ys.min(), ys.max() + 1, xs.min(), xs.max() + 1))


def own_cutout(data):
    """The owner's own clean-background image. Returns (image, None), or (None, why it cannot be used).
    Pixels are kept as they are: no re-grading, no re-cutting. Only the shared crop, margins and shadow are added."""
    try:
        im = Image.open(io.BytesIO(data))
        im.load()
    except Exception:
        return None, 'not an image file'
    if im.mode not in ('RGBA', 'LA', 'PA') and 'transparency' not in im.info:
        return None, 'no transparent background (save it as PNG or WebP with transparency)'
    im = im.convert('RGBA')
    if max(im.size) > MAX_SIDE:
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    px = np.asarray(im).astype(np.float32) / 255
    a = px[..., 3]
    rim = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    if (a < .05).mean() < .08 or (rim < .05).mean() < .85:
        return None, 'the background is not transparent'
    m = a > .5
    if not m.any():
        return None, 'the image is empty'
    ys, xs = np.where(a > .02)
    if xs.max() - xs.min() + 1 < 800:
        return None, f'too small ({xs.max() - xs.min() + 1} px across the car; use at least 800 px)'
    return finish(px[..., :3], a, np.zeros_like(a), (ys.min(), ys.max() + 1, xs.min(), xs.max() + 1)), None


def finish(rgb, a, residue, box):
    """Crop to the car, give every car the same breathing room (the shadow lives in the bottom margin) and add the
    shared contact shadow."""
    y0, y1, x0, x1 = box
    hc, wc = y1 - y0, x1 - x0
    pt, pb, px = round(hc * .03), round(hc * .09), round(wc * .04)
    pad = lambda x, mode: np.pad(x[y0:y1, x0:x1], ((pt, pb), (px, px)) + ((0, 0),) * (x.ndim - 2), mode=mode)
    rgb, a, residue = pad(rgb, 'edge'), pad(a, 'constant'), pad(residue, 'constant')
    shade = 1 - (1 - contact_shadow(a, hc)) * (1 - residue)
    out_a = a + shade * (1 - a)
    out_rgb = (rgb * a[..., None] + INK * (shade * (1 - a))[..., None]) / np.maximum(out_a, 1e-4)[..., None]
    out = (np.dstack([out_rgb, out_a]) * 255 + .5).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(out)
    if im.width > OUT_WIDTH:
        im = im.resize((OUT_WIDTH, round(im.height * OUT_WIDTH / im.width)), Image.LANCZOS)
    return im


def panel(img, region):
    """Fallback: the car's own photo in a 3:2 frame around the whole car, with the same white balance and exposure."""
    W, H = img.size
    if region is not None and region.any():
        ys, xs = np.where(region)
        cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
        bw, bh = (xs.max() - xs.min()) * 1.16, (ys.max() - ys.min()) * 1.3
    else:
        cx, cy, bw, bh = W / 2, H / 2, W * .9, H * .6
    bw, bh = max(bw, bh * PANEL_AR), max(bh, bw / PANEL_AR)
    if bw > W: bw, bh = W, W / PANEL_AR
    if bh > H: bw, bh = H * PANEL_AR, H
    left = int(np.clip(cx - bw / 2, 0, W - bw)); top = int(np.clip(cy - bh / 2, 0, H - bh))
    box = (left, top, left + int(bw), top + int(bh))
    rgb = np.asarray(img.crop(box)).astype(np.float32) / 255
    a = np.ones(rgb.shape[:2], np.float32) if region is None else \
        region[box[1]:box[3], box[0]:box[2]].astype(np.float32)
    rgb = house_light(rgb, a if a.sum() > 400 else np.ones_like(a), even=False)
    im = Image.fromarray((rgb * 255 + .5).astype(np.uint8))
    if im.width > OUT_WIDTH:
        im = im.resize((OUT_WIDTH, round(im.height * OUT_WIDTH / im.width)), Image.LANCZOS)
    return im


def main():
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument('--api'); src.add_argument('--snapshot')
    ap.add_argument('--out', required=True)
    ap.add_argument('--model', default='birefnet-general')
    ap.add_argument('--force', action='store_true', help='redo every car, ignoring the cache')
    ap.add_argument('--regrade', action='store_true', help='redo every car from cached masks (no model run)')
    ap.add_argument('--only', help='comma-separated listing ids to (re)do, e.g. right after an upload')
    args = ap.parse_args()

    segment, model = None, {}
    if not args.regrade:
        def segment(img):
            if not model:          # loaded on first use only: a run where every photo is cached never loads it
                from rembg import new_session, remove
                # plain CPU: on Macs onnxruntime otherwise picks CoreML, which takes many minutes to compile this model
                model['remove'] = remove
                model['session'] = new_session(args.model, providers=['CPUExecutionProvider'])
            return model['remove'](img, session=model['session'], only_mask=True, post_process_mask=False)
    os.makedirs(args.out, exist_ok=True)
    work = os.path.join(args.out, '.work'); os.makedirs(work, exist_ok=True)
    man_path = os.path.join(args.out, 'manifest.json')
    manifest = json.load(open(man_path)) if os.path.exists(man_path) else {}
    rows = [r for r in load_rows(args) if listed(r) and featured(r)]      # only featured cars are in the carousel
    live_ids = {r['id'] for r in rows}
    manual_dir = os.path.join(args.out, 'manual')
    if args.only:
        rows = [r for r in rows if r['id'] in args.only.split(',')]
    today = datetime.date.today().isoformat()

    for r in rows:
        cid, photos = r['id'], [u for u in (r.get('images') or []) if isinstance(u, str)][:MAX_CANDIDATES]
        prev = manifest.get(cid)
        # the owner's own cutout: the listing's heroImage, else a file in <out>/manual/
        own, own_src = None, (r.get(HERO_FIELD) or '').strip() or None
        if not own_src:
            own_src = next((f'manual/{cid}.{x}' for x in ('png', 'webp') if os.path.exists(
                os.path.join(manual_dir, f'{cid}.{x}'))), None)
        own_id = None
        if own_src:
            try:
                own = fetch_bytes(own_src) if own_src.startswith('http') else \
                    open(os.path.join(args.out, own_src), 'rb').read()
                own_id = hashlib.sha1(own).hexdigest()[:16]
            except Exception as e:
                print(f'warning {cid}  own image could not be read: {e}', flush=True)
        if prev and prev.get('v') == VERSION and not (args.force or args.regrade) and prev.get('tried') == photos \
                and prev.get('own_id') == own_id and os.path.exists(os.path.join(args.out, f'{cid}.webp')):
            continue
        info = dict(model=args.model, made=today, v=VERSION, tried=photos)
        if own:
            im, why = own_cutout(own)
            if im:
                im.save(os.path.join(args.out, f'{cid}.webp'), 'WEBP', quality=92, method=6)
                manifest[cid] = dict(status='ready', src=f'cutouts/{cid}.webp', w=im.width, h=im.height,
                                     **{'from': own_src}, photo=None, own=True, own_id=own_id, **dict(info, model='own'))
                print(f'ready   {cid}  own image  {im.width}x{im.height}', flush=True)
                continue
            print(f'warning {cid}  own image not used: {why}; using the tool\'s cutout', flush=True)
            info['own_rejected'], info['own_src'] = why, own_src
        info['own_id'] = own_id
        # try photos in listing order and take the first clean front three-quarter view, the angle the other cars
        # are shown at (the listing's cover photo, as a rule). Failing that, the first clean side view, then any
        # clean photo (a nose-on photo hides the wheels and reads badly as a cutout).
        reasons, usable, fallback = [], None, None
        rank = lambda aspect, region: 0 if aspect < SIDE_VIEW and not nose_on(region) else 1 if aspect >= SIDE_VIEW else 2
        for url in photos:
            try:
                img, soft = photo_and_mask(url, work, args.model, segment)
            except Exception as e:                      # one bad photo should not stop the batch
                reasons.append(f'photo {photos.index(url) + 1}: {e}'); continue
            region = car_region(soft)
            why, aspect = ('no car found', 0) if region is None else check_frame(region)
            if region is not None and fallback is None and why != 'car too small in photo':
                fallback = (url, img, region)
            why = why or check_car(region, aspect) or (tyres_in_grass(img, region) and 'tyres hidden in grass')
            if why:
                reasons.append(f'photo {photos.index(url) + 1}: {why}'); continue
            k = rank(aspect, region)
            if usable is None or k < usable[0]:
                usable = (k, url, img, soft, region)
            if k == 0:
                break
        if usable:
            _, url, img, soft, region = usable
            im, status = render(img, soft, region), 'ready'
        elif photos:
            if fallback is None:
                try: fallback = (photos[0], photo_and_mask(photos[0], work, args.model, segment)[0], None)
                except Exception: fallback = None
            if fallback is None:
                manifest[cid] = dict(status='failed', reason='; '.join(reasons), **info)
                print(f'failed  {cid}  {manifest[cid]["reason"]}', flush=True); continue
            url, img, region = fallback
            im, status = panel(img, region), 'panel'
            info['reason'] = '; '.join(reasons)
        else:
            manifest[cid] = dict(status='failed', reason='no photos', **info); continue
        im.save(os.path.join(args.out, f'{cid}.webp'), 'WEBP', quality=90, method=6)
        manifest[cid] = dict(status=status, src=f'cutouts/{cid}.webp', w=im.width, h=im.height, **{'from': url},
                             photo=photos.index(url) + 1, **info)
        print(f'{status:7} {cid}  photo {photos.index(url) + 1}  {im.width}x{im.height}  {info.get("reason", "")}',
              flush=True)

    for cid in [k for k in manifest if k not in live_ids]:     # sold, removed or no longer featured: drop it
        manifest.pop(cid)
        try: os.remove(os.path.join(args.out, f'{cid}.webp'))
        except OSError: pass
    json.dump(manifest, open(man_path, 'w'), indent=1)
    js = os.path.join(os.path.dirname(os.path.abspath(args.out)), 'cutouts.js')
    with open(js, 'w') as f:
        f.write('/* Generated by tools/make_cutouts.py: hero cutouts (or framed panels) per listing id. */\n'
                'window.KM_CUTOUTS = ' + json.dumps(manifest, separators=(',', ':')) + ';\n')
    count = lambda s: sum(v['status'] == s for v in manifest.values())
    print(f'{count("ready")} cutouts, {count("panel")} panels, {count("failed")} failed', flush=True)


if __name__ == '__main__':
    sys.exit(main())
