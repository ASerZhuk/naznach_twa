import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getServicesById(userId: string) {
	try {
		const timeSlots = await prisma.service.findMany({
			where: { specialistId: userId },
		})
		return timeSlots
	} catch (error) {
		console.error('Ошибка при загрузке услуг специалиста:', error)
		return null
	}
}
