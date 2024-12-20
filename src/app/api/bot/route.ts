import { NextResponse } from 'next/server'
import TelegramBot from 'node-telegram-bot-api'
import prisma from '@/app/libs/prismadb'

const bot = new TelegramBot('7655736393:AAGYAPPjBo1WWKhAXtcUMj0FsTWH35Y7D8g')
const botUsername = 'naznach_twa_bot'
const webAppUrl = 'https://naznach-twa.vercel.app/'

// Устанавливаем вебхук на этот маршрут
bot.setWebHook(`https://naznach-twa.vercel.app/api/bot`)

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { message, callback_query } = body

		if (message) {
			const chatId = message.chat.id.toString()
			const text = message.text || ''
			const startPayload = text.split(' ')[1] || null

			bot.sendMessage(
				message.chat.id,
				'Идёт обновление, приложение временно не работает'
			)

			// Проверяем, есть ли пользователь в базе данных
			let user = await prisma.user.findUnique({
				where: { telegramId: chatId },
			})

			if (startPayload) {
				// Если передан payload, ищем мастера
				const master = await prisma.specialist.findUnique({
					where: { userId: startPayload },
				})

				if (!user) {
					// Создаем нового пользователя
					user = await prisma.user.create({
						data: {
							telegramId: chatId,
							firstName: message.from?.first_name || '',
							lastName: message.from?.last_name || '',
							chatId,
							username: message.from?.username || '',
						},
					})
				}

				if (master) {
					const button = {
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: 'Записаться к мастеру',
										web_app: {
											url: `${webAppUrl}/profile_zapis/${startPayload}`,
										},
									},
								],
							],
						},
					}

					await bot.sendMessage(
						chatId,
						`Записаться к мастеру <b>${master.firstName} ${master.lastName}</b>`,
						{ reply_markup: button.reply_markup, parse_mode: 'HTML' }
					)
				} else {
					await bot.sendMessage(chatId, 'Мастер не найден.')
				}

				return NextResponse.json({ success: true })
			}

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

				await bot.sendMessage(chatId, 'Вы уже зарегистрированы.', button)
				return NextResponse.json({ success: true })
			}

			// Если пользователь новый, создаём его
			user = await prisma.user.create({
				data: {
					telegramId: chatId,
					firstName: message.from?.first_name || '',
					lastName: message.from?.last_name || '',
					chatId,
					username: message.from?.username || '',
				},
			})

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

			await bot.sendPhoto(chatId, photoWelcome, {
				caption: `👋 Добро пожаловать! Пожалуйста, выберите тип профиля, чтобы продолжить:`,
				reply_markup: options.reply_markup,
			})

			return NextResponse.json({ success: true })
		}
		}

		if (callback_query) {
			const chatId = callback_query.message?.chat.id.toString()
			const telegramId = callback_query.from.id.toString()

			if (!chatId) {
				return NextResponse.json(
					{ error: 'chatId is missing' },
					{ status: 400 }
				)
			}

			const user = await prisma.user.findUnique({
				where: { telegramId },
			})

			if (!user) {
				await bot.sendMessage(
					chatId,
					'Пользователь не найден. Пожалуйста, зарегистрируйтесь сначала.'
				)
				return NextResponse.json({ error: 'User not found' }, { status: 400 })
			}

			if (callback_query.data === 'client') {
				const profileOptions = {
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
				const photoProfile = `${webAppUrl}/33.png`

				await bot.sendPhoto(chatId, photoProfile, {
					caption:
						'👋 Добро пожаловать в приложение для записи!\n\n🎯 Вы можете воспользоваться функциями для клиента:\n\n🗓️ Запись к мастеру: Легко записывайтесь к нужному специалисту в удобное время.\n🔄 Перезапись: Изменяйте дату или время вашей записи, если это потребуется.\n❌ Отмена записи: Отменяйте запись, если ваши планы изменились.\n⚠️ Внимание:\nЕсли у вас есть прямая ссылка на профиль мастера, лучше воспользоваться ею. На данный момент в вашем профиле нет доступных мастеров для записи.\n\n📖 Подробнее о возможностях приложения читайте в инструкции.\n\nПриятного использования! 🚀',
					reply_markup: profileOptions.reply_markup,
				})
			}

			if (callback_query.data === 'specialist') {
				try {
					await prisma.user.update({
						where: { telegramId },
						data: { isMaster: true },
					})

					await prisma.specialist.create({
						data: {
							userId: user.telegramId,
							chatId,
							firstName: user.firstName,
							lastName: user.lastName,
							username: user.username,
							isMaster: true,
						},
					})

					const profileOptions = {
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

					const photoProfile = `${webAppUrl}/22.png`

					await bot.sendPhoto(chatId, photoProfile, {
						caption: `👋 Добро пожаловать, уважаемый специалист!

🎉 Теперь вы можете пользоваться нашим приложением для управления своей профессиональной деятельностью. Вот что вы сможете делать:

🗓️ Управлять графиком работы: добавляйте, редактируйте и настраивайте свои рабочие часы.
✍️ Записывать клиентов: следите за записями и управляйте ими прямо в приложении.
🔧 Редактировать информацию о себе: обновляйте свои контактные данные и профиль.
❌ Отменять и переносить записи: оперативно решайте вопросы с клиентами.
🔗 Ваша уникальная ссылка для записи клиентов:
https://t.me/${botUsername}?start=${chatId}

📣 Совет: используйте эту ссылку для привлечения клиентов — размещайте её в социальных сетях, мессенджерах или делитесь с клиентами напрямую.

✨ Желаем успешной работы и большого количества довольных клиентов!`,
						reply_markup: profileOptions.reply_markup,
					})
				} catch (error) {
					console.error('Ошибка при регистрации специалиста:', error)
					await bot.sendMessage(
						chatId,
						'Произошла ошибка при регистрации. Попробуйте еще раз.'
					)
				}
			}

			return NextResponse.json({ success: true })
		}

		return NextResponse.json(
			{ message: 'No relevant data in request' },
			{ status: 400 }
		)
	} catch (error) {
		console.error('Произошла ошибка:', error)
		return NextResponse.json({ error }, { status: 500 })
	}
}
