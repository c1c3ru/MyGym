# Lista de Correções - Sistema de Certificados

### 🔴 Bugs Críticos (Prioridade Alta)
- [x] **Radio Buttons de Cores Inativos**: Os botões de seleção de cor "Cor do Nome" e "Cor do Texto" não estão atualizando o estado do componente.
- [x] **Preview Web sem Background**: Ao visualizar o PDF na Web, a imagem de fundo não aparece (Fixed by ensuring base64 or public URL - *Pending Verification*)
- [x] **Estouro de Texto na Web**: O texto do certificado não quebra linha na visualização Web, saindo da área do template.
- [x] **Ajustes Finos Quebrados**: Os controles de posição (X/Y) e tamanho não estão atualizando os elementos do certificado visualmente.
- [x] **Scroll Horizontal de Modalidades**: O seletor de chips de modalidades não permite scroll para ver todas as opções.
- [x] **Funcionalidades do Modal de Personalizar**: Revisar controles que não estão respondendo dentro do modal.

### 🟡 Melhorias Necessárias
- [ ] **Tratamento de Erros no Console**: "Attempting to use a disconnected port object" (Investigar se afeta o app ou é ruído do ambiente).

---

## Plano de Execução

1. **Correção de UI/Estados (Radio Buttons & Scroll)**
   - Verificar handlers de `onPress` nas cores.
   - Ajustar `ScrollView` do seletor de modalidades.

2. **Correção do Motor de PDF (Service)**
   - Adicionar regras CSS para quebra de texto (`word-wrap`, `white-space`).
   - Investigar carregamento de imagem na Web (Converter para Base64 se necessário para garantir exibição).

3. **Correção de Lógica de Edição (Fine Tuning)**
   - Debuggar função `updateElement`.
   - Garantir que o preview utilize os dados de `elementsConfig` em tempo real.
