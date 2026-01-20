# Oportunidades de Unificação e Reutilização de Código

Com base na análise da estrutura atual do projeto, identificamos as seguintes áreas onde o código pode ser refatorado para reduzir duplicação e garantir consistência entre os perfis (Admin, Instrutor, Aluno).

## 1. Listagem de Alunos (`StudentList`)
**Situação Atual:**
- `AdminStudents.js`: Lista completa com opções de edição, exclusão e adição.
- `InstructorStudents.js`: Lista focada em visualização, mas com estrutura de busca e filtros muito similar.

**Proposta:**
Criar um componente `SharedStudentList.tsx` em `src/presentation/components/lists`.
- **Props:** `canEdit`, `canDelete`, `onPressItem`, `extraFilters`.
- Isso centralizaria a lógica de `FlashList`, Skeleton loading e Busca.

## 2. Listagem de Aulas (`ClassList`)
**Situação Atual:**
- `AdminClasses.js` e `InstructorClasses.js` possuem lógica similar de exibição de grade/lista de aulas.

**Proposta:**
Criar componente `SharedClassList.tsx` que padronize a exibição dos cards de aula, horários e instrutores, variando apenas as ações disponíveis ao clicar.

## 3. Widgets de Dashboard
**Situação Atual:**
- Lógica de "Próximas Aulas" e "Avisos" repetida nos dashboards de aluno e admin/instrutor.

**Proposta:**
Extrair widgets para:
- `DashboardAnnouncementsCard.tsx`: Aceita lista de avisos e trata o clique (modal).
- `DashboardNextClassCard.tsx`: Exibe a próxima aula em destaque.
- `DashboardStatsCard.tsx`: Padronizar os cards de estatísticas (ícone + número + label).

## 4. Status Universal (`SettingsScreen` e `UniversalHeader`)
**Situação Atual (Resolvida):**
- Felizmente, `SettingsScreen.tsx` e `UniversalHeader.tsx` já são compartilhados.
- **Atenção:** As diferenças visuais percebidas geralmente se devem a cache ou tratamento condicional de plataforma (Web vs Mobile) dentro desses componentes únicos.
- A correção recente dos Modais (usando `Portal`) aplicou-se automaticamente a todos os perfis que usam esses componentes.

## 5. Check-In
**Situação Atual:**
- Criamos `CheckInModalContent.tsx` para o Aluno.
- O Instrutor tem `CheckIn.js` (focado em QR Code scan).

**Proposta:**
Manter separados por enquanto, pois os fluxos são distintos (Scanner vs Passivo), mas compartilhar os componentes de UI (`AnimatedCard`, `ClassInfoRow`) se possível.
