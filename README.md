# Bíblia Reader - Plataforma Teológica Full-Stack

Um ecossistema completo para leitura, pesquisa e gestão de textos bíblicos, construído com tecnologias modernas. O projeto é dividido em um back-end robusto em Laravel e aplicações clientes independentes, como um app mobile construído com React Native (Expo).

## Arquitetura do Projeto

O projeto é monorepo e dividido nas seguintes pastas principais:
- `/.docker`: Configuração de contêineres para o ambiente de desenvolvimento (Nginx, PHP-FPM, MariaDB, Redis).
- `/www`: API REST (Laravel 11), Banco de Dados, e Painel Administrativo Web (Blade + Bootstrap 5).
- `/reader`: Aplicativo Mobile Leitor (React Native / Expo / TypeScript).
- `/display` & `/study-tool`: Interfaces clientes secundárias preparadas para expansão futura (Desktop e Web).

## 1. Back-End (Laravel API & Admin)
Diretório: `/www`

### Funcionalidades
- **API RESTFul**: Endpoints otimizados para listar Versões, Livros, Capítulos e Versículos.
- **Busca FTS (Full-Text Search)**: Pesquisa ultra-rápida de versículos usando engine nativa do MariaDB sobre os 400k+ registros.
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