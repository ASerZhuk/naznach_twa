import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'

const prisma = new PrismaClient()

// Функция генерации временных слотов
function generateTimeSlots(
	startTime: string,
	endTime: string,
	interval: number
): string[] {
	const timeSlots: string[] = []
	let currentTime = new Date()
	currentTime.setHours(parseInt(startTime.split(':')[0]))
	currentTime.setMinutes(parseInt(startTime.split(':')[1]))

	const end = new Date()
	end.setHours(parseInt(endTime.split(':')[0]))
	end.setMinutes(parseInt(endTime.split(':')[1]))

	while (currentTime <= end) {
		timeSlots.push(format(currentTime, 'HH:mm'))
		currentTime.setMinutes(currentTime.getMinutes() + interval)
	}

	return timeSlots
}

// POST: Создание временных слотов с уникальным именем графика
export async function POST(req: Request) {
	const body = await req.json()
	const { grafikName, startTime, endTime, interval, specialistId, daysOfWeek } =
		body
	const id = specialistId
	const slotTime = generateTimeSlots(startTime, endTime, interval)

	try {
		// Проверяем наличие существующих слотов для специалиста и графика
		const existingTimeSlots = await prisma.timeSlots.findMany({
			where: {
				specialistId: id,
				dayOfWeek: {
					in: daysOfWeek,
				},
				grafikName, // Фильтруем по имени графика
			},
		})

		// Проверяем, какие дни уже существуют
		const existingDays = existingTimeSlots.map(
			(slot: { dayOfWeek: any }) => slot.dayOfWeek
		)

		// Вычисляем новые дни недели, для которых создаем слоты
		const newDaysOfWeek = daysOfWeek.filter(
			(day: number) => !existingDays.includes(day)
		)

		if (newDaysOfWeek.length === 0) {
			return new Response(
				JSON.stringify({
					message: 'Все выбранные дни уже имеют слоты для этого графика.',
				}),
				{ status: 400 }
			)
		}

		// Создаем слоты для новых дней
		const timeSlots = await Promise.all(
			newDaysOfWeek.map(async (dayOfWeek: number) => {
				return prisma.timeSlots.create({
					data: {
						startTime,
						endTime,
						interval,
						specialistId: id,
						dayOfWeek,
						grafikName, // Сохраняем имя графика
						time: slotTime,
					},
				})
			})
		)

		return new Response(JSON.stringify(timeSlots), { status: 200 })
	} catch (error) {
		console.error('Error creating time slots:', error)
		return new Response(
			JSON.stringify({ error: 'Failed to create time slots' }),
			{ status: 500 }
		)
	}
}

// DELETE: Удаление временных слотов для конкретного графика
export async function DELETE(req: Request) {
	const body = await req.json()
	const { specialistId, daysOfWeek, grafikName } = body // принимаем имя графика
	const id = specialistId

	try {
		// Удаляем все временные слоты для выбранных дней недели и графика
		const deletedTimeSlots = await prisma.timeSlots.deleteMany({
			where: {
				specialistId: id,
				dayOfWeek: {
					in: daysOfWeek, // Удаляем слоты для выбранных дней
				},
				grafikName, // Удаляем слоты для конкретного графика
			},
		})

		if (deletedTimeSlots.count === 0) {
			return new Response(
				JSON.stringify({
					message: 'Нет временных слотов для удаления для этого графика.',
				}),
				{ status: 404 }
			)
		}

		return new Response(JSON.stringify(deletedTimeSlots), { status: 200 })
	} catch (error) {
		console.error('Error deleting time slots:', error)
		return new Response(
			JSON.stringify({ error: 'Failed to delete time slots' }),
			{ status: 500 }
		)
	}
}
