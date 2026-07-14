<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { CoreLightbox } from '@anil-labs/lightbox-gallery-vue'
import type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-vue'
import Gallery from './Gallery.vue'

const full = (id: number): string => `https://picsum.photos/id/${id}/1600/1067`
const thumb = (id: number): string => `https://picsum.photos/id/${id}/400/300`
const CAPTIONS = [
  'Coastline at dawn',
  'Alpine ridge',
  'City in the rain',
  'Desert dunes',
  'Quiet harbour',
  'Forest light',
  'Rolling hills',
  'Northern sky',
]
const IDS = [1015, 1016, 1018, 1024, 1039, 1043, 1051, 1074]
const PHOTOS: LightboxItem[] = IDS.map((id, i) => ({
  src: full(id),
  thumb: thumb(id),
  caption: CAPTIONS[i],
}))

const MEDIA: LightboxItem[] = [
  { src: full(1025), thumb: thumb(1025), caption: 'A plain image slide' },
  {
    type: 'video',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: full(1035),
    thumb: thumb(1035),
    caption: 'An MP4 video (native controls)',
  },
  {
    src: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    thumb: thumb(1041),
    caption: 'A YouTube embed (auto-detected)',
  },
  {
    type: 'html',
    src: '',
    html: '<div style="display:grid;place-items:center;height:100%;padding:40px;text-align:center;font:600 26px/1.4 system-ui;color:#fff;background:linear-gradient(135deg,#5b6cff,#b06cff);border-radius:12px">Any HTML you like<br/><span style="font-weight:400;font-size:16px;opacity:.85">rendered as a slide</span></div>',
    thumb: thumb(1047),
    caption: 'A raw HTML slide',
  },
]

const SECTIONS: [string, string][] = [
  ['basic', 'Basic'],
  ['media', 'Mixed media'],
  ['slideshow', 'Slideshow'],
  ['toolbar', 'Toolbar'],
  ['themes', 'Themes'],
  ['inline', 'Inline'],
  ['hash', 'Deep-linking'],
  ['api', 'API & events'],
]

const infoButton = {
  id: 'info',
  label: 'Photo info',
  icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
  onClick: (lb: CoreLightbox) => alert(lb.currentItem?.caption ?? 'No caption'),
}

// 3 · Slideshow
const ssGrid = ref<HTMLElement | null>(null)
let ss: CoreLightbox | null = null
function playSlideshow() {
  ss?.open(0)
  ss?.toggleSlideshow()
}

// 6 · Inline
const inlineStage = ref<HTMLElement | null>(null)
let inlineLb: CoreLightbox | null = null

// 8 · API & events
const apiGrid = ref<HTMLElement | null>(null)
let api: CoreLightbox | null = null
const log = ref<{ k: string; d: string }[]>([])
const push = (k: string, d = ''): void => {
  log.value = [{ k, d }, ...log.value].slice(0, 40)
}
const ensureApi = (): void => {
  if (!api?.isOpen) api?.open(0)
}
const apiSlideshow = (): void => {
  ensureApi()
  api?.toggleSlideshow()
}
const apiFullscreen = (): void => {
  ensureApi()
  api?.toggleFullscreen()
}

// 5 · Themes
function openThemed(opts: Pick<LightboxOptions, 'theme' | 'className'>): void {
  const lb = new CoreLightbox({ items: PHOTOS, ...opts })
  lb.on('close', () => lb.destroy())
  lb.open(0)
}

onMounted(() => {
  ss = new CoreLightbox({
    items: PHOTOS,
    slideshow: true,
    slideshowDelay: 2500,
    slideshowProgress: true,
    animateFrom: (i) => ssGrid.value?.querySelectorAll('img')[i] ?? null,
  })

  if (inlineStage.value) {
    inlineLb = new CoreLightbox({
      items: PHOTOS,
      inline: true,
      container: inlineStage.value,
      thumbnails: true,
    })
    inlineLb.open(0)
  }

  api = new CoreLightbox({
    items: PHOTOS,
    slideshow: true,
    fullscreen: true,
    animateFrom: (i) => apiGrid.value?.querySelectorAll('img')[i] ?? null,
  })
  api.on('open', (i) => push('open', `#${i}`))
  api.on('close', () => push('close'))
  api.on('change', (i, item) => push('change', `#${i} — ${item.caption ?? ''}`))
  api.on('zoom', (s) => push('zoom', `${s.toFixed(2)}×`))
  api.on('slideshow:start', () => push('slideshow:start'))
  api.on('slideshow:stop', () => push('slideshow:stop'))
})

onBeforeUnmount(() => {
  ss?.destroy()
  inlineLb?.destroy()
  api?.destroy()
})
</script>

<template>
  <main>
    <div class="hero">
      <span class="badge">Vue 3 · &lt;Lightbox&gt; + useLightbox</span>
      <h1>lightbox-gallery</h1>
      <p class="tag">
        Every feature, one page. Each card is a self-contained example — find the one that matches
        your use case.
      </p>
      <nav class="toc">
        <a v-for="[id, label] in SECTIONS" :key="id" :href="`#${id}`">{{ label }}</a>
      </nav>
    </div>

    <section class="section" id="basic">
      <div class="section-head">
        <h2><span class="n">01</span> Basic gallery</h2>
        <p class="desc">
          Click a thumbnail and it opens with a FLIP zoom. Wheel/pinch zoom, swipe, arrows,
          <kbd>f</kbd> and <kbd>Esc</kbd> all work.
        </p>
        <p class="use"><b>Use it for</b> portfolios, product shots, any grid of photos.</p>
      </div>
      <div class="card-wrap"><Gallery :items="PHOTOS" :options="{ loop: true }" /></div>
    </section>

    <section class="section" id="media">
      <div class="section-head">
        <h2><span class="n">02</span> Mixed media</h2>
        <p class="desc">
          One gallery, many types — images, an MP4 video, a YouTube embed and a raw HTML slide (via
          <code>type</code>).
        </p>
        <p class="use">
          <b>Use it for</b> mixed image + video galleries, case studies, press kits.
        </p>
      </div>
      <div class="card-wrap"><Gallery :items="MEDIA" :options="{ loop: true }" /></div>
    </section>

    <section class="section" id="slideshow">
      <div class="section-head">
        <h2><span class="n">03</span> Slideshow</h2>
        <p class="desc">
          Autoplay with a progress bar (<code>slideshow</code>, <code>slideshowDelay</code>,
          <code>slideshowProgress</code>); hovering pauses it.
        </p>
        <p class="use"><b>Use it for</b> kiosks, hero showcases, hands-off presentations.</p>
      </div>
      <div class="card-wrap">
        <div class="toolbar">
          <button class="btn primary" @click="playSlideshow">▶ Play slideshow</button>
        </div>
        <div class="thumbs" ref="ssGrid">
          <button v-for="(item, i) in PHOTOS" :key="i" class="thumb" @click="ss?.open(i)">
            <img :src="item.thumb" :alt="item.caption" loading="lazy" />
          </button>
        </div>
      </div>
    </section>

    <section class="section" id="toolbar">
      <div class="section-head">
        <h2><span class="n">04</span> Toolbar &amp; actions</h2>
        <p class="desc">
          Opt into <code>fullscreen</code>, <code>download</code>, <code>share</code> and
          <code>rotate</code> — plus your own via <code>toolbarButtons</code>.
        </p>
        <p class="use"><b>Use it for</b> asset libraries, downloadable galleries, admin tools.</p>
      </div>
      <div class="card-wrap">
        <Gallery
          :items="PHOTOS"
          :options="{
            loop: true,
            fullscreen: true,
            download: true,
            share: true,
            rotate: true,
            toolbarButtons: [infoButton],
          }"
        />
      </div>
    </section>

    <section class="section" id="themes">
      <div class="section-head">
        <h2><span class="n">05</span> Themes</h2>
        <p class="desc">
          <code>theme: 'dark' | 'light' | 'auto'</code> plus the <code>lbg-theme-glass</code> /
          <code>lbg-theme-minimal</code> presets.
        </p>
        <p class="use"><b>Use it for</b> matching your site's look, light pages, OS-aware UIs.</p>
      </div>
      <div class="card-wrap">
        <div class="swatches">
          <button class="swatch sw-dark" @click="openThemed({ theme: 'dark' })">
            Dark<small>the default</small>
          </button>
          <button class="swatch sw-light" @click="openThemed({ theme: 'light' })">
            Light<small>theme: 'light'</small>
          </button>
          <button class="swatch sw-auto" @click="openThemed({ theme: 'auto' })">
            Auto<small>follows the OS</small>
          </button>
          <button class="swatch sw-glass" @click="openThemed({ className: 'lbg-theme-glass' })">
            Glass<small>frosted blur</small>
          </button>
          <button class="swatch sw-minimal" @click="openThemed({ className: 'lbg-theme-minimal' })">
            Minimal<small>bare UI</small>
          </button>
        </div>
      </div>
    </section>

    <section class="section" id="inline">
      <div class="section-head">
        <h2><span class="n">06</span> Inline carousel</h2>
        <p class="desc">
          <code>inline: true</code> with a <code>container</code> renders a zoomable, swipeable
          carousel on the page.
        </p>
        <p class="use"><b>Use it for</b> product pages, embedded galleries, dashboards.</p>
      </div>
      <div class="card-wrap"><div class="inline-stage" ref="inlineStage"></div></div>
    </section>

    <section class="section" id="hash">
      <div class="section-head">
        <h2><span class="n">07</span> Deep-linking (URL hash)</h2>
        <p class="desc">
          <code>hash: true</code> writes the open slide to the URL, so links are shareable and the
          back button closes the viewer.
        </p>
        <p class="use">
          <b>Use it for</b> shareable photos, SEO-friendly galleries, back-button UX.
        </p>
      </div>
      <div class="card-wrap"><Gallery :items="PHOTOS" :options="{ loop: true, hash: true }" /></div>
    </section>

    <section class="section" id="api">
      <div class="section-head">
        <h2><span class="n">08</span> Programmatic API &amp; live events</h2>
        <p class="desc">
          Drive the instance — <code>open</code>, <code>next</code>, <code>prev</code>,
          <code>toggleSlideshow</code>, <code>toggleFullscreen</code> — and watch events fire.
        </p>
        <p class="use"><b>Use it for</b> custom controls, analytics, syncing state.</p>
      </div>
      <div class="card-wrap">
        <div class="toolbar">
          <button class="btn" @click="api?.open(0)">Open</button>
          <button class="btn" @click="api?.prev()">‹ Prev</button>
          <button class="btn" @click="api?.next()">Next ›</button>
          <button class="btn" @click="apiSlideshow">Slideshow</button>
          <button class="btn" @click="apiFullscreen">Fullscreen</button>
        </div>
        <div class="thumbs" ref="apiGrid">
          <button v-for="(item, i) in PHOTOS" :key="i" class="thumb" @click="api?.open(i)">
            <img :src="item.thumb" :alt="item.caption" loading="lazy" />
          </button>
        </div>
        <div class="log">
          <div v-if="log.length === 0" class="empty">
            Open the gallery or press a button — events appear here…
          </div>
          <div v-for="(e, i) in log" :key="i" class="row">
            <span class="k">{{ e.k }}</span> {{ e.d }}
          </div>
        </div>
      </div>
    </section>

    <footer>
      Every card runs the same zero-dependency <code>@anil-labs/lightbox-gallery-core</code> engine.
      <a href="https://github.com/anilkumarthakur60/lightbox-gallery">View source on GitHub</a>
    </footer>
  </main>
</template>
