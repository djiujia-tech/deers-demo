document.addEventListener('DOMContentLoaded', function () {

  // ══════════════════════════════════════════
  // ハンバーガーメニュー
  // ══════════════════════════════════════════
  var toggle = document.querySelector('.nav-toggle');
  var menu   = document.querySelector('.quarters');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // ══════════════════════════════════════════
  // スクロールリビール
  // ══════════════════════════════════════════
  var reveals = document.querySelectorAll('.reveal');
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
      // ── 1枚目：HOME
      eyebrow  : 'OITA CITY / U15 BASKETBALL TEAM',
      h1       : '本気で、<br><span class="accent">COMMIT.</span>',
      btnText  : '',
      btnHref  : '',
      btnTarget: '',
      meta: [],
      xlSrc    : 'assets/team-4.png',
      xlLabel  : 'ON COURT',
      bgRotA   : '0deg',
      bgRotB   : '0deg',
      showPopup: true
    },
    {
      // ── 2枚目：TRYOUT / EXPERIENCE
      eyebrow  : 'JOIN THE TEAM / 無料体験会・見学 随時受付中',
      h1       : 'その熱量を、<br>コートで<span class="accent">試せ。</span>',
      btnText  : '体験に申し込む',
      btnHref  : 'https://lin.ee/4VsUYfm',
      btnTarget: '_blank',
      meta: [],
      xlSrc    : 'assets/team-3.png',
      xlLabel  : 'TRY OUT',
      bgRotA   : '38deg',
      bgRotB   : '-28deg',
      showPopup: false
    },
    {
      // ── 3枚目：PARTNERS / SPONSORS
      eyebrow  : 'TEAM PARTNERS / 応援してくれる最高の仲間たち',
      h1       : '共に、大分から<br><span class="accent">未来へ。</span>',
      btnText  : 'スポンサー募集について',
      btnHref  : 'https://lin.ee/4VsUYfm',
      btnTarget: '_blank',
      meta: [],
      xlSrc    : 'assets/team-2.png',
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
  var slides      = document.querySelectorAll('.hero-slide');
  var dots        = document.querySelectorAll('.slider-dot');
  var heroDyn     = document.getElementById('heroDyn');
  var dynEyebrow  = document.getElementById('dynEyebrow');
  var dynH1       = document.getElementById('dynH1');
  var dynBtn      = document.getElementById('dynBtn');
  var dynMeta     = document.getElementById('dynMeta');
  var xlPhoto     = document.getElementById('xlPhoto');
  var xlLabel     = document.getElementById('xlLabel');
  var popup       = document.getElementById('fvPopup');
  var ticker      = document.getElementById('heroTicker');
  var current     = 0;
  var heroTimer   = null;

  // ══════════════════════════════════════════
  // ポップアップ表示・非表示
  // ══════════════════════════════════════════
  function hidePopup() {
    if (popup) popup.classList.remove('is-visible');
  }

  // ══════════════════════════════════════════
  // スポンサーティッカー：Slide 3 のみ表示
  // ══════════════════════════════════════════
  function syncTicker(i) {
    if (!ticker) return;
    if (i === 2) {
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
      if (dynH1) {
        dynH1.innerHTML = data.h1;
        dynH1.classList.remove('h1-anim');
        dynH1.setAttribute('data-fast', '');   // スライド切り替え = 速いアニメ
        void dynH1.offsetWidth; // reflow でアニメリセット
        dynH1.classList.add('h1-anim');
      }

      if (dynMeta) {
        dynMeta.innerHTML = data.meta.map(function (m) {
          return '<div><span class="num">' + m.num + '</span>'
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

    if (!data.showPopup) hidePopup();
  }

  // ══════════════════════════════════════════
  // タイマー制御
  // ══════════════════════════════════════════

  // ① 3秒後：slide 0 にいればポップアップを表示、かつ hero-copy アニメーション開始
  setTimeout(function () {
    if (current === 0 && popup) popup.classList.add('is-visible');
    if (dynH1) dynH1.classList.add('h1-anim');
  }, 3000);

  // ② 6秒後：スライドの自動切り替えを開始（6秒ループ）
  if (slides.length > 1) {
    setTimeout(function () {
      heroTimer = setInterval(function () {
        goTo((current + 1) % slides.length);
      }, 6000);
    }, 6000);

    // ③ ドットタップ：タイマークリア＋スライド移動
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
        goTo(i);
      });
    });
  }

  // ④ スクロール 30px でポップアップ消去
  window.addEventListener('scroll', function () {
    if (window.scrollY > 30) hidePopup();
  }, { passive: true });

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
  document.querySelectorAll('.slide-circles .circle').forEach(function (circle, ci) {
    var photos = circle.querySelectorAll('.c-slide');
    if (photos.length < 2) return;
    var cur = 0;
    setInterval(function () {
      photos[cur].classList.remove('is-active');
      cur = (cur + 1) % photos.length;
      photos[cur].classList.add('is-active');
    }, 3700 + ci * 500);
  });

});
