#

````js
export default defineConfig([
  # MonteCar

  Marketplace de veículos desenvolvido com React e TypeScript. A aplicação permite que visitantes encontrem carros novos e usados, consultem os detalhes de cada anúncio e entrem em contato com o vendedor pelo WhatsApp.

  Usuários autenticados também podem cadastrar seus próprios veículos, visualizar os anúncios publicados e removê-los pelo painel de controle.

  ## Funcionalidades

  ### Para visitantes

  - Listagem de veículos ordenada pelos anúncios mais recentes.
  - Busca de veículos pelo nome.
  - Cards com foto, nome, ano, quilometragem, preço e cidade.
  - Página de detalhes com galeria de imagens responsiva.
  - Informações completas do anúncio: modelo, localização, ano, quilometragem, descrição e telefone.
  - Atalho para iniciar uma conversa com o vendedor pelo WhatsApp.

  ### Para usuários cadastrados

  - Cadastro de conta com nome, e-mail e senha.
  - Login com e-mail e senha.
  - Validação dos formulários e mensagens de sucesso ou erro.
  - Proteção das rotas privadas por autenticação.
  - Painel com os veículos cadastrados pelo usuário.
  - Cadastro de anúncio com nome, modelo, ano, quilometragem, preço, cidade, WhatsApp e descrição.
  - Upload de imagens JPEG e PNG com pré-visualização.
  - Exclusão de imagens antes de publicar o anúncio.
  - Exclusão do anúncio e das imagens correspondentes no painel.

  ## Tecnologias

  - React 19
  - TypeScript
  - Vite
  - React Router
  - Firebase Authentication
  - Cloud Firestore
  - Firebase Storage
  - React Hook Form e Zod
  - Tailwind CSS
  - Swiper
  - React Icons
  - React Hot Toast

  ## Rotas

  | Rota | Acesso | Descrição |
  | --- | --- | --- |
  | `/` | Público | Lista e busca veículos disponíveis. |
  | `/car/:id` | Público | Exibe os detalhes de um veículo. |
  | `/login` | Público | Formulário de login. |
  | `/register` | Público | Formulário de cadastro. |
  | `/dashboard` | Autenticado | Lista os anúncios do usuário. |
  | `/dashboard/new` | Autenticado | Permite publicar um novo anúncio. |

  ## Pré-requisitos

  - Node.js 18 ou superior.
  - npm.
  - Um projeto configurado no Firebase com:
    - Authentication com o provedor de e-mail e senha habilitado.
    - Cloud Firestore.
    - Firebase Storage.

  ## Como executar

  1. Clone o repositório e acesse a pasta do projeto:

     ```bash
     git clone <url-do-repositorio>
     cd montecar
     ```

  2. Instale as dependências:

     ```bash
     npm install
     ```

  3. Configure as credenciais do Firebase em `src/services/firebaseConnection.ts` com as credenciais do seu projeto.

  4. Inicie o servidor de desenvolvimento:

     ```bash
     npm run dev
     ```

  5. Abra a URL exibida pelo Vite no terminal, normalmente `http://localhost:5173`.

  ## Scripts disponíveis

  | Comando | Descrição |
  | --- | --- |
  | `npm run dev` | Inicia o servidor de desenvolvimento com HMR. |
  | `npm run build` | Executa a verificação TypeScript e gera a build de produção. |
  | `npm run lint` | Executa o ESLint no projeto. |
  | `npm run preview` | Serve localmente a build de produção. |

  ## Estrutura principal

  ```text
  src/
  ├── components/       # Componentes reutilizáveis da interface
  ├── contexts/         # Contexto global de autenticação
  ├── pages/            # Páginas públicas e privadas
  ├── routes/           # Proteção das rotas autenticadas
  ├── services/         # Configuração e acesso ao Firebase
  ├── App.tsx           # Definição das rotas da aplicação
  └── main.tsx          # Ponto de entrada do React
````
