import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAppointmentBySpecialistId(specialistId: string) {
	try {
		const appointment = await prisma.appointments.findMany({
			where: { specialistId: specialistId },
		})
		return appointment
	} catch (error) {
		console.error('Ошибка при загрузке:', error)
		return null
	}
}
