import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { userId, status } = body

		if (!userId || !status) {
			return NextResponse.json(
				{ message: 'Пользователь и статус обязательны' },
				{ status: 400 }
			)
		}

		// Обновляем статус в базе данных с помощью Prisma
		await prisma.specialist.update({
			where: { userId: userId },
			data: { status },
		})

		return NextResponse.json(
			{ message: 'Статус обновлен успешно' },
			{ status: 200 }
		)
	} catch (error) {
		console.error('Ошибка обновления статуса:', error)
		return NextResponse.json(
			{ message: 'Ошибка обновления статуса' },
			{ status: 500 }
		)
	}
}
