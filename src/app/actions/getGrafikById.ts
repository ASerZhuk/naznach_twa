import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getGrafikById(userId: string) {
	try {
		const timeSlots = await prisma.timeSlots.findMany({
			where: { specialistId: userId },
		})
		return timeSlots
	} catch (error) {
		console.error('Ошибка при загрузке графика специалиста:', error)
		return null
	}
}
