# Sistema de Templates de Certificados - Implementação

## 📋 Funcionalidades Implementadas

### 1. **Tags Dinâmicas**
```typescript
$tagAcademia        → Nome da academia
$tagNome            → Nome do aluno
$tagTipoDeGraduacao → Tipo de graduação (ex: Faixa Preta - 1º Dan)
$tagDataELocal      → Data e local (ex: Fortaleza-CE, 15 de Dezembro de 2025)
$tagDadosDoInstrutor → Nome do instrutor
```

### 2. **Template Padrão**
```
A equipe $tagAcademia confere ao aluno $tagNome a graduação de $tagTipoDeGraduacao, 
conquistada pela disciplina e determinação demonstradas na busca pela excelência técnica, 
assim como sua dedicação aos valores da nossa equipe e ao Jiu-Jitsu.
```

### 3. **Layout do Certificado**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [IMAGEM DE FUNDO]                    │
│                                                         │
│                     NOME DO ALUNO                       │
│                                                         │
│              [TEXTO PERSONALIZADO COM TAGS]             │
│                                                         │
│                                                         │
│  Fortaleza-CE,                    ___________________   │
│  15 de Dezembro de 2025           Nome do Instrutor     │
│                                        Instrutor        │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Próximos Passos

### Fase 1: Adicionar Editor de Texto ✅ CONCLUÍDO
- [x] Campo de texto para editar template
- [x] Botões para inserir tags
- [x] Preview em tempo real (Via PDF e Overlay básico)
- [x] Salvar template personalizado no Firestore

### Fase 2: Configurações Avançadas ✅ CONCLUÍDO
- [x] Campo para cidade/local
- [x] Escolher posicionamento de elementos (Sistema de Grid com X/Y %)
- [x] Escolher fontes e cores (6 estilos + paleta de cores)
- [x] Sistema de configuração unificado (CertificateTemplateConfig)
- [x] Editor de Layout com controles visuais
- [x] Ajustes finos: posição, tamanho, alinhamento
- [ ] Múltiplos templates por modalidade (PRÓXIMA FASE)

### Fase 3: Geração de Certificados ✅ CONCLUÍDO
- [x] Integrar com AddGraduationScreen
- [x] Gerar PDF automaticamente
- [x] Enviar por email/WhatsApp
- [x] Galeria de certificados emitidos

## 📝 Estrutura de Dados

### Firestore: `gyms/{academiaId}`
```typescript
{
  settings: {
    // Legacy fields (mantidos para compatibilidade)
    certificateTemplateUrl: string,
    certificateTextTemplate: string,
    certificateLocation: string,
    certificateColors: {
      studentName: string,
      bodyText: string
    },
    certificateFontStyle: 'classic' | 'modern' | 'handwritten' | 'elegant' | 'roboto' | 'openSans',
    
    // Nova configuração unificada (FASE 2)
    certificateConfig: {
      id: string,
      name: string,
      imageUrl: string,
      textTemplate: string,
      elements: {
        studentName: ElementStyle,
        bodyText: ElementStyle,
        dateLocation: ElementStyle,
        instructorName: ElementStyle,
        graduationName: ElementStyle
      },
      createdAt: number
    },
    updatedAt: Date
  }
}

interface ElementStyle {
  visible: boolean,
  x?: number,        // Posição horizontal (0-100%)
  y?: number,        // Posição vertical (0-100%)
  width?: number,    // Largura (0-100%)
  fontSize?: number, // Tamanho da fonte (px)
  fontFamily?: string,
  color?: string,
  textAlign?: 'left' | 'center' | 'right',
  fontWeight?: 'normal' | 'bold',
  italic?: boolean
}
```

## 🚀 Como Usar

### Para Administradores:
1. Acesse "Configurações de Certificados"
2. Faça upload da imagem de fundo
3. **Personalize o Texto**: Clique em "Personalizar Certificado"
   - Edite o texto usando as tags dinâmicas
   - Configure cidade/local
   - Escolha o estilo de fonte (6 opções)
   - Selecione cores para nome e texto
4. **Ajustes Finos (Opcional)**: Clique em "Mostrar Ajustes Finos"
   - Selecione o elemento a editar (Nome, Texto, Data, etc)
   - Ajuste posição vertical e horizontal (%)
   - Modifique tamanho da fonte
   - Altere alinhamento do texto
   - Ative/desative visibilidade de elementos
5. Clique em "Visualizar PDF" para ver o preview
6. Salve as configurações

### Para Emitir Certificado:
1. Ao adicionar graduação, marque "Gerar Certificado"
2. O sistema usa o template configurado
3. Escolha se deseja enviar por Email ou WhatsApp
4. O PDF é gerado e anexado à graduação
5. O aluno recebe o certificado digitalmente

### Galeria de Certificados:
1. Acesse o menu "Galeria de Certificados" na gestão de graduações
2. Visualize todos os certificados emitidos
3. Use filtros por aluno ou modalidade
4. Reenvie certificados por Email ou WhatsApp se necessário

## 📚 Arquivos Modificados

- ✅ `certificateService.ts` - Sistema de tags e geração de PDF
- ✅ `CertificateTemplateScreen.tsx` - Editor de template visual
- ✅ `AddGraduationScreen.tsx` - Integração com geração

## 🎯 Benefícios

- ✅ Certificados profissionais e personalizados
- ✅ Economia de tempo (geração automática)
- ✅ Consistência visual
- ✅ Fácil personalização por academia
- ✅ Múltiplas modalidades suportadas
- ✅ **Controle total de layout** (posicionamento pixel-perfect)
- ✅ **6 estilos de fonte** (Classic, Modern, Handwritten, Elegant, Roboto, Open Sans)
- ✅ **Design tokens integrados** (cores do tema do app)
- ✅ **Sistema híbrido**: UI simples + Ajustes avançados opcionais
- ✅ **Compatibilidade retroativa** com configurações antigas
