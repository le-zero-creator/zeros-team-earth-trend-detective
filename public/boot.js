/* Classic script, old phones included. Runs before the app module. */
;(function () {
  window.addEventListener('error', function (event) {
    if (event.target && event.target !== window) return
    if (document.documentElement.getAttribute('data-app') === 'up') return
    var root = document.getElementById('root')
    if (!root) return
    while (root.firstChild) root.removeChild(root.firstChild)
    var p = document.createElement('p')
    p.setAttribute('role', 'alert')
    p.style.cssText =
      'font-family:system-ui,sans-serif;margin:24px 16px;color:#14261c;font-size:1.25rem;line-height:1.45'
    p.textContent =
      'Trend Detective could not start. Check your connection and reload. — L’application n’a pas démarré. Vérifiez la connexion, puis rechargez.'
    root.appendChild(p)
  })
})()
