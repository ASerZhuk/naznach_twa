import React from 'react'
import Zapis from './client'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import { getGrafikById } from '@/app/actions/getGrafikById'

import { getServicesById } from '@/app/actions/getServicesById'

interface ZapisPageProps {
	params: {
		userId: string
	}
}

const page = async ({ params }: ZapisPageProps) => {
	const user = await getSpecialistByUseId(params.userId)
	const grafik = await getGrafikById(params.userId)
	const service = await getServicesById(params.userId)
	if (!user) {
		return <div>Пользователь не найден</div>
	}

	return <Zapis user={user} service={service || []} grafik={grafik || []} />
}

export default page
