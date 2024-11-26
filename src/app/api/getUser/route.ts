import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { userId } = body

		if (!userId) {
			return NextResponse.json(
				{ message: 'Необходимо передать userId' },
				{ status: 400 }
			)
		}

		const user = await prisma.user.findUnique({
			where: { telegramId: userId },
		})

		if (!user) {
			return NextResponse.json(
				{ message: 'Пользователь не найден' },
				{ status: 404 }
			)
		}

		const userResponse = {
			...user,
			telegramId: user.telegramId.toString(),
		}

		return NextResponse.json(userResponse, { status: 200 })
	} catch (error) {
		console.error('Ошибка при получении данных пользователя:', error)
		return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
	}
}
