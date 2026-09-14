/* Lava Jato Dois Irmãos — aplicação local com persistência no navegador */
const storageKey = "dois-irmaos-gestao-v1";
const sessionKey = "dois-irmaos-admin-session";
const adminAccounts = [
  { username: "alvaro", password: "doisirmaos@2026", name: "Alvaro Afonso" },
  { username: "alisson", password: "doisirmaos@2026", name: "Alisson Santos" }
];
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let currentAdmin = null;

function localDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
function offsetDate(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return localDate(date);
}
function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
function formatDate(dateString, long = false) {
  if (!dateString) return "—";
  return (long ? longDateFormatter : shortDateFormatter).format(parseDate(dateString));
}
function money(value) { return currencyFormatter.format(Number(value || 0)); }
function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
function uid(prefix) { return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`; }
function statusClass(status) {
  return ({ "Concluído": "done", "Em andamento": "progress", "Agendado": "scheduled", "Cancelado": "cancelled" })[status] || "scheduled";
}
function statusTag(status) { return `<span class="status ${statusClass(status)}">${status}</span>`; }
function escapeHtml(value = "") { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char]); }

function seedData() {
  return {
    business: { name: "Lava Jato Dois Irmãos", admin: "Administrador", phone: "", goal: 12000 },
    employees: [
      { id: "emp-1", name: "João Silva", role: "Lavador", commission: 18, active: true },
      { id: "emp-2", name: "Marcos Souza", role: "Lavador", commission: 15, active: true },
      { id: "emp-3", name: "Lucas Santos", role: "Lavador", commission: 20, active: true },
      { id: "emp-4", name: "Pedro Alves", role: "Auxiliar", commission: 10, active: true }
    ],
    services: [
      { id: "srv-1", date: offsetDate(0), time: "09:00", client: "Carla Mendes", phone: "", vehicle: "Honda Civic", plate: "RDM-4A19", service: "Lavagem completa", price: 85, payment: "Pix", status: "Concluído", employees: ["emp-1", "emp-4"], notes: "" },
      { id: "srv-2", date: offsetDate(0), time: "10:30", client: "Roberto Lima", phone: "", vehicle: "Jeep Compass", plate: "KLU-8B70", service: "Lavagem detalhada", price: 150, payment: "Cartão", status: "Em andamento", employees: ["emp-3", "emp-2"], notes: "" },
      { id: "srv-3", date: offsetDate(0), time: "14:00", client: "Fernanda Costa", phone: "", vehicle: "Toyota Corolla", plate: "PXA-2D18", service: "Lavagem simples", price: 55, payment: "Dinheiro", status: "Agendado", employees: ["emp-2"], notes: "" },
      { id: "srv-4", date: offsetDate(-1), time: "15:20", client: "Rafael Martins", phone: "", vehicle: "Fiat Toro", plate: "JQM-6F25", service: "Higienização interna", price: 130, payment: "Pix", status: "Concluído", employees: ["emp-3", "emp-1"], notes: "" },
      { id: "srv-5", date: offsetDate(-2), time: "11:10", client: "Ana Paula", phone: "", vehicle: "VW T-Cross", plate: "NVE-1J02", service: "Lavagem completa", price: 85, payment: "Cartão", status: "Concluído", employees: ["emp-1", "emp-4"], notes: "" },
      { id: "srv-6", date: offsetDate(-3), time: "09:30", client: "Diego Rocha", phone: "", vehicle: "Chevrolet Onix", plate: "SRT-9A82", service: "Lavagem simples", price: 55, payment: "Dinheiro", status: "Concluído", employees: ["emp-2"], notes: "" },
      { id: "srv-7", date: offsetDate(-5), time: "13:00", client: "Bianca Freire", phone: "", vehicle: "Hyundai HB20", plate: "HZA-5C45", service: "Lavagem completa", price: 85, payment: "Pix", status: "Concluído", employees: ["emp-1", "emp-3"], notes: "" },
      { id: "srv-8", date: offsetDate(-8), time: "16:00", client: "Gustavo Nunes", phone: "", vehicle: "Renault Kwid", plate: "FGL-0B12", service: "Lavagem simples", price: 55, payment: "Pix", status: "Concluído", employees: ["emp-4"], notes: "" }
    ],
    inventory: [
      { id: "prod-1", name: "Shampoo automotivo", category: "Limpeza", quantity: 8, minimum: 5, unit: "L", cost: 24.9 },
      { id: "prod-2", name: "Cera líquida", category: "Acabamento", quantity: 2, minimum: 4, unit: "L", cost: 38.5 },
      { id: "prod-3", name: "Pretinho para pneus", category: "Acabamento", quantity: 6, minimum: 3, unit: "L", cost: 19.9 },
      { id: "prod-4", name: "Pano de microfibra", category: "Acessórios", quantity: 11, minimum: 8, unit: "un", cost: 7.5 },
      { id: "prod-5", name: "Desengraxante", category: "Limpeza", quantity: 1, minimum: 3, unit: "L", cost: 27 }
    ],
    expenses: [
      { id: "exp-1", date: offsetDate(-1), description: "Compra de produtos", category: "Estoque", supplier: "Auto Clean", payment: "Pix", amount: 342.8 },
      { id: "exp-2", date: offsetDate(-4), description: "Conta de água", category: "Utilidades", supplier: "Saneamento", payment: "Boleto", amount: 186.5 },
      { id: "exp-3", date: offsetDate(-6), description: "Troca de mangueira", category: "Manutenção", supplier: "Hidro Peças", payment: "Cartão", amount: 89.9 }
    ]
  };
}

let data = seedData();
let currentSection = "dashboard";
async function carregarDadosDoServidor() {
  try {
    const response = await fetch("/api/dados");
    const resultado = await response.json();

    if (resultado.dados) {
      data = {
        ...seedData(),
        ...resultado.dados,
        clients: resultado.dados.clients || [],
        services: resultado.dados.services || [],
        appointments: resultado.dados.appointments || [],
        payments: resultado.dados.payments || [],
        employees: resultado.dados.employees || [],
        business: resultado.dados.business || seedData().business
      };
    }

    renderedSections.clear();
    dirtySections.clear();
    pendingRenders.clear();

    init();

  } catch (erro) {
    console.error("Erro ao carregar dados do servidor:", erro);
    init();
  }
}
// Navegação de alta responsividade: renderizamos uma seção somente quando
// ela precisa ser criada/atualizada e nunca bloqueamos o clique do menu.
const renderedSections = new Set();
const dirtySections = new Set();
const pendingRenders = new Map();

const renderers = {
  dashboard: renderDashboard, services: renderServices, employees: renderEmployees,
  payroll: renderPayroll, inventory: renderInventory, expenses: renderExpenses,
  reports: renderReport, settings: renderSettings
};
async function saveData(section = currentSection, affected = []) {
  try {
    const response = await fetch("/api/dados", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar dados no servidor");
    }

    console.log("Dados salvos no servidor");

  } catch (erro) {
    console.error(erro);
    alert("Não foi possível salvar os dados no servidor.");
    return;
  }

  dirtySections.add(section);
  dirtySections.add("dashboard");

  refreshSection(section, true);

  if (section !== "dashboard") {
    refreshSection("dashboard", true);
 }
}

function refreshSection(section, force = false) {
  if (!renderers[section]) return;
  if (!force && renderedSections.has(section) && !dirtySections.has(section)) return;
  renderedSections.add(section);
  dirtySections.delete(section);
  renderers[section]();
}

function scheduleSectionRender(section) {
  if (!renderers[section] || (renderedSections.has(section) && !dirtySections.has(section))) return;
  if (pendingRenders.has(section)) return;
  const run = () => {
    pendingRenders.delete(section);
    // Se o usuário já saiu da tela, ainda podemos preparar a próxima tela
    // sem bloquear a interação atual.
    refreshSection(section, true);
  };
  const id = 'requestIdleCallback' in window
    ? requestIdleCallback(run, { timeout: 500 })
    : setTimeout(run, 0);
  pendingRenders.set(section, id);
}

function getEmployee(id) { return data.employees.find((employee) => employee.id === id); }
function serviceEmployees(service) { return service.employees.map(getEmployee).filter(Boolean); }
function completedServices() { return data.services.filter((service) => service.status === "Concluído"); }
function sum(items, accessor) { return items.reduce((total, item) => total + Number(accessor(item) || 0), 0); }
function showNotice(message) { const notice = $("#appNotice"); notice.textContent = message; notice.classList.add("show"); clearTimeout(showNotice.timer); showNotice.timer = setTimeout(() => notice.classList.remove("show"), 3200); }

function dashboardStats() {
  const month = localDate().slice(0, 7);
  const completedThisMonth = completedServices().filter((service) => service.date.startsWith(month));
  const revenue = sum(completedThisMonth, (service) => service.price);
  const ticket = completedThisMonth.length ? revenue / completedThisMonth.length : 0;
  const low = data.inventory.filter((product) => Number(product.quantity) <= Number(product.minimum));
  return { completedThisMonth, revenue, ticket, low };
}
function renderDashboard() {
  const stats = dashboardStats();
  $("#dashboardUserName").textContent = currentAdmin?.name || "Administrador";
  $("#metricRevenue").textContent = money(stats.revenue);
  $("#metricServices").textContent = stats.completedThisMonth.length;
  $("#metricTicket").textContent = money(stats.ticket);
  $("#metricStock").textContent = `${stats.low.length} ${stats.low.length === 1 ? "item" : "itens"}`;
  $("#revenueTrend").textContent = `${completedServices().length} serviços concluídos no total`;
  $("#servicesTrend").textContent = "no mês atual";
  $("#servicesBadge").textContent = data.services.filter((service) => service.status !== "Concluído" && service.status !== "Cancelado").length;

  const days = Array.from({ length: 7 }, (_, index) => offsetDate(index - 6));
  const totals = days.map((day) => sum(completedServices().filter((service) => service.date === day), (service) => service.price));
  const maximum = Math.max(...totals, 1);
  $("#weeklyChart").innerHTML = days.map((day, index) => {
    const label = weekdayFormatter.format(parseDate(day)).replace(".", "");
    const height = Math.max(5, Math.round((totals[index] / maximum) * 100));
    return `<div class="bar-col ${day === localDate() ? "today" : ""}" title="${formatDate(day)}: ${money(totals[index])}"><span class="bar-value">${money(totals[index])}</span><div class="bar" style="height:${height}%"></div><span class="bar-label">${label}</span></div>`;
  }).join("");

  const agenda = data.services.filter((service) => service.date === localDate() && service.status !== "Concluído" && service.status !== "Cancelado").sort((a, b) => a.time.localeCompare(b.time));
  $("#agendaSubtitle").textContent = agenda.length ? `${agenda.length} ${agenda.length === 1 ? "serviço programado" : "serviços programados"}` : "Nenhum serviço pendente";
  $("#agendaList").innerHTML = agenda.length ? agenda.map((service) => `<div class="agenda-item"><div class="time-badge">${service.time}</div><div class="agenda-main"><strong>${escapeHtml(service.client)}</strong><span>${escapeHtml(service.vehicle)} · ${escapeHtml(service.service)}</span></div>${statusTag(service.status)}</div>`).join("") : `<div class="empty-state"><strong>Agenda livre</strong>Registre um novo serviço para começar.</div>`;

  const recent = [...completedServices()].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)).slice(0, 5);
  $("#recentServices").innerHTML = recent.length ? recent.map((service) => `<tr><td class="client-cell"><strong>${escapeHtml(service.client)}</strong><span>${escapeHtml(service.vehicle)} · ${escapeHtml(service.plate)}</span></td><td>${escapeHtml(service.service)}</td><td class="money">${money(service.price)}</td><td>${statusTag(service.status)}</td></tr>`).join("") : emptyTable(4, "Ainda não existem serviços concluídos.");

  const leaders = data.employees.map((employee) => ({ employee, count: stats.completedThisMonth.filter((service) => service.employees.includes(employee.id)).length })).sort((a, b) => b.count - a.count).slice(0, 4);
  $("#leaderboard").innerHTML = leaders.length ? leaders.map((entry, index) => `<div class="leader-item"><span class="rank">0${index + 1}</span><div class="leader-name"><strong>${escapeHtml(entry.employee.name)}</strong><span>${escapeHtml(entry.employee.role)}</span></div><span class="leader-count">${entry.count} ${entry.count === 1 ? "serviço" : "serviços"}</span></div>`).join("") : `<div class="empty-state">Cadastre funcionários para visualizar a equipe.</div>`;
}
function emptyTable(columns, message) { return `<tr><td colspan="${columns}"><div class="empty-state">${message}</div></td></tr>`; }

function renderServices() {
  const query = $("#serviceSearch").value.trim().toLowerCase();
  const status = $("#serviceStatusFilter").value;
  const date = $("#serviceDateFilter").value;
  const rows = [...data.services].filter((service) => {
    const haystack = `${service.client} ${service.vehicle} ${service.plate} ${service.service}`.toLowerCase();
    return (!query || haystack.includes(query)) && (status === "all" || service.status === status) && (!date || service.date === date);
  }).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  $("#servicesTable").innerHTML = rows.length ? rows.map((service) => `<tr><td><strong>${formatDate(service.date)}</strong><span class="cell-sub">${service.time}</span></td><td class="client-cell"><strong>${escapeHtml(service.client)}</strong><span>${escapeHtml(service.phone || "Sem telefone")}</span></td><td class="vehicle-cell"><strong>${escapeHtml(service.vehicle)}</strong><span>${escapeHtml(service.plate)}</span></td><td>${escapeHtml(service.service)}</td><td>${serviceEmployees(service).map((employee) => `<span class="mini-person">${escapeHtml(employee.name.split(" ")[0])}</span>`).join("") || "—"}</td><td class="money">${money(service.price)}</td><td>${statusTag(service.status)}</td><td><div class="row-actions"><button class="row-action" type="button" title="Editar" data-action="edit-service" data-id="${service.id}">✎</button><button class="row-action" type="button" title="Excluir" data-action="delete-service" data-id="${service.id}">⌫</button></div></td></tr>`).join("") : emptyTable(8, "Nenhum serviço encontrado com estes filtros.");
}

function employeeMonthStats(employee) {
  const month = localDate().slice(0, 7);
  const jobs = completedServices().filter((service) => service.date.startsWith(month) && service.employees.includes(employee.id));
  return { jobs, total: sum(jobs, (service) => service.price * employee.commission / 100) };
}
function renderEmployees() {
  $("#employeeCards").innerHTML = data.employees.length ? data.employees.map((employee) => {
    const stats = employeeMonthStats(employee);
    return `<article class="employee-card"><div class="employee-menu"><button class="row-action" type="button" title="Editar funcionário" data-action="edit-employee" data-id="${employee.id}">✎</button><button class="row-action" type="button" title="Excluir funcionário" data-action="delete-employee" data-id="${employee.id}">⌫</button></div><div class="employee-top"><div class="avatar">${initials(employee.name)}</div><div><h3>${escapeHtml(employee.name)}</h3><p>${escapeHtml(employee.role)} · ${employee.active ? "Ativo" : "Inativo"}</p></div></div><div class="employee-stats"><div><span>Percentual por lavagem</span><strong>${employee.commission}%</strong></div><div><span>Comissão no mês</span><strong>${money(stats.total)}</strong></div></div><div class="employee-bottom"><span>${stats.jobs.length} ${stats.jobs.length === 1 ? "lavagem" : "lavagens"} no mês</span><b>${employee.active ? "● Disponível" : "● Inativo"}</b></div></article>`;
  }).join("") : `<div class="empty-state"><strong>Nenhum funcionário cadastrado</strong>Adicione a sua equipe para calcular as comissões.</div>`;
}

function currentWeekRange() {
  const today = new Date();
  const day = today.getDay() || 7;
  const start = new Date(today); start.setDate(today.getDate() - day + 1);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  return { start: localDate(start), end: localDate(end) };
}
function renderPayroll() {
  const start = $("#payrollStart").value;
  const end = $("#payrollEnd").value;
  const jobs = completedServices().filter((service) => (!start || service.date >= start) && (!end || service.date <= end));
  const revenue = sum(jobs, (service) => service.price);
  let total = 0;
  const rows = data.employees.map((employee) => {
    const employeeJobs = jobs.filter((service) => service.employees.includes(employee.id));
    const base = sum(employeeJobs, (service) => service.price);
    const commission = sum(employeeJobs, (service) => service.price * employee.commission / 100);
    total += commission;
    return { employee, employeeJobs, base, commission };
  });
  $("#payrollJobCount").textContent = jobs.length;
  $("#payrollRevenue").textContent = money(revenue);
  $("#payrollTotal").textContent = money(total);
  $("#payrollTable").innerHTML = rows.length ? rows.map((row) => `<tr><td class="employee-cell"><strong>${escapeHtml(row.employee.name)}</strong><span>${escapeHtml(row.employee.role)}</span></td><td>${row.employee.commission}%</td><td>${row.employeeJobs.length}</td><td>${money(row.base)}</td><td class="money">${money(row.commission)}</td><td><button class="row-action" type="button" title="Ver serviços" data-action="show-employee-jobs" data-id="${row.employee.id}">⌕</button></td></tr>`).join("") : emptyTable(6, "Cadastre funcionários para ver a folha semanal.");
}

function renderInventory() {
  const low = data.inventory.filter((product) => Number(product.quantity) <= Number(product.minimum));
  $("#productCount").textContent = data.inventory.length;
  $("#lowStockCount").textContent = low.length;
  $("#stockValue").textContent = money(sum(data.inventory, (product) => product.quantity * product.cost));
  $("#inventoryTable").innerHTML = data.inventory.length ? data.inventory.map((product) => {
    const isLow = Number(product.quantity) <= Number(product.minimum);
    return `<tr><td><strong>${escapeHtml(product.name)}</strong></td><td>${escapeHtml(product.category)}</td><td class="money">${Number(product.quantity).toLocaleString("pt-BR")} ${escapeHtml(product.unit)}</td><td>${Number(product.minimum).toLocaleString("pt-BR")} ${escapeHtml(product.unit)}</td><td>${money(product.cost)}</td><td class="money">${money(product.cost * product.quantity)}</td><td><span class="status ${isLow ? "scheduled" : "done"}">${isLow ? "Estoque baixo" : "Normal"}</span></td><td><div class="row-actions"><button class="row-action" type="button" data-action="edit-product" data-id="${product.id}" title="Editar">✎</button><button class="row-action" type="button" data-action="delete-product" data-id="${product.id}" title="Excluir">⌫</button></div></td></tr>`;
  }).join("") : emptyTable(8, "Nenhum produto cadastrado.");
}

function monthExpenses() { return data.expenses.filter((expense) => expense.date.startsWith(localDate().slice(0, 7))); }
function renderExpenses() {
  const month = monthExpenses();
  const byCategory = month.reduce((groups, expense) => { groups[expense.category] = (groups[expense.category] || 0) + Number(expense.amount); return groups; }, {});
  const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  $("#expensesMonth").textContent = money(sum(month, (expense) => expense.amount));
  $("#topExpenseCategory").textContent = top ? top[0] : "—";
  $("#topExpenseAmount").textContent = top ? money(top[1]) : "sem lançamentos";
  $("#expenseCount").textContent = month.length;
  const ordered = [...data.expenses].sort((a, b) => b.date.localeCompare(a.date));
  $("#expensesTable").innerHTML = ordered.length ? ordered.map((expense) => `<tr><td>${formatDate(expense.date)}</td><td><strong>${escapeHtml(expense.description)}</strong></td><td>${escapeHtml(expense.category)}</td><td>${escapeHtml(expense.supplier || "—")}</td><td>${escapeHtml(expense.payment)}</td><td class="money">${money(expense.amount)}</td><td><div class="row-actions"><button class="row-action" type="button" data-action="edit-expense" data-id="${expense.id}" title="Editar">✎</button><button class="row-action" type="button" data-action="delete-expense" data-id="${expense.id}" title="Excluir">⌫</button></div></td></tr>`).join("") : emptyTable(7, "Nenhum gasto registrado.");
}

function reportRange() {
  return { start: $("#reportStart").value, end: $("#reportEnd").value, status: $("#reportStatus").value };
}
function inRange(item, range) { return (!range.start || item.date >= range.start) && (!range.end || item.date <= range.end); }
function renderReport() {
  const range = reportRange();
  const type = $("#reportType").value;
  const services = data.services.filter((service) => inRange(service, range) && (range.status === "all" || service.status === range.status));
  const concluded = services.filter((service) => service.status === "Concluído");
  const revenue = sum(concluded, (service) => service.price);
  const expenses = data.expenses.filter((expense) => inRange(expense, range));
  const expenseTotal = sum(expenses, (expense) => expense.amount);
  const title = { financial: "Resumo financeiro", services: "Serviços realizados", team: "Produção da equipe" }[type];
  const dateTitle = `${range.start ? formatDate(range.start) : "início"} a ${range.end ? formatDate(range.end) : "hoje"}`;
  let body = "";
  if (type === "financial") {
    const payout = concluded.reduce((total, service) => total + serviceEmployees(service).reduce((subtotal, employee) => subtotal + service.price * employee.commission / 100, 0), 0);
    body = `<div class="report-summary"><article class="metric-card revenue"><div class="metric-icon">↗</div><div><p>Receitas</p><strong>${money(revenue)}</strong><small>${concluded.length} serviços concluídos</small></div></article><article class="metric-card danger"><div class="metric-icon">↓</div><div><p>Gastos</p><strong>${money(expenseTotal)}</strong><small>${expenses.length} lançamentos</small></div></article><article class="metric-card accent"><div class="metric-icon">◉</div><div><p>Resultado operacional</p><strong>${money(revenue - expenseTotal - payout)}</strong><small>Receita − gastos − comissões</small></div></article></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Indicador</th><th>Valor</th></tr></thead><tbody><tr><td>Comissões projetadas da equipe</td><td class="money">${money(payout)}</td></tr><tr><td>Ticket médio</td><td class="money">${money(concluded.length ? revenue / concluded.length : 0)}</td></tr><tr><td>Margem antes de comissões</td><td class="money">${money(revenue - expenseTotal)}</td></tr></tbody></table></div>`;
  } else if (type === "services") {
    body = `<div class="report-summary"><article class="metric-card"><div class="metric-icon">▣</div><div><p>Registros selecionados</p><strong>${services.length}</strong><small>${range.status === "all" ? "todos os status" : "serviços concluídos"}</small></div></article><article class="metric-card revenue"><div class="metric-icon">↗</div><div><p>Faturamento concluído</p><strong>${money(revenue)}</strong><small>no período</small></div></article><article class="metric-card"><div class="metric-icon">◉</div><div><p>Ticket médio</p><strong>${money(concluded.length ? revenue / concluded.length : 0)}</strong><small>por serviço concluído</small></div></article></div><div class="table-wrap"><table class="data-table large-table"><thead><tr><th>Data</th><th>Cliente</th><th>Veículo</th><th>Serviço</th><th>Valor</th><th>Status</th></tr></thead><tbody>${services.length ? services.sort((a, b) => b.date.localeCompare(a.date)).map((service) => `<tr><td>${formatDate(service.date)}</td><td>${escapeHtml(service.client)}</td><td>${escapeHtml(service.vehicle)}</td><td>${escapeHtml(service.service)}</td><td class="money">${money(service.price)}</td><td>${statusTag(service.status)}</td></tr>`).join("") : emptyTable(6, "Nenhum serviço no período selecionado.")}</tbody></table></div>`;
  } else {
    const teamRows = data.employees.map((employee) => { const jobs = concluded.filter((service) => service.employees.includes(employee.id)); return { employee, jobs, base: sum(jobs, (service) => service.price), commission: sum(jobs, (service) => service.price * employee.commission / 100) }; }).sort((a, b) => b.jobs.length - a.jobs.length);
    body = `<div class="report-summary"><article class="metric-card"><div class="metric-icon">♙</div><div><p>Equipe analisada</p><strong>${data.employees.length}</strong><small>funcionários cadastrados</small></div></article><article class="metric-card"><div class="metric-icon">▣</div><div><p>Participações</p><strong>${teamRows.reduce((total, row) => total + row.jobs.length, 0)}</strong><small>em lavagens concluídas</small></div></article><article class="metric-card accent"><div class="metric-icon">%</div><div><p>Comissões</p><strong>${money(sum(teamRows, (row) => row.commission))}</strong><small>projeção do período</small></div></article></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Funcionário</th><th>Lavagens</th><th>Base gerada</th><th>Comissão</th></tr></thead><tbody>${teamRows.map((row) => `<tr><td><strong>${escapeHtml(row.employee.name)}</strong></td><td>${row.jobs.length}</td><td class="money">${money(row.base)}</td><td class="money">${money(row.commission)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  $("#reportOutput").innerHTML = `<article class="panel"><div class="panel-header"><div><h3>${title}</h3><p>${dateTitle}</p></div><button class="secondary-button" type="button" id="printReport">▣ Imprimir</button></div>${body}<p class="report-footer">Gerado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date())} · ${escapeHtml(data.business.name)}</p></article>`;
  $("#printReport")?.addEventListener("click", () => window.print());
}

function renderSettings() {
  $("#businessName").value = data.business.name || "";
  $("#businessPhone").value = data.business.phone || "";
  $("#monthlyGoal").value = data.business.goal || "";
  $(".brand strong").textContent = (data.business.name || "Dois Irmãos").replace(/^Lava Jato\s*/i, "").toUpperCase();
}
function openModal({ eyebrow = "CADASTRO", title, content, onSubmit }) {
  $("#modalEyebrow").textContent = eyebrow;
  $("#modalTitle").textContent = title;
  const form = $("#modalForm"); form.innerHTML = content; form.onsubmit = (event) => { event.preventDefault(); onSubmit(new FormData(form), form); };
  $("#modalBackdrop").hidden = false; $("#appModal").hidden = false;
  setTimeout(() => $("#modalForm input:not([type=checkbox]):not([type=radio]), #modalForm select")?.focus(), 40);
}
function closeModal() { $("#modalBackdrop").hidden = true; $("#appModal").hidden = true; $("#modalForm").innerHTML = ""; }
function cancelButton() { return `<button class="secondary-button modal-close" type="button">Cancelar</button>`; }
function modalActions(label) { return `<div class="form-actions">${cancelButton()}<button class="primary-button" type="submit">${label}</button></div>`; }
function employeeChecks(selected = []) { return data.employees.filter((employee) => employee.active).map((employee) => `<label class="check-label"><input type="checkbox" name="employees" value="${employee.id}" ${selected.includes(employee.id) ? "checked" : ""}><span>${escapeHtml(employee.name)} <small>(${employee.commission}%)</small></span></label>`).join("") || `<span class="muted">Cadastre funcionários ativos para selecioná-los.</span>`; }
function openServiceModal(service = null) {
  const isEdit = Boolean(service);
  const s = service || { date: localDate(), time: "09:00", client: "", phone: "", vehicle: "", plate: "", service: "Lavagem completa", price: "", payment: "Pix", status: "Agendado", employees: [], notes: "" };
  openModal({
    eyebrow: isEdit ? "EDIÇÃO DE SERVIÇO" : "NOVO ATENDIMENTO", title: isEdit ? "Editar serviço" : "Registrar lavagem", content: `<div class="form-grid"><label>Data<input name="date" type="date" required value="${s.date}"></label><label>Horário<input name="time" type="time" required value="${s.time}"></label><label>Cliente<input name="client" required placeholder="Nome do cliente" value="${escapeHtml(s.client)}"></label><label>WhatsApp<input name="phone" placeholder="(00) 00000-0000" value="${escapeHtml(s.phone)}"></label><label>Veículo<input name="vehicle" required placeholder="Ex.: Honda Civic" value="${escapeHtml(s.vehicle)}"></label><label>Placa<input name="plate" required placeholder="ABC-1D23" value="${escapeHtml(s.plate)}"></label><label>Tipo de serviço<select name="service"><option ${s.service === "Lavagem simples" ? "selected" : ""}>Lavagem simples</option><option ${s.service === "Lavagem completa" ? "selected" : ""}>Lavagem completa</option><option ${s.service === "Lavagem detalhada" ? "selected" : ""}>Lavagem detalhada</option><option ${s.service === "Higienização interna" ? "selected" : ""}>Higienização interna</option><option ${s.service === "Polimento" ? "selected" : ""}>Polimento</option></select></label><label>Valor (R$)<input name="price" type="number" min="0" step="0.01" required value="${s.price}"></label><label>Forma de pagamento<select name="payment"><option ${s.payment === "Pix" ? "selected" : ""}>Pix</option><option ${s.payment === "Dinheiro" ? "selected" : ""}>Dinheiro</option><option ${s.payment === "Cartão" ? "selected" : ""}>Cartão</option><option ${s.payment === "Boleto" ? "selected" : ""}>Boleto</option></select></label><label>Status<select name="status"><option ${s.status === "Agendado" ? "selected" : ""}>Agendado</option><option ${s.status === "Em andamento" ? "selected" : ""}>Em andamento</option><option ${s.status === "Concluído" ? "selected" : ""}>Concluído</option><option ${s.status === "Cancelado" ? "selected" : ""}>Cancelado</option></select></label><label class="full">Funcionários participantes<div class="employee-checks">${employeeChecks(s.employees)}</div></label><label class="full">Observações<textarea name="notes" placeholder="Informações adicionais (opcional)">${escapeHtml(s.notes)}</textarea></label></div>${modalActions(isEdit ? "Salvar alterações" : "Registrar serviço")}`, onSubmit: (formData, form) => {
      const updated = { id: service?.id || uid("srv"), date: formData.get("date"), time: formData.get("time"), client: formData.get("client").trim(), phone: formData.get("phone").trim(), vehicle: formData.get("vehicle").trim(), plate: formData.get("plate").trim().toUpperCase(), service: formData.get("service"), price: Number(formData.get("price")), payment: formData.get("payment"), status: formData.get("status"), employees: formData.getAll("employees"), notes: formData.get("notes").trim() };
      if (!updated.employees.length && updated.status === "Concluído") { showNotice("Selecione pelo menos um participante para concluir a lavagem."); return; }
      if (isEdit) data.services = data.services.map((item) => item.id === service.id ? updated : item); else data.services.push(updated);
      closeModal(); saveData(); showNotice(isEdit ? "Serviço atualizado com sucesso." : "Serviço registrado com sucesso.");
    }
  });
}
function openEmployeeModal(employee = null) {
  const e = employee || { name: "", role: "Lavador", commission: 15, active: true };
  openModal({
    eyebrow: employee ? "EDIÇÃO DE EQUIPE" : "NOVA PESSOA", title: employee ? "Editar funcionário" : "Adicionar funcionário", content: `<div class="form-grid"><label class="full">Nome completo<input name="name" required value="${escapeHtml(e.name)}" placeholder="Nome do funcionário"></label><label>Função<select name="role"><option ${e.role === "Lavador" ? "selected" : ""}>Lavador</option><option ${e.role === "Auxiliar" ? "selected" : ""}>Auxiliar</option><option ${e.role === "Gerente" ? "selected" : ""}>Gerente</option></select></label><label>Percentual por lavagem<input name="commission" required type="number" min="0" max="100" step="0.5" value="${e.commission}"></label><label class="full check-label"><input type="checkbox" name="active" ${e.active ? "checked" : ""}> Funcionário ativo e disponível para os serviços</label></div>${modalActions(employee ? "Salvar alterações" : "Adicionar funcionário")}`, onSubmit: (formData) => {
      const updated = { id: employee?.id || uid("emp"), name: formData.get("name").trim(), role: formData.get("role"), commission: Number(formData.get("commission")), active: formData.has("active") };
      if (employee) data.employees = data.employees.map((item) => item.id === employee.id ? updated : item); else data.employees.push(updated);
      closeModal(); saveData(); showNotice(employee ? "Funcionário atualizado." : "Funcionário adicionado à equipe.");
    }
  });
}
function openProductModal(product = null) {
  const p = product || { name: "", category: "Limpeza", quantity: "", minimum: "", unit: "L", cost: "" };
  openModal({
    eyebrow: product ? "EDIÇÃO DE ESTOQUE" : "NOVO PRODUTO", title: product ? "Editar produto" : "Adicionar produto", content: `<div class="form-grid"><label class="full">Nome do produto<input name="name" required value="${escapeHtml(p.name)}" placeholder="Ex.: Shampoo automotivo"></label><label>Categoria<select name="category"><option ${p.category === "Limpeza" ? "selected" : ""}>Limpeza</option><option ${p.category === "Acabamento" ? "selected" : ""}>Acabamento</option><option ${p.category === "Acessórios" ? "selected" : ""}>Acessórios</option><option ${p.category === "Equipamentos" ? "selected" : ""}>Equipamentos</option></select></label><label>Unidade<select name="unit"><option ${p.unit === "L" ? "selected" : ""}>L</option><option ${p.unit === "un" ? "selected" : ""}>un</option><option ${p.unit === "kg" ? "selected" : ""}>kg</option><option ${p.unit === "ml" ? "selected" : ""}>ml</option></select></label><label>Quantidade atual<input name="quantity" type="number" min="0" step="0.01" required value="${p.quantity}"></label><label>Estoque mínimo<input name="minimum" type="number" min="0" step="0.01" required value="${p.minimum}"></label><label class="full">Custo por unidade (R$)<input name="cost" type="number" min="0" step="0.01" required value="${p.cost}"></label></div>${modalActions(product ? "Salvar alterações" : "Adicionar produto")}`, onSubmit: (formData) => {
      const updated = { id: product?.id || uid("prod"), name: formData.get("name").trim(), category: formData.get("category"), quantity: Number(formData.get("quantity")), minimum: Number(formData.get("minimum")), unit: formData.get("unit"), cost: Number(formData.get("cost")) };
      if (product) data.inventory = data.inventory.map((item) => item.id === product.id ? updated : item); else data.inventory.push(updated);
      closeModal(); saveData(); showNotice(product ? "Produto atualizado." : "Produto adicionado ao estoque.");
    }
  });
}
function openInventoryMovement() {
  if (!data.inventory.length) { showNotice("Cadastre um produto antes de movimentar o estoque."); return; }
  openModal({
    eyebrow: "MOVIMENTAÇÃO", title: "Movimentar estoque", content: `<div class="form-grid"><label class="full">Produto<select name="product" required>${data.inventory.map((product) => `<option value="${product.id}">${escapeHtml(product.name)} (${product.quantity} ${product.unit})</option>`).join("")}</select></label><label class="full">Tipo de movimentação<div class="transaction-type"><label><input type="radio" name="type" value="entry" checked> Entrada</label><label><input type="radio" name="type" value="exit"> Saída</label></div></label><label>Quantidade<input name="quantity" type="number" min="0.01" step="0.01" required></label><label>Motivo<input name="reason" required placeholder="Ex.: compra, uso diário"></label></div>${modalActions("Confirmar movimentação")}`, onSubmit: (formData) => {
      const product = data.inventory.find((item) => item.id === formData.get("product")); const quantity = Number(formData.get("quantity")); const type = formData.get("type");
      if (type === "exit" && product.quantity < quantity) { showNotice("A saída não pode ser maior que o estoque disponível."); return; }
      product.quantity = Number(product.quantity) + (type === "entry" ? quantity : -quantity);
      closeModal(); saveData(); showNotice(`Movimentação de ${product.name} registrada.`);
    }
  });
}
function openExpenseModal(expense = null) {
  const e = expense || { date: localDate(), description: "", category: "Estoque", supplier: "", payment: "Pix", amount: "" };
  openModal({
    eyebrow: expense ? "EDIÇÃO DE DESPESA" : "NOVA DESPESA", title: expense ? "Editar gasto" : "Registrar gasto", content: `<div class="form-grid"><label>Data<input type="date" name="date" required value="${e.date}"></label><label>Valor (R$)<input type="number" name="amount" min="0" step="0.01" required value="${e.amount}"></label><label class="full">Descrição<input name="description" required placeholder="Ex.: compra de produtos" value="${escapeHtml(e.description)}"></label><label>Categoria<select name="category"><option ${e.category === "Estoque" ? "selected" : ""}>Estoque</option><option ${e.category === "Utilidades" ? "selected" : ""}>Utilidades</option><option ${e.category === "Manutenção" ? "selected" : ""}>Manutenção</option><option ${e.category === "Aluguel" ? "selected" : ""}>Aluguel</option><option ${e.category === "Outros" ? "selected" : ""}>Outros</option></select></label><label>Fornecedor<input name="supplier" placeholder="Opcional" value="${escapeHtml(e.supplier)}"></label><label class="full">Forma de pagamento<select name="payment"><option ${e.payment === "Pix" ? "selected" : ""}>Pix</option><option ${e.payment === "Dinheiro" ? "selected" : ""}>Dinheiro</option><option ${e.payment === "Cartão" ? "selected" : ""}>Cartão</option><option ${e.payment === "Boleto" ? "selected" : ""}>Boleto</option></select></label></div>${modalActions(expense ? "Salvar alterações" : "Registrar gasto")}`, onSubmit: (formData) => {
      const updated = { id: expense?.id || uid("exp"), date: formData.get("date"), description: formData.get("description").trim(), category: formData.get("category"), supplier: formData.get("supplier").trim(), payment: formData.get("payment"), amount: Number(formData.get("amount")) };
      if (expense) data.expenses = data.expenses.map((item) => item.id === expense.id ? updated : item); else data.expenses.push(updated);
      closeModal(); saveData(); showNotice(expense ? "Gasto atualizado." : "Gasto registrado com sucesso.");
    }
  });
}

function changeSection(section) {
  if (section === currentSection) return;
  // Primeiro troca a tela visualmente. O trabalho pesado fica para depois,
  // deixando o clique do menu responder imediatamente.
  currentSection = section;
  const active = document.getElementById(section);
  document.querySelectorAll(".content-section.active").forEach((el) => el.classList.remove("active"));
  if (active) active.classList.add("active");
  document.querySelectorAll(".nav-item[data-section]").forEach((element) => {
    element.classList.toggle("active", element.dataset.section === section);
  });
  const pages = { dashboard: ["VISÃO GERAL", "Dashboard"], services: ["OPERAÇÃO", "Serviços"], employees: ["PESSOAS", "Funcionários"], payroll: ["FINANCEIRO", "Salário semanal"], inventory: ["SUPRIMENTOS", "Estoque"], expenses: ["FINANCEIRO", "Gastos"], reports: ["ANÁLISES", "Relatórios"], settings: ["SISTEMA", "Configurações"] };
  const page = pages[section] || pages.dashboard;
  $("#pageEyebrow").textContent = page[0];
  $("#pageTitle").textContent = page[1];
  $("#sidebar").classList.remove("open"); $("#sidebarOverlay").classList.remove("show");
  window.scrollTo(0, 0);
  scheduleSectionRender(section);
}
function deleteItem(collection, id, label) {
  const item = data[collection].find((entry) => entry.id === id); if (!item || !confirm(`Excluir ${label}? Esta ação não pode ser desfeita.`)) return;
  data[collection] = data[collection].filter((entry) => entry.id !== id); saveData(); showNotice(`${label[0].toUpperCase() + label.slice(1)} excluído.`);
}

function setSidebarOpen(open) {
  $("#sidebar").classList.toggle("open", open);
  $("#sidebarOverlay").classList.toggle("show", open);
}
function bindEvents() {
  $$(".nav-item[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      changeSection(button.dataset.section);
    });
  });

  $$("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      changeSection(button.dataset.go);
    });
  });

  const menuToggle = $("#menuToggle");

  if (menuToggle) {
    menuToggle.onclick = () => {
      setSidebarOpen(!$("#sidebar").classList.contains("open"));
    };
  }

  const sidebarClose = $("#sidebarClose");

  if (sidebarClose) {
    sidebarClose.onclick = () => setSidebarOpen(false);
  }

  const sidebarOverlay = $("#sidebarOverlay");

  if (sidebarOverlay) {
    sidebarOverlay.onclick = () => setSidebarOpen(false);
  }

  const themeToggle = $("#themeToggle");

  if (themeToggle) {
    themeToggle.onclick = () => {
      document.body.classList.toggle("dark");

      localStorage.setItem(
        "dois-irmaos-theme",
        document.body.classList.contains("dark") ? "dark" : "light"
      );
    };
  }

  $$(".open-service, #newServiceTop, #dashAddService").forEach((button) => {
    button.addEventListener("click", () => openServiceModal());
  });

  const openEmployee = $("#openEmployee");
  if (openEmployee) {
    openEmployee.onclick = () => openEmployeeModal();
  }

  const openProduct = $("#openProduct");
  if (openProduct) {
    openProduct.onclick = () => openProductModal();
  }

  const openInventoryMove = $("#openInventoryMove");
  if (openInventoryMove) {
    openInventoryMove.onclick = openInventoryMovement;
  }

  const openExpense = $("#openExpense");
  if (openExpense) {
    openExpense.onclick = () => openExpenseModal();
  }

  let serviceSearchTimer;

  const serviceSearch = $("#serviceSearch");
  if (serviceSearch) {
    serviceSearch.addEventListener("input", () => {
      clearTimeout(serviceSearchTimer);
      serviceSearchTimer = setTimeout(renderServices, 120);
    });
  }

  const serviceStatusFilter = $("#serviceStatusFilter");
  if (serviceStatusFilter) {
    serviceStatusFilter.addEventListener("change", renderServices);
  }

  const serviceDateFilter = $("#serviceDateFilter");
  if (serviceDateFilter) {
    serviceDateFilter.addEventListener("change", renderServices);
  }

  const clearServiceFilters = $("#clearServiceFilters");

  if (clearServiceFilters) {
    clearServiceFilters.onclick = () => {
      $("#serviceSearch").value = "";
      $("#serviceStatusFilter").value = "all";
      $("#serviceDateFilter").value = "";
      renderServices();
    };
  }

  const payrollStart = $("#payrollStart");
  if (payrollStart) {
    payrollStart.addEventListener("change", renderPayroll);
  }

  const payrollEnd = $("#payrollEnd");
  if (payrollEnd) {
    payrollEnd.addEventListener("change", renderPayroll);
  }

  const currentWeek = $("#currentWeek");
  if (currentWeek) {
    currentWeek.onclick = setWeekInputs;
  }

  const printPayroll = $("#printPayroll");
  if (printPayroll) {
    printPayroll.onclick = () => {
      changeSection("payroll");
      window.print();
    };
  }

  const generateReport = $("#generateReport");
  if (generateReport) {
    generateReport.onclick = renderReport;
  }

  const reportStart = $("#reportStart");
  if (reportStart) {
    reportStart.addEventListener("change", renderReport);
  }

  const reportEnd = $("#reportEnd");
  if (reportEnd) {
    reportEnd.addEventListener("change", renderReport);
  }

  const reportType = $("#reportType");
  if (reportType) {
    reportType.addEventListener("change", renderReport);
  }

  const reportStatus = $("#reportStatus");
  if (reportStatus) {
    reportStatus.addEventListener("change", renderReport);
  }

  const settingsForm = $("#settingsForm");

  if (settingsForm) {
    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();

      data.business = {
        ...data.business,
        name: $("#businessName").value.trim(),
        phone: $("#businessPhone").value.trim(),
        goal: Number($("#monthlyGoal").value) || 0
      };

      saveData();
      showNotice("Configurações salvas.");
    });
  }

  const modalBackdrop = $("#modalBackdrop");
  if (modalBackdrop) {
    modalBackdrop.onclick = closeModal;
  }

  const appModal = $("#appModal");

  if (appModal) {
    appModal.addEventListener("click", (event) => {
      if (event.target.closest(".modal-close")) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if ($("#appModal") && !$("#appModal").hidden) {
      closeModal();
    } else if (
      $("#sidebar") &&
      $("#sidebar").classList.contains("open")
    ) {
      setSidebarOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const { action, id } = button.dataset;

    if (action === "edit-service") {
      openServiceModal(
        data.services.find((item) => item.id === id)
      );
    }

    if (action === "delete-service") {
      deleteItem("services", id, "serviço");
    }

    if (action === "edit-employee") {
      openEmployeeModal(getEmployee(id));
    }

    if (action === "delete-employee") {
      if (
        data.services.some((service) =>
          service.employees.includes(id)
        )
      ) {
        showNotice(
          "Este funcionário possui serviços vinculados. Edite os serviços antes de removê-lo."
        );
        return;
      }

      deleteItem("employees", id, "funcionário");
    }

    if (action === "edit-product") {
      openProductModal(
        data.inventory.find((item) => item.id === id)
      );
    }

    if (action === "delete-product") {
      deleteItem("inventory", id, "produto");
    }

    if (action === "edit-expense") {
      openExpenseModal(
        data.expenses.find((item) => item.id === id)
      );
    }

    if (action === "delete-expense") {
      deleteItem("expenses", id, "gasto");
    }

    if (action === "show-employee-jobs") {
      const employee = getEmployee(id);

      const jobs = completedServices().filter(
        (service) =>
          service.employees.includes(id) &&
          service.date >= $("#payrollStart").value &&
          service.date <= $("#payrollEnd").value
      );

      showNotice(
        `${employee.name}: ${jobs.length} lavagem(ns) no período.`
      );
    }
  });
}
function setWeekInputs() { const range = currentWeekRange(); $("#payrollStart").value = range.start; $("#payrollEnd").value = range.end; renderPayroll(); }
function init() {
  $("#todayLabel").textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "short" }).format(new Date()).replace(/^./, (letter) => letter.toUpperCase());
  const range = currentWeekRange(); $("#payrollStart").value = range.start; $("#payrollEnd").value = range.end;
  $("#reportStart").value = `${localDate().slice(0, 7)}-01`; $("#reportEnd").value = localDate();
  if (localStorage.getItem("dois-irmaos-theme") === "dark") document.body.classList.add("dark");
  bindEvents(); refreshSection("dashboard", true); refreshSection("settings", true);
}

function savedAdminSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(sessionKey));

    if (!session) {
      return null;
    }

    return {
      username: session.username,
      name: session.name,
      id: session.id
    };

  } catch {
    return null;
  }
}

function startAuthenticatedSession(account) {
  currentAdmin = account;

  document.body.classList.add("authenticated");

  $("#activeUserName").textContent = account.name;
  $("#activeUserRole").textContent = "Administrador · acesso total";

  init();
}

function setupAuthentication() {
  $("#passwordToggle").addEventListener("click", () => {
    const password = $("#loginPassword");
    const isHidden = password.type === "password";

    password.type = isHidden ? "text" : "password";

    $("#passwordToggle").setAttribute(
      "aria-label",
      isHidden ? "Ocultar senha" : "Mostrar senha"
    );
  });

  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = $("#loginUsername").value.trim().toLowerCase();
    const password = $("#loginPassword").value;
    const error = $("#loginError");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario: username,
          senha: password
        })
      });

      const result = await response.json();

      if (!response.ok || !result.sucesso) {
        error.hidden = false;
        $("#loginPassword").select();
        return;
      }

      error.hidden = true;

      const account = {
        username: result.usuario.nome,
        name: result.usuario.nome,
        id: result.usuario.id
      };

      sessionStorage.setItem(
        sessionKey,
        JSON.stringify(account)
      );

      startAuthenticatedSession(account);

    } catch (erro) {
      console.error(erro);
      error.hidden = false;
      $("#loginPassword").select();
    }
  });

  $("#logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem(sessionKey);
    location.reload();
  });

  const session = savedAdminSession();

  if (session) {
    startAuthenticatedSession(session);
  } else {
    $("#loginUsername").focus();
  }
}

setupAuthentication();
carregarDadosDoServidor();
