# Bíblia Reader - Plataforma Teológica Full-Stack

## Ecossistema de Aplicações

O projeto é dividido em quatro pilares principais, cada um rodando em seu próprio ambiente:

1.  **`www/` (Backend & Admin)**: A API central (Laravel 13) e o painel de administração (Filament/Blade). Responsável pelo banco de dados, autenticação, ETL de Bíblias e **Gestão do Acervo de Louvor (Cache Inteligente)**.
2.  **`reader/` (Mobile App)**: O aplicativo React Native (Expo) focado na leitura diária, com navegação fluida, modo escuro nativo e TTS (Text-To-Speech).
3.  **`study-tool/` (Desktop Web App)**: Uma Single Page Application (React + Vite + Tailwind v4) para teólogos e pastores, contendo leitura paralela, pesquisa Full-Text Search veloz e ferramentas exegéticas.
4.  **`display/` (Software de Projeção)**: O super projetor para igrejas. Possui uma Mesa de Controle (`/`) e uma Tela de Projeção (`/screen`) comunicando-se via `BroadcastChannel` para exibir versículos, **Letras de Músicas com background de vídeo**, e avisos animados.

---

## Estrutura do Banco de Dados

-   **`versions`**: Traduções bíblicas (ARA, NVI, etc.).
-   **`books`**: Livros da Bíblia (Gênesis, Apocalipse).
-   **`chapters`**: Capítulos contendo as chaves de relacionamento.
-   **`verses`**: O núcleo de leitura com mais de 400.000 linhas otimizadas.
-   **`songs`**: Acervo local de letras de músicas. O backend funciona como proxy: busca na API externa (`lyrics.ovh`), salva permanentemente e retorna offline nas próximas buscas.
- **Painel Administrativo**: Área administrativa protegida acessível em `/admin`. Gerencie Livros, Versões e edite Versículos utilizando a velocidade do DataTables (Server-Side) e Modais AJAX sem sair da página.
- **OpenAPI / Swagger**: Toda a API está documentada dinamicamente. Acesse `http://localhost:8084/api/documentation`.

### Stack Tecnológica
- PHP 8.3+ / Laravel 11 / MariaDB / Redis
- L5-Swagger (OpenAPI 3.0)
- Bootstrap 5 + DataTables.js (Área Admin)

## 2. Aplicativo Mobile (Bíblia Reader)
Diretório: `/reader`

### Funcionalidades
- **Navegação Semântica**: Estrutura de roteamento dinâmica (Ex: `/GN/452/2/1-4`) permitindo Deep Linking de leitura.
- **Pesquisa Dinâmica**: Barra de pesquisa inteligente utilizando `lodash.debounce`.
- **Text-To-Speech (Áudio)**: Botão flutuante que narra o capítulo inteiro ou apenas os versículos selecionados nativamente via `expo-speech`.
- **Compartilhamento**: Seleção múltipla de versículos e compartilhamento unificado integrando nativamente ao SO.
- **UX Nativo**: Suporte pleno a *Dark Mode* do sistema.

### Build (APK/IPA)
O app já está configurado no EAS (Expo Application Services). Para gerar um `.apk` de testes:
```bash
cd reader
eas build -p android --profile preview
```

## Como Iniciar o Ambiente de Desenvolvimento

1. **Subir os Contêineres**
   ```bash
   cd .docker
   docker-compose up -d
   ```
2. **Iniciar o Servidor Web (Mobile)**
   ```bash
   cd reader
   npm install
   npm run web
   ```
3. **Acessar a Aplicação**
   - API e Admin: `http://localhost:8084`
   - Swagger: `http://localhost:8084/api/documentation`
   - Mobile Preview Web: `http://localhost:8081`

---
*Projeto desenvolvido visando escalabilidade e alta performance, suportando grandes volumes textuais e navegação offline nos clientes.*