#!/usr/bin/env node

/**
 * Script de Análise de Check-ins
 * 
 * Analisa a estrutura atual de check-ins antes da migração
 * 
 * Uso:
 *   node analyze-checkins.js <academiaId>
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, '../../google-services.json');

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin inicializado');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
    console.error('   Certifique-se de que google-services.json existe em:', serviceAccountPath);
    process.exit(1);
}

const db = admin.firestore();

// Configurações
const academiaId = process.argv[2];

if (!academiaId) {
    console.error('❌ Uso: node analyze-checkins.js <academiaId>');
    process.exit(1);
}

console.log('\n🔍 Analisando estrutura de check-ins');
console.log('📋 Academia ID:', academiaId);
console.log('');

/**
 * Analisar check-ins
 */
async function analyzeCheckIns(academiaId) {
    const analysis = {
        globalCheckIns: 0,
        subcollectionCheckIns: 0,
        classesByCheckIns: {},
        totalClasses: 0,
        duplicates: 0,
        missingData: [],
        dateRange: { oldest: null, newest: null }
    };

    try {
        // 1. Contar check-ins na localização global
        console.log('📊 Analisando localização global (/checkIns)...');
        const globalSnapshot = await db
            .collection('gyms').doc(academiaId)
            .collection('checkIns')
            .get();

        analysis.globalCheckIns = globalSnapshot.size;
        console.log(`   ✅ ${analysis.globalCheckIns} check-ins encontrados`);

        // Analisar datas
        globalSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const date = data.date || data.timestamp?.toDate();

            if (date) {
                const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

                if (!analysis.dateRange.oldest || dateStr < analysis.dateRange.oldest) {
                    analysis.dateRange.oldest = dateStr;
                }
                if (!analysis.dateRange.newest || dateStr > analysis.dateRange.newest) {
                    analysis.dateRange.newest = dateStr;
                }
            }
        });

        // 2. Contar check-ins nas subcoleções
        console.log('\n📊 Analisando subcoleções (/classes/{id}/checkIns)...');
        const classesSnapshot = await db
            .collection('gyms').doc(academiaId)
            .collection('classes')
            .get();

        analysis.totalClasses = classesSnapshot.size;
        console.log(`   📚 ${analysis.totalClasses} turmas encontradas`);

        for (const classDoc of classesSnapshot.docs) {
            const className = classDoc.data().name || 'Sem nome';

            const checkInsSnapshot = await classDoc.ref
                .collection('checkIns')
                .get();

            const count = checkInsSnapshot.size;

            if (count > 0) {
                analysis.classesByCheckIns[classDoc.id] = {
                    name: className,
                    count: count
                };
                analysis.subcollectionCheckIns += count;

                console.log(`   📖 ${className}: ${count} check-ins`);
            }
        }

        // 3. Detectar duplicatas (check-ins que já existem em ambas localizações)
        console.log('\n🔍 Verificando duplicatas...');
        const globalIds = new Set(globalSnapshot.docs.map(doc => doc.id));

        for (const classDoc of classesSnapshot.docs) {
            const checkInsSnapshot = await classDoc.ref.collection('checkIns').get();

            checkInsSnapshot.docs.forEach(doc => {
                if (globalIds.has(doc.id)) {
                    analysis.duplicates++;
                }
            });
        }

        console.log(`   ${analysis.duplicates > 0 ? '⚠️' : '✅'} ${analysis.duplicates} duplicatas encontradas`);

        // 4. Verificar dados faltantes
        console.log('\n🔍 Verificando integridade dos dados...');
        let missingFields = 0;

        for (const classDoc of classesSnapshot.docs) {
            const checkInsSnapshot = await classDoc.ref.collection('checkIns').get();

            checkInsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const required = ['studentId', 'classId', 'date'];
                const missing = required.filter(field => !data[field]);

                if (missing.length > 0) {
                    missingFields++;
                    analysis.missingData.push({
                        id: doc.id,
                        classId: classDoc.id,
                        missing: missing
                    });
                }
            });
        }

        if (missingFields > 0) {
            console.log(`   ⚠️ ${missingFields} check-ins com campos faltando`);
        } else {
            console.log(`   ✅ Todos os check-ins têm campos obrigatórios`);
        }

        return analysis;

    } catch (error) {
        console.error('❌ Erro na análise:', error);
        throw error;
    }
}

/**
 * Exibir relatório
 */
function displayReport(analysis) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE ANÁLISE');
    console.log('='.repeat(60));

    console.log('\n📍 Localização Global (/checkIns):');
    console.log(`   Total: ${analysis.globalCheckIns} check-ins`);

    console.log('\n📍 Subcoleções (/classes/{id}/checkIns):');
    console.log(`   Total: ${analysis.subcollectionCheckIns} check-ins`);
    console.log(`   Distribuídos em: ${Object.keys(analysis.classesByCheckIns).length} turmas`);

    if (Object.keys(analysis.classesByCheckIns).length > 0) {
        console.log('\n   Top 5 turmas com mais check-ins:');
        const sorted = Object.entries(analysis.classesByCheckIns)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);

        sorted.forEach(([id, data]) => {
            console.log(`   - ${data.name}: ${data.count} check-ins`);
        });
    }

    console.log('\n📅 Período dos dados:');
    if (analysis.dateRange.oldest && analysis.dateRange.newest) {
        console.log(`   De: ${analysis.dateRange.oldest}`);
        console.log(`   Até: ${analysis.dateRange.newest}`);
    } else {
        console.log(`   Sem dados de data disponíveis`);
    }

    console.log('\n🔄 Status da Migração:');
    if (analysis.duplicates > 0) {
        console.log(`   ✅ Dual-write ativo: ${analysis.duplicates} check-ins já em ambas localizações`);
    } else {
        console.log(`   ⚠️ Dual-write não detectado: nenhuma duplicata encontrada`);
    }

    const needsMigration = analysis.subcollectionCheckIns - analysis.duplicates;
    console.log(`   📦 Precisam ser migrados: ${needsMigration} check-ins`);

    if (analysis.missingData.length > 0) {
        console.log('\n⚠️ Avisos:');
        console.log(`   ${analysis.missingData.length} check-ins com dados incompletos`);
        console.log('   Estes serão migrados mas podem precisar de correção manual');
    }

    console.log('\n💡 Recomendações:');

    if (needsMigration === 0) {
        console.log('   ✅ Todos os check-ins já estão na localização global');
        console.log('   ✅ Você pode pular para a Fase 3');
    } else if (needsMigration < 100) {
        console.log('   ✅ Poucos check-ins para migrar');
        console.log('   ✅ Migração deve ser rápida (<1 minuto)');
    } else if (needsMigration < 1000) {
        console.log('   ⚠️ Volume moderado de check-ins');
        console.log('   ⚠️ Migração estimada: 2-5 minutos');
    } else {
        console.log('   🔴 Volume alto de check-ins');
        console.log('   🔴 Migração estimada: 10-30 minutos');
        console.log('   🔴 Recomendado: executar em horário de baixo tráfego');
    }

    console.log('\n📝 Próximos passos:');
    console.log('   1. Fazer backup do Firestore (recomendado)');
    console.log('   2. Executar migração em dry-run:');
    console.log(`      node scripts/migrations/migrate-checkins.js ${academiaId} --dry-run`);
    console.log('   3. Se tudo OK, executar migração real:');
    console.log(`      node scripts/migrations/migrate-checkins.js ${academiaId}`);

    console.log('\n' + '='.repeat(60));
}

/**
 * Executar análise
 */
async function main() {
    const startTime = Date.now();

    try {
        const analysis = await analyzeCheckIns(academiaId);
        displayReport(analysis);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n⏱️  Tempo de análise: ${duration}s`);

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Erro fatal:', error);
        process.exit(1);
    }
}

// Executar
main();
