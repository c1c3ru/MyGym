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

### Fase 2: Configurações Avançadas (EM ANDAMENTO)
- [x] Campo para cidade/local
- [ ] Escolher posicionamento de elementos
- [x] Escolher fontes e cores
- [ ] Múltiplos templates por modalidade

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
    certificateTemplateUrl: string,
    certificateTextTemplate: string,  // NOVO
    certificateLocation: string,      // NOVO (ex: "Fortaleza-CE")
    updatedAt: Date
  }
}
```

## 🚀 Como Usar

### Para Administradores:
1. Acesse "Configurações de Certificados"
2. Faça upload da imagem de fundo
3. Personalize o texto usando as tags
4. Clique em "Visualizar" para ver o preview
5. Salve as configurações

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
- ⏳ `CertificateTemplateScreen.tsx` - Editor de template (próximo)
- ⏳ `AddGraduationScreen.tsx` - Integração com geração (próximo)

## 🎯 Benefícios

- ✅ Certificados profissionais e personalizados
- ✅ Economia de tempo (geração automática)
- ✅ Consistência visual
- ✅ Fácil personalização por academia
- ✅ Múltiplas modalidades suportadas
