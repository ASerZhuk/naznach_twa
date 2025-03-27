import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import TelegramBot from 'node-telegram-bot-api'
import prisma from '@/app/libs/prismadb'

const prismaClient = new PrismaClient()

const bot = new TelegramBot('7655736393:AAGYAPPjBo1WWKhAXtcUMj0FsTWH35Y7D8g', {
	polling: false,
})

const webAppUrl = 'https://naznach-twa.vercel.app/'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { userId, isMaster } = body

		if (!userId) {
			return new NextResponse('UserId is required', { status: 400 })
		}

		const appointments = await prisma.appointments.findMany({
			where: isMaster ? { specialistId: userId } : { clientId: userId },
			orderBy: {
				date: 'desc',
			},
		})

		return NextResponse.json(appointments)
	} catch (error) {
		console.error('Error in appointments API:', error)
		return new NextResponse('Internal error', { status: 500 })
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
		const appointments = await prismaClient.appointments.findMany({
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
		const appointmentServoces = await prismaClient.appointmentServices.findMany(
			{
				where: { appointmentId: appointmentIdNum },
			}
		)
		const appointment = await prismaClient.appointments.findUnique({
			where: { id: appointmentIdNum },
		})

		if (!appointmentServoces) {
			console.error(`Запись с ID ${appointmentIdNum} не найдена`)
			return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
		}

		if (!appointment) {
			console.error(`Запись с ID ${appointmentIdNum} не найдена`)
			return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
		}

		await prismaClient.appointmentServices.deleteMany({
			where: {
				appointmentId: appointmentIdNum,
			},
		})

		// Удаляем запись из базы данных
		await prismaClient.appointments.delete({
			where: { id: appointmentIdNum },
		})

		// Отправка уведомления клиенту о причине отмены
		const clientChatId = parseInt(appointment.clientId)
		const masterChatId = parseInt(appointment.specialistId)
		const cancelPhoto = `${webAppUrl}/55.png`
		const messageClient = `❌ Ваша запись была отменена.\n\n 📆 Дата: ${appointment.date}\n ⌚ Время: ${appointment.time}\n 😀 Мастер: ${appointment.specialistName} ${appointment.specialistLastName}\n 📞 Телефон: ${appointment.specialistPhone}\n❗ Причина отмены: ${reason}`

		if (appointment.clientId !== appointment.specialistId) {
			await bot.sendPhoto(clientChatId, cancelPhoto, {
				caption: messageClient,
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

		// Отправка уведомления мастеру о причине отмены
		const messageMaster = `❌Отмена записи.\n\n
		Клиент ${appointment.firstName} ${appointment.lastName}.\n\n 📆 Дата: ${appointment.date}\n ⌚ Время: ${appointment.time}\n 📞 Телефон для связи: ${appointment.phone}\n❗ Причина отмены: ${reason}`

		await bot.sendPhoto(masterChatId, cancelPhoto, {
			caption: messageMaster,
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

		const appointment = await prismaClient.appointments.findUnique({
			where: { id: appointmentIdNum },
		})

		if (!appointment) {
			console.error(`Запись с ID ${appointmentIdNum} не найдена`)
			return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
		}

		await prismaClient.appointments.update({
			where: { id: appointmentIdNum },
			data: {
				date: date,
				time: time,
			},
		})

		const clientChatId = parseInt(appointment.clientId)
		const masterChatId = parseInt(appointment.specialistId)
		const rewritePhoto = `${webAppUrl}/68.png`

		if (appointment.clientId !== appointment.specialistId) {
			await bot.sendPhoto(clientChatId, rewritePhoto, {
				caption: `🔔 Вы перезаписаны.\n\n📆 с ${appointment.date} ⌚ в ${appointment.time}.\n📆 на ${date} ⌚ в ${time}\n😀 Мастер: ${appointment.specialistName} ${appointment.specialistLastName}\n📞 Телефон: ${appointment.specialistPhone}`,
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

		await bot.sendPhoto(masterChatId, rewritePhoto, {
			caption: `🔔 Клиент ${appointment.firstName} ${appointment.lastName} перезаписан\n\n📆 с ${appointment.date} ⌚ в ${appointment.time}.\n📆 на ${date} ⌚ в ${time}\n📞 Телефон для связи: ${appointment.phone}`,
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

		return NextResponse.json({ message: 'Запись успешно перезаписана' })
	} catch (error) {
		console.error('Ошибка при перезаписи:', error)
		return NextResponse.json(
			{ error: 'Ошибка при перезаписи' },
			{ status: 500 }
		)
	}
}
