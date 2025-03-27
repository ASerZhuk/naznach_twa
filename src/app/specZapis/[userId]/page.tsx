import React from 'react'
import SpecZapis from './client'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import Container from '@/app/components/Container'
import { AppRoot } from '@telegram-apps/telegram-ui'
import { getServicesById } from '@/app/actions/getServicesById'

import { getGrafikById } from '@/app/actions/getGrafikById'

interface specZapisPageProps {
	params: {
		userId: string
	}
}

const page = async ({ params }: specZapisPageProps) => {
	const user = await getSpecialistByUseId(params.userId)
	const service = await getServicesById(params.userId)
	const grafik = await getGrafikById(params.userId)
	if (!user) {
		return <div>Пользователь не найден</div>
	}

	return <SpecZapis user={user} service={service || []} grafik={grafik || []} />
}

export default page
