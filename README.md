# Rafael Vidal - Portfólio

Portfólio web de desenvolvedor Full Stack construído com HTML, CSS e JavaScript vanilla. Projeto responsivo com animações suaves, tema escuro moderno e animações 3D.

## 🚀 Features

- **Design Responsivo**: Otimizado para desktop, tablet e mobile
- **Animações Fluidas**: Efeitos visuais com CSS e JavaScript vanilla
- **Acessibilidade**: Seguindo padrões WCAG
- **Performance**: Otimizado para Core Web Vitals
- **SEO Friendly**: Meta tags e estrutura semântica
- **Modo Escuro**: Dark mode por padrão

## 🛠️ Tecnologias

- HTML5
- CSS3 (Grid, Flexbox, Animações)
- JavaScript ES6+
- Canvas para renderização 3D

## 📦 Como usar

### Pré-requisitos

- Node.js (opcional, apenas para servidor local)
- Git

### Instalação

```bash
# Clone o repositório
git clone https://github.com/vidaaal/portifolio.git

# Acesse o diretório
cd portifolio/frontend

# Inicie um servidor local (opcional)
python -m http.server 8000
# ou
npm install -g http-server
http-server
```

Acesse `http://localhost:8000` no seu navegador.

## 📂 Estrutura

```
frontend/
├── index.html          # Estrutura HTML
├── styles.css          # Estilos e animações
├── script.js           # Lógica JavaScript
├── three-scene.js      # Renderização 3D com Three.js
└── assets/             # Imagens e fontes
```

## 🌐 Deploy no Vercel

### Método 1: Git Integration

1. Push seu repositório no GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Selecione seu repositório
5. Configure:
   - **Root Directory**: `./frontend`
   - **Build Command**: deixe em branco (se for apenas arquivos estáticos)
   - **Output Directory**: `.` (raiz do frontend)
6. Clique em "Deploy"

### Método 2: Manual Upload

```bash
# Instale Vercel CLI
npm i -g vercel

# Na raiz do projeto
vercel
```

## 📝 Seções

- **Início**: Apresentação com hero section
- **Sobre**: Texto sobre background e história
- **Tecnologias**: Stack de desenvolvimento
- **Projetos**: Portfolio de projetos realizados
- **Experiência**: Timeline de formação e experiência
- **Contato**: Links para redes sociais e contato direto

## 🎨 Customização

### Cores

As cores principais estão definidas em `:root` no `styles.css`:

```css
:root {
  --violet: #6200b3;
  --violet-deep: #3b0086;
  --bg: #050309;
  --ink: #eeeeee;
  /* ... mais cores ... */
}
```

### Fontes

As fontes utilizadas estão importadas do Google Fonts e são carregadas via CDN.

## 📊 Otimizações

- Lazy loading de imagens
- Preconexões para CDNs
- CSS crítico inline
- Sem dependências externas pesadas

## 📱 Responsividade

O projeto é totalmente responsivo com breakpoints para:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔒 Segurança

- Sem dados sensíveis hardcoded
- Sem API keys expostas
- `.gitignore` configurado corretamente
- Links sanitizados

## 🚀 Melhorias Futuras

- [ ] Adicionar formulário de contato com backend
- [ ] Integrar analytics
- [ ] Adicionar mais projetos
- [ ] Sistema de blog
- [ ] Dark/Light mode toggle

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**Rafael Vidal**

- [LinkedIn](https://linkedin.com/in/rafael-vidal)
- [GitHub](https://github.com/vidaaal)
- [Email](mailto:vidalrafaelbaldoni@gmail.com)

---

Feito com ❤️ por Rafael Vidal
