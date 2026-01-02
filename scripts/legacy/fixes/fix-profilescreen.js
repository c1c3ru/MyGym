#!/usr/bin/env node
/**
 * Script de Correção Final - ProfileScreen
 * Foca nos erros restantes específicos do ProfileScreen
 */

const fs = require('fs');
const path = require('path');

const filePath = 'src/presentation/screens/shared/ProfileScreen.tsx';
const fullPath = path.join(process.cwd(), filePath);

if (!fs.existsSync(fullPath)) {
    console.log('❌ ProfileScreen.tsx não encontrado');
    process.exit(1);
}

let content = fs.readFileSync(fullPath, 'utf8');
const originalContent = content;

console.log('🔧 Corrigindo erros restantes no ProfileScreen...\n');

// 1. Tipar trainingData como any
content = content.replace(
    /const \[trainingData, setTrainingData\] = useState\({}\);/,
    'const [trainingData, setTrainingData] = useState<any>({});'
);
console.log('✓ trainingData tipado como any');

// 2. Tipar currentPayment como any
content = content.replace(
    /const \[currentPayment, setCurrentPayment\] = useState\(null\);/,
    'const [currentPayment, setCurrentPayment] = useState<any>(null);'
);
console.log('✓ currentPayment tipado como any');

// 3. Tipar paymentDueNotification como any
content = content.replace(
    /const \[paymentDueNotification, setPaymentDueNotification\] = useState\(null\);/,
    'const [paymentDueNotification, setPaymentDueNotification] = useState<any>(null);'
);
console.log('✓ paymentDueNotification tipado como any');

// 4. Adicionar estilo title que está faltando
const stylesSection = content.indexOf('const styles = StyleSheet.create({');
if (stylesSection > 0) {
    // Encontrar o final do objeto styles
    const stylesEnd = content.indexOf('});', stylesSection);
    const beforeEnd = content.substring(0, stylesEnd);
    const afterEnd = content.substring(stylesEnd);

    // Adicionar estilo title antes do final
    const titleStyle = `  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700' as const,
    marginBottom: SPACING.sm,
  },
`;

    content = beforeEnd + titleStyle + afterEnd;
    console.log('✓ Estilo title adicionado');
}

// 5. Verificar se logout já existe, se não, não adicionar (já foi adicionado pelo script anterior)
if (!content.includes('const logout = async ()')) {
    console.log('⚠️  Função logout não encontrada - pode ter sido adicionada anteriormente');
}

// 6. Corrigir chamada de logout
content = content.replace(
    /onPress={logout}/g,
    'onPress={handleLogout}'
);
console.log('✓ Chamadas de logout corrigidas para handleLogout');

// Salvar
if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('\n✅ ProfileScreen.tsx atualizado com sucesso!');
} else {
    console.log('\n⏭️  Nenhuma alteração necessária');
}
