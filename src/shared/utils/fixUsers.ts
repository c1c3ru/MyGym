import { db } from '@services/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc, 
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot
} from 'firebase/firestore';

const USERS_TO_FIX: string[] = [
  'cti.maracanau@ifce.edu.br',
  'deppi.maracanau@ifce.edu.br', 
  'cicero.silva@ifce.edu.br'
];

const IFCE_ACADEMIA_ID: string = 'ifce-maracanau';

export async function fixUsersInFirestore(): Promise<boolean> {
  console.log('🔧 Iniciando correção de usuários...');
  
  try {
    // 1. Verificar se a academia IFCE existe
    console.log('🏢 Verificando academia IFCE...');
    const academiasRef = collection(db, 'gyms');
    const academiasSnapshot = await getDocs(academiasRef);
    
    let ifceExists = false;
    academiasSnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      console.log(`Academia encontrada: ${docSnap.id} - ${docSnap.data().name || docSnap.data().nome}`);
      if (docSnap.id === IFCE_ACADEMIA_ID || 
          docSnap.data().name?.toLowerCase().includes('ifce') ||
          docSnap.data().nome?.toLowerCase().includes('ifce')) {
        ifceExists = true;
        console.log('✅ Academia IFCE encontrada');
      }
    });
    
    // 2. Criar academia se não existir
    if (!ifceExists) {
      console.log('🏗️ Criando academia IFCE...');
      const academiaRef = doc(db, 'gyms', IFCE_ACADEMIA_ID);
      await setDoc(academiaRef, {
        name: 'IFCE - Campus Maracanaú',
        nome: 'IFCE - Campus Maracanaú',
        address: 'Av. Parque Central, 1315 - Distrito Industrial I, Maracanaú - CE',
        phone: '(85) 3878-6300',
        email: 'maracanau@ifce.edu.br',
        createdAt: serverTimestamp(),
        active: true,
        tipo: 'publica',
        cnpj: '10.744.098/0008-51'
      });
      console.log('✅ Academia IFCE criada');
    }
    
    // 3. Corrigir cada usuário
    for (const email of USERS_TO_FIX) {
      console.log(`\n👤 Processando usuário: ${email}`);
      
      // Buscar usuário
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        console.log(`❌ Usuário ${email} não encontrado`);
        continue;
      }
      
      const userDoc = userSnapshot.docs[0] as QueryDocumentSnapshot<DocumentData>;
      const userData = userDoc.data() as Record<string, any>;
      
      console.log(`📊 Dados atuais:`, {
        email: userData.email,
        academiaId: userData.academiaId,
        profileCompleted: userData.profileCompleted,
        tipo: userData.tipo,
        userType: userData.userType
      });
      
      // Preparar atualizações
      const updates: Record<string, any> = {};
      let needsUpdate = false;
      
      if (!userData.academiaId) {
        updates.academiaId = IFCE_ACADEMIA_ID;
        needsUpdate = true;
        console.log(`  ✅ Adicionando academiaId: ${IFCE_ACADEMIA_ID}`);
      }
      
      if (!userData.profileCompleted) {
        updates.profileCompleted = true;
        needsUpdate = true;
        console.log(`  ✅ Definindo profileCompleted: true`);
      }
      
      // Garantir userType correto
      if (userData.tipo && !userData.userType) {
        const typeMapping: Record<string, string> = {
          'aluno': 'student',
          'instrutor': 'instructor',
          'administrador': 'admin'
        };
        const key = String(userData.tipo).toLowerCase();
        updates.userType = typeMapping[key] || String(userData.tipo);
        needsUpdate = true;
        console.log(`  ✅ Definindo userType: ${updates.userType}`);
      }
      
      if (needsUpdate) {
        updates.updatedAt = serverTimestamp();
        await updateDoc(userDoc.ref, updates);
        console.log(`✅ Usuário ${email} atualizado com sucesso!`);
      } else {
        console.log(`✅ Usuário ${email} já está correto`);
      }
    }
    
    console.log('\n🎉 Correção concluída! Os usuários agora devem conseguir fazer login normalmente.');
    return true;
    
  } catch (error: unknown) {
    const err = error as any;
    console.error('❌ Erro durante a correção:', err?.message || err);
    return false;
  }
}

// Função para listar todos os usuários (debug)
export async function listAllUsers(): Promise<void> {
  console.log('📋 Listando todos os usuários...');
  
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`Total de usuários: ${usersSnapshot.size}`);
    
    usersSnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data() as Record<string, any>;
      console.log(`\n👤 Usuário: ${docSnap.id}`);
      console.log(`  📧 Email: ${data.email}`);
      console.log(`  👨‍💼 Nome: ${data.name}`);
      console.log(`  🏷️ Tipo: ${data.tipo} / ${data.userType}`);
      console.log(`  🏢 AcademiaId: ${data.academiaId}`);
      console.log(`  ✅ Perfil Completo: ${data.profileCompleted}`);
    });
    
  } catch (error: unknown) {
    const err = error as any;
    console.error('❌ Erro ao listar usuários:', err?.message || err);
  }
}
