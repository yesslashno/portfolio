// Full films only download when someone presses Play.
document.querySelectorAll('.video-feature').forEach((feature) => {
  const preview = feature.querySelector('.video-preview');
  const film = feature.querySelector('.full-film');
  const button = feature.querySelector('.play-button');
  const error = feature.querySelector('.video-error');

  let inView = true;

  function restorePreview(message = '') {
    film.hidden = true;
    film.pause();
    preview.hidden = false;
    button.hidden = false;
    error.textContent = message;
    error.hidden = !message;
    if (preview.tagName === 'VIDEO' && inView) preview.play().catch(() => {});
  }

  // Keep a paused film available while it is visible. Restore its preview
  // after it leaves the viewport, ready for the viewer's return.
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (!inView && !film.hidden && film.paused) restorePreview();
    if (preview.tagName === 'VIDEO' && !preview.hidden) {
      if (inView) preview.play().catch(() => {});
      else preview.pause();
    }
  });
  observer.observe(feature);

  film.addEventListener('pause', () => {
    if (!inView && !film.hidden) restorePreview();
  });

  button.addEventListener('click', () => {
    // Only stop other full films; silent loops should keep animating.
    document.querySelectorAll('.full-film').forEach((video) => video.pause());
    if (preview.tagName === 'VIDEO') preview.pause();
    error.hidden = true;
    preview.hidden = true;
    button.hidden = true;
    film.hidden = false;
    if (!film.getAttribute('src')) film.src = film.dataset.src;
    film.muted = false;
    film.focus();
    film.play().catch(() => restorePreview('The film could not play. Please try again.'));
  });

  film.addEventListener('error', () => restorePreview('The film could not load. Please try again.'));
  film.addEventListener('ended', () => {
    restorePreview();
    button.focus();
  });
});

// Resume every silent loop when it returns onscreen, including the standalone clips.
const loops = [...document.querySelectorAll('video[autoplay][muted][loop]')];
function updateLoop(video) {
  const bounds = video.getBoundingClientRect();
  const visible = !document.hidden && !video.hidden && bounds.width > 0 &&
    bounds.bottom > 0 && bounds.top < window.innerHeight &&
    bounds.right > 0 && bounds.left < window.innerWidth;
  if (visible) video.play().catch(() => {});
  else video.pause();
}
const loopObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target }) => updateLoop(target));
});
loops.forEach((video) => loopObserver.observe(video));
document.addEventListener('visibilitychange', () => loops.forEach(updateLoop));

// Native-control films also stop any other full film's audio.
document.querySelectorAll('.full-film').forEach((film) => {
  film.addEventListener('play', () => {
    document.querySelectorAll('.full-film').forEach((other) => {
      if (other !== film) other.pause();
    });
  });
});
