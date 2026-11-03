# contexto geral
O **FisioCentral** é uma aplicação para organizar pacientes e acompanhar os atendimentos de uma clínica de fisioterapia. O fluxo principal reúne cadastro, agenda e histórico do tratamento em um só lugar.

### Pacientes

A aplicação permite cadastrar pacientes com dados pessoais, contato, endereço, referência e foto de perfil. Também há telas para consultar e editar esses dados, trocar ou remover a foto e excluir o paciente.

O cadastro é dividido em etapas, com validações, mensagens de erro junto aos campos e opções para limpar os dados do formulário.

### Sessões e pacotes

O paciente pode ter um **pacote de sessões** ou **sessões avulsas**. Na listagem, a equipe acompanha cada sessão e pode alterar seu status de realização, pagamento, data e horário, além de excluir sessões.

No histórico, os pacotes mostram informações como período, sessões realizadas e status de conclusão. Também é possível adicionar sessões e tratar casos como reposição de sessão excluída ou sessão extra fora do pacote.

### Evolução do tratamento

A aplicação permite registrar a evolução do paciente vinculada a uma sessão elegível. A edição verifica se houve mudanças, e campos não preenchidos são omitidos conforme as regras definidas para o formulário.

### Tecnologia e dados

O projeto usa **React com TypeScript** no frontend e **Supabase** para persistir dados e arquivos, incluindo fotos dos pacientes. As alterações de agenda e sessões são refletidas no servidor.

Em resumo, o FisioCentral centraliza o cadastro dos pacientes, a organização de atendimentos e o acompanhamento dos pacotes e da evolução clínica.

### Stack do projeto

- **Next.js 16** com **App Router**: páginas e layouts ficam em `src/app`.
- **React 19** e **TypeScript 5**: interface e lógica tipadas.
- **Tailwind CSS 4**: estilos, principalmente por classes nos componentes.
- **Supabase**: banco de dados, autenticação e armazenamento de arquivos, usando `@supabase/ssr` e `@supabase/supabase-js`.
- **Zustand 5**: estado compartilhado da aplicação.
- **date-fns**: formatação e cálculos de datas.
- **lucide-react**: ícones.
- **react-toastify**: notificações.

### Como o código está organizado

O fluxo costuma ser: **página → componente → hook → serviço/repositório → Supabase**. O estado que precisa ser compartilhado passa pela store do Zustand.

| Área | Arquivos principais |
|---|---|
| Rotas e telas | `src/app/page.tsx`, `src/app/(patient)/listar-pacientes/page.tsx`, `src/app/(patient)/cadastrar-pacientes/page.tsx` |
| Cadastro de pacientes | `src/components/patient/register/` e hooks em `src/hook/` |
| Listagem e detalhes | `src/components/patient/list/` |
| Sessões e pacotes | `src/components/patient/session/` e `src/components/patient/package/` |
| Evolução clínica | `src/components/patient/evolution/` |
| Integração com o banco | `src/services/patients/` |
| Estado da aplicação | `src/store/fisio/` e `src/store/fisio/slices/` |
| Tipos TypeScript | `src/types/` |
| Utilitários | `src/utils/` |
| Cliente Supabase | `src/lib/supabase/` |
| Migrações do banco | `supabase/migrations/` |
| Estilos globais e específicos | `src/app/globals.css` e `src/styles/` |

Os arquivos de serviço mais centrais são [patientRepository.ts](/home/ezequiel/programação/JavaScript/react/fisio-central/src/services/patients/patientRepository.ts), [patientListRepository.ts](/home/ezequiel/programação/JavaScript/react/fisio-central/src/services/patients/patientListRepository.ts) e [patientScheduleRepository.ts](/home/ezequiel/programação/JavaScript/react/fisio-central/src/services/patients/patientScheduleRepository.ts). Eles concentram operações de pacientes, listagem e agenda/sessões.

As dependências e comandos estão em [package.json](/home/ezequiel/programação/JavaScript/react/fisio-central/package.json). Ele define `dev`, `build` e `start`; não há script de testes configurado ali.
