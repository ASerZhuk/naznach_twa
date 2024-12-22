import React from 'react'
import Zapis from './client'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import { getGrafikById } from '@/app/actions/getGrafikById'
import Container from '@/app/components/Container'
import { AppRoot } from '@telegram-apps/telegram-ui'
import { getTimeSlotsById } from '@/app/actions/getTimeSlotsById'
import { getServicesById } from '@/app/actions/getServicesById'

interface ZapisPageProps {
	params: {
		userId: string
	}
}

const page = async ({ params }: ZapisPageProps) => {
	const user = await getSpecialistByUseId(params.userId)
	const timeslot = await getTimeSlotsById(params.userId)
	const service = await getServicesById(params.userId)
	if (!user) {
		return <div>Пользователь не найден</div>
	}

	return <Zapis user={user} service={service || []} timeslot={timeslot || []} />
}

export default page
