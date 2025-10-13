import sgMail from '@sendgrid/mail';
import { COLORS } from '@presentation/theme/designTokens';

// Configuração do SendGrid
const isDev = (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') || false;
const isProduction = (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') || false;
const sendGridApiKey = (typeof process !== 'undefined' && process.env?.SENDGRID_API_KEY) || null;
const fromEmail = (typeof process !== 'undefined' && process.env?.FROM_EMAIL) || 'noreply@academiaapp.com';
const FROM_NAME = (typeof process !== 'undefined' && process.env?.FROM_NAME) || 'Academia App';

if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

export class EmailService {
  /**
   * Envia email usando SendGrid
   * @param {Object} emailData - Dados do email
   * @param {string} emailData.to - Email do destinatário
   * @param {string} emailData.subject - Assunto do email
   * @param {string} emailData.html - Conteúdo HTML do email
   * @param {string} emailData.text - Conteúdo texto do email (opcional)
   * @returns {Promise<boolean>} Resultado do envio
   */
  static async sendEmail(emailData) {
    try {
      // Verificar se está configurado para envio real
      if (!sendGridApiKey) {
        console.log('📧 Modo simulação - SendGrid não configurado');
        console.log('Email que seria enviado:', emailData);
        return true;
      }

      const msg = {
        to: emailData.to,
        from: {
          email: fromEmail,
          name: FROM_NAME
        },
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      await sgMail.send(msg);
      console.log('✅ Email enviado com sucesso para:', emailData.to);
      return true;

    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      
      // Em caso de erro, simular sucesso em desenvolvimento
      if (isDev) {
        console.log('📧 Simulando sucesso em desenvolvimento');
        console.log('Email que seria enviado:', emailData);
        return true;
      }
      
      return false;
    }
  }

  /**
   * Gera template de email de convite para academia
   * @param {Object} data - Dados para o template
   * @param {string} data.academiaName - Nome da academia
   * @param {string} data.inviterName - Nome de quem está convidando
   * @param {string} data.inviteLink - Link para aceitar o convite
   * @param {string} data.userType - Tipo de usuário (aluno/instrutor/admin)
   * @returns {Object} Template do email
   */
  static generateInviteEmailTemplate(data) {
    const { academiaName, inviterName, inviteLink, userType } = data;
    
    const userTypeText = {
      'aluno': 'aluno',
      'instrutor': 'instrutor',
      'admin': 'administrador'
    };

    const subject = `Convite para ${academiaName} - ${userTypeText[userType] || 'membro'}`;

    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite - ${academiaName}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: COLORS.text.primary}
            .email-container {
                background-color: COLORS.text.primary}
            .header {
                text-align: center;
                margin-bottom: 32px;
                border-bottom: 2px solid currentTheme.gray[100];
                padding-bottom: 24px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: COLORS.text.primary}
            .subtitle {
                color: COLORS.text.primary}
            .content {
                margin-bottom: 32px;
            }
            .academy-name {
                color: COLORS.text.primary}
            .user-type {
                background-color: COLORS.text.primary}
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, currentTheme.info[500], currentTheme.info[700]);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 24px 0;
                box-shadow: 0 4px 12px currentTheme.info[500] + "4D";
                transition: all 0.3s ease;
            }
            .link-backup {
                background-color: COLORS.text.primary}
            .expiration {
                background-color: COLORS.text.primary}
            .footer {
                text-align: center;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid currentTheme.gray[300];
                color: COLORS.text.primary}
            .security-notice {
                background-color: COLORS.text.primary}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">🥋 Academia App</div>
                <div class="subtitle">Sistema de Gestão de Academias</div>
            </div>
            
            <div class="content">
                <h2>🎉 Você foi convidado!</h2>
                
                <p>Olá!</p>
                
                <p><strong>${inviterName}</strong> convidou você para se juntar à academia <span class="academy-name">${academiaName}</span> como <span class="user-type">${userTypeText[userType] || 'membro'}</span>.</p>
                
                <p>Com o Academia App você poderá:</p>
                <ul>
                    <li>🗓️ Acompanhar horários de treinos e aulas</li>
                    <li>💪 Registrar sua evolução física</li>
                    <li>💳 Gerenciar pagamentos e mensalidades</li>
                    <li>🏆 Acompanhar graduações e conquistas</li>
                    <li>📱 Receber notificações importantes</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="${inviteLink}" class="cta-button">
                        ✨ Aceitar Convite
                    </a>
                </div>
                
                <div class="expiration">
                    ⏰ Este convite expira em 7 dias
                </div>
                
                <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
                <div class="link-backup">
                    <strong>Link do convite:</strong><br>
                    ${inviteLink}
                </div>
                
                <div class="security-notice">
                    🔐 <strong>Importante:</strong> Este convite é pessoal e intransferível. Não compartilhe este link com outras pessoas.
                </div>
            </div>
            
            <div class="footer">
                <p>Academia App - Sistema de Gestão de Academias</p>
                <p>Este é um email automático, não responda a esta mensagem.</p>
                <p>Se você não esperava este convite, pode ignorar este email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return {
      subject,
      html,
      text: `
Você foi convidado para ${academiaName}!

${inviterName} convidou você para se juntar à academia ${academiaName} como ${userTypeText[userType] || 'membro'}.

Para aceitar o convite, acesse: ${inviteLink}

Este convite expira em 7 dias.

Academia App - Sistema de Gestão de Academias
      `.trim()
    };
  }

  /**
   * Envia email de convite para academia
   * @param {string} email - Email do destinatário
   * @param {string} academiaName - Nome da academia
   * @param {string} inviterName - Nome de quem está convidando
   * @param {string} inviteLink - Link para aceitar o convite
   * @param {string} userType - Tipo de usuário
   * @returns {Promise<boolean>} Resultado do envio
   */
  static async sendInviteEmail(email, academiaName, inviterName, inviteLink, userType = 'aluno') {
    try {
      const template = this.generateInviteEmailTemplate({
        academiaName,
        inviterName,
        inviteLink,
        userType
      });

      const emailData = {
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      return await this.sendEmail(emailData);

    } catch (error) {
      console.error('Erro ao enviar email de convite:', error);
      return false;
    }
  }

  /**
   * Envia email de lembrete de convite
   * @param {string} email - Email do destinatário
   * @param {string} academiaName - Nome da academia
   * @param {string} inviteLink - Link para aceitar o convite
   * @param {number} daysLeft - Dias restantes para expirar
   * @returns {Promise<boolean>} Resultado do envio
   */
  static async sendInviteReminder(email, academiaName, inviteLink, daysLeft) {
    try {
      const subject = `⏰ Lembrete: Seu convite para ${academiaName} expira em ${daysLeft} dia(s)`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>⏰ Lembrete de Convite</h2>
          <p>Você ainda não aceitou seu convite para se juntar à <strong>${academiaName}</strong>.</p>
          <p>Seu convite expira em <strong>${daysLeft} dia(s)</strong>.</p>
          <a href="${inviteLink}" style="background-color: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Aceitar Convite Agora
          </a>
          <p>Link: ${inviteLink}</p>
        </div>
      `;

      return await this.sendEmail({
        to: email,
        subject,
        html
      });

    } catch (error) {
      console.error('Erro ao enviar lembrete de convite:', error);
      return false;
    }
  }

  /**
   * Envia email de boas-vindas após aceitar convite
   * @param {string} email - Email do novo membro
   * @param {string} name - Nome do novo membro
   * @param {string} academiaName - Nome da academia
   * @param {string} userType - Tipo de usuário
   * @returns {Promise<boolean>} Resultado do envio
   */
  static async sendWelcomeEmail(email, name, academiaName, userType = 'aluno') {
    try {
      const userTypeText = {
        'aluno': 'aluno',
        'instrutor': 'instrutor',
        'admin': 'administrador'
      };

      const subject = `🎉 Bem-vindo(a) à ${academiaName}!`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🎉 Bem-vindo(a) à ${academiaName}!</h2>
          <p>Olá <strong>${name}</strong>,</p>
          <p>Parabéns! Você agora faz parte da ${academiaName} como <strong>${userTypeText[userType] || 'membro'}</strong>.</p>
          
          <h3>Próximos passos:</h3>
          <ul>
            <li>✅ Complete seu perfil com informações pessoais</li>
            <li>📋 Faça sua primeira avaliação física</li>
            <li>🗓️ Consulte os horários das aulas</li>
            <li>💪 Comece seus treinos!</li>
          </ul>
          
          <p>Estamos animados para ter você conosco!</p>
          <p><strong>Equipe ${academiaName}</strong></p>
        </div>
      `;

      return await this.sendEmail({
        to: email,
        subject,
        html
      });

    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      return false;
    }
  }
}

export default EmailService;