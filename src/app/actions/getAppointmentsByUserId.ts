import prisma from '@/app/libs/prismadb'

export async function getAppointmentsByUserId(
	userId: string,
	isMaster: boolean
) {
	try {
		const appointments = await prisma.appointments.findMany({
			where: isMaster ? { specialistId: userId } : { clientId: userId },
			orderBy: {
				date: 'desc',
			},
		})
		return appointments
	} catch (error) {
		console.error('Error fetching appointments:', error)
		return []
	}
}
