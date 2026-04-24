/* =====================================================
   André Sagat Muaythai GYM — main.js
   =====================================================
   SEÇÕES:
   01. Configuração EmailJS          (linha ~10)
   02. Navbar / Scroll               (linha ~25)
   03. Máscara WhatsApp              (linha ~35)
   04. Formulário de Matrícula       (linha ~45)
   05. Popup Agendamento — Estado    (linha ~120)
   06. Popup Agendamento — Calendário(linha ~145)
   07. Popup Agendamento — Horários  (linha ~200)
   08. Popup Agendamento — Confirmar (linha ~245)
   09. Envio de Email Agendamento    (linha ~280)
   10. Inicialização (DOMContentLoaded)(linha ~320)
   ===================================================== */

// ── EmailJS init ──────────────────────────────────────
  // INSTRUÇÕES DE CONFIGURAÇÃO:
  // 1. Acesse https://www.emailjs.com e crie uma conta gratuita
  // 2. Crie um Email Service conectado ao Gmail (studiodemuaythai@gmail.com)
  // 3. Crie dois Email Templates:
  //    - template_academia : notificação para a academia (to: studiodemuaythai@gmail.com)
  //    - template_aluno    : boas-vindas + instrução Nextfit para o aluno
  // 4. Substitua os valores abaixo pelos seus IDs reais:
  const EJS_PUBLIC_KEY   = 'YOUR_PUBLIC_KEY';   // Account > API Keys
  const EJS_SERVICE_ID   = 'YOUR_SERVICE_ID';   // Email Services
  const EJS_TMPL_ACADEMIA = 'template_academia'; // Email Templates
  const EJS_TMPL_ALUNO   = 'template_aluno';    // Email Templates

  emailjs.init({ publicKey: EJS_PUBLIC_KEY });

  // ── Nav / Scroll ──────────────────────────────────────
  function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
  }
  // ── SCHEDULE POPUP ───────────────────────────────────────────
  const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const WEEKDAYS_FULL = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];

  // Horários por turno (seg-sex / sáb)
  const SLOTS = {
    manha: ['07:00','08:30'],
    tarde: ['15:00','16:30'],
    noite: ['19:00','20:30'],
  };
  const SLOTS_SAB = {
    manha: ['07:00','08:30'],
    tarde: [],
    noite: [],
  };

  let calYear, calMonth;
  let selectedDate = null; // Date object
  let selectedSlot = null; // string 'HH:MM'
  let schedStep = 1;

  function openSchedPopup() {
    const now = new Date();
    calYear  = now.getFullYear();
    calMonth = now.getMonth();
    selectedDate = null;
    selectedSlot = null;
    schedStep = 1;
    renderCal();
    updateStepUI();
    const ov = document.getElementById('schedOverlay');
    ov.style.display = 'flex';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => ov.classList.add('visible'));
    });
  }

  function closeSchedPopup() {
    const ov = document.getElementById('schedOverlay');
    ov.classList.remove('visible');
    setTimeout(() => { ov.style.display = 'none'; }, 300);
  }

  function handleSchedOverlayClick(e) {
    if (e.target === document.getElementById('schedOverlay')) closeSchedPopup();
  }

  // ── Calendar render ──
  function renderCal() {
    document.getElementById('calMonthLabel').textContent = `${MONTHS[calMonth]} ${calYear}`;
    const today = new Date(); today.setHours(0,0,0,0);
    const minDate = new Date(today); minDate.setDate(today.getDate() + 1); // min: amanhã

    const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=dom
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    let html = '';
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calYear, calMonth, d);
      const dow  = date.getDay(); // 0=dom
      const isPast   = date < minDate;
      const isSunday = dow === 0;
      const isSat    = dow === 6;
      const isToday  = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const disabled = isPast || isSunday;

      let cls = 'cal-day';
      if (disabled)    cls += ' disabled';
      if (isSat)       cls += ' weekend';
      if (isToday)     cls += ' today';
      if (isSelected)  cls += ' selected';

      const click = disabled ? '' : `onclick="selectDay(${calYear},${calMonth},${d})"`;
      html += `<div class="${cls}" ${click}>${d}</div>`;
    }
    document.getElementById('calDays').innerHTML = html;
  }

  function changeMonth(dir) {
    calMonth += dir;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0)  { calMonth = 11; calYear--; }
    renderCal();
  }

  function selectDay(y, m, d) {
    selectedDate = new Date(y, m, d);
    selectedSlot = null;
    renderCal();
    // Activate next button
    const btn = document.getElementById('schedNextBtn');
    btn.classList.add('ready');
  }

  // ── Time slots ──
  function renderTimeSlots() {
    const dow = selectedDate.getDay();
    const isSat = dow === 6;
    const slots = isSat ? SLOTS_SAB : SLOTS;

    const d = selectedDate;
    const dateStr = `${WEEKDAYS_FULL[dow].charAt(0).toUpperCase()+WEEKDAYS_FULL[dow].slice(1)}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
    document.getElementById('selectedDateLabel').querySelector('span').textContent = dateStr;

    function buildSlots(containerId, times) {
      const wrap = document.getElementById(containerId);
      const block = wrap.closest('.turno-block');
      if (!times || times.length === 0) { block.style.display = 'none'; return; }
      block.style.display = '';
      wrap.innerHTML = times.map(t =>
        `<div class="time-slot" onclick="selectSlot('${t}', this)">${t}</div>`
      ).join('');
    }

    buildSlots('slotsManha', slots.manha);
    buildSlots('slotsTarde', slots.tarde);
    buildSlots('slotsNoite', slots.noite);
  }

  function selectSlot(time, el) {
    selectedSlot = time;
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('schedNextBtn').classList.add('ready');
    document.getElementById('schedNextTxt').textContent = 'Confirmar Agendamento';
  }

  // ── Confirm ──
  function renderConfirm() {
    const dow = selectedDate.getDay();
    const d   = selectedDate;
    const dateStr = `${WEEKDAYS_FULL[dow].charAt(0).toUpperCase()+WEEKDAYS_FULL[dow].slice(1)}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
    const nome = document.getElementById('matNome').value.trim() || '—';
    const tel  = document.getElementById('matWhatsapp').value.trim() || '—';

    document.getElementById('confirmSummary').innerHTML = `
      <div class="confirm-row"><i class="fa-solid fa-user"></i><strong>Aluno</strong><span>${nome}</span></div>
      <div class="confirm-row"><i class="fa-solid fa-calendar"></i><strong>Data</strong><span>${dateStr}</span></div>
      <div class="confirm-row"><i class="fa-solid fa-clock"></i><strong>Horário</strong><span>${selectedSlot}</span></div>
      <div class="confirm-row"><i class="fa-brands fa-whatsapp"></i><strong>Contato</strong><span>${tel}</span></div>
      <div class="confirm-row"><i class="fa-solid fa-location-dot"></i><strong>Local</strong><span>Av. Cangaíba, 4530 — São Paulo, SP</span></div>
    `;
  }

  // ── Step navigation ──
  function goToStep(s) {
    schedStep = s;
    updateStepUI();
  }

  function schedNext() {
    if (schedStep === 1 && selectedDate) {
      goToStep(2);
    } else if (schedStep === 2 && selectedSlot) {
      goToStep(3);
      // Send scheduling confirmation
      sendSchedEmail();
    }
  }

  function updateStepUI() {
    // Panels
    document.getElementById('calWrap').style.display   = schedStep === 1 ? '' : 'none';
    document.getElementById('timeWrap').style.display  = schedStep === 2 ? 'block' : 'none';
    document.getElementById('confirmWrap').style.display = schedStep === 3 ? 'block' : 'none';

    // Step indicators
    [1,2,3].forEach(i => {
      const el = document.getElementById(`step-ind-${i}`);
      el.className = 'sched-step' + (i < schedStep ? ' done' : i === schedStep ? ' active' : '');
    });

    // Next button
    const btn = document.getElementById('schedNextBtn');
    const ico = document.getElementById('schedNextIco');
    const txt = document.getElementById('schedNextTxt');

    if (schedStep === 1) {
      btn.className = 'sched-btn-next' + (selectedDate ? ' ready' : '');
      txt.textContent = 'Escolher Horário';
      ico.className = 'fa-solid fa-arrow-right';
    } else if (schedStep === 2) {
      renderTimeSlots();
      btn.className = 'sched-btn-next' + (selectedSlot ? ' ready' : '');
      txt.textContent = 'Confirmar Agendamento';
      ico.className = 'fa-solid fa-check';
    } else {
      renderConfirm();
      btn.className = 'sched-btn-next';
      btn.style.display = 'none';
      document.querySelector('.sched-cancel-link').textContent = 'Fechar';
    }
  }

  async function sendSchedEmail() {
    const dow = selectedDate.getDay();
    const d   = selectedDate;
    const dateStr = `${WEEKDAYS_FULL[dow].charAt(0).toUpperCase()+WEEKDAYS_FULL[dow].slice(1)}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
    const nome  = document.getElementById('matNome').value.trim() || 'Aluno';
    const email = document.getElementById('matEmail').value.trim();
    const tel   = document.getElementById('matWhatsapp').value.trim();

    try {
      await emailjs.send(EJS_SERVICE_ID, EJS_TMPL_ACADEMIA, {
        to_email: 'studiodemuaythai@gmail.com',
        reply_to: email || 'sem@email.com',
        subject: `Agendamento Aula Experimental: ${nome} — ${dateStr} ${selectedSlot}`,
        nome, email: email||'—', whatsapp: tel||'—', idade:'—', plano:'Aula Experimental Gratuita',
        mensagem: `Data: ${dateStr} | Horário: ${selectedSlot}`,
      });
      if (email) {
        await emailjs.send(EJS_SERVICE_ID, EJS_TMPL_ALUNO, {
          to_email: email,
          subject: 'Sua aula experimental foi agendada! — André Sagat GYM',
          nome, email, whatsapp: tel||'—', idade:'—',
          plano: 'Aula Experimental Gratuita',
          mensagem: `Data: ${dateStr} | Horário: ${selectedSlot}`,
          is_experimental:'sim',
          nextfit_url:'https://www.nextfit.com.br',
          nextfit_ios:'https://apps.apple.com/br/app/nextfit/id1449761779',
          nextfit_android:'https://play.google.com/store/apps/details?id=br.com.nextfit',
          academia_whatsapp:'(11) 96605-8202',
          academia_endereco:'Av. Cangaíba, 4530 — São Paulo, SP',
        });
      }
    } catch(e) {
      console.warn('EmailJS schedule send failed:', e);
      // silent — confirmation UI already shown
    }
  }

  // ── Hook plan radio to open popup ──
  document.addEventListener('DOMContentLoaded', () => {
    const radios = document.querySelectorAll('input[name="plano"]');
    radios.forEach(r => {
      r.addEventListener('change', () => {
        if (r.value.includes('Experimental')) {
          openSchedPopup();
        }
      });
    });
  });

    window.addEventListener('scroll', () => {
    document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
    document.getElementById('navbar').style.borderBottomColor =
      window.scrollY > 10 ? 'rgba(212,160,23,0.35)' : 'rgba(212,160,23,0.2)';
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // ── WhatsApp mask ─────────────────────────────────────
  document.getElementById('matWhatsapp').addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g,'');
    if (v.length > 11) v = v.slice(0,11);
    if (v.length > 7) v = `(${v.slice(0,2)}) ${v.slice(2,3)} ${v.slice(3,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    e.target.value = v;
  });

  // ── Submit ────────────────────────────────────────────
  async function submitMatricula() {
    const nome     = document.getElementById('matNome').value.trim();
    const email    = document.getElementById('matEmail').value.trim();
    const whatsapp = document.getElementById('matWhatsapp').value.trim();
    const idade    = document.getElementById('matIdade').value.trim();
    const msg      = document.getElementById('matMsg').value.trim();
    const plano    = document.querySelector('input[name="plano"]:checked')?.value || '';
    const isExperimental = plano.includes('Experimental');

    // Validation
    if (!nome)  { shakeField('matNome');    return; }
    if (!email || !email.includes('@')) { shakeField('matEmail'); return; }
    if (!whatsapp) { shakeField('matWhatsapp'); return; }

    // Loading state
    setLoading(true);

    const commonParams = { nome, email, whatsapp, idade, plano, mensagem: msg || '—' };

    try {
      // Email 1: notificação para a academia
      await emailjs.send(EJS_SERVICE_ID, EJS_TMPL_ACADEMIA, {
        ...commonParams,
        to_email: 'studiodemuaythai@gmail.com',
        reply_to: email,
        subject:  `Nova Matrícula: ${nome} — ${plano}`,
      });

      // Email 2: boas-vindas para o aluno (só se não for aula experimental)
      // Para aula experimental também enviamos, mas com texto diferente (controlado no template)
      await emailjs.send(EJS_SERVICE_ID, EJS_TMPL_ALUNO, {
        ...commonParams,
        to_email: email,
        is_experimental: isExperimental ? 'sim' : 'não',
        subject: isExperimental
          ? 'Sua aula experimental foi agendada! — André Sagat GYM'
          : 'Bem-vindo(a) à André Sagat Muaythai GYM! 🦁',
        nextfit_url: 'https://www.nextfit.com.br',
        nextfit_ios: 'https://apps.apple.com/br/app/nextfit/id1449761779',
        nextfit_android: 'https://play.google.com/store/apps/details?id=br.com.nextfit',
        academia_whatsapp: '(11) 96605-8202',
        academia_endereco: 'Av. Cangaíba, 4530 — São Paulo, SP',
      });

      // Show success
      document.getElementById('successName').textContent = nome.split(' ')[0];
      document.getElementById('matFormBody').style.display = 'none';
      const s = document.getElementById('matSuccess');
      s.style.display = 'flex';
      s.style.flexDirection = 'column';

    } catch (err) {
      console.error('EmailJS error:', err);
      // Fallback: open mailto
      const body = encodeURIComponent(
        `Nome: ${nome}\nIdade: ${idade}\nWhatsApp: ${whatsapp}\nPlano: ${plano}\nMensagem: ${msg}`
      );
      window.location.href = `mailto:studiodemuaythai@gmail.com?subject=Nova%20Matr%C3%ADcula%3A%20${encodeURIComponent(nome)}&body=${body}`;
      alert('Redirecionando para seu e-mail. Por favor, configure o EmailJS para envio automático.');
    } finally {
      setLoading(false);
    }
  }

  function setLoading(on) {
    const btn = document.getElementById('matSubmitBtn');
    const ico = document.getElementById('matBtnIcon');
    const txt = document.getElementById('matBtnText');
    const sp  = document.getElementById('matSpinner');
    btn.disabled = on;
    ico.style.display = on ? 'none' : '';
    sp.style.display  = on ? 'block' : 'none';
    txt.textContent   = on ? 'Enviando...' : 'Enviar Matrícula';
  }

  function shakeField(id) {
    const el = document.getElementById(id);
    el.style.borderColor = '#e74c3c';
    el.focus();
    el.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:300,iterations:2});
    setTimeout(() => el.style.borderColor = '', 2000);
  }
</script>