import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAppointmentByClientId(telegramId: string) {
	try {
		const appointment = await prisma.appointments.findMany({
			where: { clientId: telegramId },
		})
		return appointment
	} catch (error) {
		console.error('Ошибка при загрузке графика специалиста:', error)
		return null
	}
}
