class EmailService {
    async sendWelcomeEmail(email, name) {
        // Заглушка для отправки приветственного письма
        console.log(`[Разработка] Имитация отправки приветственного письма для ${name} (${email})`);
        return true;
    }

    async sendSubscriptionEmail(email) {
        // Заглушка для отправки письма подписки
        console.log(`[Разработка] Имитация отправки письма подписки (${email})`);
        return true;
    }
}

module.exports = new EmailService();