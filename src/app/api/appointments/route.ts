import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import TelegramBot from 'node-telegram-bot-api'

const prisma = new PrismaClient()

const bot = new TelegramBot('7655736393:AAGYAPPjBo1WWKhAXtcUMj0FsTWH35Y7D8g', {
	polling: false,
})

const webAppUrl = 'https://naznach.vercel.app'

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
		const clientChatId = parseInt(clientId)

		const photoSuccess = `${webAppUrl}/44.png`

		await bot.sendPhoto(clientChatId, photoSuccess, {
			caption: `🔔 Вы записались 🔔\n\n 📆 Дата: ${date} \n ⌚ Время: ${time} \n 💰 К оплате: ${specialistPrice} руб. \n 😀 Мастер: ${specialistName} ${specialistLastName} \n 📞 Телефон: ${specialistPhone}`,
			reply_markup: {
				inline_keyboard: [
					[{ text: 'Перейти в приложение', web_app: { url: `${webAppUrl}` } }],
				],
			},
		})

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

// Новый обработчик для получения существующих записей специалиста
export async function GET(request: Request) {
	try {
		// Извлечение параметров из URL (специалист и дата)
		const { searchParams } = new URL(request.url)
		const specialistId = searchParams.get('specialistId')
		const date = searchParams.get('date')

		if (!specialistId || !date) {
			return NextResponse.json(
				{ error: 'Неверные параметры запроса' },
				{ status: 400 }
			)
		}

		// Получение всех записей для данного специалиста на указанную дату
		const appointments = await prisma.appointments.findMany({
			where: {
				specialistId,
				date,
			},
			select: {
				time: true, // Выбираем только поле time, чтобы минимизировать объём данных
			},
		})

		return NextResponse.json(appointments)
	} catch (error) {
		return NextResponse.json(
			{ error: 'Ошибка при получении записей' },
			{ status: 500 }
		)
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url)
		const appointmentId = searchParams.get('id')

		// Проверяем наличие параметра reason в теле запроса
		const body = await req.json()
		const { reason } = body

		if (!reason) {
			return NextResponse.json(
				{ error: 'Пожалуйста, укажите причину отмены' },
				{ status: 400 }
			)
		}

		if (!appointmentId) {
			return NextResponse.json(
				{ error: 'Неверные параметры запроса' },
				{ status: 400 }
			)
		}

		const appointmentIdNum = parseInt(appointmentId)
		if (isNaN(appointmentIdNum)) {
			return NextResponse.json({ error: 'Неверный формат ID' }, { status: 400 })
		}

		// Проверка наличия записи перед удалением
		const appointment = await prisma.appointments.findUnique({
			where: { id: appointmentIdNum },
		})

		if (!appointment) {
			console.error(`Запись с ID ${appointmentIdNum} не найдена`)
			return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
		}

		// Удаляем запись из базы данных
		await prisma.appointments.delete({
			where: { id: appointmentIdNum },
		})

		// Отправка уведомления клиенту о причине отмены
		if (appointment.clientId) {
			const clientChatId = parseInt(appointment.clientId)
			const cancelPhoto = `${webAppUrl}/55.png`
			const message = `❌ Ваша запись была отменена.\n\n 📆 Дата: ${appointment.date}\n ⌚ Время: ${appointment.time}\n 😀 Мастер: ${appointment.specialistName} ${appointment.specialistLastName}\n 📞 Телефон: ${appointment.specialistPhone} \n  ❗ Причина: ${reason}`

			await bot.sendPhoto(clientChatId, cancelPhoto, {
				caption: message,
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
			})
		}

		return NextResponse.json({ message: 'Запись успешно удалена' })
	} catch (error) {
		console.error('Ошибка при удалении записи:', error)
		return NextResponse.json(
			{ error: 'Ошибка при удалении записи' },
			{ status: 500 }
		)
	}
}

export async function PUT(req: Request) {
	try {
		const { searchParams } = new URL(req.url)
		const appointmentId = searchParams.get('id')

		// Проверяем наличие параметра reason в теле запроса
		const body = await req.json()
		const { date, time } = body

		if (!appointmentId) {
			return NextResponse.json(
				{ error: 'Неверные параметры запроса' },
				{ status: 400 }
			)
		}

		const appointmentIdNum = parseInt(appointmentId)
		if (isNaN(appointmentIdNum)) {
			return NextResponse.json({ error: 'Неверный формат ID' }, { status: 400 })
		}

		const appointment = await prisma.appointments.findUnique({
			where: { id: appointmentIdNum },
		})

		if (!appointment) {
			console.error(`Запись с ID ${appointmentIdNum} не найдена`)
			return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
		}

		// Удаляем запись из базы данных
		await prisma.appointments.update({
			where: { id: appointmentIdNum },
			data: {
				date: date,
				time: time,
			},
		})

		return NextResponse.json({ message: 'Запись успешно перезаписана' })
	} catch (error) {
		console.error('Ошибка при перезаписи:', error)
		return NextResponse.json(
			{ error: 'Ошибка при перезаписи' },
			{ status: 500 }
		)
	}
}
