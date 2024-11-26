import Container from '@/app/components/Container'
import React from 'react'

import { getAppointmentByClientId } from '@/app/actions/getAppointmentByClientId'
import MyAppointmentlist from './client'
import { AppRoot } from '@telegram-apps/telegram-ui'
import { getUserById } from '@/app/actions/getUserById'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'

interface MyListProps {
	params: {
		telegramId: string
	}
}

export default async function MyList({ params }: MyListProps) {
	const appointment = await getAppointmentByClientId(params.telegramId)
	const user = params.telegramId

	return (
		<AppRoot>
			<Container>
				<MyAppointmentlist appointment={appointment} user={user} />
			</Container>
		</AppRoot>
	)
}
