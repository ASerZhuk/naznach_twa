import React from 'react'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import { getGrafikById } from '@/app/actions/getGrafikById'
import Container from '@/app/components/Container'
import { getAppointmentById } from '@/app/actions/getAppointmentById'
import Perezapis from './client'
import { AppRoot } from '@telegram-apps/telegram-ui'

interface PereZapisPageProps {
	params: {
		id: number
	}
}

interface Appointment {
	id: number
	clientId: string
	firstName: string
	lastName: string
	specialistId: string
	date: string
	time: string
	phone: string
	specialistName: string | null
	specialistLastName: string | null
	specialistAddress: string | null
	specialistPrice: string | null
	specialistPhone: string | null
	specialistCategory: string | null
}

const page = async ({ params }: PereZapisPageProps) => {
	const appointment: Appointment | null = await getAppointmentById(
		params.id.toString()
	)
	if (!appointment) {
		return <div>Запись не найдена</div>
	}

	const user = await getSpecialistByUseId(appointment.specialistId)
	if (!user) {
		return <div>Пользователь не найден</div>
	}

	// Убедитесь, что specialistId определён перед вызовом getGrafikById
	if (!appointment.specialistId) {
		return <div>Специалист не найден</div>
	}

	const grafik = (await getGrafikById(appointment.specialistId)) || []

	return (
		<AppRoot>
			<Container>
				<Perezapis garfik={grafik} user={user} appointments={appointment} />
			</Container>
		</AppRoot>
	)
}

export default page
