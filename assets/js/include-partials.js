document.addEventListener('DOMContentLoaded', () => {
  const hosts = document.querySelectorAll('[data-include]');
  hosts.forEach((host) => {
    const name = host.getAttribute('data-include');
    if (!name) return;

    fetch(`/partials/${name}.html`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load partial: ${name} (${response.status})`);
        }
        return response.text();
      })
      .then((html) => {
        host.innerHTML = html;
        document.dispatchEvent(
          new CustomEvent('partial:loaded', { detail: { name } })
        );
      })
      .catch((err) => {
        console.error(err);
      });
  });
});
