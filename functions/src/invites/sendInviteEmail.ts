import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';


/**
 * Cloud Function para enviar email de convite
 * Configuração do Gmail ou outro provedor de email necessária
 */
export const sendInviteEmail = functions.https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário deve estar autenticado para enviar convites'
        );
    }

    const { email, academiaName, inviteLink, inviterName, userType } = data;

    // Validar dados
    if (!email || !academiaName || !inviteLink) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Email, nome da academia e link são obrigatórios'
        );
    }

    try {
        // Configurar transporter do Nodemailer
        // IMPORTANTE: Configure as variáveis de ambiente no Firebase:
        // firebase functions:config:set gmail.email="seu-email@gmail.com" gmail.password="sua-senha-app"
        const gmailEmail = functions.config().gmail?.email;
        const gmailPassword = functions.config().gmail?.password;

        if (!gmailEmail || !gmailPassword) {
            console.warn('⚠️ Configuração de email não encontrada. Email não será enviado.');
            console.log('Configure com: firebase functions:config:set gmail.email="..." gmail.password="..."');

            // Retornar sucesso mesmo sem enviar (para não bloquear o fluxo)
            return {
                success: true,
                message: 'Convite criado (email não configurado)',
                emailSent: false
            };
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailEmail,
                pass: gmailPassword,
            },
        });

        // Template do email
        const userTypeText = userType === 'instrutor' ? 'instrutor' : 'aluno';
        const mailOptions = {
            from: `${academiaName} <${gmailEmail}>`,
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
    } catch (error) {
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
