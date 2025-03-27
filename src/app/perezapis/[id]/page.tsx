import React from 'react'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import { getGrafikById } from '@/app/actions/getGrafikById'

import { getAppointmentById } from '@/app/actions/getAppointmentById'
import Perezapis from './client'

import { getServicesById } from '@/app/actions/getServicesById'
import { getServiceIdById } from '@/app/actions/getServiceIdById'
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
	const serviceIds = await getServiceIdById(appointment.id)
	const service = await getServicesById(appointment.specialistId)

	return (
		<Perezapis
			grafik={grafik || []}
			user={user}
			service={service || []}
			appointments={appointment}
			serviceIds={serviceIds || []}
		/>
	)
}

export default page
