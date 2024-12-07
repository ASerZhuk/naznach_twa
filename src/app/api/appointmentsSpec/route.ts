import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import TelegramBot from 'node-telegram-bot-api'

const prisma = new PrismaClient()

const bot = new TelegramBot('7249133903:AAEWsIi32yjBoPNR6kJHlenKfYSEI-Ba5Yg', {
	polling: false,
})

const webAppUrl = 'https://f5a1-178-167-72-118.ngrok-free.app'

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const {
			firstName,
			lastName,
			phone,
			specialistId,
			date,
			time,
			clientId,
			specialistName,
			specialistLastName,
			specialistPhone,
			specialistCategory,
			specialistAddress,
			specialistPrice,
		} = body

		// Вставка данных в базу данных
		const appointment = await prisma.appointments.create({
			data: {
				firstName,
				lastName,
				phone,
				specialistId,
				date,
				time,
				clientId,
				specialistName,
				specialistLastName,
				specialistPhone,
				specialistCategory,
				specialistAddress,
				specialistPrice,
			},
		})

		const masterChatId = parseInt(specialistId)

		const photoSuccess = `${webAppUrl}/44.png`

		await bot.sendPhoto(masterChatId, photoSuccess, {
			caption: `🔔 У Вас новая запись 🔔\n\n 😀 ${firstName} ${lastName} \n 📆 Дата: ${date} \n ⌚ Время: ${time} \n 📞 Телефон: ${phone} \n 💰 К оплате: ${specialistPrice} руб.`,
			reply_markup: {
				inline_keyboard: [
					[{ text: 'Перейти в приложение', web_app: { url: `${webAppUrl}` } }],
				],
			},
		})

		return NextResponse.json({ appointment })
	} catch (error) {
		return NextResponse.json(
			{ error: 'Ошибка при создании записи' },
			{ status: 500 }
		)
	}
}
