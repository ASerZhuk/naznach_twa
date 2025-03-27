import { NextResponse } from 'next/server'
import prisma from '@/app/libs/prismadb'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { userId, isMaster } = body

		if (!userId) {
			return new NextResponse('UserId is required', { status: 400 })
		}

		const appointments = await prisma.appointments.findMany({
			where: isMaster ? { specialistId: userId } : { clientId: userId },
			orderBy: {
				date: 'desc',
			},
		})

		return NextResponse.json(appointments)
	} catch (error) {
		console.error('Error in appointments API:', error)
		return new NextResponse('Internal error', { status: 500 })
	}
}
