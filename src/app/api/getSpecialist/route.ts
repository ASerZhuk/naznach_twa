import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { specialistId } = body

		if (!specialistId) {
			return NextResponse.json(
				{ message: 'Необходимо передать specialistId' },
				{ status: 400 }
			)
		}

		const specialist = await prisma.specialist.findUnique({
			where: { userId: specialistId },
		})

		if (!specialist) {
			return NextResponse.json(
				{ message: 'Пользователь не найден' },
				{ status: 404 }
			)
		}

		const userResponse = {
			...specialist,
			telegramId: specialist.userId.toString(),
		}

		return NextResponse.json(userResponse, { status: 200 })
	} catch (error) {
		console.error('Ошибка при получении данных специалиста:', error)
		return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
	}
}
