# Melhorias no Perfil do Instrutor

**Status**: Concluído
**Data**: 2026-01-27
**Objetivo**: Aprimorar a UX e UI do painel do instrutor, correções de tema e gerenciamento de avisos.

## 📋 Lista de Tarefas

### 🎨 Temas e Aparência (Concluído)
- [x] Substituir cores hardcoded (`COLORS.white`) por cores dinâmicas do tema (`profileTheme`)
- [x] Remover referências a temas dinâmicos em `StyleSheet.create` (estilos estáticos)
- [x] Garantir legibilidade em modo Claro e Escuro
- [x] Validar contraste de textos e fundos

### 📢 Gerenciamento de Avisos (Concluído)
- [x] Implementar função de exclusão de avisos no frontend
- [x] Conectar com serviço `academyAnnouncementService.deleteAnnouncement`
- [x] Adicionar diálogo de confirmação antes de excluir
- [x] Adicionar botão de exclusão no Modal de Detalhes
- [x] Adicionar botão de exclusão rápida (lixeira) diretamente no Card do Aviso na lista
- [x] Implementar feedback visual após exclusão (atualização da lista e cache)

## 🔍 Arquivos Modificados
- `src/presentation/screens/instructor/InstructorDashboard.js`
