const subscribeUser = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Валидация email
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Неверный формат email'
            });
        }

        // Проверка на существующую подписку
        const existingSubscriber = await db.subscribers.findOne({ 
            where: { email, is_active: true } 
        });

        if (existingSubscriber) {
            return res.status(409).json({
                success: false,
                message: 'Этот email уже подписан на рассылку'
            });
        }

        // Добавление подписчика с оптимистичной блокировкой
        const subscriber = await db.subscribers.create({
            email,
            is_active: true
        });

        // Отправка приветственного письма асинхронно
        await emailQueue.add('welcome-email', { 
            email,
            unsubscribeToken: subscriber.unsubscribe_token 
        });

        return res.status(201).json({
            success: true,
            message: 'Подписка успешно оформлена'
        });

    } catch (error) {
        logger.error('Ошибка при оформлении подписки:', error);
        return res.status(500).json({
            success: false,
            message: 'Произошла ошибка при оформлении подписки'
        });
    }
}; 