const timeNode = document.querySelector("#local-time");
const header = document.querySelector(".site-header");
const spotlight = document.querySelector(".spotlight");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const canHover = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function updateLocalTime() {
  if (!timeNode) return;

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });

  timeNode.textContent = `Sao Paulo, ${formatter.format(new Date())}`;
}

function splitHeroTitle() {
  const title = document.querySelector("h1");
  if (!title || title.dataset.split) return;

  const signature = title.querySelector(".hero-signature");
  const signatureText = signature?.textContent.trim();
  const titleText = title.textContent.replace(signatureText ?? "", "").trim();
  const words = titleText.split(/\s+/).filter(Boolean);
  title.innerHTML = words
    .map(
      (word, index) => `<span class="word" style="--i:${index}">${word}</span>`,
    )
    .join(" ");

  if (signatureText) {
    title.insertAdjacentHTML(
      "beforeend",
      `<br /><span class="word hero-signature" style="--i:${words.length}">${signatureText}</span>`,
    );
  }

  title.dataset.split = "true";
}

function setupReveal() {
  const fallbackNodes = document.querySelectorAll(
    ".section-label, .section-body, .tech-heading, .tech-card, .stack-grid article, .project, .career-heading, .career-card, .timeline article, .highlight-list span, .connect-layout > *",
  );

  if (!window.anime) {
    fallbackNodes.forEach((node) => node.classList.add("reveal"));

    if (reducedMotion) {
      fallbackNodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const fallbackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            fallbackObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    fallbackNodes.forEach((node) => fallbackObserver.observe(node));
    return;
  }

  const sections = document.querySelectorAll(".hero, main > .section");

  function getAnimatedChildren(section) {
    const selectors = [
      ".section-label",
      ".section-body",
      ".hero-copy",
      ".hero-card",
      ".hero-ticker",
      ".about-profile",
      ".tech-heading",
      ".project-heading",
      ".tech-card",
      ".project",
      ".career-heading",
      ".career-card",
      ".timeline article",
      ".highlight-list span",
      ".connect-copy",
      ".connect-links a",
      ".connect-layout",
    ];

    return [...section.querySelectorAll(selectors.join(", "))].filter(
      (node) => !node.closest(".project-modal"),
    );
  }

  sections.forEach((section) => {
    const children = getAnimatedChildren(section);
    section.dataset.animeSection = "pending";

    if (reducedMotion) {
      section.dataset.animeSection = "done";
      children.forEach((child) => {
        child.style.opacity = "1";
        child.style.transform = "none";
      });
      return;
    }

    window.anime.set(section, {
      opacity: 0.96,
      translateY: 26,
    });

    window.anime.set(children, {
      opacity: 0,
      translateY: 34,
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          !entry.isIntersecting ||
          entry.target.dataset.animeSection === "done"
        )
          return;

        const section = entry.target;
        const children = getAnimatedChildren(section);
        section.dataset.animeSection = "done";

        window.anime
          .timeline({
            easing: "easeOutExpo",
            duration: 900,
          })
          .add({
            targets: section,
            opacity: [0.96, 1],
            translateY: [26, 0],
            duration: 760,
          })
          .add(
            {
              targets: children,
              opacity: [0, 1],
              translateY: [34, 0],
              delay: window.anime.stagger(78, { start: 80 }),
              duration: 960,
            },
            "-=560",
          );

        observer.unobserve(section);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
  );

  sections.forEach((section) => observer.observe(section));
}

function setupCursor() {
  if (!canHover || !cursorDot || !cursorRing) return;

  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;
  let mouseX = ringX;
  let mouseY = ringY;

  window.addEventListener(
    "pointermove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    },
    { passive: true },
  );

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

    if (spotlight) {
      spotlight.style.opacity = "1";
      spotlight.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(animateRing);
  }

  animateRing();

  document
    .querySelectorAll(
      "a, button, .project, .tech-card, .career-card, .stack-grid article, .stack-grid li, .highlight-list span",
    )
    .forEach((node) => {
      node.addEventListener("pointerenter", () =>
        document.body.classList.add("is-hovering"),
      );
      node.addEventListener("pointerleave", () =>
        document.body.classList.remove("is-hovering"),
      );
    });
}

function setupHoverLight() {
  if (!canHover) return;

  document
    .querySelectorAll(
      ".hero-card, .tech-card, .stack-grid article, .project, .career-card, .timeline article, .highlight-list span",
    )
    .forEach((node) => {
      let rect = null;
      let frame = null;
      let pointerEvent = null;

      node.addEventListener("pointerenter", () => {
        rect = node.getBoundingClientRect();
      });

      node.addEventListener(
        "pointermove",
        (event) => {
          pointerEvent = event;
          if (frame) return;

          frame = requestAnimationFrame(() => {
            rect ||= node.getBoundingClientRect();
            const x = ((pointerEvent.clientX - rect.left) / rect.width) * 100;
            const y = ((pointerEvent.clientY - rect.top) / rect.height) * 100;
            node.style.setProperty("--mx", `${x}%`);
            node.style.setProperty("--my", `${y}%`);
            frame = null;
          });
        },
        { passive: true },
      );

      node.addEventListener("pointerleave", () => {
        rect = null;
      });
    });
}

function setupTilt() {
  if (!canHover || reducedMotion) return;

  document
    .querySelectorAll(".hero-card, .tech-card, .stack-grid article")
    .forEach((node) => {
      let rect = null;
      let frame = null;
      let pointerEvent = null;

      node.addEventListener("pointerenter", () => {
        rect = node.getBoundingClientRect();
      });

      node.addEventListener(
        "pointermove",
        (event) => {
          pointerEvent = event;
          if (frame) return;

          frame = requestAnimationFrame(() => {
            rect ||= node.getBoundingClientRect();
            const x = pointerEvent.clientX - rect.left;
            const y = pointerEvent.clientY - rect.top;
            const rotateY = (x / rect.width - 0.5) * 8;
            const rotateX = (y / rect.height - 0.5) * -8;
            node.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            frame = null;
          });
        },
        { passive: true },
      );

      node.addEventListener("pointerleave", () => {
        rect = null;
        node.style.transform = "";
      });
    });
}

function setupMagneticElements() {
  if (!canHover || reducedMotion) return;

  document
    .querySelectorAll(".button, .header-cta, .connect a, .brand")
    .forEach((node) => {
      let rect = null;
      let frame = null;
      let pointerEvent = null;

      node.addEventListener("pointerenter", () => {
        rect = node.getBoundingClientRect();
      });

      node.addEventListener(
        "pointermove",
        (event) => {
          pointerEvent = event;
          if (frame) return;

          frame = requestAnimationFrame(() => {
            rect ||= node.getBoundingClientRect();
            const x = pointerEvent.clientX - rect.left - rect.width / 2;
            const y = pointerEvent.clientY - rect.top - rect.height / 2;
            node.style.transform = `translate(${x * 0.12}px, ${y * 0.2}px)`;
            frame = null;
          });
        },
        { passive: true },
      );

      node.addEventListener("pointerleave", () => {
        rect = null;
        node.style.transform = "";
      });
    });
}

function setupScramble() {
  const glyphs = "01<>/{}[]#$%&*+-";
  const targets = document.querySelectorAll(
    ".nav-links a, .button, .project h3, .stack-grid h3, .highlight-list span",
  );

  targets.forEach((node) => {
    node.classList.add("scramble");
    node.dataset.originalText = node.textContent.trim();

    node.addEventListener("pointerenter", () => {
      if (reducedMotion) return;

      const original = node.dataset.originalText;
      let frame = 0;
      clearInterval(node.scrambleTimer);

      node.scrambleTimer = setInterval(() => {
        node.textContent = original
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < frame / 2) return original[index];
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join("");

        frame += 1;

        if (frame > original.length * 2) {
          clearInterval(node.scrambleTimer);
          node.textContent = original;
        }
      }, 22);
    });

    node.addEventListener("pointerleave", () => {
      clearInterval(node.scrambleTimer);
      node.textContent = node.dataset.originalText;
    });
  });
}

function setupStackDetails() {
  const modal = document.querySelector("#stack-modal");
  if (!modal) return;

  const kickerNode = modal.querySelector("[data-stack-kicker]");
  const titleNode = modal.querySelector("[data-stack-title]");
  const descriptionNode = modal.querySelector("[data-stack-description]");
  const toolsNode = modal.querySelector("[data-stack-tools]");
  const usesNode = modal.querySelector("[data-stack-uses]");
  const focusNode = modal.querySelector("[data-stack-focus]");
  const closeButtons = modal.querySelectorAll("[data-close-stack]");

  const iconBase = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
  const details = new Map([
    [
      "Frontend",
      {
        kicker: "Interface e experiencia",
        title: "Frontend",
        description:
          "Camada visual dos projetos: estrutura, responsividade, interaes, estados de tela e pequenos detalhes que fazem a interface parecer viva sem perder clareza.",
        tools: [
          {
            name: "TypeScript",
            icon: `${iconBase}/typescript/typescript-original.svg`,
          },
          { name: "React", icon: `${iconBase}/Areact/Areact-original.svg` },
        ],
        uses: [
          "Landing pages",
          "Componentes reutilizaveis",
          "Layouts responsivos",
          "Animacoes e microinteraes",
        ],
        focus: [
          "Acessibilidade",
          "Performance visual",
          "Design systems",
          "Experiencia mobile",
        ],
      },
    ],
    [
      "Backend",
      {
        kicker: "APIs e regra de negocio",
        title: "Backend",
        description:
          "Parte responsavel por dados, autenticacao, integracoes e regras do sistema. E onde a aplicao deixa de ser so tela e passa a funcionar como produto.",
        tools: [
          { name: "Node.js", icon: `${iconBase}/nodejs/nodejs-original.svg` },
          {
            name: "Express.js",
            icon: `${iconBase}/express/express-original.svg`,
          },
          { name: "Flask", icon: `${iconBase}/flask/flask-original.svg` },
          { name: "FastAPI", icon: `${iconBase}/fastapi/fastapi-original.svg` },
          { name: "JWT", icon: "assets/jwt-logo.svg" },
          { name: "Integracoes", initials: "EXT" },
        ],
        uses: [
          "APIs com Flask e FastAPI",
          "Login e sessoes",
          "Validacao de dados",
          "Consumo de APIs externas",
        ],
        focus: [
          "FastAPI",
          "Arquitetura limpa",
          "Seguranca",
          "Logs e tratamento de erros",
        ],
      },
    ],
    [
      "Dados",
      {
        kicker: "Persistencia e consultas",
        title: "Dados",
        description:
          "Organizacao, consulta e exibicao de informacoes. Uso bancos relacionais, importacao de dados e dashboards para transformar registros em decisao.",
        tools: [
          { name: "SQLite", icon: `${iconBase}/sqlite/sqlite-original.svg` },
          { name: "MySQL", icon: `${iconBase}/mysql/mysql-original.svg` },
          { name: "SQL", initials: "SQL" },
          {
            name: "Lecom",
            icon: "https://conjecto.com.br/wp-content/uploads/2023/06/logo_lecom_COLORIDO_RGB-1.png",
          },
          { name: "Dashboards", initials: "BI" },
        ],
        uses: [
          "Modelagem simples",
          "Consultas SQL",
          "Importacao de dados",
          "Historicos e relatorios",
        ],
        focus: [
          "Indices",
          "Performance de query",
          "Integridade dos dados",
          "Visualizacao",
        ],
      },
    ],
    [
      "Ferramentas",
      {
        kicker: "Fluxo de criacao",
        title: "Ferramentas",
        description:
          "Ferramentas que ajudam a desenhar, versionar, testar e publicar projetos com mais controle, desde a ideia inicial ate a entrega online.",
        tools: [
          { name: "GitHub", icon: `${iconBase}/github/github-original.svg` },
          { name: "VS Code", icon: `${iconBase}/vscode/vscode-original.svg` },
          { name: "Figma", icon: `${iconBase}/figma/figma-original.svg` },
          { name: "UX/UI", initials: "UX" },
          { name: "Deploy", initials: "CD" },
        ],
        uses: [
          "Versionamento",
          "Prototipos de tela",
          "Documentacao",
          "Deploy e manutencao",
        ],
        focus: [
          "Organizacao de repos",
          "Componentizacao",
          "Prototipacao",
          "Entrega continua",
        ],
      },
    ],
  ]);

  function renderList(node, items) {
    node.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  }

  function renderTools(tools) {
    toolsNode.innerHTML = tools
      .map((tool) => {
        let visual = `<span class="stack-tool-initials">${tool.initials}</span>`;

        if (tool.icon) {
          visual = `<img src="${tool.icon}" alt="" loading="lazy" decoding="async" />`;
        }

        return `
          <article class="stack-tool">
            ${visual}
            <strong>${tool.name}</strong>
          </article>
        `;
      })
      .join("");
  }

  function openModal(stack) {
    kickerNode.textContent = stack.kicker;
    titleNode.textContent = stack.title;
    descriptionNode.textContent = stack.description;
    renderTools(stack.tools);
    renderList(usesNode, stack.uses);
    renderList(focusNode, stack.focus);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  closeButtons.forEach((button) =>
    button.addEventListener("click", closeModal),
  );

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open"))
      closeModal();
  });

  document.querySelectorAll(".stack-grid article").forEach((card) => {
    const title = card.querySelector("h3").textContent.trim();
    const stack = details.get(title);
    if (!stack) return;

    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Abrir detalhes de ${title}`);

    const open = () => openModal(stack);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function setupProjectDetails() {
  const modal = document.querySelector("#project-modal");
  if (!modal) return;

  const indexNode = modal.querySelector("[data-project-index]");
  const titleNode = modal.querySelector("[data-project-title]");
  const descriptionNode = modal.querySelector("[data-project-description]");
  const featuresNode = modal.querySelector("[data-project-features]");
  const tagsNode = modal.querySelector("[data-project-tags]");
  const AreadmeNode = modal.querySelector("[data-project-Areadme]");
  const linkNode = modal.querySelector("[data-project-link]");
  const closeButtons = modal.querySelectorAll("[data-close-modal]");

  const details = new Map([
    [
      "EcoWay",
      {
        index: "Projeto 001",
        slug: "ecoway",
        title: "EcoWay",
        url: "https://ecoway-fly.onrender.com",
        description:
          "Projeto academico desenvolvido na Facens para UPX III. O EcoWay e uma plataforma para planejamento de rotas de veiculos eletricos no Brasil: calcula autonomia, sugere estacoes compativeis, considera margem de seguranca, gera paradas de recarga e mantem historico para o usuario acompanhar viagens anteriores.",
        features: [
          "Projeto de faculdade - Facens UPX III",
          "Landing page publicada",
          "Auth por cookie HTTP-only",
          "Cadastro de veiculos",
          "Busca por endereco, CEP e coordenadas",
          "Planejamento energetico de rotas",
          "Recomendacao de recargas",
          "Historico de rotas",
          "Fallback local sem chave externa",
        ],
        tags: [
          "React",
          "Flask",
          "SQLite",
          "ViaCEP",
          "Nominatim",
          "OpenRouteService",
          "Open Charge Map",
        ],
        AreadmeHtml: `
          <section class="Areadme-section">
            <h3>Viso geral</h3>
            <blockquote>Planejador de rotas para veiculos eletricos, com foco em autonomia, seguranca e paradas de recarga.</blockquote>
            <p>O EcoWay calcula se a viagem e viavel com a bateria atual, estima consumo, consulta provedores externos e retorna informacoes prontas para a interface explicar a rota ao usuario.</p>
          </section>
          <section class="Areadme-section">
            <h3>Stack tecnologico</h3>
            <table>
              <tbody>
                <tr><th>Frontend</th><td>React, CSS, interface responsiva</td></tr>
                <tr><th>Backend</th><td>Flask, SQLite, APIs REST</td></tr>
                <tr><th>Integracoes</th><td>ViaCEP, Nominatim, OpenRouteService, Open Charge Map</td></tr>
              </tbody>
            </table>
          </section>
          <section class="Areadme-section">
            <h3>Estrutura</h3>
            <pre><code>ecoway/
├─ frontend/      # interface da landing e fluxos do usuario
├─ backend/       # rotas Flask, autenticacao e calculo de rota
├─ database/      # SQLite, migracoes e seeds
└─ integrations/  # provedores externos e fallbacks</code></pre>
          </section>
        `,
        AreadmeHtml: `
          <section class="Areadme-section">
            <h3>EcoWay</h3>
            <p>EcoWay e uma aplicao web para planejamento de rotas de veiculos eletricos no Brasil. O sistema calcula autonomia, margem de seguranca, necessidade de recarga e sugere paradas ao longo da rota com base em provedores externos.</p>
          </section>
          <section class="Areadme-section">
            <h3>Stack</h3>
            <ul>
              <li><strong>Backend:</strong> Flask + SQLite</li>
              <li><strong>Frontend:</strong> Vite + JavaScript modular + Leaflet</li>
              <li><strong>Cliente HTTP:</strong> Axios</li>
              <li><strong>Validacao de contratos no frontend:</strong> Zod</li>
              <li><strong>Testes backend:</strong> Pytest</li>
              <li><strong>Lint Python:</strong> Ruff</li>
            </ul>
          </section>
          <section class="Areadme-section">
            <h3>Preview da Aplicacao</h3>
            <h4>Landing Page</h4>
            <img src="assets/landingecoway.png" alt="Landing Page do EcoWay" />
            <h4>Planejamento de Rotas</h4>
            <img src="https://github.com/vidaaal/EcoWay/raw/master/docs/route-planning.png" alt="Planejamento de Rotas" />
            <h4>Planejamento de Rotas 2</h4>
            <img src="https://github.com/vidaaal/EcoWay/raw/master/docs/route-planning2.png" alt="Dashboard de planejamento de rotas" />
            <h4>Historico de Rotas</h4>
            <img src="https://github.com/vidaaal/EcoWay/raw/master/docs/history.png" alt="Historico de Rotas" />
          </section>
          <section class="Areadme-section">
            <h3>Integracoes externas</h3>
            <ul>
              <li>OpenRouteService: geocoding e direcoes</li>
              <li>Open Charge Map: busca de estacoes de recarga</li>
              <li>ViaCEP: consulta de CEP</li>
              <li>Nominatim: apoio a busca reversa e normalizacao de enderecos</li>
              <li>Open EV Data: catalogo tecnico para autopreenchimento de veiculos</li>
            </ul>
          </section>
          <section class="Areadme-section">
            <h3>Funcionalidades implementadas</h3>
            <ul>
              <li>Cadastro, login e sessao por cookie</li>
              <li>Cadastro de veiculos por usuario</li>
              <li>Busca de <code>marca + modelo + ano</code></li>
              <li>Autopreenchimento tecnico de veiculo</li>
              <li>Planejamento com <code>0</code>, <code>1</code> ou multiplas recargas</li>
              <li>Margem de seguranca configuravel</li>
              <li>Enderecos por busca textual, CEP, localizacao atual ou clique no mapa</li>
              <li>Historico de rotas por usuario</li>
              <li>Link para abrir rota no Google Maps</li>
              <li>Tema claro/escuro persistente</li>
              <li>Diagnosticos de planejamento no payload da rota</li>
              <li>Fallbacks para falha de provedores externos</li>
            </ul>
          </section>
          <section class="Areadme-section">
            <h3>Arquitetura do planejador</h3>
            <p>O backend de planejamento foi separado por responsabilidade:</p>
            <table>
              <tbody>
                <tr><th>planning_service.py</th><td>orquestracao do fluxo</td></tr>
                <tr><th>planning_solver.py</th><td>solver de caminho de recarga</td></tr>
                <tr><th>planning_stations.py</th><td>filtro e transformacao de estacoes</td></tr>
                <tr><th>planning_geometry.py</th><td>geometria de rota, progresso e segmentacao</td></tr>
                <tr><th>planning_models.py</th><td>modelos internos do planejador</td></tr>
                <tr><th>planning_history.py</th><td>historico de rotas</td></tr>
                <tr><th>planning_constants.py</th><td>limites e parametros</td></tr>
              </tbody>
            </table>
            <p>A busca de estacoes usa consulta por <code>polyline</code> segmentada no corredor da rota, busca suplementar em gaps grandes e busca perto da origem para cenarios de bateria baixa.</p>
          </section>
          <section class="Areadme-section">
            <h3>Como rodar</h3>
            <h4>Backend</h4>
            <pre><code>cd C:/Dev/ProjetoUPX
python -m venv .venv
.venv/Scripts/Activate.ps1
pip install -r backend/requirements.txt
cd backend
../.venv/Scripts/python.exe app.py</code></pre>
            <p>Backend: <code>http://127.0.0.1:5000</code></p>
            <h4>Frontend</h4>
            <pre><code>cd C:/Dev/ProjetoUPX/frontend
corepack pnpm install
corepack pnpm run dev</code></pre>
            <p>Frontend: <code>http://127.0.0.1:8000</code></p>
          </section>
          <section class="Areadme-section">
            <h3>Endpoints principais</h3>
            <table>
              <tbody>
                <tr><th>Health</th><td><code>GET /api/health</code></td></tr>
                <tr><th>Auth</th><td><code>POST /api/auth/register</code>, <code>POST /api/auth/login</code>, <code>POST /api/auth/logout</code>, <code>GET /api/auth/me</code></td></tr>
                <tr><th>Veiculos</th><td><code>GET /api/vehicles</code>, <code>POST /api/vehicles</code>, <code>PUT /api/vehicles/{id}</code>, <code>DELETE /api/vehicles/{id}</code></td></tr>
                <tr><th>Places</th><td><code>GET /api/places/search?q=...</code>, <code>GET /api/places/reverse?lat=...&amp;lng=...</code>, <code>GET /api/places/cep/{cep}</code></td></tr>
                <tr><th>Rotas</th><td><code>POST /api/routes/plan</code>, <code>GET /api/routes/history</code>, <code>DELETE /api/routes/history</code></td></tr>
              </tbody>
            </table>
          </section>
          <section class="Areadme-section">
            <h3>Resposta de rota</h3>
            <p>O endpoint <code>POST /api/routes/plan</code> retorna campos como <code>status</code>, <code>origin</code>, <code>destination</code>, <code>distance_km</code>, <code>driving_time_min</code>, <code>safe_range_km</code>, <code>estimated_arrival_battery_percent</code>, <code>route_geometry</code>, <code>recommended_stops</code>, <code>warnings</code>, <code>diagnostics</code> e <code>perf</code>.</p>
            <h4>Status possiveis</h4>
            <ul>
              <li><code>safe_without_charging</code></li>
              <li><code>requires_charging</code></li>
              <li><code>requires_multiple_charges</code></li>
              <li><code>unsafe_no_station_found</code></li>
              <li><code>external_api_error</code></li>
              <li><code>invalid_input</code></li>
            </ul>
          </section>
          <section class="Areadme-section">
            <h3>Qualidade e limites</h3>
            <pre><code>cd C:/Dev/ProjetoUPX
.venv/Scripts/python.exe -m pytest
.venv/Scripts/python.exe -m ruff check backend tests

cd C:/Dev/ProjetoUPX/frontend
corepack pnpm run build</code></pre>
            <ul>
              <li>backend: <code>57 passed</code></li>
              <li>frontend: build de producao validado com Vite</li>
              <li>O planejador depende fortemente da cobertura da Open Charge Map</li>
              <li>Rotas longas podem exigir complementaridade entre busca por corredor e busca pontual</li>
            </ul>
          </section>
        `,
        colors: ["rgba(117, 135, 65, 0.34)", "rgba(78, 94, 42, 0.28)"],
        previews: [
          {
            label: "Viso geral",
            html: `
              <div class="info-preview">
                <figure class="project-shot">
                  <img src="assets/landingecoway.png" alt="Preview visual da landing page do EcoWay" />
                </figure>
                <h4>O que o EcoWay resolve</h4>
                <p><strong>Projeto academico da Facens para UPX III.</strong></p>
                <p>Motoristas de veiculos eletricos precisam saber se chegam ao destino com seguranca, onde recarregar e quais estacoes fazem sentido para o carro cadastrado.</p>
                <div class="info-grid">
                  <span><b>Planejamento</b> origem, destino, bateria atual e margem de seguranca</span>
                  <span><b>Autonomia</b> consumo Areal do veiculo e bateria estimada na chegada</span>
                  <span><b>Recarga</b> paradas recomendadas com conector e potencia compativeis</span>
                  <span><b>Historico</b> viagens anteriores salvas para consulta do usuario</span>
                </div>
              </div>
            `,
          },
          {
            label: "Backend",
            html: `
              <div class="info-preview backend-preview">
                <h4>API Flask + SQLite</h4>
                <div class="endpoint-list">
                  <span><b>/api/auth</b> register, login, me e logout com cookie HTTP-only</span>
                  <span><b>/api/vehicles</b> garagem do usuario, validacoes e catalogo de modelos</span>
                  <span><b>/api/places</b> busca de endereco, CEP e reverse geocoding</span>
                  <span><b>/api/routes/plan</b> rota, energia, diagnosticos e paradas sugeridas</span>
                </div>
                <p>O backend sobe aplicando migracoes SQL, seed de vehicle_models, CORS controlado e headers de seguranca.</p>
              </div>
            `,
          },
          {
            label: "Integracoes",
            html: `
              <div class="info-preview">
                <h4>APIs externas usadas</h4>
                <div class="integration-grid">
                  <span><b>ViaCEP</b> consulta e normalizacao de enderecos por CEP</span>
                  <span><b>Nominatim</b> autocomplete, reverse geocoding e cache local</span>
                  <span><b>OpenRouteService</b> geocoding estruturado e rota veicular</span>
                  <span><b>Open Charge Map</b> estacoes de recarga por rota, raio ou bounding box</span>
                  <span><b>Open EV Data</b> sincronizacao externa do catalogo de veiculos</span>
                </div>
              </div>
            `,
          },
          {
            label: "UX",
            html: `
              <div class="info-preview">
                <h4>Detalhes pensados para a interface</h4>
                <div class="info-grid">
                  <span><b>recommended_stops</b> j chega pronto para a UI exibir parada, tempo e endereco</span>
                  <span><b>warnings</b> explica fallback, ausencia de estacoes ou limitacao de provedor</span>
                  <span><b>diagnostics</b> mostra origem dos dados e resultado da busca de recarga</span>
                  <span><b>navigation_waypoint</b> facilita abrir a rota no Google Maps com paradas</span>
                </div>
              </div>
            `,
          },
        ],
      },
    ],
    [
      "Salute Studio Pilates",
      {
        index: "Projeto 002",
        slug: "salute",
        title: "Salute Studio Pilates",
        url: "https://salutestudiopilates.com/",
        description:
          "Site institucional para o Salute Studio Pilates, studio de pilates em Salto. A pagina apresenta o espaco, reforca a proposta de bem-estar pela conexao entre corpo e mente, mostra diferenciais e conduz visitantes para o agendamento da primeira aula pelo WhatsApp.",
        features: [
          "Site institucional publicado",
          "Projeto para negocio local",
          "Apresentacao do studio e dos diferenciais",
          "Chamada para agendamento da primeira aula",
          "Secoes de sobre, localizacao e contato",
          "Integracao com WhatsApp",
          "Conteudo voltado para conversao",
        ],
        tags: ["HTML", "CSS", "UX/UI", "Responsivo", "WhatsApp", "SEO local"],
        AreadmeHtml: `
          <section class="Areadme-section">
            <h3>Objetivo</h3>
            <blockquote>Site institucional focado em apresentar o studio e converter visitantes em contatos pelo WhatsApp.</blockquote>
            <p>A pagina organiza proposta, diferenciais, localizacao e chamada para primeira aula em uma experiencia simples, acolhedora e direta.</p>
          </section>
          <section class="Areadme-section">
            <h3>Conteudo do site</h3>
            <ul>
              <li>Apresentacao do studio e da proposta de bem-estar.</li>
              <li>Diferenciais do espaco e das profissionais.</li>
              <li>Contato, Instagram, endereco e CTA para agendamento.</li>
            </ul>
          </section>
          <section class="Areadme-section">
            <h3>Stack tecnologico</h3>
            <table>
              <tbody>
                <tr><th>Base</th><td>HTML, CSS e JavaScript</td></tr>
                <tr><th>Design</th><td>UX/UI, responsividade e conteudo para conversao</td></tr>
                <tr><th>Contato</th><td>WhatsApp e links externos</td></tr>
              </tbody>
            </table>
          </section>
        `,
        colors: ["rgba(213, 176, 130, 0.28)", "rgba(122, 171, 148, 0.26)"],
        previews: [
          {
            label: "Viso geral",
            html: `
              <div class="info-preview">
                <h4>Site para studio de pilates</h4>
                <p><strong>Projeto institucional para o Salute Studio Pilates.</strong></p>
                <p>A experiencia apresenta o studio, comunica acolhimento e facilita o contato de quem quer marcar a primeira aula.</p>
                <div class="info-grid">
                  <span><b>Objetivo</b> transformar visitantes em contatos pelo WhatsApp</span>
                  <span><b>Conteudo</b> sobre o espaco, diferenciais, depoimentos e localizacao</span>
                  <span><b>Publico</b> pessoas buscando saude, movimento e bem-estar em Salto</span>
                  <span><b>Tom</b> acolhedor, leve e focado em experiencia Areal</span>
                </div>
              </div>
            `,
          },
          {
            label: "Conversao",
            html: `
              <div class="info-preview">
                <h4>Fluxo direto para agendamento</h4>
                <div class="endpoint-list">
                  <span><b>CTA principal</b> agendamento da primeira aula pelo WhatsApp</span>
                  <span><b>Contato</b> telefone, e-mail, Instagram e endereco visiveis</span>
                  <span><b>Localizacao</b> Av. Angelo Miguel Nascimento, 269, Salto - SP</span>
                  <span><b>Prova social</b> Area dedicada ao que clientes falam sobre o studio</span>
                </div>
                <p>A estrutura reduz atrito para quem chega pelo site e quer falar com o studio rapidamente.</p>
              </div>
            `,
          },
          {
            label: "Diferenciais",
            html: `
              <div class="info-preview">
                <h4>Mensagem do negocio</h4>
                <div class="integration-grid">
                  <span><b>Espaco</b> amplo, climatizado, aconchegante e acolhedor</span>
                  <span><b>Aulas</b> prtica em grupo com aproveitamento fluido</span>
                  <span><b>Equipe</b> profissionais capacitadas e treinadas</span>
                  <span><b>Bem-estar</b> saude fisica, mental e emocional atraves do movimento</span>
                  <span><b>Experiencia</b> conexao entre corpo e mente em um ambiente cuidado</span>
                </div>
              </div>
            `,
          },
        ],
      },
    ],
    [
      "JoJo API",
      {
        index: "Projeto 003",
        slug: "jojo-api",
        title: "JoJo API",
        url: "https://meu-projeto-api-9onq.onrender.com/",
        description:
          "API de personagens de JoJo's Bizarre Adventure criada com FastAPI, Python e SQLite. O projeto organiza dados de personagens, habilidades, stats e detalhes para consumo em uma interface web ou documentacao interativa.",
        features: [
          "API de personagens",
          "Endpoints para listagem e detalhes",
          "Dados de habilidades e stats",
          "Persistencia com SQLite",
          "Documentacao Swagger automtica",
          "Consumo via JavaScript no frontend",
          "Estrutura pronta para filtros e busca",
        ],
        tags: [
          "FastAPI",
          "Python",
          "SQLite",
          "JavaScript",
          "API REST",
          "Swagger",
        ],
        AreadmeHtml: `
          <section class="Areadme-section">
            <h3>JoJo API</h3>
            <blockquote>API e interface para explorar personagens, habilidades, stats e detalhes de JoJo's Bizarre Adventure.</blockquote>
            <p>O projeto usa FastAPI para organizar dados, expor endpoints e documentar tudo no Swagger. A ideia e permitir que o frontend consulte personagens e abra detalhes com informacoes extras.</p>
          </section>
          <section class="Areadme-section">
            <h3>Endpoints principais</h3>
            <table>
              <thead>
                <tr><th>Metodo</th><th>Rota</th><th>Uso</th></tr>
              </thead>
              <tbody>
                <tr><td>GET</td><td><code>/characters</code></td><td>Lista personagens</td></tr>
                <tr><td>GET</td><td><code>/characters/{id}</code></td><td>Detalhes do personagem</td></tr>
                <tr><td>GET</td><td><code>/docs</code></td><td>Swagger da API</td></tr>
              </tbody>
            </table>
          </section>
          <section class="Areadme-section">
            <h3>Estrutura do projeto</h3>
            <pre><code>jojo-api/
├─ app/
│  ├─ main.py          # instancia FastAPI
│  ├─ routes/          # endpoints de personagens
│  ├─ models/          # modelos e schemas
│  ├─ database.py      # conexao SQLite
│  └─ services/        # regras de busca e normalizacao
├─ static/             # frontend consumidor
└─ README.md</code></pre>
          </section>
          <section class="Areadme-section">
            <h3>Proximos incrementos</h3>
            <ul>
              <li>Filtros por parte, stand, familia ou status.</li>
              <li>Modal de personagem com habilidades especiais e curiosidades.</li>
              <li>Cache local para reduzir chamadas externas.</li>
            </ul>
          </section>
        `,
      },
    ],
    [
      "Projeto 004",
      {
        index: "Projeto 004",
        slug: "projeto-004",
        title: "Projeto 004",
        url: "",
        description: "Descricao do Projeto 004.",
        features: ["Funcionalidade A", "Funcionalidade B", "Funcionalidade C"],
        tags: ["Tecnologia X", "Tecnologia Y", "Tecnologia Z"],
      },
    ],
  ]);

  function renderList(node, items) {
    node.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  }

  function renderReadme(project) {
    const fallbackReadme = `
      <section class="Areadme-section">
        <h3>Sobre o projeto</h3>
        <p>${project.description}</p>
      </section>
      <section class="Areadme-section">
        <h3>Stack tecnologico</h3>
        <p>${project.tags.join(" · ")}</p>
      </section>
    `;

    AreadmeNode.innerHTML = project.AreadmeHtml || fallbackReadme;
    AreadmeNode.querySelectorAll("img").forEach((image) => {
      image.loading = "lazy";
      image.decoding = "async";
    });
  }

  function openModal(project) {
    indexNode.textContent = project.index;
    titleNode.textContent = project.title;
    descriptionNode.textContent = project.description;
    linkNode.href = project.url || "#";
    linkNode.hidden = !project.url;
    renderList(featuresNode, project.features);
    renderList(tagsNode, project.tags);
    renderReadme(project);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  closeButtons.forEach((button) =>
    button.addEventListener("click", closeModal),
  );

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open"))
      closeModal();
  });

  document.querySelectorAll(".project").forEach((project) => {
    const title = project.querySelector("h3").textContent.trim();
    const projectData = details.get(title);

    project.setAttribute("tabindex", "0");
    project.setAttribute("role", "button");
    project.setAttribute("aria-label", `Abrir detalhes do projeto ${title}`);

    const open = () => {
      if (projectData) openModal(projectData);
    };

    project.addEventListener("click", open);
    project.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function setupClickSparks() {
  if (reducedMotion || !canHover) return;

  window.addEventListener("click", (event) => {
    const colors = ["#758741", "#a3b36b", "#4e5e2a", "#ffffff"];

    for (let i = 0; i < 10; i += 1) {
      const particle = document.cAreateElement("span");
      const angle = (Math.PI * 2 * i) / 10;
      const distance = 24 + Math.random() * 46;

      particle.className = "particle";
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.background = colors[i % colors.length];
      particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);

      document.body.appendChild(particle);
      particle.addEventListener("animationend", () => particle.remove(), {
        once: true,
      });
    }
  });
}

function setupActiveNav() {
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === `#${entry.target.id}`,
          );
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px" },
  );

  sections.forEach((section) => observer.observe(section));
}

function setupScrollHeader() {
  window.addEventListener(
    "scroll",
    () => {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    },
    { passive: true },
  );
}

function setupCareerProgress() {
  const careerGrid = document.querySelector(".career-grid");
  if (!careerGrid) return;

  const cards = [...careerGrid.querySelectorAll(".career-card")];
  if (!cards.length) return;

  let frame = null;

  function updateProgress() {
    frame = null;

    const gridRect = careerGrid.getBoundingClientRect();
    const viewportMarker = window.innerHeight * 0.5;
    const progress = Math.min(Math.max((viewportMarker - gridRect.top) / gridRect.height, 0), 1);

    careerGrid.style.setProperty("--career-progress", `${(progress * 100).toFixed(2)}%`);

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      card.classList.toggle("is-active", cardCenter <= viewportMarker + 24);
    });
  }

  function requestUpdate() {
    if (frame) return;
    frame = window.requestAnimationFrame(updateProgress);
  }

  updateProgress();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

updateLocalTime();
setInterval(updateLocalTime, 30_000);
splitHeroTitle();
setupReveal();
setupCursor();
setupHoverLight();
setupTilt();
setupMagneticElements();
setupScramble();
setupStackDetails();
setupProjectDetails();
setupClickSparks();
setupActiveNav();
setupScrollHeader();
setupCareerProgress();
