/* ============ PERSISTÊNCIA (backends genéricos, uma instância por coleção) ============ */
/* Local: dados só no navegador (usado quando js/00-config.js está vazio). */
const LocalBackend = key => ({
  async start(set) {
    let d; try { d = JSON.parse(localStorage.getItem(key)) } catch { }
    set(Array.isArray(d) ? d : [])
  },
  _w(list) { try { localStorage.setItem(key, JSON.stringify(list)) } catch { } },
  async put(c, list) { this._w(list) },
  async del(id, list) { this._w(list) }
});
/* Compartilhado: Supabase (Postgres + REST). Configure em js/00-config.js. */
const SupabaseBackend = (table, order, row, errMsg) => ({
  h(extra) { const k = CONFIG.supabaseKey; return { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json', ...extra } },
  url: q => CONFIG.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + table + q,
  async start(set) {
    let last = '';
    const pull = async () => {
      try {
        const r = await fetch(this.url('?select=*&order=' + order), { headers: this.h() }); if (!r.ok) throw new Error(r.status);
        const d = await r.json(), j = JSON.stringify(d);
        if (j !== last) { last = j; set(d.map(({ updated_at, ...c }) => c)) }
      } catch { if (!last) { last = '[]'; set([]); toast(errMsg, true) } }
    };
    await pull();
    setInterval(pull, 5000);                                   // sincroniza a cada 5 s
    document.addEventListener('visibilitychange', () => { if (!document.hidden) pull() });
  },
  async put(c) {
    const r = await fetch(this.url(''), {
      method: 'POST', headers: this.h({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify(row(c))
    }); if (!r.ok) throw new Error(r.status)
  },
  async del(id) { const r = await fetch(this.url('?id=eq.' + encodeURIComponent(id)), { method: 'DELETE', headers: this.h() }); if (!r.ok) throw new Error(r.status) }
});
/* Para outro backend (API própria), crie um objeto com start(set)/put(c)/del(id). */
const createRepo = ({ key, table, order, row, errMsg }) => ({
  cache: [], mode: 'local', be: null, _s: null, _w: null,
  start() {
    return this._s || (this._s = (async () => {
      const shared = !!(CONFIG.supabaseUrl && CONFIG.supabaseKey);
      this.be = shared ? SupabaseBackend(table, order, row, errMsg) : LocalBackend(key); this.mode = shared ? 'shared' : 'local';
      await this.be.start(l => { this.cache = l; if (this._ready) this._w && this._w(l) }); this._ready = true
    })())
  },
  watch(fn) { this._w = fn },
  async list() { await this.start(); return this.cache },
  async put(c) {
    await this.start(); const i = this.cache.findIndex(x => x.id === c.id);
    this.cache = i < 0 ? [...this.cache, c] : this.cache.map(x => x.id === c.id ? c : x);
    await this.be.put(c, this.cache); this._w && this._w(this.cache)
  },
  async del(id) {
    await this.start(); this.cache = this.cache.filter(x => x.id !== id);
    await this.be.del(id, this.cache); this._w && this._w(this.cache)
  }
});
/* Clientes (tabela "clients") */
const Repo = createRepo({
  key: 'linkhub.clients.v1', table: 'clients', order: 'name',
  row: c => ({ id: c.id, name: c.name, notes: c.notes, links: c.links, info: c.info || [], files: c.files || [] }),
  errMsg: 'Não foi possível conectar ao banco. Confira js/00-config.js e o supabase.sql.'
});
/* Links Úteis (tabela "useful_links") */
const UsefulRepo = createRepo({
  key: 'linkhub.useful.v1', table: 'useful_links', order: 'category,title',
  row: u => ({ id: u.id, title: u.title, url: u.url, description: u.description || '', category: u.category }),
  errMsg: 'Não foi possível carregar os Links Úteis. Execute o supabase.sql atualizado no Supabase.'
});
