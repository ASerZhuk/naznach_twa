import React from 'react'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import { getGrafikById } from '@/app/actions/getGrafikById'
import Container from '@/app/components/Container'
import { getAppointmentById } from '@/app/actions/getAppointmentById'
import Perezapis from './client'
import { AppRoot } from '@telegram-apps/telegram-ui'
import { getServicesById } from '@/app/actions/getServicesById'
import { getTimeSlotsById } from '@/app/actions/getTimeSlotsById'

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
	serviceId: number
	date: string
	time: string
	phone: string
	specialistName: string | null
	specialistLastName: string | null
	specialistAddress: string | null
	specialistPrice: string | null
	specialistPhone: string | null
	serviceName: string | null
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
	const service = await getServicesById(appointment.specialistId)
	const timeslot = await getTimeSlotsById(appointment.specialistId)

	return (
		<Perezapis
			garfik={grafik}
			user={user}
			service={service || []}
			appointments={appointment}
			timeslot={timeslot || []}
		/>
	)
}

export default page
