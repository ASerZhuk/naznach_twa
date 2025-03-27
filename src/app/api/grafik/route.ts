import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'

const prisma = new PrismaClient()

export async function POST(req: Request) {
	const body = await req.json()
	const { grafikName, startTime, endTime, specialistId, daysOfWeek } = body
	const id = specialistId
	const formatTime = (time: string) => (time === '00:00' ? '24:00' : time)

	try {
		// Проверяем наличие существующих слотов для специалиста и графика
		const existingTimeSlots = await prisma.grafik.findMany({
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
				return prisma.grafik.create({
					data: {
						startTime: formatTime(startTime),
						endTime: formatTime(endTime),
						specialistId: id,
						dayOfWeek,
						grafikName, // Сохраняем имя графика
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
		const deletedTimeSlots = await prisma.grafik.deleteMany({
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
