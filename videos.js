// Full films only download when someone presses Play.
document.querySelectorAll('.video-feature').forEach((feature) => {
  const preview = feature.querySelector('.video-preview');
  const film = feature.querySelector('.full-film');
  const button = feature.querySelector('.play-button');
  const error = feature.querySelector('.video-error');

  function restorePreview(message = '') {
    film.pause();
    film.hidden = true;
    preview.hidden = false;
    button.hidden = false;
    error.textContent = message;
    error.hidden = !message;
    if (preview.tagName === 'VIDEO') preview.play().catch(() => {});
  }

  button.addEventListener('click', () => {
    // Pause other media so the selected film has the viewer's attention.
    document.querySelectorAll('video').forEach((video) => video.pause());
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
