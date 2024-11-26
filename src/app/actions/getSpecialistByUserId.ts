import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getSpecialistByUseId(telegramId: string) {
	try {
		const specialist = await prisma.specialist.findFirst({
			where: { userId: telegramId },
		})
		return specialist
	} catch (error) {
		console.error('Ошибка при загрузке графика специалиста:', error)
		return null
	}
}
