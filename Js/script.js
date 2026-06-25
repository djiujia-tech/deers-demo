document.addEventListener('DOMContentLoaded', function () {

  // ══════════════════════════════════════════
  // IGフォトティッカー：SP タップで一時停止/再開
  // ══════════════════════════════════════════
  var igTrack = document.querySelector('.top_ig-ticker_track');
  if (igTrack) {
    igTrack.addEventListener('click', function () {
      igTrack.classList.toggle('is-paused');
    });
  }


  // ══════════════════════════════════════════
  // サイトイントロ
  // URL: ?v=b → 案B（緑×インパクト）、デフォルト → 案A（黒×ミニマル）
  // ══════════════════════════════════════════
  var siteIntro = document.getElementById('site-intro');
  var introDelay = 0; // イントロスキップ時はタイマーを即時スタート
  if (siteIntro) {
    if (sessionStorage.getItem('introPlayed')) {
      // 2回目以降：即非表示
      siteIntro.style.display = 'none';
    } else {
      // 初回のみ再生
      sessionStorage.setItem('introPlayed', '1');
      introDelay = 1700;
      var introPlan = 'b';
      siteIntro.classList.add('plan-' + introPlan);
      setTimeout(function () { siteIntro.classList.add('logo-in'); }, 100);
      setTimeout(function () { siteIntro.classList.add('is-out'); }, 1000);
      setTimeout(function () {
        siteIntro.style.display = 'none';
        window.scrollTo(0, 0);
      }, 1700);
    }
  }

  // ══════════════════════════════════════════
  // ハンバーガーメニュー
  // ══════════════════════════════════════════
  var toggle = document.querySelector('.m_hamburger');
  var menu   = document.querySelector('.l_header-nav');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // ══════════════════════════════════════════
  // スクロールリビール
  // ══════════════════════════════════════════
  var reveals = document.querySelectorAll('.m_reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ══════════════════════════════════════════
  // スライドデータ定義
  // ── スライドごとのコピー・写真・背景アニメーションをここで管理
  // ══════════════════════════════════════════
  var slideData = [
    {
      // ── 1枚目：TRYOUT / EXPERIENCE（旧2枚目）
      eyebrow  : 'JOIN THE TEAM / 無料体験会・見学 随時受付中',
      h1       : 'その熱量を、<br>コートで<span class="m_accent">試せ。</span>',
      lede     : '無料体験会・見学随時受付中。まずはコートに来てみてください。',
      btnText  : '無料体験',
      btnHref  : 'https://lin.ee/4VsUYfm',
      btnTarget: '_blank',
      meta: [],
      xlSrc    : 'assets/team-1.png',
      xlLabel  : 'TRY OUT',
      bgRotA   : '38deg',
      bgRotB   : '-28deg',
      showPopup: false
    },
    {
      // ── 2枚目：PARTNERS / SPONSORS（旧3枚目）
      eyebrow  : 'TEAM PARTNERS / 応援してくれる最高の仲間たち',
      h1       : '共に、大分から<br><span class="m_accent">未来へ。</span>',
      lede     : '地域の未来を担う子どもたちの挑戦を、一緒に支えてください。',
      btnText  : 'スポンサー募集中',
      btnHref  : 'https://lin.ee/4VsUYfm',
      btnTarget: '_blank',
      meta: [],
      xlSrc    : 'assets/team-5.png',
      xlLabel  : 'PARTNERS',
      bgRotA   : '-22deg',
      bgRotB   : '48deg',
      showPopup: false
    }
  ];

  // ══════════════════════════════════════════
  // DOM 参照
  // ══════════════════════════════════════════
  var heroSection = document.getElementById('heroSection');
  var slides      = document.querySelectorAll('.top_hero_slide');
  var dots        = document.querySelectorAll('.top_slider-dot');
  var heroDyn     = document.getElementById('heroDyn');
  var dynEyebrow  = document.getElementById('dynEyebrow');
  var dynCopy       = document.getElementById('dynCopy');
  var dynLede     = document.getElementById('dynLede');
  var dynBtn      = document.getElementById('dynBtn');
  var dynMeta     = document.getElementById('dynMeta');
  var xlPhoto     = document.getElementById('xlPhoto');
  var xlLabel     = document.getElementById('xlLabel');
  var ticker      = document.getElementById('heroTicker');
  var current     = 0;
  var heroTimer   = null;

  // 初期スライドのコンテンツをセット（slide 0 = 体験申込）
  if (dynEyebrow) dynEyebrow.textContent = slideData[0].eyebrow;
  if (dynCopy)      dynCopy.innerHTML        = slideData[0].h1;
  if (dynLede)    dynLede.textContent     = slideData[0].lede || '';
  if (dynBtn && slideData[0].btnText) {
    dynBtn.textContent = slideData[0].btnText;
    dynBtn.href        = slideData[0].btnHref;
    dynBtn.target      = slideData[0].btnTarget || '';
    dynBtn.parentElement.style.display = '';
  }

  // ══════════════════════════════════════════
  // スポンサーティッカー：Slide 3 のみ表示
  // ══════════════════════════════════════════
  function syncTicker(i) {
    if (!ticker) return;
    if (i === 1) {
      ticker.classList.add('is-visible');
      ticker.removeAttribute('aria-hidden');
    } else {
      ticker.classList.remove('is-visible');
      ticker.setAttribute('aria-hidden', 'true');
    }
  }

  // ══════════════════════════════════════════
  // ドット点灯
  // PCではプログレスバーのCSSアニメーションを確実に再起動するため
  // classList変更の前後で強制リフローを挟む
  // ══════════════════════════════════════════
  function syncDots(i) {
    dots.forEach(function (d) { d.classList.remove('is-active'); });
    if (dots[i]) {
      void dots[i].offsetWidth;   // ← reflow：アニメーションをリセット
      dots[i].classList.add('is-active');
    }
  }

  // ══════════════════════════════════════════
  // circle-xl 写真をクロスフェードで差し替え
  // ══════════════════════════════════════════
  function changeXlPhoto(src, label) {
    if (!xlPhoto) return;
    xlPhoto.style.opacity = '0';
    setTimeout(function () {
      xlPhoto.src = src;
      if (xlLabel) xlLabel.textContent = label;
      xlPhoto.style.opacity = '1';
    }, 480);
  }

  // ══════════════════════════════════════════
  // 背景ジオメトリ（::before / ::after）を CSS 変数経由で滑らかに回転
  // ══════════════════════════════════════════
  function animateBg(data) {
    if (!heroSection) return;
    heroSection.style.setProperty('--bg-rot-a', data.bgRotA);
    heroSection.style.setProperty('--bg-rot-b', data.bgRotB);
  }

  // ══════════════════════════════════════════
  // hero-content テキストをフェードで差し替え
  // ══════════════════════════════════════════
  function updateContent(data) {
    if (!heroDyn) return;

    heroDyn.classList.add('is-fading');

    setTimeout(function () {
      if (dynEyebrow) dynEyebrow.textContent = data.eyebrow;
      if (dynLede) dynLede.textContent = data.lede || '';
      if (dynCopy) {
        dynCopy.innerHTML = data.h1;
        dynCopy.classList.remove('top_hero-anim');
        dynCopy.setAttribute('data-fast', '');   // スライド切り替え = 速いアニメ
        void dynCopy.offsetWidth; // reflow でアニメリセット
        dynCopy.classList.add('top_hero-anim');
      }

      if (dynMeta) {
        dynMeta.innerHTML = data.meta.map(function (m) {
          return '<div><span class="m_num">' + m.num + '</span>'
               + '<span>' + m.label + '</span></div>';
        }).join('');
      }

      if (dynBtn) {
        dynBtn.textContent = data.btnText;
        dynBtn.href        = data.btnHref;
        dynBtn.target      = data.btnTarget || '';
        dynBtn.rel         = data.btnTarget === '_blank' ? 'noopener noreferrer' : '';
        dynBtn.parentElement.style.display = data.btnText ? '' : 'none';
      }

      heroDyn.classList.remove('is-fading');
    }, 280);
  }

  // ══════════════════════════════════════════
  // メイン：スライド切り替え（全要素連動）
  // ══════════════════════════════════════════
  function goTo(i) {
    slides[current].classList.remove('is-active');
    current = i;
    slides[current].classList.add('is-active');

    var data = slideData[i];
    syncDots(i);
    updateContent(data);
    changeXlPhoto(data.xlSrc, data.xlLabel);
    animateBg(data);
    syncTicker(i);

  }

  // ══════════════════════════════════════════
  // タイマー制御
  // ══════════════════════════════════════════

  // ① hero-copy アニメーション開始（初回はイントロ後、2回目以降は即時）
  setTimeout(function () {
    if (dynCopy) dynCopy.classList.add('top_hero-anim');
  }, introDelay > 0 ? 2000 : 100);

  // ② スライドタイマースタート（初回はイントロ後1.7秒、2回目以降は即時）
  if (slides.length > 1) {
    setTimeout(function () {
      heroTimer = setInterval(function () {
        goTo((current + 1) % slides.length);
      }, 3000);
    }, introDelay);

    // ③ ドットタップ：タイマークリア＋スライド移動
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
        goTo(i);
      });
    });
  }


  // ══════════════════════════════════════════
  // マウスパララックス（PC専用 / min-width: 769px）
  //
  // CSS個別変換プロパティ  rotate / translate を分離しているため
  // translate だけを 0.2s ease-out でアニメーションできる。
  //   ::before → 最大 ±4px（マウス方向）
  //   ::after  → 最大 ±3px（逆方向：対向移動で奥行き感）
  // ══════════════════════════════════════════
  if (heroSection && window.matchMedia('(min-width: 769px)').matches) {

    heroSection.addEventListener('mousemove', function (e) {
      var rect  = heroSection.getBoundingClientRect();
      var xFrac = (e.clientX - rect.left)  / rect.width  - 0.5;  // -0.5 〜 0.5
      var yFrac = (e.clientY - rect.top)   / rect.height - 0.5;

      // ::before  — マウス追従方向に最大 4px
      heroSection.style.setProperty('--px-a', (xFrac *  8).toFixed(1) + 'px');
      heroSection.style.setProperty('--py-a', (yFrac *  6).toFixed(1) + 'px');
      // ::after   — 逆方向に最大 3px（立体感の奥行き演出）
      heroSection.style.setProperty('--px-b', (xFrac * -6).toFixed(1) + 'px');
      heroSection.style.setProperty('--py-b', (yFrac * -5).toFixed(1) + 'px');
    }, { passive: true });

    heroSection.addEventListener('mouseleave', function () {
      heroSection.style.setProperty('--px-a', '0px');
      heroSection.style.setProperty('--py-a', '0px');
      heroSection.style.setProperty('--px-b', '0px');
      heroSection.style.setProperty('--py-b', '0px');
    });
  }

  // ══════════════════════════════════════════
  // デコレーティブサークル（slide 0 背景）の独立サイクル
  // .slide-circles 内の各サークルが 3.7〜5.7秒ごとに写真を切り替え
  // ══════════════════════════════════════════
  document.querySelectorAll('.top_slide-circles .top_circle, .top_hero_sp-a, .top_hero_sp-b').forEach(function (circle, ci) {
    var photos = circle.querySelectorAll('.top_c-slide');
    if (photos.length < 2) return;
    var cur = 0;
    setTimeout(function () {
      setInterval(function () {
        photos[cur].classList.remove('is-active');
        var next;
        do { next = Math.floor(Math.random() * photos.length); } while (next === cur);
        cur = next;
        photos[cur].classList.add('is-active');
      }, 3000);
    }, ci * 1000);
  });

});
