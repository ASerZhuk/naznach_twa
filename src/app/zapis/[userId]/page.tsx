import React from 'react'
import Zapis from './client'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import { getGrafikById } from '@/app/actions/getGrafikById'
import Container from '@/app/components/Container'
import { AppRoot } from '@telegram-apps/telegram-ui'

interface ZapisPageProps {
	params: {
		userId: string
	}
}

const page = async ({ params }: ZapisPageProps) => {
	const user = await getSpecialistByUseId(params.userId)
	const grafik = await getGrafikById(params.userId)
	if (!user) {
		return <div>Пользователь не найден</div>
	}

	return (
		<Container>
			<AppRoot>
				<Zapis user={user} garfik={grafik ?? []} />
			</AppRoot>
		</Container>
	)
}

export default page
