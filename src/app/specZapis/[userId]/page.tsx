import React from 'react'
import SpecZapis from './client'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import Container from '@/app/components/Container'
import { AppRoot } from '@telegram-apps/telegram-ui'
import { getServicesById } from '@/app/actions/getServicesById'
import { getTimeSlotsById } from '@/app/actions/getTimeSlotsById'

interface specZapisPageProps {
	params: {
		userId: string
	}
}

const page = async ({ params }: specZapisPageProps) => {
	const user = await getSpecialistByUseId(params.userId)
	const timeslot = await getTimeSlotsById(params.userId)
	const service = await getServicesById(params.userId)
	if (!user) {
		return <div>Пользователь не найден</div>
	}

	return (
		<SpecZapis user={user} service={service || []} timeslot={timeslot || []} />
	)
}

export default page
