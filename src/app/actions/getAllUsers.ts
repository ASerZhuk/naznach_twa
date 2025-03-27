import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAllUsers() {
	try {
		const users = await prisma.user.findMany()
		return users
	} catch (error) {
		console.error('Ошибка при загрузке:', error)
		return null
	}
}
