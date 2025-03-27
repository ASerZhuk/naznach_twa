import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'

const prisma = new PrismaClient()

export async function POST(req: Request) {
	const body = await req.json()
	const { specialistId, name, description, duration, price, valuta } = body
	const interval = duration

	try {
		const newService = await prisma.service.create({
			data: {
				specialistId,
				name,
				description,
				duration,
				price,
				valuta,
			},
		})

		const grafiks = await prisma.grafik.findMany({
			// используем findFirst, так как нам нужно только одно значение
			where: { specialistId },
		})

		if (!grafiks) {
			return NextResponse.json({ error: 'График не найден' }, { status: 404 })
		}

		return NextResponse.json(newService, { status: 201 })
	} catch (error) {
		console.error('Error adding service:', error)
		return NextResponse.json(
			{ error: 'Failed to add service' },
			{ status: 500 }
		)
	}
}

export async function DELETE(req: Request) {
	const { searchParams } = new URL(req.url)
	const serviceId = searchParams.get('id')

	if (!serviceId) {
		return NextResponse.json({ error: 'ID не указан' }, { status: 400 })
	}

	const serviceIdIdNum = parseInt(serviceId)

	try {
		const service = await prisma.service.findUnique({
			where: { id: serviceIdIdNum },
		})

		if (!service) {
			console.error(`Услуга с ID ${serviceIdIdNum} не найдена`)
			return NextResponse.json({ error: 'Услуга не найдена' }, { status: 404 })
		}

		// Проверка наличия записей перед удалением
		const appointmentServices = await prisma.appointmentServices.findMany({
			where: { serviceId: serviceIdIdNum },
		})

		// Удаляем все связанные записи, если они есть
		if (appointmentServices.length > 0) {
			await prisma.appointmentServices.deleteMany({
				where: { serviceId: serviceIdIdNum },
			})
		}

		await prisma.service.delete({
			where: { id: serviceIdIdNum },
		})

		return new NextResponse(null, { status: 204 }) // Возвращает 204 No Content
	} catch (error) {
		console.error('Ошибка при удалении услуги:', error)
		return NextResponse.json(
			{ error: 'Ошибка при удалении услуги' },
			{ status: 500 }
		)
	}
}

// Метод для редактирования услуги
export async function PUT(req: Request) {
	const { searchParams } = new URL(req.url)
	const serviceId = searchParams.get('id')

	if (!serviceId) {
		return NextResponse.json({ error: 'ID не указан' }, { status: 400 })
	}

	const serviceIdIdNum = parseInt(serviceId)
	const body = await req.json()
	const { specialistId, name, description, duration, price, valuta } = body

	try {
		// Ищем услугу по ID
		const service = await prisma.service.findUnique({
			where: { id: serviceIdIdNum },
		})

		if (!service) {
			console.error(`Услуга с ID ${serviceIdIdNum} не найдена`)
			return NextResponse.json({ error: 'Услуга не найдена' }, { status: 404 })
		}

		// Обновляем услугу
		const updatedService = await prisma.service.update({
			where: { id: serviceIdIdNum },
			data: {
				specialistId,
				name,
				description,
				duration,
				price,
				valuta,
			},
		})

		return NextResponse.json(updatedService, { status: 200 })
	} catch (error) {
		console.error('Ошибка при обновлении услуги:', error)
		return NextResponse.json(
			{ error: 'Ошибка при обновлении услуги' },
			{ status: 500 }
		)
	}
}
