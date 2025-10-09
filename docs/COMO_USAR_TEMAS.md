# 🎨 Como Usar e Alternar Temas no MyGym

## 📱 **Como Visualizar a Demonstração dos Temas**

### **Método 1: Via Configurações (Recomendado)**
1. **Faça login** no MyGym como Admin, Instrutor ou Aluno
2. Navegue para **Configurações** (ícone de engrenagem)
3. Na seção **"Demonstração"**, toque em **"Ver Demonstração de Temas"**
4. Você verá uma tela completa mostrando ambos os temas

### **Método 2: Via Navegação Direta**
```javascript
// Para desenvolvedores - navegar diretamente
navigation.navigate('ThemeDemo');
```

---

## 🔄 **Como Alternar Entre Temas**

### **Localização do Switch de Temas:**
1. **Abra o app** MyGym
2. Vá para **Configurações** (menu principal)
3. Procure pela seção **"Aparência"**
4. Use o **switch** para alternar entre:
   - 🌙 **Dark Premium** (tema escuro para artes marciais)
   - 🌞 **Light Sóbrio** (tema claro para ambientes corporativos)

### **Interface do Switch:**
```
┌─────────────────────────────────────┐
│ 🎨 Aparência                        │
├─────────────────────────────────────┤
│ Escolha entre o tema claro sóbrio   │
│ ou escuro premium                   │
├─────────────────────────────────────┤
│ Dark Premium                    ⚫ │
│ Tema escuro para academias      🔘 │
│ de artes marciais                   │
├─────────────────────────────────────┤
│ Temas Disponíveis:                  │
│                                     │
│ ⚫ Dark Premium         ✅          │
│ 🔳 Light Sóbrio                     │
└─────────────────────────────────────┘
```

---

## 🎯 **Características dos Temas**

### 🌙 **Dark Premium**
- **Público**: Academias de artes marciais
- **Cor Principal**: Vermelho coral (#D32F2F)
- **Background**: Preto profundo (#0B0B0B)
- **Contraste**: WCAG AA aprovado (4.98:1)
- **Estilo**: Moderno, elegante, premium

### 🌞 **Light Sóbrio**
- **Público**: Ambientes corporativos/tecnológicos
- **Cor Principal**: Azul inovação (#2196F3)
- **Background**: Cinza muito claro (#FAFBFC)
- **Inspiração**: Incubadoras tecnológicas
- **Estilo**: Sóbrio, profissional, clean

---

## 💾 **Persistência e Configurações**

### **Salvamento Automático:**
- ✅ A preferência é **salva automaticamente**
- ✅ Persiste entre sessões do app
- ✅ Sincroniza em todos os dispositivos do usuário
- ✅ Não requer configuração adicional

### **Aplicação Instantânea:**
- ⚡ Mudança **imediata** ao alternar
- 🔄 Aplica em **todas as telas** do app
- 🎨 Mantém **consistência visual** total
- 📱 Funciona em **iOS e Android**

---

## 🛠️ **Para Desenvolvedores**

### **Usar Tema Atual no Código:**
```javascript
import { useThemeToggle } from '@contexts/ThemeToggleContext';

const MeuComponente = () => {
  const { currentTheme, isDarkTheme, toggleTheme } = useThemeToggle();
  
  return (
    <View style={{ backgroundColor: currentTheme.background.default }}>
      <Text style={{ color: currentTheme.text.primary }}>
        Tema atual: {isDarkTheme ? 'Dark Premium' : 'Light Sóbrio'}
      </Text>
      <Button onPress={toggleTheme}>
        Alternar Tema
      </Button>
    </View>
  );
};
```

### **Hooks Disponíveis:**
```javascript
// Hook completo
const { 
  isDarkTheme, 
  currentTheme, 
  toggleTheme, 
  setDarkTheme, 
  setLightTheme 
} = useThemeToggle();

// Hook simplificado para apenas o tema
const currentTheme = useCurrentTheme();

// Hook para verificar se é escuro
const isDark = useIsDarkTheme();
```

### **Verificar Cor Específica:**
```javascript
const { getThemeColor, hasColor } = useThemeToggle();

// Obter cor específica
const primaryColor = getThemeColor('primary.500');

// Verificar se cor existe
if (hasColor('primary.500')) {
  // Usar a cor
}
```

---

## 📋 **Checklist de Implementação**

### ✅ **Já Implementado:**
- [x] Light Theme Premium criado
- [x] Dark Theme Premium otimizado
- [x] Sistema de alternância funcional
- [x] Persistência no AsyncStorage
- [x] Interface de configuração
- [x] Tela de demonstração
- [x] Hooks para desenvolvedores
- [x] Integração no App principal

### 🔄 **Como Testar:**
1. **Reinicie o app**: `npx expo start --clear`
2. **Faça login** com qualquer perfil
3. **Vá para Configurações**
4. **Teste a alternância** de temas
5. **Veja a demonstração** visual
6. **Verifique a persistência** (feche e abra o app)

---

## 🎨 **Demonstração Visual**

### **Tela de Demonstração Inclui:**
- 📱 Header com gradiente
- 🎯 Seção "Nossa Missão" (3 cards)
- 📝 Explicação com layout responsivo
- 🔧 Funcionalidades e áreas de atuação
- 📊 Componentes do sistema
- 📞 Seção de contatos

### **Componentes Demonstrados:**
- Cards com diferentes variantes
- Botões primários e secundários
- Chips com cores contextuais
- Estatísticas visuais
- Gradientes e sombras
- Tipografia hierárquica

---

## 🚀 **Próximos Passos**

1. **Teste a funcionalidade** seguindo este guia
2. **Reporte bugs** se encontrar algum problema
3. **Sugira melhorias** na interface
4. **Documente** novos casos de uso

---

## 📞 **Suporte**

Se tiver dúvidas sobre os temas:
- 📧 **Email**: contato@mygym.app
- 📱 **Telefone**: (85) 3366-9999
- 🌐 **Website**: www.mygym.app

---

**🎉 Aproveite os novos temas do MyGym!**
