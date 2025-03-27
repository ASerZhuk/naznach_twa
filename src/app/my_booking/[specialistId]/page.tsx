import Container from '@/app/components/Container'
import React from 'react'

import { getAppointmentByClientId } from '@/app/actions/getAppointmentByClientId'
import MySpecialBooking from './client'
import { getAppointmentBySpecialistId } from '@/app/actions/getAppointmentsBySpecialistId'

interface MyBookingProps {
	params: {
		specialistId: string
	}
}

export default async function MyBooking({ params }: MyBookingProps) {
	const appointment = await getAppointmentBySpecialistId(params.specialistId)
	if (!appointment) {
		// Можно показать индикатор загрузки или сообщение об ошибке
		return <div>Ошибка загрузки данных о встречах</div>
	}

	return (
		<Container>
			<MySpecialBooking appointment={appointment} />
		</Container>
	)
}
