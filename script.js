const API_BASE = 'https://portfolio-api-three-black.vercel.app/api/v1';

const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];
const byId = id => document.getElementById(id);


function showMsg(text, type='info') {
  const box = byId('msg');
  if (!box) return alert(text);
  box.textContent = text;
  box.className = `msg ${type}`;
  box.hidden = false;
  clearTimeout(showMsg._t);
  showMsg._t = setTimeout(() => (box.hidden = true), 3000);
}

function parseCSV(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(',').map(s=>s.trim()).filter(Boolean);
  return [];
}

function validUrl(u){ try { new URL(u); return true; } catch { return false; } }





function renderProjects(list){
  const grid = byId('projects');
  const tpl  = byId('project-tpl');

  grid.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    grid.innerHTML = '<p class="msg">No hay proyectos públicos para este ITSON ID.</p>';
    return;
  }

  list.forEach(p => {
    const card = tpl.content.firstElementChild.cloneNode(true);

    
    const imgs = parseCSV(p.images);
    const cover = card.querySelector('.proj-cover');
    if (imgs.length && validUrl(imgs[0])) cover.style.backgroundImage = `url("${imgs[0]}")`;

    
    card.querySelector('.proj-title').textContent = p.title || '(Sin título)';
    card.querySelector('.proj-desc').textContent  = p.description || '';

    const wrap = card.querySelector('[data-techs]');
    const techs = parseCSV(p.technologies);
    if (techs.length) {
      techs.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = t;
        wrap.appendChild(span);
      });
    } else {
      wrap.remove();
    }

    
    const a = card.querySelector('[data-repo]');
    if (p.repository && validUrl(p.repository)) { a.href = p.repository; }
    else { a.textContent = '—'; a.removeAttribute('href'); a.style.pointerEvents = 'none'; }

    grid.appendChild(card);
  });
}



// el fakin fecht
async function loadPublicProjects(itsonId){
  if (!itsonId) { showMsg('Proporciona un ITSON ID de 6 dígitos.', 'error'); return; }

  const loader = document.getElementById('loader');
  const grid   = document.getElementById('projects');

  loader.hidden = false;
  grid.hidden   = true;

  try {
    const url = `${API_BASE}/publicProjects/${encodeURIComponent(itsonId)}?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderProjects(data);
    grid.hidden = false;
  } catch (e) {
    showMsg('Este usuario no existe ', 'error');
  } finally {
    loader.hidden = true;
  }
}
document.addEventListener('DOMContentLoaded', () => {

  const idInput = document.getElementById('itsonId');
  const fromQuery = new URLSearchParams(location.search).get('itsonId');
  const fromAttr  = document.body.dataset.itsonId?.trim();
  const currentId = fromQuery || fromAttr || '';

  if (idInput) idInput.value = currentId;

  if (currentId) loadPublicProjects(currentId);

  byId('id-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = idInput.value.trim();
    
    if (!/^\d{6}$/.test(id)) { showMsg('El ITSON ID debe tener 6 dígitos.', 'error'); return; }
    const q = new URLSearchParams(location.search);
    q.set('itsonId', id);
    history.replaceState({}, '', `${location.pathname}?${q.toString()}`);
    loadPublicProjects(id);
  });
});