"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInviteEmail = void 0;
const functions = __importStar(require("firebase-functions"));
const params_1 = require("firebase-functions/params");
const nodemailer = __importStar(require("nodemailer"));
// Definir parâmetros de configuração
const gmailEmail = (0, params_1.defineString)('GMAIL_EMAIL', {
    description: 'Email do Gmail para envio de convites',
    default: ''
});
const gmailPassword = (0, params_1.defineString)('GMAIL_PASSWORD', {
    description: 'Senha de aplicativo do Gmail',
    default: ''
});
/**
 * Cloud Function para enviar email de convite
 *
 * Configure as variáveis de ambiente:
 * 1. Crie arquivo .env no diretório functions/:
 *    GMAIL_EMAIL=seu-email@gmail.com
 *    GMAIL_PASSWORD=sua-senha-app
 *
 * 2. Ou configure no Firebase Console:
 *    https://console.firebase.google.com/project/academia-app-5cf79/functions/list
 */
exports.sendInviteEmail = functions.https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuário deve estar autenticado para enviar convites');
    }
    const { email, academiaName, inviteLink, inviterName, userType } = data;
    // Validar dados
    if (!email || !academiaName || !inviteLink) {
        throw new functions.https.HttpsError('invalid-argument', 'Email, nome da academia e link são obrigatórios');
    }
    try {
        // Obter valores dos parâmetros
        const emailConfig = gmailEmail.value();
        const passwordConfig = gmailPassword.value();
        // Verificar se as credenciais estão configuradas
        if (!emailConfig || !passwordConfig) {
            console.warn('⚠️ Configuração de email não encontrada.');
            console.log('📝 Configure as variáveis de ambiente:');
            console.log('   1. Crie arquivo .env no diretório functions/');
            console.log('   2. Adicione: GMAIL_EMAIL=seu-email@gmail.com');
            console.log('   3. Adicione: GMAIL_PASSWORD=sua-senha-app');
            console.log('   4. Ou configure no Firebase Console');
            // Retornar sucesso mesmo sem enviar (para não bloquear o fluxo)
            return {
                success: true,
                message: 'Convite criado (email não configurado)',
                emailSent: false,
                needsConfig: true
            };
        }
        // Configurar transporter do Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailConfig,
                pass: passwordConfig,
            },
        });
        // Template do email
        const userTypeText = userType === 'instrutor' ? 'instrutor' : 'aluno';
        const mailOptions = {
            from: `${academiaName} <${emailConfig}>`,
            to: email,
            subject: `Convite para ${academiaName}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🥋 Convite para ${academiaName}</h1>
          </div>
          <div class="content">
            <p>Olá!</p>
            <p><strong>${inviterName}</strong> convidou você para fazer parte da <strong>${academiaName}</strong> como <strong>${userTypeText}</strong>.</p>
            <p>Clique no botão abaixo para aceitar o convite e começar sua jornada:</p>
            <center>
              <a href="${inviteLink}" class="button">Aceitar Convite</a>
            </center>
            <p><small>Ou copie e cole este link no seu navegador:</small><br>
            <code>${inviteLink}</code></p>
            <p><strong>⏰ Este convite expira em 7 dias.</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
            <p>© ${new Date().getFullYear()} ${academiaName}</p>
          </div>
        </body>
        </html>
      `,
        };
        // Enviar email
        await transporter.sendMail(mailOptions);
        console.log('✅ Email de convite enviado com sucesso para:', email);
        return {
            success: true,
            message: 'Email enviado com sucesso',
            emailSent: true
        };
    }
    catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        // Não lançar erro para não bloquear o fluxo
        // O convite ainda será criado mesmo se o email falhar
        return {
            success: true,
            message: 'Convite criado (erro ao enviar email)',
            emailSent: false,
            error: errorMessage
        };
    }
});
//# sourceMappingURL=sendInviteEmail.js.map