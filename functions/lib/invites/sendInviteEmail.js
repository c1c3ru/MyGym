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
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              margin: 0 0 15px 0;
              font-size: 16px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 8px;
              margin: 25px 0;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
            }
            .link-box {
              background: #f9f9f9;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              word-break: break-all;
            }
            .link-box code {
              color: #667eea;
              font-size: 14px;
            }
            .info-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .store-buttons {
              text-align: center;
              margin: 30px 0;
              padding: 20px 0;
              border-top: 2px solid #f0f0f0;
            }
            .store-buttons p {
              font-size: 14px;
              color: #666;
              margin-bottom: 15px;
            }
            .store-badge {
              display: inline-block;
              margin: 0 10px;
            }
            .store-badge img {
              height: 50px;
              width: auto;
            }
            .footer {
              text-align: center;
              padding: 30px;
              background-color: #f9f9f9;
              border-top: 1px solid #e0e0e0;
              color: #666;
              font-size: 13px;
            }
            .footer p {
              margin: 5px 0;
            }
            @media only screen and (max-width: 600px) {
              .header h1 {
                font-size: 24px;
              }
              .content {
                padding: 30px 20px;
              }
              .button {
                display: block;
                text-align: center;
              }
              .store-badge {
                display: block;
                margin: 10px auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥋 Convite para ${academiaName}</h1>
            </div>
            
            <div class="content">
              <p>Olá!</p>
              
              <p><strong>${inviterName}</strong> convidou você para fazer parte da <strong>${academiaName}</strong> como <strong>${userTypeText}</strong>.</p>
              
              <p>Estamos muito felizes em recebê-lo(a)! Clique no botão abaixo para aceitar o convite e começar sua jornada:</p>
              
              <center>
                <a href="${inviteLink}" class="button">✨ Aceitar Convite</a>
              </center>
              
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                <small>Ou copie e cole este link no seu navegador:</small>
              </p>
              <div class="link-box">
                <code>${inviteLink}</code>
              </div>
              
              <div class="info-box">
                <strong>⏰ Importante:</strong> Este convite expira em 7 dias.
              </div>

              <div class="store-buttons">
                <p><strong>Baixe nosso aplicativo:</strong></p>
                <a href="https://apps.apple.com/app/mygym" class="store-badge" target="_blank">
                  <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1234567890" alt="Download na App Store">
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.mygym.app" class="store-badge" target="_blank">
                  <img src="https://play.google.com/intl/en_us/badges/static/images/badges/pt-br_badge_web_generic.png" alt="Disponível no Google Play">
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>${academiaName}</strong></p>
              <p>Este é um email automático. Por favor, não responda.</p>
              <p style="margin-top: 15px;">© ${new Date().getFullYear()} ${academiaName}. Todos os direitos reservados.</p>
            </div>
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