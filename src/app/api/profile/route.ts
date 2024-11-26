import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// Обработчик для POST-запросов
export async function POST(request: Request) {
	try {
		const body = await request.json()
		const {
			firstName,
			lastName,
			userId,
			price,
			phone,
			address,
			category,
			description,
		} = body

		console.log(userId)
		// Проверка на наличие обязательных полей
		const requiredFields = [
			firstName,
			lastName,
			price,
			phone,
			address,
			category,
			description,
		]
		if (requiredFields.some(field => !field)) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			)
		}

		// Обновление данных в базе
		const updateSpecialist = await prisma.specialist.update({
			where: { userId: userId },
			data: {
				firstName,
				lastName,
				price,
				phone,
				address,
				category,
				description,
			},
		})

		return NextResponse.json(updateSpecialist, { status: 200 })
	} catch (error) {
		console.error('Ошибка обновления профиля:', error)
		return NextResponse.json(
			{ error: 'Проблема обновления профиля' },
			{ status: 500 }
		)
	}
}
