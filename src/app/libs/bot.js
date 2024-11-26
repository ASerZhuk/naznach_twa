const TelegramBot = require('node-telegram-bot-api')
const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(TOKEN)

module.exports = bot

{
	/*
	const chatId = msg.chat.id.toString()
	const text = msg.text || ''
	const startPayload = text.split(' ')[1]

	// Проверяем, есть ли пользователь в базе данных
	let user = await prisma.user.findUnique({
		where: { telegramId: chatId },
	})

	// Если параметр существует и пользователя нет, создаём пользователя и предлагаем записаться
	if (text === startPayload) {
		let master = await prisma.specialist.findUnique({
			where: { userId: startPayload },
		})
		if (!user) {
			// Создание нового пользователя
			user = await prisma.user.create({
				data: {
					telegramId: chatId,
					firstName: msg.from?.first_name || '',
					lastName: msg.from?.last_name || '',
					chatId: chatId.toString(),
					username: msg.from?.username || '',
				},
			})

			//bot.sendMessage(chatId, 'Добро пожаловать! Вы зарегистрированы.')
		}

		// Отправляем кнопку для записи к мастеру
		const button = {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: `Записаться к мастеру`,
							web_app: { url: `${webAppUrl}/profile_zapis/${startPayload}` }, // Ссылка на профиль мастера
						},
					],
				],
			},
		}

		bot.sendMessage(
			chatId,
			`Записаться к мастеру <b>${master?.firstName} ${master?.lastName}</b>`,
			{
				reply_markup: button.reply_markup,
				parse_mode: 'HTML',
			}
		)
		return
	}

	// Если пользователь существует и команда /start без параметра, показываем сообщение о регистрации
	if (user) {
		const button = {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Перейти в приложение',
							web_app: { url: `${webAppUrl}` },
						},
					],
				],
			},
		}

		bot.sendMessage(chatId, 'Вы уже зарегистрированы.', button)
		return
	}

	// Если пользователя нет, создаём его и предлагаем выбрать тип профиля
	user = await prisma.user.create({
		data: {
			telegramId: chatId,
			firstName: msg.from?.first_name || '',
			lastName: msg.from?.last_name || '',
			chatId: chatId.toString(),
			username: msg.from?.username || '',
		},
	})

	// Приветственное сообщение с выбором типа профиля
	const options = {
		reply_markup: {
			inline_keyboard: [
				[
					{ text: 'Клиент', callback_data: 'client' },
					{ text: 'Специалист', callback_data: 'specialist' },
				],
			],
		},
	}

	const photoWelcome = `${webAppUrl}/11.png`

	bot.sendPhoto(chatId, photoWelcome, {
		caption: `👋 Добро пожаловать! Мы рады видеть вас в нашем приложении для онлайн записи. Пожалуйста, выберите тип профиля, чтобы продолжить:`,
		reply_markup: options.reply_markup,
	})
	*/
}
