import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getSpecialistByUsername(username: string) {
	try {
		const specialist = await prisma.specialist.findFirst({
			where: { username },
		})
		return specialist
	} catch (error) {
		console.error('Ошибка при загрузке профиля специалиста:', error)
		return null
	}
}
