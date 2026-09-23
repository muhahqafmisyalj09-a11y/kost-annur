$(document).ready(function () {

  // Tahun otomatis di footer
  $('#year').text(new Date().getFullYear());

  // Header: efek scrolled saat discroll
  $(window).on('scroll', function () {
    $('#siteHeader').toggleClass('scrolled', $(window).scrollTop() > 20);
  });

  // Menu mobile (buka/tutup burger)
  $('#burgerBtn').on('click', function () {
    $(this).toggleClass('open');
    $('#navLinks').toggleClass('open');
  });
  $('#navLinks a').on('click', function () {
    $('#burgerBtn').removeClass('open');
    $('#navLinks').removeClass('open');
  });

  // Highlight menu aktif sesuai posisi scroll
  const $sections = $('section[id]');
  const $navLinks = $('#navLinks a');
  function highlightNav() {
    let current = '';
    $sections.each(function () {
      const top = $(this).offset().top - 120;
      if ($(window).scrollTop() >= top) current = $(this).attr('id');
    });
    $navLinks.each(function () {
      $(this).toggleClass('active', $(this).attr('href') === '#' + current);
    });
  }
  $(window).on('scroll', highlightNav);
  highlightNav();

  // Reveal saat elemen masuk viewport (pakai IntersectionObserver,
  // dibungkus jQuery untuk menambah/menghapus class)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $(entry.target).addClass('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  $('.reveal').each(function () { io.observe(this); });

  // ===== Lightbox terpadu (dipakai galeri utama & "Lihat 3 Foto" per kamar) =====
  let currentGallery = [];
  let currentIndex = 0;

  function updateLightboxView() {
    const item = currentGallery[currentIndex];
    if (!item) return;
    $('#lightboxImg').attr('src', item.src).attr('alt', item.label || 'Foto');
    $('#lightboxCap').text(item.label || '');
    $('#lightboxCounter').text((currentIndex + 1) + ' / ' + currentGallery.length);
    $('.lightbox-thumb').removeClass('active').eq(currentIndex).addClass('active');

    const multi = currentGallery.length > 1;
    $('#lightboxPrev, #lightboxNext').toggle(multi);
    $('.lightbox-thumbs').toggle(multi);
  }

  function buildLightboxThumbs() {
    const $thumbs = $('#lightboxThumbs').empty();
    currentGallery.forEach(function (item, i) {
      const $thumb = $('<button type="button" class="lightbox-thumb"></button>')
        .append($('<img>').attr('src', item.src).attr('alt', ''));
      $thumb.on('click', function () {
        currentIndex = i;
        updateLightboxView();
      });
      $thumbs.append($thumb);
    });
  }

  function openLightbox(images, startIndex) {
    currentGallery = images;
    currentIndex = startIndex || 0;
    buildLightboxThumbs();
    updateLightboxView();
    $('#lightbox').addClass('open');
  }

  // Klik foto di galeri utama -> buka semua foto galeri, mulai dari foto yang diklik
  $('.gal-item').on('click', function () {
    const $allItems = $('.gal-item');
    const images = $allItems.map(function () {
      return { src: $(this).find('img').attr('src'), label: $(this).data('label') || '' };
    }).get();
    const index = $allItems.index(this);
    openLightbox(images, index);
  });

  // Klik "Lihat 3 Foto" di kartu kamar -> buka hanya foto-foto kamar itu
  $('.room-gallery-btn').on('click', function () {
    const title = $(this).data('title') || '';
    const raw = $(this).data('images') || '';
    const images = String(raw).split('|')
      .map(function (src) { return src.trim(); })
      .filter(Boolean)
      .map(function (src) { return { src: src, label: title }; });
    if (images.length) openLightbox(images, 0);
  });

  // Navigasi
  $('#lightboxPrev').on('click', function () {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    updateLightboxView();
  });
  $('#lightboxNext').on('click', function () {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    updateLightboxView();
  });

  // Tutup lightbox
  $('#lightboxClose').on('click', function () {
    $('#lightbox').removeClass('open');
  });
  $('#lightbox').on('click', function (e) {
    if (e.target === this) $(this).removeClass('open');
  });
  $(document).on('keydown', function (e) {
    if (!$('#lightbox').hasClass('open')) return;
    if (e.key === 'Escape') $('#lightbox').removeClass('open');
    if (e.key === 'ArrowLeft') $('#lightboxPrev').trigger('click');
    if (e.key === 'ArrowRight') $('#lightboxNext').trigger('click');
  });

  // Form kontak -> arahkan ke WhatsApp
  $('#contactForm').on('submit', function (e) {
    e.preventDefault();
    const $inputs = $(this).find('input, textarea');
    const name = $inputs.eq(0).val().trim();
    const phone = $inputs.eq(1).val().trim();
    const msg = $inputs.eq(2).val().trim();
    if (!name || !phone || !msg) return;

    const text = encodeURIComponent(`Halo Kost An-Nur, saya ${name} (${phone}). ${msg}`);
    window.open(`https://wa.me/6281256362606?text=${text}`, '_blank');
    $('#formNote').text('Terima kasih! Anda akan diarahkan ke WhatsApp.');
  });

});