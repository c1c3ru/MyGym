# Plano de Implementação: Geração de Certificados de Graduação

## Objetivo
Implementar funcionalidade para gerar, enviar e armazenar certificados de graduação personalizados.

## Arquitetura

### 1. Gerenciamento de Templates
- **Armazenamento:** Firebase Storage (`templates/certificates/`)
- **Banco de Dados:** Coleção `academy_settings` ou `certificate_templates` no Firestore.
- **Formato:** Imagem de fundo (PNG/JPG). O layout do texto (posicionamento) será padronizado via HTML/CSS inicialmente.

### 2. Geração do Certificado
- **Tecnologia:** `expo-print` (HTML -> PDF).
- **Processo:**
  1. Carregar imagem de template (usuario upload).
  2. Injetar dados (Nome Aluno, Graduação, Data, Instrutor) em um HTML pré-definido que usa a imagem como background.
  3. Gerar PDF.

### 3. Armazenamento do Certificado
- **Firebase Storage:** `certificates/{academiaId}/{studentId}/{graduationId}.pdf`
- **Link:** Salvar URL pública/download no documento da graduação no Firestore.

### 4. Envio e Acesso
- **Envio por E-mail:**
  - *Opção Recomendada (Client-Side):* Usar `expo-mail-composer` para abrir rascunho com anexo logo após geração.
  - *Opção Automatizada:* Requer Cloud Functions (Backend). Implementaremos a estrutura de dados para suportar isso, mas focaremos na geração client-side primeiro.
- **Perfil do Aluno:** Novo botão "Certificado" na lista de graduações, abrindo o PDF via URL.

## Etapas de Implementação

### Fase 1: Infraestrutura e Utils (Backend/Core)
- [ ] Criar `CertificateService` para gerenciar lógica de geração e upload.
- [ ] Criar `CertificateTemplateService` para gerenciar templates.
- [ ] Atualizar `graduationRepository` para suportar metadados de certificado.

### Fase 2: Gestão de Templates (Frontend - Admin/Instrutor)
- [ ] Criar tela `CertificateTemplatesScreen`:
  - Upload de imagem de fundo.
  - Preview do certificado com dados fictícios.
  - Salvar configuração na academia.

### Fase 3: Geração na Graduação (Frontend - Fluxo)
- [ ] Atualizar `AddGraduationScreen`:
  - Checkbox "Gerar Certificado" (padrão marcado se houver template).
  - Após salvar graduação -> Gerar PDF -> Upload -> (Opcional) Abrir Email.

### Fase 4: Visualização (Frontend - Aluno/Perfil)
- [ ] Atualizar lista de graduações (`StudentDetails`, `Profile`) para exibir ícone de download/visualização se houver certificado.
