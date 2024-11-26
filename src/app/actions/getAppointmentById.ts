import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAppointmentById(id: string) {
	try {
		const appointmentId = parseInt(id, 10) // Преобразуем строку в число
		if (isNaN(appointmentId)) {
			throw new Error('Invalid ID')
		}

		const appointment = await prisma.appointments.findUnique({
			where: { id: appointmentId },
		})
		return appointment
	} catch (error) {
		console.error('Ошибка при загрузке записи:', error)
		return null
	}
}
