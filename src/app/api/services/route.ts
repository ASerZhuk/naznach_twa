import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'

const prisma = new PrismaClient()

export async function POST(req: Request) {
	const body = await req.json()
	const { specialistId, name, description, duration, price } = body
	const interval = duration

	try {
		const newService = await prisma.service.create({
			data: {
				specialistId,
				name,
				description,
				duration,
				price,
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
	const { id } = await req.json()

	try {
		await prisma.service.delete({
			where: { id },
		})
		return NextResponse.json({}, { status: 204 })
	} catch (error) {
		console.error('Error deleting service:', error)
		return NextResponse.json(
			{ error: 'Failed to delete service' },
			{ status: 500 }
		)
	}
}
