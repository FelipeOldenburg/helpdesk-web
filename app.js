const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const apiInput = $('#apiBase');
let token = localStorage.getItem('helpdesk_token') || '';
let usuario = JSON.parse(localStorage.getItem('helpdesk_usuario') || 'null');

apiInput.value = localStorage.getItem('helpdesk_api') || window.HELPDESK_API_URL || '';

const apiBase = () => {
  const value = apiInput.value.trim().replace(/\/$/, '');
  if (!value) throw new Error('Informe a URL publica da API antes de continuar.');
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return url.toString().replace(/\/$/, '');
  } catch {
    throw new Error('Informe uma URL publica valida para a API.');
  }
};

const request = async (path, options = {}) => {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const response = await fetch(`${apiBase()}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Erro HTTP ${response.status}`);
  return data;
};

const message = (text, error = false) => { $('#status').textContent = text; $('#status').className = `notice ${error ? 'error' : 'success'}`; };
const showApp = () => {
  $('#authView').classList.toggle('hidden', Boolean(usuario));
  $('#appView').classList.toggle('hidden', !usuario);
  $('#identity').textContent = usuario ? `${usuario.nome} · ${usuario.papel}` : '';
  $('#ticketForm').classList.toggle('hidden', usuario?.papel !== 'cliente');
  if (usuario) loadTickets();
};

const renderTickets = (tickets) => {
  $('#tickets').innerHTML = tickets.map((ticket) => `<article class="ticket" data-id="${ticket.id}"><div class="ticket-top"><span class="status-badge ${ticket.status.replace(/\s/g, '-').toLowerCase()}">${escapeHtml(ticket.status)}</span><small>#${ticket.id}</small></div><h3>${escapeHtml(ticket.titulo)}</h3><p>${escapeHtml(ticket.descricao)}</p><div class="meta"><span>${escapeHtml(ticket.cliente)}</span><span>${ticket.total_comentarios} comentarios</span></div><button class="ghost" data-open>Ver atendimento</button></article>`).join('') || '<div class="empty">Nenhum chamado encontrado.</div>';
};

const loadTickets = async () => { try { renderTickets(await request('/api/chamados')); } catch (error) { message(error.message, true); } };

const openTicket = async (id) => {
  try {
    const ticket = await request(`/api/chamados/${id}`);
    const tools = usuario.papel === 'tecnico' ? `<form id="statusForm" class="inline-form"><select name="status">${['Aberto', 'Em Atendimento', 'Concluído'].map((status) => `<option ${status === ticket.status ? 'selected' : ''}>${status}</option>`).join('')}</select><button>Atualizar status</button></form><form id="commentForm" class="stack"><label>Novo comentario<textarea name="mensagem" rows="3" required></textarea></label><button>Comentar</button></form>` : '';
    $('#detailsBody').innerHTML = `<p class="eyebrow">Chamado #${ticket.id}</p><h2>${escapeHtml(ticket.titulo)}</h2><p>${escapeHtml(ticket.descricao)}</p><span class="status-badge">${escapeHtml(ticket.status)}</span><h3>Historico</h3><div class="comments">${ticket.comentarios.map((item) => `<div><strong>${escapeHtml(item.autor)} · ${escapeHtml(item.papel)}</strong><p>${escapeHtml(item.mensagem)}</p></div>`).join('') || '<p>Sem comentarios.</p>'}</div>${tools}`;
    $('#details').showModal();
    $('#statusForm')?.addEventListener('submit', async (event) => { event.preventDefault(); await request(`/api/chamados/${id}/status`, { method: 'PATCH', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); await openTicket(id); await loadTickets(); });
    $('#commentForm')?.addEventListener('submit', async (event) => { event.preventDefault(); await request(`/api/chamados/${id}/comentarios`, { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); await openTicket(id); await loadTickets(); });
  } catch (error) { message(error.message, true); }
};

document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('active', item === button)); $('#loginForm').classList.toggle('hidden', button.dataset.tab !== 'login'); $('#registerForm').classList.toggle('hidden', button.dataset.tab !== 'register'); }));
$('#registerForm').addEventListener('submit', async (event) => { event.preventDefault(); try { await request('/api/register', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); event.target.reset(); document.querySelector('[data-tab="login"]').click(); } catch (error) { alert(error.message); } });
$('#loginForm').addEventListener('submit', async (event) => { event.preventDefault(); try { localStorage.setItem('helpdesk_api', apiBase()); const result = await request('/api/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); token = result.token; usuario = result.usuario; localStorage.setItem('helpdesk_token', token); localStorage.setItem('helpdesk_usuario', JSON.stringify(usuario)); showApp(); } catch (error) { alert(error.message); } });
$('#ticketForm').addEventListener('submit', async (event) => { event.preventDefault(); try { await request('/api/chamados', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); event.target.reset(); message('Chamado aberto com sucesso.'); await loadTickets(); } catch (error) { message(error.message, true); } });
$('#tickets').addEventListener('click', (event) => { const button = event.target.closest('[data-open]'); if (button) openTicket(button.closest('[data-id]').dataset.id); });
$('#reload').addEventListener('click', loadTickets);
$('#closeDetails').addEventListener('click', () => $('#details').close());
$('#logout').addEventListener('click', () => { token = ''; usuario = null; localStorage.removeItem('helpdesk_token'); localStorage.removeItem('helpdesk_usuario'); showApp(); });
showApp();
