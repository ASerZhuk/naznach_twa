import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getUserById(telegramId: string) {
	try {
		const user = await prisma.user.findFirst({
			where: { telegramId: telegramId },
		})
		return user
	} catch (error) {
		console.error('Ошибка при загрузке пользователя:', error)
		return null
	}
}
