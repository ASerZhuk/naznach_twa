import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getServiceIdById(id: number) {
	try {
		const serviceId = await prisma.appointmentServices.findMany({
			where: { appointmentId: id },
		})
		return serviceId
	} catch (error) {
		console.error('Ошибка при загрузке графика специалиста:', error)
		return null
	}
}
